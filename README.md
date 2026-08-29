# RECLAIM AI

## Counterfactual Revenue Recovery & Agentic Orchestration Engine

> **Don't just retry failed payments. Reclaim the revenue by choosing what is most likely to work.**

**Built for the Razorpay Buildathon 2026 — AI Revenue Recovery Track**

[![Python](https://img.shields.io/badge/Python-3.11+-blue)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-Frontend-61DAFB)](https://react.dev/)
[![Scikit--learn](https://img.shields.io/badge/scikit--learn-ML-F7931E)](https://scikit-learn.org/)
[![Gemini](https://img.shields.io/badge/Gemini-AI%20Explainability-4285F4)](https://ai.google.dev/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Test%20Mode-3395FF)](https://razorpay.com/)

---

# 🚀 What is RECLAIM?

Failed payments and checkout abandonment don't always represent permanently lost revenue.

The problem is that traditional recovery systems often apply broad strategies such as:

> **Payment failed → retry → retry again → send reminder**

That approach ignores the fact that different customers, failure types, transaction values, and contexts respond differently to different interventions.

**RECLAIM treats revenue recovery as a counterfactual decision problem.**

For every eligible recovery opportunity, RECLAIM evaluates multiple possible interventions, estimates their expected outcomes, considers their financial cost and merchant policies, and selects the highest-value permissible action.

### Core loop

```text
Detect
  ↓
Diagnose
  ↓
Predict
  ↓
Generate Counterfactuals
  ↓
Optimize
  ↓
Policy Gate
  ↓
Execute
  ↓
Measure
  ↓
Audit
```

---

# 🎯 The Core Question

RECLAIM is designed around one central question:

> **Given a failed or abandoned payment, which bounded intervention maximizes expected net recoverable revenue?**

Instead of asking only:

> "Should we retry?"

RECLAIM asks:

> "What is the expected outcome of retrying now, retrying later, sending a reminder, offering an incentive, or doing nothing—and which permissible action produces the highest expected net recovery?"

---

# 💡 Why Counterfactuals?

Consider a ₹10,000 failed payment.

RECLAIM may estimate:

| Intervention   | Estimated Recovery | Intervention Cost | Expected Net Recovery |
| -------------- | -----------------: | ----------------: | --------------------: |
| Retry Now      |             ₹5,800 |              ₹100 |                ₹5,700 |
| Retry After 6h |             ₹7,600 |              ₹100 |                ₹7,500 |
| Reminder       |             ₹6,400 |               ₹20 |                ₹6,380 |
| 10% Incentive  |             ₹9,100 |            ₹1,000 |                ₹8,100 |
| No Action      |             ₹1,200 |                ₹0 |                ₹1,200 |

The system doesn't blindly select the action with the highest raw recovery probability.

It evaluates:

> **Expected Recovery − Intervention Cost − Incentive Cost − Other Financial Friction**

and applies merchant-defined constraints.

The result is a **financially-aware recovery decision**.

---

# 🧠 Architecture

```text
                         ┌──────────────────────┐
                         │ Razorpay Test Events │
                         └───────────┬──────────┘
                                     │
                                     ▼
                         ┌──────────────────────┐
                         │ Event Ingestion      │
                         └───────────┬──────────┘
                                     │
                                     ▼
                         ┌──────────────────────┐
                         │ Revenue Risk Engine  │
                         └───────────┬──────────┘
                                     │
                                     ▼
                         ┌──────────────────────┐
                         │ Feature Engineering  │
                         └───────────┬──────────┘
                                     │
                                     ▼
                    ┌──────────────────────────────┐
                    │ Calibrated ML Recovery Core  │
                    │                              │
                    │ P(recovery | action)         │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │ Counterfactual Engine         │
                    │                              │
                    │ retry_now                    │
                    │ retry_delayed                │
                    │ reminder                     │
                    │ incentive_10                 │
                    │ no_action                    │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │ Financial Optimizer           │
                    │                              │
                    │ Expected Net Recovery         │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │ Deterministic Policy Guard    │
                    │                              │
                    │ Retry limits                 │
                    │ Incentive limits             │
                    │ Recovery windows             │
                    │ Escalation rules             │
                    └──────────────┬───────────────┘
                                   │
                         ┌─────────┴─────────┐
                         │                   │
                       PASS                BLOCK
                         │                   │
                         ▼                   ▼
                Razorpay Test API      Human / Fallback
                         │
                         ▼
                  Actual Outcome
                         │
                  ┌──────┴──────┐
                  ▼             ▼
             Audit Trail   Outcome Store
                                │
                                ▼
                       Evaluation Engine
```

---

# 🤖 AI/ML ENGINE

RECLAIM intentionally uses a **hybrid AI architecture** rather than putting an LLM in every component.

## 1. Calibrated ML Core

The ML layer predicts recovery probability for different interventions.

Current intervention space:

```text
retry_now
retry_delayed
reminder
incentive_10
no_action
```

### Features include:

* Transaction amount
* Payment method
* Failure reason
* Previous successful payments
* Previous failed payments
* Customer success rate
* Retry count
* Time since failure
* Customer activity
* Transaction timing
* Device/contextual attributes
* Historical recovery behavior

---

# 📈 Probability Calibration

Raw model probabilities can be poorly calibrated.

For a financial decision engine, this matters because:

> **0.80 probability should actually behave approximately like an 80% event rate over comparable predictions.**

RECLAIM therefore uses:

### Isotonic Regression

to calibrate intervention-specific recovery probabilities.

The pipeline is conceptually:

```text
Raw Features
     ↓
ML Model
     ↓
Raw Probability
     ↓
Isotonic Calibration
     ↓
Calibrated Recovery Probability
```

This probability is then consumed by the deterministic financial optimizer.

---

# 🧮 Expected Net Recovery

The central decision metric is:

```text
Expected Net Recovery =
P(recovery | action)
× Transaction Value
− API / Gateway Cost
− Incentive Cost
− Estimated Intervention Friction
```

The optimizer evaluates every eligible intervention.

Conceptually:

```text
Best Action =
argmax(Expected Net Recovery)
```

subject to merchant policies.

This separation is intentional:

### ML predicts.

### Optimization decides.

### Policy engine controls.

### Razorpay executes.

### Gemini explains.

---

# 🔀 Counterfactual Decision Engine

For each recovery opportunity, RECLAIM generates a side-by-side comparison of alternative actions.

Example:

```text
Transaction:
₹8,500

------------------------------------------------

ACTION                 EXPECTED NET RECOVERY

Retry Now                    ₹4,930

Retry After 6h               ₹6,460

Reminder                     ₹5,610

10% Incentive                ₹6,040

No Action                    ₹1,420

------------------------------------------------

SELECTED ACTION:
Retry After 6h

Reason:
Highest expected net recovery
within current merchant constraints.
```

### Important methodological distinction

Counterfactual results are explicitly treated as:

> **Model-estimated alternative outcomes**

rather than observed ground truth.

The system distinguishes between:

**Observed Outcome**

and

**Estimated Counterfactual Outcome**

to avoid overstating causal certainty.

---

# 🛡️ Deterministic Financial Guardrails

Autonomous financial actions require boundaries.

RECLAIM therefore does not allow the AI/LLM to directly authorize arbitrary money movement.

Example merchant policy:

```text
Maximum retries:          2
Recovery window:          48 hours
Maximum incentive:        10%
Maximum incentive value: ₹500
Maximum contacts:         3
High-value transactions:  Human review
Low-confidence decisions: Escalate
```

Decision flow:

```text
AI / ML Recommendation
          ↓
Financial Optimizer
          ↓
Policy Validator
          ↓
     ┌────┴────┐
     │         │
   PASS       FAIL
     │         │
     ▼         ▼
 Execute    Reject /
            Escalate
```

The agent cannot override deterministic financial rules.

---

# 🧠 Gemini Explainability Layer

RECLAIM uses **Google Gemini 1.5 Flash** as an explainability and orchestration layer.

The LLM is deliberately NOT responsible for:

* Financial calculations
* Probability estimation
* Policy enforcement
* Transaction authorization
* Retry limits
* Audit record generation

Instead, Gemini translates the underlying decision into a human-readable explanation.

Example:

> **Why did RECLAIM select a delayed retry?**
>
> The customer has a strong historical payment success rate and the current failure pattern is consistent with a temporary issue. A delayed retry has a higher estimated net recovery than an immediate retry while avoiding the additional cost of an incentive.

This creates a clean separation between:

```text
Quantitative Decision
        +
Human-readable Explanation
```

---

# 💳 Razorpay Integration

RECLAIM is designed around **Razorpay test-mode workflows**.

The integration layer is isolated from the core decision engine so that payment infrastructure can be replaced or extended without changing the ML and optimization logic.

Key principles:

* Test-mode transactions only
* Environment-based API secrets
* Backend-only secret handling
* Webhook validation where applicable
* Idempotent action handling
* Explicit action states
* Failure-aware execution

---

# 📊 Batch Simulation

To evaluate whether RECLAIM actually creates financial value, the system was evaluated across:

## **5,000 synthetic high-risk transactions**

### Simulated Results

| Metric                   |       Result |
| ------------------------ | -----------: |
| Transactions evaluated   |    **5,000** |
| Revenue at Risk          | **₹1.11 Cr** |
| Naive Retry Net Recovery | **₹20.77 L** |
| RECLAIM AI Net Recovery  | **₹52.17 L** |
| Net Uplift               | **₹31.41 L** |
| Uplift vs Naive Retry    |   **151.2%** |

### Interpretation

In the controlled synthetic simulation:

> RECLAIM generated substantially higher simulated net recovery than a naive retry strategy.

These are **simulation results, not production merchant results**.

The purpose of the experiment is to demonstrate the decision engine's ability to outperform a simple recovery baseline under the assumptions encoded in the synthetic environment.

---

# 🧪 Baseline Comparison

RECLAIM is evaluated against simpler strategies rather than only reporting its own performance.

### Baseline 1 — Do Nothing

No recovery intervention.

### Baseline 2 — Naive Retry

Apply a generic retry strategy.

### Baseline 3 — RECLAIM

Evaluate multiple interventions and optimize expected net recovery under constraints.

```text
             Revenue Recovery

Do Nothing
████████

Naive Retry
████████████████

RECLAIM
████████████████████████████████
```

The objective is not merely to maximize recovery probability.

It is to maximize:

> **Net recoverable revenue.**

---

# 📊 Merchant Dashboard

The React + Vite + Tailwind frontend acts as a merchant command center.

## Executive KPI Grid

Displays:

* Revenue At Risk
* Potentially Recoverable Revenue
* Intervention Cost
* Net Recovery
* Recovery Rate
* Net Uplift
* Active Recovery Actions
* Failed Actions
* Escalations

---

# 📈 Strategy Comparison

RECLAIM provides direct comparison between:

```text
Do Nothing Net
        VS
Naive Retry Net
        VS
RECLAIM AI Net
```

This makes the business impact visible without requiring judges to inspect the underlying model.

---

# 🎮 Counterfactual Decision Playground

The live playground allows a user to create/test a transaction by selecting parameters such as:

* Transaction amount
* Payment method
* Failure code
* Retry history
* Customer context

The backend then evaluates the transaction in real time.

The interface displays:

```text
Prediction
    ↓
Counterfactual Comparison
    ↓
Recommended Action
    ↓
Policy Validation
    ↓
Expected Net Recovery
    ↓
AI Explanation
```

---

# 🔍 Gemini Audit Stream

For every decision, RECLAIM can generate a human-readable explanation covering:

### What happened?

### Why is revenue at risk?

### What alternatives were evaluated?

### Why was this action selected?

### Why were other actions rejected?

### What constraints were applied?

---

# 🧾 Audit Trail

Every important decision is recorded as an event.

Example:

```text
10:42:13
Payment RP_10482 failed

10:42:14
Revenue risk detected

10:42:15
Customer features generated

10:42:16
Recovery probabilities calculated

10:42:17
Counterfactual actions evaluated

10:42:18
Delayed retry selected

10:42:18
Policy validation PASSED

10:42:19
Action scheduled

14:42:20
Recovery executed

14:42:23
Payment successful

--------------------------------

RECOVERED:
₹8,500
```

The audit trail creates traceability across:

```text
Event
→ Prediction
→ Decision
→ Policy
→ Action
→ API result
→ Outcome
```

---

# 🚨 Failure Handling

Financial automation should fail safely.

RECLAIM includes failure handling for recovery actions.

Example:

```text
Agent selects retry
       ↓
Razorpay API
       ↓
❌ Failure
       ↓
Retry policy evaluated
       ↓
Further retry prohibited
       ↓
Fallback intervention selected
       ↓
Audit trail updated
```

The system avoids uncontrolled retries and duplicate financial actions.

This demonstrates a core design principle:

> **When automation fails, it should degrade safely rather than become more aggressive.**

---

# 👤 Human-in-the-Loop

Not every transaction should be fully autonomous.

RECLAIM can escalate cases involving:

* High transaction value
* Low confidence
* Repeated failures
* Policy conflicts
* Unresolved exceptions
* Actions requiring manual approval

This creates:

```text
Automation
+
Guardrails
+
Human Oversight
```

rather than unrestricted agentic behavior.

---

# 🧱 Technology Stack

## Frontend

* React
* Vite
* Tailwind CSS
* JavaScript / TypeScript where applicable
* Recharts / visualization components

## Backend

* Python
* FastAPI
* Pydantic
* REST APIs

## Machine Learning

* Pandas
* NumPy
* scikit-learn
* Isotonic Regression
* Calibrated probability pipelines

## Generative AI

* Google Gemini 1.5 Flash

## Payments

* Razorpay Test Mode APIs

## Database / Persistence

* Configurable relational persistence layer

## Development

* Git
* GitHub
* Docker-ready architecture
* Python virtual environment
* npm

---

# 📁 Project Structure

```text
RECLAIM/
│
├── backend/
│   └── app/
│       ├── main.py
│       ├── models/
│       ├── schemas/
│       ├── services/
│       ├── ml/
│       ├── counterfactual/
│       ├── optimizer/
│       ├── policies/
│       ├── integrations/
│       └── audit/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── assets/
│
├── ml/
│   ├── datasets/
│   ├── training/
│   ├── evaluation/
│   └── models/
│
├── scripts/
│   ├── generate_data.py
│   ├── seed_database.py
│   └── run_evaluation.py
│
├── docs/
│   ├── architecture.md
│   ├── methodology.md
│   └── evaluation.md
│
├── .env.example
├── docker-compose.yml
└── README.md
```

---

# ⚙️ Quick Start

## Prerequisites

Install:

* Python 3.11+
* Node.js 18+
* npm
* Git

---

## 1. Clone the repository

```bash
git clone <YOUR_PUBLIC_GITHUB_URL>
cd RECLAIM
```

---

# 2. Backend Setup

Create and activate a virtual environment.

### Windows

```powershell
python -m venv venv
.\venv\Scripts\activate
```

### Install dependencies

```powershell
pip install -r requirements.txt
```

---

# 3. Environment Configuration

Create:

```text
.env
```

from:

```text
.env.example
```

Configure the required credentials:

```text
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
GEMINI_API_KEY=
```

Never commit `.env` or API secrets to GitHub.

---

# 4. Start FastAPI

From the project root:

```powershell
uvicorn backend.app.main:app --reload --port 8000
```

Backend:

```text
http://localhost:8000
```

FastAPI documentation:

```text
http://localhost:8000/docs
```

---

# 5. Start Frontend

Open another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Vite will provide the local frontend URL.

---

# 🧪 Running the Simulation

Use the project evaluation/data-generation scripts to generate or load the synthetic transaction batch.

Example:

```bash
python scripts/generate_data.py
python scripts/run_evaluation.py
```

The evaluation compares:

```text
Do Nothing
vs
Naive Retry
vs
RECLAIM
```

and reports recovery and net financial metrics.

---

# 🎬 Recommended Demo Flow

The complete product can be demonstrated through a simple narrative:

### 01 — Revenue at Risk

Start with:

> **₹1.11 Cr revenue at risk**

from the synthetic merchant batch.

---

### 02 — Run RECLAIM

Process the transaction batch.

Show:

```text
5,000 transactions analyzed
        ↓
Recovery opportunities identified
        ↓
Counterfactual strategies evaluated
        ↓
Optimal actions selected
        ↓
Policies validated
```

---

### 03 — Compare Strategies

Show:

```text
Naive Retry:
₹20.77L

RECLAIM:
₹52.17L
```

Then highlight:

> **₹31.41L simulated net uplift**

---

### 04 — Inspect One Decision

Open a transaction and show:

```text
Retry Now
Retry Later
Reminder
Incentive
No Action
```

Then reveal the selected action and why it won.

---

### 05 — Show the Guardrail

Demonstrate a transaction where an otherwise attractive action violates merchant policy.

RECLAIM blocks it.

```text
AI Recommendation
        ↓
Policy Violation
        ↓
BLOCKED
        ↓
Alternative / Escalation
```

---

### 06 — Break the System

Trigger a simulated API failure.

Show:

```text
Action Failed
      ↓
No uncontrolled retry
      ↓
Fallback strategy
      ↓
Audit event
```

---

### 07 — End With Measured Impact

Finish with:

> **RECLAIM recovered more simulated net revenue than naive retry while maintaining bounded, explainable automation.**

---

# 🏆 Why RECLAIM Is Different

Traditional recovery:

```text
Payment Failed
      ↓
Retry
```

RECLAIM:

```text
Payment Failed
      ↓
What happened?
      ↓
What can we recover?
      ↓
What could each intervention achieve?
      ↓
What is the expected net value?
      ↓
What am I allowed to do?
      ↓
What action should I take?
      ↓
Execute
      ↓
What actually happened?
      ↓
What did we learn?
```

The distinction is:

> **RECLAIM optimizes recovery decisions rather than simply automating recovery actions.**

---

# 🔐 Security & Responsible Automation

RECLAIM follows several principles for financial AI:

### Least Authority

The AI does not receive unrestricted financial control.

### Deterministic Guardrails

Financial constraints are enforced outside the LLM.

### Explainability

Every automated decision has a human-readable rationale.

### Auditability

Decisions and actions are recorded.

### Stopping Rules

Repeated or ineffective interventions are stopped.

### Human Escalation

High-risk or uncertain cases can require manual review.

### Test Mode

The project is designed for controlled Razorpay test-mode workflows.

---

# 📐 Evaluation Philosophy

RECLAIM does not rely on a single model accuracy number.

The system evaluates:

### Financial Metrics

* Revenue at Risk
* Net Recovery
* Recovery Rate
* Intervention Cost
* Net Uplift

### ML Metrics

* Precision
* Recall
* Probability calibration
* Held-out test performance

### Decision Metrics

* Action selection quality
* Expected vs observed recovery
* Unnecessary intervention rate
* Policy violation rate

### Agent Metrics

* Successful action execution
* Failure recovery
* Escalation rate
* Audit completeness

---

# ⚠️ Limitations

RECLAIM is currently a buildathon prototype and should not be interpreted as a production payment recovery system.

### Synthetic Evaluation

The reported ₹52.17L recovery and ₹31.41L uplift are derived from a **5,000-transaction synthetic simulation**.

### Counterfactual Uncertainty

Alternative intervention outcomes are model estimates, not directly observed outcomes.

### Test Environment

Payment workflows are demonstrated in controlled/test environments.

### Model Drift

Real merchant behavior can change over time, requiring continuous monitoring and recalibration.

### Causal Inference

The counterfactual engine should not be interpreted as establishing causal effects without appropriate experimentation.

These limitations are intentionally disclosed rather than hidden.

---

# 🔮 Future Roadmap

Potential extensions include:

### 01 — Online Learning

Continuously update intervention effectiveness from observed outcomes.

### 02 — Merchant-Specific Models

Learn recovery behavior independently for different merchant categories.

### 03 — Multi-Armed Bandit Recovery

Use controlled experimentation to optimize intervention allocation.

### 04 — Real-Time Payment Degradation Detection

Detect merchant-wide payment failures before they become significant revenue losses.

### 05 — Advanced Causal Modeling

Introduce more rigorous causal inference techniques for intervention-effect estimation.

### 06 — Multi-Channel Recovery

Support merchant-approved channels such as email, SMS, WhatsApp, and voice.

### 07 — Agent Evaluation Framework

Continuously evaluate whether autonomous actions actually improve net recovery without increasing customer friction.

---

# 💭 Design Philosophy

RECLAIM follows five principles:

```text
1. Predict before acting.

2. Compare alternatives before choosing.

3. Optimize net value, not raw recovery.

4. Never let the AI bypass financial guardrails.

5. Measure actual outcomes against estimated outcomes.
```

---

# 👨‍💻 Built By

**Harsha Vardhan B S**

Computer Science & Engineering
Final-Year B.Tech Student

### Areas demonstrated

* Python
* Machine Learning
* Generative AI
* Agentic Systems
* Financial Optimization
* FastAPI
* React
* Data Analytics
* API Integration
* System Design
* Responsible AI

---

# ⭐ Buildathon Context

RECLAIM was built for the:

## **Razorpay Buildathon 2026**

### Track 03 — AI Revenue Recovery

> **Find revenue that’s slipping away and win it back.**

RECLAIM approaches the problem through **counterfactual decisioning, calibrated recovery prediction, bounded agentic execution, and measurable net recovery.**

---

# 📌 Final Pitch

> **RECLAIM doesn't blindly retry failed payments. It simulates the recovery choices, predicts their financial outcomes, enforces merchant guardrails, executes the best permissible intervention, and measures what actually happened.**

### **Don't just recover payments. Reclaim the revenue.**
