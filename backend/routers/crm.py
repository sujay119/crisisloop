import os
import json
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any
from huggingface_hub import AsyncInferenceClient
import time

router = APIRouter(prefix="/crm", tags=["CRM"])

# Base Hugging Face setup
HF_TOKEN = os.getenv("HF_TOKEN", "")
client = AsyncInferenceClient(token=HF_TOKEN)

class AutoReplyRequest(BaseModel):
    history: List[Dict[str, str]]  # list of {"role": "customer"|"agent", "content": "..."}
    sentiment: float
    sla_remaining: int
    patience: int

class AutoReplyResponse(BaseModel):
    action_type: str
    message: str
    concession_amount: float
    raw_llm_response: str

@router.post("/auto-reply", response_model=AutoReplyResponse)
async def auto_reply(req: AutoReplyRequest):
    # Formulate prompt for the Agent
    system_prompt = (
        "You are a Level 1 AI Customer Support Agent in a live CRM. "
        "Your goal is to converse with the customer and resolve their issue BEFORE patience runs out or SLA hits 0. "
        "Available actions:\n"
        "1. 'respond' - standard reply to gather info or apologize.\n"
        "2. 'offer_resolution' - propose a strict fix. You may offer up to $50 concession if absolutely necessary.\n"
        "3. 'escalate' - explicitly hand off to a human manager if the customer is abusive, demands a human, or threatens legal action.\n\n"
        "You must respond in valid JSON format ONLY:\n"
        "{\n"
        '  "action_type": "<respond | offer_resolution | escalate>",\n'
        '  "message": "<your text response to the customer>",\n'
        '  "concession_amount": <0.0 to 50.0>\n'
        "}\n\n"
        f"CURRENT CONTEXT: SLA Remaining = {req.sla_remaining}, Customer Patience = {req.patience}, Current Sentiment = {req.sentiment}."
    )

    # Reformat history
    messages = [{"role": "system", "content": system_prompt}]
    for msg in req.history[-10:]: # last 10 turns
        role = "user" if msg["role"] == "customer" else "assistant"
        prefix = "CUSTOMER SAYS: " if role == "user" else "YOU PREVIOUSLY SAID: "
        messages.append({"role": role, "content": prefix + msg["content"]})
        
    messages.append({"role": "system", "content": "Generate your next JSON action in response to the customer."})

    model = "meta-llama/Llama-3.3-70B-Instruct"
    
    try:
        response = await client.chat_completion(
            model=model,
            messages=messages,
            temperature=0.3,
            max_tokens=300,
        )
        content = response.choices[0].message.content or "{}"
        
        # Safely parse JSON
        content_clean = content.strip()
        if "```json" in content_clean:
            content_clean = content_clean.split("```json")[-1].split("```")[0].strip()
        elif "```" in content_clean:
            content_clean = content_clean.split("```")[1].strip()
            
        try:
            data = json.loads(content_clean)
        except json.JSONDecodeError:
            # Fallback if the free model breaks format
            data = {
                "action_type": "respond",
                "message": "I understand your frustration. Let me check the details.",
                "concession_amount": 0.0
            }

        return AutoReplyResponse(
            action_type=data.get("action_type", "respond"),
            message=data.get("message", "I am here to help."),
            concession_amount=float(data.get("concession_amount", 0.0)),
            raw_llm_response=content
        )
        
    except Exception as e:
        # Fallback to human escalation if LLM completely crashes
        return AutoReplyResponse(
            action_type="escalate",
            message="[System: AI Agent Failure. Error evaluating response.]",
            concession_amount=0.0,
            raw_llm_response=str(e)
        )
