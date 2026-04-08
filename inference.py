import os
import json
import httpx
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv()

# We run this standalone but interact with our FastAPI via HTTP
# The Hackathon might run the FastAPI on a specific port or host.
ENV_API_BASE = os.getenv("ENV_API_BASE", "http://127.0.0.1:7860")

API_BASE_URL = os.getenv("API_BASE_URL", "https://api-inference.huggingface.co/v1/")
MODEL_NAME = os.getenv("MODEL_NAME", "meta-llama/Llama-3.3-70B-Instruct")
HF_TOKEN = os.getenv("HF_TOKEN")

# Optional – if you use from_docker_image():
LOCAL_IMAGE_NAME = os.getenv("LOCAL_IMAGE_NAME")
BENCHMARK = "crisisloop"

def log_start(task: str, env: str, model: str) -> None:
    print(f"[START] task={task} env={env} model={model}", flush=True)

def log_step(step: int, action: str, reward: float, done: bool, error: Optional[str]) -> None:
    error_val = error if error else "null"
    done_val = str(done).lower()
    print(f"[STEP] step={step} action={action} reward={reward:.2f} done={done_val} error={error_val}", flush=True)

def log_end(success: bool, steps: int, score: float, rewards: List[float]) -> None:
    rewards_str = ",".join(f"{r:.2f}" for r in rewards)
    print(f"[END] success={str(success).lower()} steps={steps} score={score:.3f} rewards={rewards_str}", flush=True)

def get_openai_client():
    if not HF_TOKEN:
        print("[DEBUG] Warning: HF_TOKEN not set. Inference might fail if the endpoint requires auth.")
    return {
        "api_key": HF_TOKEN or "dummy-key",
        "base_url": API_BASE_URL,
    }

def run_task(task_id: str, client: dict) -> float:
    log_start(task=task_id, env=BENCHMARK, model=MODEL_NAME)
    
    try:
        # 1. Reset Env
        r = httpx.post(f"{ENV_API_BASE}/reset", json={"task_id": task_id, "scenario_id": ""}, timeout=10.0)
        if r.status_code != 200:
            print(f"[DEBUG] Failed to reset: {r.text}")
            log_end(success=False, steps=0, score=0.0, rewards=[])
            return 0.0
        
    except httpx.TimeoutException:
        print("[DEBUG] Timeout error: failed to reset environment")
        log_end(success=False, steps=0, score=0.0, rewards=[])
        return 0.0
    except httpx.NetworkError as e:
        print(f"[DEBUG] Network error: failed to reset environment - {e}")
        log_end(success=False, steps=0, score=0.0, rewards=[])
        return 0.0
    except Exception as e:
        print(f"[DEBUG] Unexpected error: failed to reset environment - {e}")
        log_end(success=False, steps=0, score=0.0, rewards=[])
        return 0.0

    data = r.json()
    episode_id = data["episode_id"]
    obs = data["observation"]
    
    done = False
    step_count = 0
    rewards = []
    
    while not done and step_count < 10:
        step_count += 1
        
        system_prompt = f"""You are an enterprise support agent.
Policy: {obs.get('company_policy_summary', '')}
SLA Remaining: {obs.get('sla_remaining', 0)}
Sentiment: {obs.get('visible_sentiment_score', 0)}

History: {json.dumps(obs.get('conversation_history', []))}
New Message: {obs.get('customer_message', '')}

Output ONLY JSON in the following exact schema:
{{
  "action_type": "classify" | "respond" | "escalate" | "offer_resolution",
  "urgency_class": "low" | "medium" | "high" | "critical" (only if classify),
  "message": "your response to customer" (if respond or offer),
  "concession_amount": float (if offering resolution)
}}
"""
        action_dict = None
        error_msg = None
        try:
            url = client["base_url"].rstrip("/") + "/chat/completions"
            headers = {
                "Authorization": f"Bearer {client['api_key']}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": MODEL_NAME,
                "messages": [{"role": "system", "content": system_prompt}],
                "temperature": 0.0
            }
            response = httpx.post(url, json=payload, headers=headers, timeout=30.0)
            response.raise_for_status()
            content = response.json()["choices"][0]["message"]["content"]
            
            # Clean JSON if it's wrapped in triple backticks
            content_clean = content.strip()
            if "```json" in content_clean:
                content_clean = content_clean.split("```json")[-1].split("```")[0].strip()
            elif "```" in content_clean:
                content_clean = content_clean.split("```")[1].strip()

            action_dict = json.loads(content_clean)
        except Exception as e:
            error_msg = f"LLM parsing error: {e}"
            action_dict = {"action_type": "escalate", "message": "Fallback due to LLM error"}

        action_str = json.dumps(action_dict).replace('"', "'")
        
        reward = 0.0
        try:
            # 2. Step Env
            r = httpx.post(f"{ENV_API_BASE}/step", json={
                "episode_id": episode_id,
                "action": action_dict
            }, timeout=10.0)
            if r.status_code == 200:
                step_data = r.json()
                obs = step_data["observation"]
                done = step_data["done"]
                reward = float(step_data.get("reward", 0.0))
            else:
                error_msg = f"Step API error: {r.status_code} - {r.text}"
                done = True
        except httpx.TimeoutException:
            error_msg = "Timeout error: failed to step environment"
            done = True
        except httpx.NetworkError as e:
            error_msg = f"Network error: failed to step environment - {e}"
            done = True
            
        rewards.append(reward)
        log_step(step=step_count, action=action_str, reward=reward, done=done, error=error_msg)
            
    # 3. Get Grader Result
    score = 0.0
    try:
        r = httpx.get(f"{ENV_API_BASE}/grader", params={"episode_id": episode_id}, timeout=10.0)
        if r.status_code == 200:
            score = r.json()["final_score"]
        else:
            print(f"[DEBUG] Grader API error: {r.status_code} - {r.text}")
    except httpx.TimeoutException:
        print("[DEBUG] Timeout error: failed to get grader result")
    except httpx.NetworkError as e:
        print(f"[DEBUG] Network error: failed to get grader result - {e}")
    except Exception as e:
        print(f"[DEBUG] Unexpected error: failed to get grader result - {e}")

    success = score >= 0.5
    log_end(success=success, steps=step_count, score=score, rewards=rewards)

    return score

if __name__ == "__main__":
    client = get_openai_client()
    
    tasks = ["task_1_easy_urgency", "task_2_medium_policy", "task_3_hard_multi_step"]
    results = {}
    
    for task in tasks:
        score = run_task(task, client)
        results[task] = score
    
    # Save local results
    with open("inference_results.json", "w") as f:
        json.dump(results, f, indent=2)
