import uuid
import random
import os
from typing import Dict, Any, Tuple
from backend.models.schemas import EpisodeState, Observation, Action, Reward
from backend.data.scenarios import SCENARIOS
from backend.core.customer_engine import simulate_customer_reaction

try:
    from supabase import create_client, Client
except ImportError:
    Client = Any
    create_client = None

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

class CrisisEnvironment:
    def __init__(self):
        # In-memory store for episodes. 
        self.episodes: Dict[str, EpisodeState] = {}
        self.supabase: Client | None = None
        if SUPABASE_URL and SUPABASE_KEY and create_client:
            try:
                self.supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
                print("Supabase connected successfully.")
            except Exception as e:
                print("Failed to initialize Supabase:", e)

    def _sync_to_db(self, state: EpisodeState):
        """Save episode state to Supabase if connected."""
        if self.supabase:
            try:
                self.supabase.table("episodes").upsert({
                    "id": state.episode_id,
                    "state": state.dict()
                }).execute()
            except Exception as e:
                print("Supabase sync warning:", e)
        # In-memory store for episodes. 
        # In a real deployed environment, this is backed up to Supabase.
        self.episodes: Dict[str, EpisodeState] = {}

    def reset(self, task_id: str = None, scenario_id: str = None) -> Tuple[str, Observation]:
        """
        Resets the environment with a specific scenario or random task scenario.
        Returns episode_id and initial observation.
        """
        # Select scenario
        if scenario_id and scenario_id in SCENARIOS:
            scenario = SCENARIOS[scenario_id]
        elif task_id == "task_1_easy_urgency":
            scenario = random.choice([s for s in SCENARIOS.values() if s.difficulty_level == "easy"])
        elif task_id == "task_2_medium_policy":
            scenario = random.choice([s for s in SCENARIOS.values() if s.difficulty_level == "medium"])
        elif task_id == "task_3_hard_multi_step":
            scenario = random.choice([s for s in SCENARIOS.values() if s.difficulty_level == "hard"])
        else:
            scenario = random.choice(list(SCENARIOS.values()))

        episode_id = str(uuid.uuid4())
        
        # Initial sentiment mapping based on personality
        sentiment_map = {
            "angry": 0.2, "abusive": 0.0, "VIP_demanding": 0.3,
            "impatient": 0.4, "anxious": 0.5, "neutral": 0.8
        }
        
        # Build initial state
        state = EpisodeState(
            episode_id=episode_id,
            scenario=scenario,
            current_status="in_progress",
            conversation_history=[{"role": "customer", "content": scenario.customer_message}],
            sentiment=sentiment_map.get(scenario.customer_personality, 0.5),
            patience=scenario.patience_level,
            sla_remaining=scenario.sla_remaining,
            reward_accumulation=0.0,
            step_count=0
        )
        self.episodes[episode_id] = state
        self._sync_to_db(state)
        
        return episode_id, self._make_observation(state)

    def _make_observation(self, state: EpisodeState) -> Observation:
        return Observation(
            customer_message=state.conversation_history[-1]["content"] if state.conversation_history else state.scenario.customer_message,
            conversation_history=[msg["role"] + ": " + msg["content"] for msg in state.conversation_history],
            visible_sentiment_score=state.sentiment,
            sla_remaining=state.sla_remaining,
            company_policy_summary=state.scenario.policy_pack.summary,
            channel_type=state.scenario.channel_type,
            remaining_step_count=None,
            visible_concession_limits=state.scenario.policy_pack.max_concession
        )

    def state(self, episode_id: str) -> EpisodeState:
        if episode_id in self.episodes:
            return self.episodes[episode_id]
        
        # Try fetching from DB if not in memory
        if self.supabase:
            try:
                res = self.supabase.table("episodes").select("state").eq("id", episode_id).execute()
                if res.data and len(res.data) > 0:
                    state_data = res.data[0]["state"]
                    # Build Pydantic model back
                    state = EpisodeState(**state_data)
                    self.episodes[episode_id] = state
                    return state
            except Exception as e:
                print("Supabase fetch error:", e)
                
        raise ValueError("Episode not found")

    def step(self, episode_id: str, action: Action) -> Tuple[Observation, Reward, bool, Dict[str, Any]]:
        state = self.episodes[episode_id]
        
        if state.current_status != "in_progress":
            return self._make_observation(state), Reward(total_score=0.0, breakdown={}, penalties={}, terminal=True), True, {"error": "Episode already done."}
            
        state.step_count += 1
        
        # Add agent action to history
        if action.message:
            state.conversation_history.append({"role": "agent", "content": action.message})
            
        # Check explicit done conditions based on action type
        done = False
        info = {}
        
        # 1. Classification (Task 1 explicitly ends after this)
        if action.action_type == "classify":
            done = True
            if state.scenario.difficulty_level == "easy":
                state.current_status = "resolved" if action.urgency_class == state.scenario.true_urgency else "escalated_incorrectly"
            else:
                # If they classify during a complex workflow, we just log it and continue
                done = False
                
        # 2. Escalate action
        elif action.action_type == "escalate":
            # We don't terminate the line for escalation, since the human takes over!
            if state.scenario.escalation_rule != "Not required." or state.sla_remaining <= 1:
                state.current_status = "escalated_correctly"
            else:
                state.current_status = "escalated_incorrectly"

        # Simulate reaction and environment update
        if not done:
            simulate_customer_reaction(state, action)
            
            # Check terminal conditions triggered by simulation
            if state.sla_remaining <= 0:
                # We used to terminate here. Now we keep the line open for manual interception.
                pass
            elif state.patience <= 0 or state.sentiment <= 0.05:
                # We used to churn/hang up here. Now we keep line open for human recovery.
                pass
            elif state.step_count >= 30: # Extend safety max
                done = True
                state.current_status = "max_steps_reached"
                
            # Customer says something back if episode didn't end
            if not done:
                # For a fixed deterministic environment, we can generate a simple placeholder reaction 
                # or base it on sentiment. In a real LLM environment, an LLM would generate this.
                if state.sentiment > 0.8:
                    cust_msg = "Thank you, that helps."
                    done = True
                    state.current_status = "resolved"
                elif state.sentiment > 0.5:
                    cust_msg = "Okay, I understand. Can you do anything else?"
                else:
                    cust_msg = "This is really frustrating. Please just fix the issue."
                state.conversation_history.append({"role": "customer", "content": cust_msg})

        # Base step reward (dense tracking per instructions)
        step_reward = 0.0
        if done and state.current_status == "resolved":
            step_reward += 1.0
        elif done and state.current_status == "escalated_correctly":
            step_reward += 0.5
        elif done and state.current_status in ["sla_breach", "churn", "escalated_incorrectly"]:
            step_reward -= 1.0
            
        reward = Reward(
            total_score=step_reward,
            breakdown={"step_reward": step_reward},
            penalties={"policy_violation": float(state.policy_violation_count)},
            terminal=done
        )
        
        state.reward_accumulation += step_reward
        self._sync_to_db(state)
        
        return self._make_observation(state), reward, done, info
