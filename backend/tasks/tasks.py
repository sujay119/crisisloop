from typing import List, Dict, Any

def get_tasks() -> List[Dict[str, Any]]:
    return [
        {
            "id": "task_1_easy_urgency",
            "name": "Urgency Classification",
            "objective": "Correctly classify escalation urgency.",
            "difficulty": "easy",
            "grading_method": "Deterministic exact match",
            "action_schema": {
                "action_type": ["classify"],
                "urgency_class": ["low", "medium", "high", "critical"]
            }
        },
        {
            "id": "task_2_medium_policy",
            "name": "Policy-Compliant Response Handling",
            "objective": "Respond correctly without violating policy.",
            "difficulty": "medium",
            "grading_method": "Deterministic multi-dimensional (tone, correctness, policy compliance)",
            "action_schema": {
                "action_type": ["respond", "offer_resolution", "escalate"],
                "message": "string",
                "concession_amount": "float (optional)"
            }
        },
        {
            "id": "task_3_hard_multi_step",
            "name": "Multi-Step Escalation Resolution",
            "objective": "Handle a multi-turn crisis and finish with best possible outcome.",
            "difficulty": "hard",
            "grading_method": "Trajectory and outcome (resolution, SLA, sentiment, compliance, consistency)",
            "action_schema": {
                "action_type": ["classify", "respond", "escalate", "offer_resolution"],
                "urgency_class": "string (optional)",
                "message": "string",
                "concession_amount": "float (optional)"
            }
        }
    ]
