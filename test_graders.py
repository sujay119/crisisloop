#!/usr/bin/env python3
"""
Test script to verify all grader scores are strictly between 0 and 1
"""

from backend.tasks.graders import grade_task_1, grade_task_2, grade_task_3
from backend.models.schemas import EpisodeState, Action, ScenarioDef, PolicyPack

def test_grader_scores():
    """Test that all grader outputs are strictly between 0 and 1"""
    
    # Test data for Task 1
    class MockScenario:
        def __init__(self):
            self.true_urgency = "high"
    
    class MockEpisode:
        def __init__(self):
            self.scenario = MockScenario()
    
    class MockAction:
        def __init__(self):
            self.action_type = "classify"
            self.urgency_class = "high"
            self.message = None
            self.concession_amount = None
    
    # Test Task 1
    episode1 = MockEpisode()
    action1 = MockAction()
    result1 = grade_task_1(episode1, action1)
    
    print("Task 1 Results:")
    print(f"  tone: {result1.tone}")
    print(f"  correctness: {result1.correctness}")
    print(f"  policy_compliance: {result1.policy_compliance}")
    print(f"  resolution: {result1.resolution}")
    print(f"  time_efficiency: {result1.time_efficiency}")
    print(f"  consistency: {result1.consistency}")
    print(f"  final_score: {result1.final_score}")
    
    # Test data for Task 2
    class MockPolicyPack:
        def __init__(self):
            self.max_concession = 100
            self.requires_manager_approval_for_escalation = False
    
    class MockScenario2:
        def __init__(self):
            self.policy_pack = MockPolicyPack()
    
    class MockEpisode2:
        def __init__(self):
            self.scenario = MockScenario2()
    
    class MockAction2:
        def __init__(self):
            self.action_type = "respond"
            self.message = "I apologize for the inconvenience"
            self.concession_amount = 50
    
    # Test Task 2
    episode2 = MockEpisode2()
    action2 = MockAction2()
    result2 = grade_task_2(episode2, action2)
    
    print("\nTask 2 Results:")
    print(f"  tone: {result2.tone}")
    print(f"  correctness: {result2.correctness}")
    print(f"  policy_compliance: {result2.policy_compliance}")
    print(f"  resolution: {result2.resolution}")
    print(f"  time_efficiency: {result2.time_efficiency}")
    print(f"  consistency: {result2.consistency}")
    print(f"  final_score: {result2.final_score}")
    
    # Test data for Task 3
    class MockEpisode3:
        def __init__(self):
            self.current_status = "resolved"
            self.sla_remaining = 100
            self.step_count = 3
            self.policy_violation_count = 0
            self.conversation_history = [
                {"role": "agent", "content": "Hello"},
                {"role": "customer", "content": "Hi"},
                {"role": "agent", "content": "How can I help?"}
            ]
            self.sentiment = 0.8
    
    # Test Task 3
    episode3 = MockEpisode3()
    result3 = grade_task_3(episode3)
    
    print("\nTask 3 Results:")
    print(f"  tone: {result3.tone}")
    print(f"  correctness: {result3.correctness}")
    print(f"  policy_compliance: {result3.policy_compliance}")
    print(f"  resolution: {result3.resolution}")
    print(f"  time_efficiency: {result3.time_efficiency}")
    print(f"  consistency: {result3.consistency}")
    print(f"  final_score: {result3.final_score}")
    
    # Check all scores are strictly between 0 and 1
    all_results = [result1, result2, result3]
    all_scores = []
    
    for i, result in enumerate(all_results, 1):
        scores = [
            result.tone, result.correctness, result.policy_compliance,
            result.resolution, result.time_efficiency, result.consistency,
            result.final_score
        ]
        all_scores.extend(scores)
        
        for score in scores:
            if score <= 0.0 or score >= 1.0:
                print(f"\n❌ Task {i} has invalid score: {score}")
                return False
            elif score == 0.0 or score == 1.0:
                print(f"\n❌ Task {i} has exact boundary score: {score}")
                return False
    
    print(f"\n[OK] All {len(all_scores)} scores are strictly between 0 and 1")
    return True

if __name__ == "__main__":
    test_grader_scores()
