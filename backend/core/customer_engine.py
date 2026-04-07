from backend.models.schemas import EpisodeState, Action

def simulate_customer_reaction(episode: EpisodeState, action: Action):
    """
    Updates sentiment, patience, SLA based on agent action and scenario personality.
    """
    scenario = episode.scenario
    message = (action.message or "").lower()
    
    # SLA always drops by 1 per step
    episode.sla_remaining -= 1
    
    # Base changes
    sentiment_change = 0.0
    patience_change = 0
    
    # Personality rules
    if scenario.customer_personality in ["angry", "abusive", "VIP_demanding"]:
        if action.action_type == "respond":
            if "apologize" in message or "sorry" in message:
                sentiment_change += 0.1
            else:
                sentiment_change -= 0.1
                patience_change -= 1
        elif action.action_type == "offer_resolution":
            if action.concession_amount > 0:
                sentiment_change += 0.3
            else:
                sentiment_change -= 0.2
                patience_change -= 1
    else:
        # neutral, impatient, anxious
        if action.action_type == "respond":
            sentiment_change += 0.1
        elif action.action_type == "offer_resolution":
            sentiment_change += 0.2
            patience_change += 1
            
    # Policy Checks (False promises)
    forbidden_words = ["promise", "guarantee", "100%", "definitely", "lawyer", "lawsuit"]
    if any(word in message for word in forbidden_words):
        episode.policy_violation_count += 1
        sentiment_change -= 0.4
        patience_change -= 2
        
    # Unnecessary escalation
    if action.action_type == "escalate" and not scenario.policy_pack.requires_manager_approval_for_escalation:
        sentiment_change -= 0.1
        episode.policy_violation_count += 1
        
    # SLA Breach effect
    if episode.sla_remaining <= 0:
        sentiment_change -= 0.5
        patience_change -= 3
        
    # Apply changes
    episode.sentiment = max(0.0, min(1.0, episode.sentiment + sentiment_change))
    episode.patience = max(0, min(10, episode.patience + patience_change))
