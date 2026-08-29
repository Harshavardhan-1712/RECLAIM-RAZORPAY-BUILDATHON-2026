# RECLAIM AI: Counterfactual Revenue Recovery & Agentic Orchestration Engine
> *Built for the Razorpay Buildathon 2026*

RECLAIM is an enterprise-grade fintech intelligence engine designed to solve the multi-million dollar problem of failed online payments. Unlike legacy payment routers that rely on naive, blanket retries (which often spike gateway fees and degrade merchant net recovery), RECLAIM treats payment recovery as a **counterfactual optimization problem**.

---

## 🚀 Core Architecture

1. **Calibrated Machine Learning Core (`ml/`)**: 
   * Custom scikit-learn pipelines with **Isotonic Regression** calibration predicting exact recovery probabilities across multiple distinct interventions (`retry_now`, `retry_delayed`, `reminder`, `incentive_10`, `no_action`).
2. **Deterministic Financial Policy Guardrails (`backend/app/`)**: 
   * Strict business rule bounding that mathematically projects $E[\text{Net Recovery}]$ by factoring in API costs, gateway fees, and discount friction *before* an action is permitted.
3. **Agentic Explainability (`backend/app/main.py`)**: 
   * Integrated with **Google Gemini 1.5 Flash** to provide instant, human-readable audit trails and justifications for every automated decision made by the engine.
4. **Interactive Merchant Dashboard (`frontend/`)**: 
   * A modern React + Tailwind analytics suite visualizing net uplift comparisons, intervention distribution mixes, and a live testing playground.

---

## 📊 Measured Business Impact (Batch Simulation)
Evaluated across **5,000 synthetic high-risk transactions**:
* **Revenue At Risk:** ₹1.11 Cr
* **Naive Retry Net Recovery:** ₹20.77 L
* **RECLAIM AI Net Recovery:** ₹52.17 L
* **Net Uplift:** **+₹31.41 Lakhs (+151.2% uplift over baseline)**

---

## 🛠️ Quick Start Guide

### 1. Start the FastAPI Backend
```powershell
# Activate your virtual environment
.\venv\Scripts\activate

# Launch FastAPI on port 8000
uvicorn backend.app.main:app --reload --port 8000
# Navigate to frontend and run Vite
cd frontend
npm run dev
