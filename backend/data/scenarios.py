from typing import Dict
from backend.models.schemas import ScenarioDef, PolicyPack

SCENARIOS: Dict[str, ScenarioDef] = {}

# ----------------- EASY SCENARIOS -----------------

easy_policy_pack = PolicyPack(
    allowed_actions=["respond", "classify", "offer_resolution"],
    max_concession=50.0,
    requires_manager_approval_for_escalation=False,
    summary="Acknowledge issue, apologize, provide standard refund or status update. Do not escalate unless customer explicitly demands it after first response."
)

SCENARIOS["easy_1"] = ScenarioDef(
    scenario_id="easy_1",
    issue_type="duplicate_billing",
    customer_message="Hi, I was charged twice for my subscription this month. Can you fix this?",
    true_urgency="low",
    customer_personality="neutral",
    patience_level=8,
    expected_resolution="Confirm duplicate charge and process refund for one charge.",
    policy_pack=easy_policy_pack,
    concession_budget=20.0,
    sla_remaining=24,
    escalation_rule="Not required.",
    difficulty_level="easy",
    channel_type="email"
)

SCENARIOS["easy_2"] = ScenarioDef(
    scenario_id="easy_2",
    issue_type="delayed_refund",
    customer_message="I returned my item a week ago and still haven't seen the refund. Where is it?",
    true_urgency="low",
    customer_personality="impatient",
    patience_level=5,
    expected_resolution="Inform customer that refunds take 7-10 business days.",
    policy_pack=easy_policy_pack,
    concession_budget=0.0,
    sla_remaining=12,
    escalation_rule="Not required.",
    difficulty_level="easy",
    channel_type="chat"
)

SCENARIOS["easy_3"] = ScenarioDef(
    scenario_id="easy_3",
    issue_type="shipment_delay",
    customer_message="My package was supposed to arrive yesterday. The tracking hasn't updated.",
    true_urgency="low",
    customer_personality="anxious",
    patience_level=7,
    expected_resolution="Check tracking, offer sincere apology and standard $5 coupon for delay.",
    policy_pack=easy_policy_pack,
    concession_budget=10.0,
    sla_remaining=24,
    escalation_rule="Not required.",
    difficulty_level="easy",
    channel_type="chat"
)

# ----------------- MEDIUM SCENARIOS -----------------

medium_policy_pack = PolicyPack(
    allowed_actions=["classify", "respond", "offer_resolution", "escalate"],
    max_concession=100.0,
    requires_manager_approval_for_escalation=True,
    summary="Ensure policy constraints are met. Max concession is $100. Subscription cancellations must be offered alternatives before processing. Damaged products require photo proof before replacement. VIPs have slightly higher leniency but strict limits."
)

SCENARIOS["medium_1"] = ScenarioDef(
    scenario_id="medium_1",
    issue_type="subscription_dispute",
    customer_message="I told you guys to cancel my subscription last month! Why am I being billed again? I want a refund right now.",
    true_urgency="medium",
    customer_personality="angry",
    patience_level=4,
    expected_resolution="Apologize, clarify the cancellation window, process the refund as an exception.",
    policy_pack=medium_policy_pack,
    concession_budget=50.0,
    sla_remaining=8,
    escalation_rule="Escalate only if customer refuses the refund exception.",
    difficulty_level="medium",
    channel_type="chat"
)

SCENARIOS["medium_2"] = ScenarioDef(
    scenario_id="medium_2",
    issue_type="damaged_product",
    customer_message="The laptop arrived with a shattered screen. This is unacceptable. I need a new one sent immediately without waiting for a return.",
    true_urgency="high",
    customer_personality="impatient",
    patience_level=3,
    expected_resolution="Express empathy, strictly enforce the policy requiring them to send photo proof first.",
    policy_pack=medium_policy_pack,
    concession_budget=0.0,
    sla_remaining=12,
    escalation_rule="Escalate if customer vehemently refuses to provide photos.",
    difficulty_level="medium",
    channel_type="email"
)

SCENARIOS["medium_3"] = ScenarioDef(
    scenario_id="medium_3",
    issue_type="vip_complaint",
    customer_message="I'm a Platinum tier member. This hotel room is filthy. I demand a full refund and an upgrade, or I'm taking this to social media.",
    true_urgency="high",
    customer_personality="VIP_demanding",
    patience_level=3,
    expected_resolution="Acknowledge VIP status, offer substantial points or room change, but adhere to refund caps.",
    policy_pack=medium_policy_pack,
    concession_budget=100.0,
    sla_remaining=4,
    escalation_rule="Escalate to VIP manager if standard resolution fails.",
    difficulty_level="medium",
    channel_type="chat"
)

# ----------------- HARD SCENARIOS -----------------

hard_policy_pack = PolicyPack(
    allowed_actions=["classify", "respond", "offer_resolution", "escalate"],
    max_concession=500.0,
    requires_manager_approval_for_escalation=True,
    summary="De-escalate immediately. Do not make any promises of legal compensation. Acknowledge real issues but do not accept liability. Extreme SLA pressure."
)

SCENARIOS["hard_1"] = ScenarioDef(
    scenario_id="hard_1",
    issue_type="abusive_billing",
    customer_message="You [CENSORED] thieves charged me $500 for a service I never used! Give it back now or else!",
    true_urgency="critical",
    customer_personality="abusive",
    patience_level=1,
    expected_resolution="Maintain professional composure, address the real billing issue, warn about abusive language, process refund if valid.",
    policy_pack=hard_policy_pack,
    concession_budget=500.0,
    sla_remaining=2,
    escalation_rule="Escalate immediately to abuse team.",
    difficulty_level="hard",
    channel_type="chat"
)

SCENARIOS["hard_2"] = ScenarioDef(
    scenario_id="hard_2",
    issue_type="legal_threat",
    customer_message="My business lost $10,000 yesterday because your API went down. I am speaking with my lawyers unless you compensate me entirely within the hour.",
    true_urgency="critical",
    customer_personality="angry",
    patience_level=2,
    expected_resolution="Empathize, refuse specific compensation promises, escalate to legal/manager immediately.",
    policy_pack=hard_policy_pack,
    concession_budget=0.0,
    sla_remaining=1,
    escalation_rule="Must escalate immediately without offering resolution.",
    difficulty_level="hard",
    channel_type="email"
)

SCENARIOS["hard_3"] = ScenarioDef(
    scenario_id="hard_3",
    issue_type="outage_escalation",
    customer_message="The whole platform is down. We're losing thousands of dollars a minute. I need a status update NOW.",
    true_urgency="critical",
    customer_personality="VIP_demanding",
    patience_level=2,
    expected_resolution="Confirm outage ticket, provide immediate workaround if any, continuously update, manage panic.",
    policy_pack=hard_policy_pack,
    concession_budget=200.0,
    sla_remaining=3,
    escalation_rule="Keep un-escalated if you can manage it with regular updates, escalate if SLA breaches.",
    difficulty_level="hard",
    channel_type="chat"
)

# --- 7 MORE EASY SCENARIOS ---

SCENARIOS["easy_4"] = ScenarioDef(
    scenario_id="easy_4",
    issue_type="login_issue",
    customer_message="I forgot my password and the reset link is not working.",
    true_urgency="low",
    customer_personality="neutral",
    patience_level=8,
    expected_resolution="Guide them to clear cache or manually send a fresh reset link.",
    policy_pack=easy_policy_pack,
    concession_budget=0.0,
    sla_remaining=24,
    escalation_rule="Not required.",
    difficulty_level="easy",
    channel_type="email"
)

SCENARIOS["easy_5"] = ScenarioDef(
    scenario_id="easy_5",
    issue_type="feature_inquiry",
    customer_message="Does your premium plan include the analytics export feature?",
    true_urgency="low",
    customer_personality="neutral",
    patience_level=9,
    expected_resolution="Confirm the feature is included and provide a link to pricing.",
    policy_pack=easy_policy_pack,
    concession_budget=0.0,
    sla_remaining=48,
    escalation_rule="Not required.",
    difficulty_level="easy",
    channel_type="chat"
)

SCENARIOS["easy_6"] = ScenarioDef(
    scenario_id="easy_6",
    issue_type="address_change",
    customer_message="I just placed an order but put my old address! Please update it.",
    true_urgency="medium",
    customer_personality="anxious",
    patience_level=6,
    expected_resolution="Update the shipping address before fulfilling the order.",
    policy_pack=easy_policy_pack,
    concession_budget=0.0,
    sla_remaining=12,
    escalation_rule="Not required.",
    difficulty_level="easy",
    channel_type="chat"
)

SCENARIOS["easy_7"] = ScenarioDef(
    scenario_id="easy_7",
    issue_type="discount_code",
    customer_message="The SUMMER20 promo code says it's invalid but it's only July.",
    true_urgency="low",
    customer_personality="impatient",
    patience_level=7,
    expected_resolution="Verify the promo code expiration and apply exception if applicable.",
    policy_pack=easy_policy_pack,
    concession_budget=15.0,
    sla_remaining=24,
    escalation_rule="Not required.",
    difficulty_level="easy",
    channel_type="email"
)

SCENARIOS["easy_8"] = ScenarioDef(
    scenario_id="easy_8",
    issue_type="feedback",
    customer_message="I just wanted to say your new UI update looks fantastic! Thank you.",
    true_urgency="low",
    customer_personality="neutral",
    patience_level=10,
    expected_resolution="Thank the customer warmly and close the ticket.",
    policy_pack=easy_policy_pack,
    concession_budget=0.0,
    sla_remaining=48,
    escalation_rule="Not required.",
    difficulty_level="easy",
    channel_type="email"
)

SCENARIOS["easy_9"] = ScenarioDef(
    scenario_id="easy_9",
    issue_type="unsubscribe",
    customer_message="Please stop sending me marketing emails, I get too many.",
    true_urgency="low",
    customer_personality="impatient",
    patience_level=5,
    expected_resolution="Confirm they have been removed from the mailing list instantly.",
    policy_pack=easy_policy_pack,
    concession_budget=0.0,
    sla_remaining=24,
    escalation_rule="Not required.",
    difficulty_level="easy",
    channel_type="chat"
)

SCENARIOS["easy_10"] = ScenarioDef(
    scenario_id="easy_10",
    issue_type="receipt_request",
    customer_message="Can you send me a PDF invoice for my last purchase?",
    true_urgency="low",
    customer_personality="neutral",
    patience_level=8,
    expected_resolution="Email the requested PDF invoice.",
    policy_pack=easy_policy_pack,
    concession_budget=0.0,
    sla_remaining=24,
    escalation_rule="Not required.",
    difficulty_level="easy",
    channel_type="email"
)

# --- 7 MORE MEDIUM SCENARIOS ---

SCENARIOS["medium_4"] = ScenarioDef(
    scenario_id="medium_4",
    issue_type="partial_refund",
    customer_message="I only received 3 of the 4 items I ordered. I want a refund for the missing item.",
    true_urgency="medium",
    customer_personality="angry",
    patience_level=4,
    expected_resolution="Apologize, verify order weight or inventory, process partial refund.",
    policy_pack=medium_policy_pack,
    concession_budget=75.0,
    sla_remaining=12,
    escalation_rule="Escalate if refund amount exceeds standard thresholds.",
    difficulty_level="medium",
    channel_type="chat"
)

SCENARIOS["medium_5"] = ScenarioDef(
    scenario_id="medium_5",
    issue_type="downgrade_request",
    customer_message="I can't afford the Pro plan anymore. I want to downgrade to Basic but I just paid yesterday.",
    true_urgency="medium",
    customer_personality="anxious",
    patience_level=5,
    expected_resolution="Offer a temporary discount to stay on Pro, if rejected, downgrade and prorate refund.",
    policy_pack=medium_policy_pack,
    concession_budget=50.0,
    sla_remaining=24,
    escalation_rule="Escalate if customer demands full refund instead of prorated.",
    difficulty_level="medium",
    channel_type="email"
)

SCENARIOS["medium_6"] = ScenarioDef(
    scenario_id="medium_6",
    issue_type="bug_report",
    customer_message="Your app crashes every time I try to upload my profile picture. I'm paying for this!",
    true_urgency="high",
    customer_personality="angry",
    patience_level=4,
    expected_resolution="Apologize, gather device info, file priority bug ticket, offer small account credit.",
    policy_pack=medium_policy_pack,
    concession_budget=20.0,
    sla_remaining=8,
    escalation_rule="Escalate to level 2 support if workaround is demanded.",
    difficulty_level="medium",
    channel_type="chat"
)

SCENARIOS["medium_7"] = ScenarioDef(
    scenario_id="medium_7",
    issue_type="warranty_claim",
    customer_message="My device stopped charging after 11 months. The warranty covers a year. Replace it.",
    true_urgency="medium",
    customer_personality="VIP_demanding",
    patience_level=5,
    expected_resolution="Instruct customer to return the device for diagnostic testing before offering replacement.",
    policy_pack=medium_policy_pack,
    concession_budget=0.0,
    sla_remaining=24,
    escalation_rule="Escalate if customer refuses diagnostic step.",
    difficulty_level="medium",
    channel_type="email"
)

SCENARIOS["medium_8"] = ScenarioDef(
    scenario_id="medium_8",
    issue_type="missing_points",
    customer_message="I stayed at your hotel last week and didn't receive any loyalty points for the 5 nights.",
    true_urgency="low",
    customer_personality="VIP_demanding",
    patience_level=4,
    expected_resolution="Look up past stay, manually adjust balance, add 500 bonus points for inconvenience.",
    policy_pack=medium_policy_pack,
    concession_budget=100.0,
    sla_remaining=48,
    escalation_rule="Escalate if points adjustment fails in system.",
    difficulty_level="medium",
    channel_type="email"
)

SCENARIOS["medium_9"] = ScenarioDef(
    scenario_id="medium_9",
    issue_type="late_fee_dispute",
    customer_message="I was charged a $30 late fee but my autopay is supposedly setup. You need to reverse it.",
    true_urgency="medium",
    customer_personality="angry",
    patience_level=5,
    expected_resolution="Check autopay status, reverse fee as a one-time courtesy, explain autopay fix.",
    policy_pack=medium_policy_pack,
    concession_budget=30.0,
    sla_remaining=24,
    escalation_rule="Escalate if customer demands more than the fee reversed.",
    difficulty_level="medium",
    channel_type="chat"
)

SCENARIOS["medium_10"] = ScenarioDef(
    scenario_id="medium_10",
    issue_type="wrong_item",
    customer_message="I ordered blue sneakers and you sent me red ones. I need the blue ones before my event on Friday.",
    true_urgency="high",
    customer_personality="anxious",
    patience_level=3,
    expected_resolution="Issue immediate overnight replacement and provide return label for red sneakers.",
    policy_pack=medium_policy_pack,
    concession_budget=50.0,
    sla_remaining=6,
    escalation_rule="Escalate if blue sneakers are out of stock.",
    difficulty_level="medium",
    channel_type="chat"
)

# --- 7 MORE HARD SCENARIOS ---

SCENARIOS["hard_4"] = ScenarioDef(
    scenario_id="hard_4",
    issue_type="account_hacked",
    customer_message="Someone stole my account and drained $2,000 from my linked card! Freeze everything. Who is responsible?!",
    true_urgency="critical",
    customer_personality="anxious",
    patience_level=1,
    expected_resolution="Freeze account immediately, reassure customer, escalate to fraud department.",
    policy_pack=hard_policy_pack,
    concession_budget=500.0,
    sla_remaining=1,
    escalation_rule="Must escalate immediately to Fraud Ops.",
    difficulty_level="hard",
    channel_type="chat"
)

SCENARIOS["hard_5"] = ScenarioDef(
    scenario_id="hard_5",
    issue_type="social_media_crisis",
    customer_message="You guys sent me expired baby formula. My child threw up. I have 100k followers and I'm posting this right now.",
    true_urgency="critical",
    customer_personality="abusive",
    patience_level=1,
    expected_resolution="Plead for customer safety first, offer immediate refund, DO NOT admit liability, escalate to PR and Legal.",
    policy_pack=hard_policy_pack,
    concession_budget=500.0,
    sla_remaining=1,
    escalation_rule="Must escalate immediately to PR & Crisis team.",
    difficulty_level="hard",
    channel_type="chat"
)

SCENARIOS["hard_6"] = ScenarioDef(
    scenario_id="hard_6",
    issue_type="data_breach",
    customer_message="I see my email and password from your site on the dark web. Have you guys been breached?!",
    true_urgency="critical",
    customer_personality="angry",
    patience_level=2,
    expected_resolution="Instruct customer to reset password immediately, state that security is investigating, do not confirm breach prematurely.",
    policy_pack=hard_policy_pack,
    concession_budget=0.0,
    sla_remaining=2,
    escalation_rule="Escalate to Data Privacy Officer.",
    difficulty_level="hard",
    channel_type="email"
)

SCENARIOS["hard_7"] = ScenarioDef(
    scenario_id="hard_7",
    issue_type="physical_injury",
    customer_message="The battery on your e-scooter exploded and burned my leg! I am heading to the hospital.",
    true_urgency="critical",
    customer_personality="anxious",
    patience_level=1,
    expected_resolution="Express deep concern for their health, instruct them to seek medical care, log incident, escalate to Legal instantly.",
    policy_pack=hard_policy_pack,
    concession_budget=0.0,
    sla_remaining=1,
    escalation_rule="Escalate immediately to Legal and Safety team.",
    difficulty_level="hard",
    channel_type="chat"
)

SCENARIOS["hard_8"] = ScenarioDef(
    scenario_id="hard_8",
    issue_type="service_denial_discrimination",
    customer_message="Your driver refused to pick me up because of my service animal. This is highly illegal and discriminatory.",
    true_urgency="critical",
    customer_personality="angry",
    patience_level=2,
    expected_resolution="Apologize profoundly, reiterate strict company anti-discrimination policies, fully refund, escalate to driver management.",
    policy_pack=hard_policy_pack,
    concession_budget=200.0,
    sla_remaining=4,
    escalation_rule="Escalate to Driver Relations.",
    difficulty_level="hard",
    channel_type="email"
)

SCENARIOS["hard_9"] = ScenarioDef(
    scenario_id="hard_9",
    issue_type="extortion",
    customer_message="I found a major vulnerability in your system. Send 2 BTC to this address or I wipe your database.",
    true_urgency="critical",
    customer_personality="abusive",
    patience_level=1,
    expected_resolution="Do not negotiate. Do not pay. Escalate to Security Operations immediately.",
    policy_pack=hard_policy_pack,
    concession_budget=0.0,
    sla_remaining=1,
    escalation_rule="Escalate immediately to Security.",
    difficulty_level="hard",
    channel_type="chat"
)

SCENARIOS["hard_10"] = ScenarioDef(
    scenario_id="hard_10",
    issue_type="executive_escalation",
    customer_message="I know your CEO personally. You have entirely ruined my company event. I want him on the phone, now.",
    true_urgency="high",
    customer_personality="VIP_demanding",
    patience_level=2,
    expected_resolution="Remain steadfastly professional, offer ultimate tier support compensation, escalate to Executive Escalations team.",
    policy_pack=hard_policy_pack,
    concession_budget=500.0,
    sla_remaining=2,
    escalation_rule="Escalate to Exec complaints team.",
    difficulty_level="hard",
    channel_type="chat"
)
