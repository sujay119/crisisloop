from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field

class PolicyPack(BaseModel):
    allowed_actions: List[str]
    max_concession: float
    requires_manager_approval_for_escalation: bool
    summary: str

class ScenarioDef(BaseModel):
    scenario_id: str
    issue_type: str
    customer_message: str
    true_urgency: Literal["low", "medium", "high", "critical"]
    customer_personality: Literal["angry", "neutral", "impatient", "abusive", "anxious", "VIP_demanding"]
    patience_level: int = Field(..., ge=0, le=10)
    expected_resolution: str
    policy_pack: PolicyPack
    concession_budget: float
    sla_remaining: int  # in steps or minutes equivalent
    escalation_rule: str
    difficulty_level: Literal["easy", "medium", "hard"]
    channel_type: Literal["chat", "email", "voice_transcript"]

class Observation(BaseModel):
    customer_message: str
    conversation_history: List[str] = []
    visible_sentiment_score: float = 0.0
    visible_urgency_context: Optional[str] = None
    sla_remaining: int
    internal_notes: Optional[str] = None
    company_policy_summary: str
    channel_type: str
    remaining_step_count: Optional[int] = None
    visible_concession_limits: Optional[float] = None

class Action(BaseModel):
    action_type: Literal["classify", "respond", "escalate", "offer_resolution"]
    urgency_class: Optional[Literal["low", "medium", "high", "critical"]] = None
    message: Optional[str] = None  # text back to customer
    concession_amount: Optional[float] = 0.0

class Reward(BaseModel):
    total_score: float
    breakdown: Dict[str, float]
    penalties: Dict[str, float]
    terminal: bool = False

class GraderResult(BaseModel):
    tone: float = 0.0
    correctness: float = 0.0
    policy_compliance: float = 0.0
    resolution: float = 0.0
    time_efficiency: float = 0.0
    consistency: float = 0.0
    final_score: float

class EpisodeState(BaseModel):
    episode_id: str
    scenario: ScenarioDef
    current_status: Literal["in_progress", "resolved", "escalated_correctly", "escalated_incorrectly", "sla_breach", "churn", "max_steps_reached"]
    conversation_history: List[Dict[str, str]]  # list of {"role": "...", "content": "..."}
    sentiment: float
    patience: int
    sla_remaining: int
    reward_accumulation: float = 0.0
    step_count: int = 0
    policy_violation_count: int = 0

class ResetRequest(BaseModel):
    task_id: Optional[str] = None
    scenario_id: Optional[str] = None

class StepRequest(BaseModel):
    episode_id: str
    action: Action

class StepResponse(BaseModel):
    observation: Observation
    reward: Reward
    done: bool
    info: Dict[str, Any]
