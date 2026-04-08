from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
from backend.agents.omni_agents import EmailAgent, SMSAgent, SlackAgent, DiscordAgent
import time

router = APIRouter(prefix="/omnichannel", tags=["Omnichannel"])

class WebhookPayload(BaseModel):
    platform: str
    message: str

# Instantiate agents
agents = {
    "email": EmailAgent(),
    "sms": SMSAgent(),
    "slack": SlackAgent(),
    "discord": DiscordAgent()
}

@router.post("/webhook")
async def handle_omnichannel_webhook(payload: WebhookPayload):
    start = time.time()
    platform = payload.platform.lower()
    
    if platform not in agents:
        raise HTTPException(status_code=400, detail=f"Unsupported platform: {platform}")
        
    agent = agents[platform]
    
    # Process asynchronously using open router
    result = await agent.process_payload(payload.message)
    
    process_time = round((time.time() - start) * 1000, 2)
    result["process_time_ms"] = process_time
    
    return result
