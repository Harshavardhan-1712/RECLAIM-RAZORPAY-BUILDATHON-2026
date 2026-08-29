import os
import joblib
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any
import google.generativeai as genai
from fastapi.middleware.cors import CORSMiddleware

from backend.app.counterfactual.optimizer import Transaction, CounterfactualOptimizer, MerchantPolicies, OptimizationResult

# Secure dynamic paths for Windows
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_DIR = os.path.join(BASE_DIR, "ml", "models")
ACTIONS = ["retry_now", "retry_delayed", "reminder", "incentive_10", "no_action"]

ml_models: Dict[str, Any] = {}

genai.configure(api_key=os.getenv("GEMINI_API_KEY", "dummy_key"))
llm_model = genai.GenerativeModel('gemini-1.5-flash')

@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"Loading Models from {MODEL_DIR}...")
    for action in ACTIONS:
        path = os.path.join(MODEL_DIR, f"model_{action}.joblib")
        if os.path.exists(path):
            ml_models[action] = joblib.load(path)
            print(f"  -> Loaded {action}")
    yield
    ml_models.clear()

app = FastAPI(title="RECLAIM API", lifespan=lifespan)
@app.get("/api/v1/health")
async def health_check():
    gemini_configured = bool(
        os.getenv("GEMINI_API_KEY")
        and os.getenv("GEMINI_API_KEY") != "dummy_key"
    )

    return {
        "status": "ok",
        "service": "RECLAIM API",
        "models_loaded": len(ml_models),
        "models_expected": len(ACTIONS),
        "models_ready": len(ml_models) == len(ACTIONS),
        "gemini_configured": gemini_configured,
        "execution_mode": "simulation"
    }

# --- ADD THIS CORS MIDDLEWARE ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# --------------------------------

class ExplainabilityAgent:
    @staticmethod
    def generate_explanation(transaction: Transaction, result: OptimizationResult) -> str:
        alternatives_text = "\n".join([f"- {e.action}: ₹{e.expected_net_recovery}" for e in result.evaluations if e.action != result.selected_action])
        prompt = f"""
        Explain this fintech AI decision concisely (2 sentences).
        Tx: ₹{transaction.amount}, Error: {transaction.error_code}.
        Selected: {result.selected_action} (Expected: ₹{result.expected_net_recovery}).
        Alternatives Rejected: {alternatives_text}
        """
        try:
            if os.getenv("GEMINI_API_KEY") in [None, "dummy_key", ""]:
                return f"SYSTEM: {result.selected_action} selected to maximize net recovery adhering to policies."
            return llm_model.generate_content(prompt).text.strip()
        except:
            return "Explanation temporarily unavailable."

class EvaluationResponse(BaseModel):
    transaction_id: str
    selected_action: str
    expected_net_recovery: float
    confidence: float
    llm_explanation: str
    detailed_evaluations: list

def get_optimizer() -> CounterfactualOptimizer:
    if not ml_models:
        raise HTTPException(status_code=503, detail="Models not loaded")
    return CounterfactualOptimizer(models_dict=ml_models, policies=MerchantPolicies())

@app.post("/api/v1/recovery/evaluate", response_model=EvaluationResponse)
async def evaluate_recovery(transaction: Transaction, optimizer: CounterfactualOptimizer = Depends(get_optimizer)):
    result = optimizer.evaluate(transaction)
    explanation = ExplainabilityAgent.generate_explanation(transaction, result)
    return EvaluationResponse(
        transaction_id=result.transaction_id,
        selected_action=result.selected_action,
        expected_net_recovery=result.expected_net_recovery,
        confidence=result.confidence,
        llm_explanation=explanation,
        detailed_evaluations=[e.dict() for e in result.evaluations]
    )