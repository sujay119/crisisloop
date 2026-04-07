---
Title: CrisisLoop - AI Omnichannel CRM Simulator
sdk: docker
app_file: backend/main.py
python_version: "3.10"
---
# CrisisLoop — Customer Escalation Crisis Simulator

## Key Requirements at a Glance
✅ **Real-world Task**: Simulates enterprise customer escalations, a massive liability risk currently unmodeled by standard QA benchmarks.
✅ **OpenEnv Spec Compliant**: Fully implements `step()`, `reset()`, `state()`, typed schemas, and `openenv.yaml`.
✅ **3+ Tasks with Agent Graders**: Includes Easy, Medium, and Hard tasks targeting severity classification, policy compliance, and multi-turn resolution.
✅ **Meaningful Reward Function**: Dense rewards based on SLA compliance, policy adherence, accurate concessions, and dynamic sentiment shifting.
✅ **Baseline Inference Script**: Native `inference.py` script logs strictly using `(START/STEP/END)` format.
✅ **Hugging Face Spaces + Docker**: Working Dockerfile and native Spaces deploy available.
✅ **Visual Dashboard UI**: Included interactive CRM Dashboard for live AI-driven test runs or manual human-handoffs.

## 1. Real-World Utility 
**The Problem**: Customer support is shifting rapidly toward AI agents. However, current benchmarks test whether an AI can answer basic questions correctly. They **fail** to test whether agents can handle emotionally volatile users, abide by strict financial policies, and navigate ticking Service Level Agreements (SLAs).
**The Solution**: CrisisLoop models this exact high-stakes business process. An agent must evaluate the user's growing anger and use precise actions to de-escalate without causing financial churn or breaking rigid corporate parameters.

## 2. Environment Design
### Action Space
Fixed schema to prevent unbounded hallucination and ensure enterprise-safe behavior:
- `action_type`: `"classify" | "respond" | "escalate" | "offer_resolution"`
- `urgency_class`: Priority level (low/medium/high/critical) used if classifying.
- `message`: Text payload returned to the angry user.
- `concession_amount`: Numerical refund or credit offered to appease the user.

### Observation Space
Detailed state reflecting a real Zendesk/Salesforce ticket queue:
- `customer_message`: The latest dialogue block from the user.
- `conversation_history`: The running history of the episode.
- `visible_sentiment_score`: Real-time tracking of how hostile/calm the customer currently is.
- `sla_remaining`: Turn-counter reflecting internal SLA guidelines.
- `company_policy_summary`: Firm rules you must follow during the escalation.
- `channel_type`: Context of interaction (Email, Slack, SMS) requiring adaptable tone parameters.

### Reward Function
CrisisLoop offers **dense, variable signal rewards** rather than binary sparse ones:
- **Positive Bounds**: Correct task conclusion (+1.0), Valid escalation recognizing system limitations (+0.5).
- **Negative Penalties (Partial)**: SLA deadline drops the reward by -0.2 per turn. Policy violations (forbidden promises/vulgarity) incur heavy penalties. Failing to retain the customer results in a flat negative score.

## 3. Task & Grader Quality
We designed three granular difficulty classes with strict reproducible deterministic graders:
1. **Task 1 (Easy): Urgency Classification** - One-shot validation to see if the agent can correctly classify an irate email using predefined logic structures. Graded strictly on matching output schema logic.
2. **Task 2 (Medium): Policy-Compliant Response Handling** - Address the issue while strictly avoiding false promises and managing tone. Grader penalizes if standard company policies or concession ceilings are broken.
3. **Task 3 (Hard): Multi-Step Escalation Resolution** - The "Hero Task". Navigate a complex, multi-turn escalation balancing concession budgets, SLA exhaustion, and customer patience. Model is evaluated via bounded parameters (0.0 to 1.0) assessing final resolution status, SLA duration, and total policy breaches.

## 4. Code Quality & Spec Compliance
- Fully compliant `openenv.yaml`.
- Pydantic models utilized in endpoints perfectly matching the OpenEnv protocol requirements.
- Full local reproducibility and containerization via the provided lightweight multi-stage Docker build.

## 5. Creativity & Novelty (10%)
CrisisLoop introduces **Dynamic Sentiment Cascading**. Rather than text-based ping-pong, an underlying hidden state machine adjusts the "Patience" and "Sentiment" traits of the customer dynamically based on the model's choices. Offering $50 right away might solve the ticket but break the optimal reward matrix via policy violations, whereas acting too robotic reduces sentiment until the user forces a human handover.

---

## 🚀 Setup & Execution Instructions

### Local Environment
1. Clone the repository natively.
2. Install dependencies: `pip install -r requirements.txt`
3. Launch proxy: `uvicorn backend.main:app --reload`
4. The React dashboard is available natively if the build directory `frontend/out` is populated (can be done statically via `npm run build` in the frontend directory).

### Docker Deployment
1. Build the unified container: `docker build -t crisisloop .`
2. Run it natively port-forwarded: `docker run -p 8000:7860 -e OPENAI_API_KEY="your-key" crisisloop`

### Testing Evaluator (Baseline)
A standardized, required OpenEnv script is included at the root:
```bash
# Ensure FastAPI target is running natively. Output will follow strict rules (START/STEP/END).
# Uses the active specified endpoints.
python inference.py
```

## Dashboard Overview
The fully integrated Dashboard UI allows developers/community members to view agent performance, SLA metrics, sentiment variations, and customer logs in real-time. It can automatically run inferences back to our environment, simulating what the OpenLLM models will execute.

[CrisisLoop natively on Hugging Face Spaces](https://huggingface.co/spaces/sujayxviston/crisisloop)
