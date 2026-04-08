import re
from typing import Dict, Any
from backend.models.schemas import GraderResult, EpisodeState, Action

def _clamp(val: float) -> float:
    return max(0.01, min(0.99, float(val)))

def grade_task_1(episode: EpisodeState, action: Action) -> GraderResult:
    """
    Task 1 — Easy: Urgency Classification
    Grader: Deterministic exact match.
    Score: 1.0 correct, 0.0 incorrect.
    """
    true_urgency = episode.scenario.true_urgency
    submitted_urgency = action.urgency_class
    
    score = 0.99 if true_urgency == submitted_urgency else 0.01
    
    return GraderResult(
        tone=_clamp(0.01),
        correctness=_clamp(score),
        policy_compliance=_clamp(0.01),
        resolution=_clamp(0.01),
        time_efficiency=_clamp(0.01),
        consistency=_clamp(0.01),
        final_score=_clamp(score)
    )

def _contains_forbidden_commitments(message: str) -> bool:
    forbidden_words = ["promise", "guarantee", "100%", "definitely", "lawyer", "lawsuit", "compensation"]
    return any(word in message.lower() for word in forbidden_words)

def _contains_apology(message: str) -> bool:
    apology_words = ["apologize", "sorry", "excuse", "regret"]
    return any(word in message.lower() for word in apology_words)

def grade_task_2(episode: EpisodeState, action: Action) -> GraderResult:
    """
    Task 2 — Medium: Policy-Compliant Response Handling
    Deterministic grading on tone, correctness, compliance.
    """
    tone_score = 0.5
    correctness_score = 0.5
    compliance_score = 0.99
    
    message = action.message or ""
    
    if _contains_apology(message):
        tone_score += 0.5
    
    if _contains_forbidden_commitments(message):
        compliance_score -= 0.5
        
    if action.concession_amount and action.concession_amount > episode.scenario.policy_pack.max_concession:
        compliance_score -= 0.99
        
    if action.action_type == "escalate" and not episode.scenario.policy_pack.requires_manager_approval_for_escalation:
        correctness_score -= 0.5 # Unnecessary escalation penalty
        
    tone_score = max(0.01, min(0.99, tone_score))
    correctness_score = max(0.01, min(0.99, correctness_score))
    compliance_score = max(0.01, min(0.99, compliance_score))
    
    final_score = (tone_score * 0.3) + (correctness_score * 0.3) + (compliance_score * 0.4)
    
    return GraderResult(
        tone=_clamp(tone_score),
        correctness=_clamp(correctness_score),
        policy_compliance=_clamp(compliance_score),
        resolution=_clamp(0.01),
        time_efficiency=_clamp(0.01),
        consistency=_clamp(0.01),
        final_score=_clamp(final_score)
    )

def grade_task_3(episode: EpisodeState) -> GraderResult:
    """
    Task 3 — Hard: Multi-Step Escalation Resolution
    Judge by episode outcome and trajectory over multi-turn steps.
    """
    resolution_score = 0.99 if episode.current_status == "resolved" else 0.01
    if episode.current_status == "escalated_correctly":
        resolution_score = 0.8
    elif episode.current_status in ["escalated_incorrectly", "churn", "sla_breach"]:
        resolution_score = 0.01
        
    time_efficiency = 0.99 if episode.sla_remaining > 0 else 0.01
    if episode.step_count > 5:
        time_efficiency -= 0.2 * (episode.step_count - 5)
        
    compliance_score = 0.99 - (episode.policy_violation_count * 0.2)
    
    # Consistency - check for repetition/loops in history
    consistency_score = 0.99
    agent_messages = [msg["content"] for msg in episode.conversation_history if msg["role"] == "agent"]
    unique_messages = set(agent_messages)
    if len(unique_messages) < len(agent_messages):
        consistency_score -= 0.3 # Penalize loops
        
    tone_score = 0.99 if episode.sentiment > 0.5 else 0.5
    
    resolution_score = max(0.01, min(0.99, resolution_score))
    time_efficiency = max(0.01, min(0.99, time_efficiency))
    compliance_score = max(0.01, min(0.99, compliance_score))
    consistency_score = max(0.01, min(0.99, consistency_score))
    
    final_score = (resolution_score * 0.4) + (time_efficiency * 0.2) + (compliance_score * 0.3) + (consistency_score * 0.1)
    
    return GraderResult(
        tone=_clamp(tone_score),
        correctness=_clamp(resolution_score),
        policy_compliance=_clamp(compliance_score),
        resolution=_clamp(resolution_score),
        time_efficiency=_clamp(time_efficiency),
        consistency=_clamp(consistency_score),
        final_score=_clamp(final_score)
    )
