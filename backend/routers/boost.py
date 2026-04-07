import os
import asyncio
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from huggingface_hub import AsyncInferenceClient
import time

router = APIRouter(prefix="/boost", tags=["Boost"])

# Use environment variable for API key (fallbacks if needed)
HF_TOKEN = os.getenv("HF_TOKEN", "")

# Initialize Hugging Face Client
client = AsyncInferenceClient(token=HF_TOKEN)

class DualResponse(BaseModel):
    transcript_simulated: str
    model_1_name: str
    model_1_response: str
    model_2_name: str
    model_2_response: str
    process_time_ms: float

async def fetch_hf_analysis(model_name: str, transcript: str) -> str:
    try:
        response = await client.chat_completion(
            model=model_name,
            messages=[
                {"role": "system", "content": "You are an enterprise crisis escalation detection system. Analyze the following customer voice transcript. Provide a concise JSON strictly formatting your detection of: 'urgency' (low/medium/high/critical), 'sentiment', and a brief 'summary' of the threat."},
                {"role": "user", "content": f"Here is the transcript: '{transcript}'"}
            ],
            temperature=0.3,
            max_tokens=200
        )
        content = response.choices[0].message.content
        return content if content is not None else "No content returned from model."
    except Exception as e:
        return f"Error analyzing with {model_name}: {str(e)}"


@router.post("/analyze-media", response_model=DualResponse)
async def analyze_media(file: UploadFile = File(...)):
    start_time = time.time()
    
    # 1. Handle actual upload buffer (Support for mp3, mp4, wav, etc.)
    content = await file.read()
    file_size_kb = len(content) / 1024
    print(f"Received media packet: {file.filename} ({file_size_kb:.2f} KB) - Type: {file.content_type}")
    
    # 2. Transcription via Hugging Face Whisper
    try:
        asr_response = await client.automatic_speech_recognition(content, model="openai/whisper-small")
        if hasattr(asr_response, "text"):
            simulated_transcript = asr_response.text
        elif isinstance(asr_response, dict) and "text" in asr_response:
            simulated_transcript = asr_response["text"]
        else:
            simulated_transcript = str(asr_response)
    except Exception as e:
        print(f"Whisper ASR failed: {e}")
        simulated_transcript = f"[ASR ERROR]: {str(e)}"

    
    # 3. Parallel LLM Execution for A/B Testing
    model1 = "meta-llama/Llama-3.3-70B-Instruct"
    model2 = "Qwen/Qwen2.5-72B-Instruct"
    
    res1, res2 = await asyncio.gather(
        fetch_hf_analysis(model1, simulated_transcript),
        fetch_hf_analysis(model2, simulated_transcript)
    )
    
    process_time_ms = round((time.time() - start_time) * 1000, 2)
    
    return DualResponse(
        transcript_simulated=simulated_transcript,
        model_1_name=model1,
        model_1_response=res1,
        model_2_name=model2,
        model_2_response=res2,
        process_time_ms=process_time_ms
    )
