import os
import json
from huggingface_hub import InferenceClient
import httpx
from dotenv import load_dotenv

load_dotenv()

# We run this standalone but interact with our FastAPI via HTTP
API_BASE = "http://127.0.0.1:8000"

def clamp_score(score: float) -> float:
    """Ensures score is strictly between 0 and 1, range [0.1, 0.99]"""
    return round(max(0.1, min(0.99, float(score))), 4)

def get_hf_client():
    hf_token = os.getenv("HF_TOKEN", "")
    if not hf_token:
        print("Warning: HF_TOKEN not set. Baseline will fail.")
    return InferenceClient(token=hf_token)

def run_task(task_id: str, client: InferenceClient) -> float:
    print(f"\n--- Running Baseline for {task_id} ---")
    
    # 1. Reset Env
    r = httpx.post(f"{API_BASE}/reset", json={"task_id": task_id})
    if r.status_code != 200:
        print(f"Failed to reset: {r.text}")
        return clamp_score(0.0)
        
    data = r.json()
    episode_id = data["episode_id"]
    obs = data["observation"]
    
    done = False
    step_count = 0
    
    while not done and step_count < 10:
        step_count += 1
        
        system_prompt = f"""You are an enterprise support agent.
Policy: {obs['company_policy_summary']}
SLA Remaining: {obs['sla_remaining']}
Sentiment: {obs['visible_sentiment_score']}

History: {json.dumps(obs['conversation_history'])}
New Message: {obs['customer_message']}

Output ONLY JSON in the following exact schema:
{{
  "action_type": "classify" | "respond" | "escalate" | "offer_resolution",
  "urgency_class": "low" | "medium" | "high" | "critical" (only if classify),
  "message": "your response to customer" (if respond or offer),
  "concession_amount": float (if offering resolution)
}}
"""
        
        try:
            response = client.chat_completion(
                model="meta-llama/Llama-3.3-70B-Instruct",
                messages=[{"role": "system", "content": system_prompt}],
                temperature=0.0
            )
            action_dict = json.loads(response.choices[0].message.content)
            
            # 2. Step Env
            r = httpx.post(f"{API_BASE}/step", json={
                "episode_id": episode_id,
                "action": action_dict
            })
            step_data = r.json()
            obs = step_data["observation"]
            done = step_data["done"]
            print(f"Action taken: {action_dict['action_type']}")
            
        except Exception as e:
            print(f"Error calling LLM or Step API: {e}")
            break
            
    # 3. Get Grader Result
    r = httpx.get(f"{API_BASE}/grader", params={"episode_id": episode_id})
    if r.status_code == 200:
        score = r.json()["final_score"]
        score = clamp_score(score)
        print(f"Final Score: {score}")
        return score
    else:
        print("Failed to run grader")
        return clamp_score(0.0)

if __name__ == "__main__":
    client = get_hf_client()
    
    tasks = ["task_1_easy_urgency", "task_2_medium_policy", "task_3_hard_multi_step"]
    results = {}
    
    total = 0
    for task in tasks:
        score = run_task(task, client)
        results[task] = score
        total += score
        
    avg = total / len(tasks)
    print(f"\n--- BASELINE COMPLETE ---")
    for t, s in results.items():
        print(f"{t}: {s}")
    print(f"AVERAGE SCORE: {avg}")
    
    # Save local results
    with open("baseline_results.json", "w") as f:
        json.dump(results, f, indent=2)
