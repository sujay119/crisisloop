import os
from huggingface_hub import AsyncInferenceClient
import json

HF_TOKEN = os.getenv("HF_TOKEN", "")

class BaseOmniAgent:
    def __init__(self, platform_name: str, constraints: str):
        self.platform_name = platform_name
        self.constraints = constraints
        self.client = AsyncInferenceClient(token=HF_TOKEN)

    async def process_payload(self, payload: str, model: str = "meta-llama/Llama-3.3-70B-Instruct") -> dict:
        system_prompt = (
            f"You are a Level 2 Autonomous Company Agent responding to a customer issue natively on {self.platform_name}.\n"
            f"PLATFORM CONSTRAINTS: {self.constraints}\n\n"
            "Respond strictly in JSON format:\n"
            "{\n"
            '  "action_type": "respond" | "resolve" | "escalate",\n'
            '  "generated_response": "<your string response adhering perfectly to platform bounds>"\n'
            "}"
        )

        try:
            res = await self.client.chat_completion(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Customer payload received: '{payload}'"}
                ],
                temperature=0.3,
                max_tokens=350
            )
            content = res.choices[0].message.content or "{}"
            
            # Clean JSON
            clean = content.strip()
            if "```json" in clean:
                clean = clean.split("```json")[-1].split("```")[0].strip()
            elif "```" in clean:
                clean = clean.split("```")[1].strip()
                
            data = json.loads(clean)
            return {
                "success": True,
                "platform": self.platform_name,
                "action": data.get("action_type", "respond"),
                "response_text": data.get("generated_response", "Failed to generate text.")
            }
        except Exception as e:
            return {
                "success": False,
                "platform": self.platform_name,
                "action": "error",
                "response_text": f"Agent error: {str(e)}"
            }

class EmailAgent(BaseOmniAgent):
    def __init__(self):
        super().__init__(
            "Email", 
            "Use formal, professional email structure. Include a subject line reference (e.g. 'Re: Your Support Request'), a professional greeting, paragraphs, and a polite sign-off."
        )

class SMSAgent(BaseOmniAgent):
    def __init__(self):
        super().__init__(
            "SMS", 
            "EXTREMELY STRICT: Must be 160 characters or less. Be concise. NO greetings. NO sign-offs. Get straight to the point."
        )

class SlackAgent(BaseOmniAgent):
    def __init__(self):
        super().__init__(
            "Slack", 
            "Use Slack Markdown (e.g., *bold*, _italics_). The tone should be helpful, quick, and corporate-casual. You can occasionally use a relevant emoji."
        )

class DiscordAgent(BaseOmniAgent):
    def __init__(self):
        super().__init__(
            "Discord", 
            "Use Discord Markdown. The tone should be gamer-friendly, relaxed, and highly empathetic. Address them casually. Emojis are strongly encouraged."
        )
