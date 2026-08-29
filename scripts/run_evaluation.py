import sys
import os

# Add root directory to sys.path so backend module can be found
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import json
import pandas as pd
import joblib
import time

from backend.app.counterfactual.optimizer import Transaction, MerchantPolicies

# Dynamic paths for cross-platform compatibility
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "ml", "datasets", "reclaim_synthetic_data.csv")
MODEL_DIR = os.path.join(BASE_DIR, "ml", "models")
OUTPUT_DIR = os.path.join(BASE_DIR, "frontend", "src", "data")
OUTPUT_JSON = os.path.join(OUTPUT_DIR, "simulation_results.json")
ACTIONS = ["retry_now", "retry_delayed", "reminder", "incentive_10", "no_action"]

def calculate_actual_cost(amount: float, action: str, policies: MerchantPolicies) -> float:
    if action in ["retry_now", "retry_delayed"]:
        return 2.0
    elif action == "reminder":
        return 1.0
    elif action == "incentive_10":
        return min(amount * 0.10, policies.max_incentive_cap)
    return 0.0

def run_simulation():
    print("Loading Machine Learning Models...")
    models = {}
    for action in ACTIONS:
        models[action] = joblib.load(os.path.join(MODEL_DIR, f"model_{action}.joblib"))
        
    policies = MerchantPolicies()
    
    print(f"Loading Synthetic Data from {DATA_PATH}...")
    df = pd.read_csv(DATA_PATH)
    
    print("Pre-computing batch probabilities across all 5,000 records...")
    start_time = time.time()
    
    # 1. Extract feature set matching exact training column order
    X_batch = df[["amount", "historical_success_rate", "previous_failed_attempts", "time_of_day", "error_code", "device_type"]]
    
    # 2. Vectorized prediction (5 batch model calls total instead of 25,000 individual calls)
    batch_probs = {}
    for action in ACTIONS:
        batch_probs[action] = models[action].predict_proba(X_batch)[:, 1]
        
    metrics = {
        "total_transactions": len(df),
        "total_revenue_at_risk": float(df["amount"].sum()),
        "baselines": {
            "no_action": {"recovered": 0.0, "cost": 0.0, "net": 0.0},
            "naive_retry": {"recovered": 0.0, "cost": 0.0, "net": 0.0},
        },
        "reclaim": {
            "expected_net": 0.0,
            "actual_recovered": 0.0,
            "cost": 0.0,
            "actual_net": 0.0,
            "action_distribution": {a: 0 for a in ACTIONS}
        }
    }
    
    # 3. Fast evaluation loop
    for i, row in df.iterrows():
        amt = float(row["amount"])
        
        # Ground truth baselines
        if row["outcome_no_action"] == 1:
            metrics["baselines"]["no_action"]["recovered"] += amt
            metrics["baselines"]["no_action"]["net"] += amt
            
        retry_cost = calculate_actual_cost(amt, "retry_now", policies)
        metrics["baselines"]["naive_retry"]["cost"] += retry_cost
        if row["outcome_retry_now"] == 1:
            metrics["baselines"]["naive_retry"]["recovered"] += amt
            metrics["baselines"]["naive_retry"]["net"] += (amt - retry_cost)
        else:
            metrics["baselines"]["naive_retry"]["net"] -= retry_cost

        # Counterfactual evaluation using pre-computed batch probabilities
        tx = Transaction(
            id=str(row["transaction_id"]),
            amount=amt,
            error_code=str(row["error_code"]),
            historical_success_rate=float(row["historical_success_rate"]),
            previous_failed_attempts=int(row["previous_failed_attempts"]),
            time_of_day=int(row["time_of_day"]),
            device_type=str(row["device_type"])
        )
        
        evaluations = []
        for action in ACTIONS:
            is_allowed, reason = policies.check_action_allowed(tx, action)
            if not is_allowed:
                continue
                
            p_rec = float(batch_probs[action][i])
            cost = calculate_actual_cost(amt, action, policies)
            expected_net = (p_rec * amt) - cost
            evaluations.append((action, expected_net, p_rec, cost))
            
        best_action, best_expected_net, best_p_rec, best_cost = max(evaluations, key=lambda x: x[1])
        
        metrics["reclaim"]["expected_net"] += best_expected_net
        metrics["reclaim"]["action_distribution"][best_action] += 1
        metrics["reclaim"]["cost"] += best_cost
        
        outcome_col = f"outcome_{best_action}"
        if row[outcome_col] == 1:
            metrics["reclaim"]["actual_recovered"] += amt
            metrics["reclaim"]["actual_net"] += (amt - best_cost)
        else:
            metrics["reclaim"]["actual_net"] -= best_cost

    elapsed = time.time() - start_time
    print(f"Simulation complete in {elapsed:.2f} seconds.")
    
    # Round metrics for JSON format
    def round_dict(d):
        for k, v in d.items():
            if isinstance(v, dict): round_dict(v)
            elif isinstance(v, float): d[k] = round(v, 2)
            
    round_dict(metrics)
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    with open(OUTPUT_JSON, "w") as f:
        json.dump(metrics, f, indent=2)
        
    print("\n--- MEASURED BUSINESS IMPACT ---")
    print(f"Revenue At Risk:            ₹{metrics['total_revenue_at_risk']:,.2f}")
    print(f"Baseline (Naive Retry) Net: ₹{metrics['baselines']['naive_retry']['net']:,.2f}")
    print(f"RECLAIM Net Recovered:      ₹{metrics['reclaim']['actual_net']:,.2f}")
    print(f"Uplift vs Naive Retry:      +₹{(metrics['reclaim']['actual_net'] - metrics['baselines']['naive_retry']['net']):,.2f}")
    print(f"\n✅ Results exported to {OUTPUT_JSON} for the React Dashboard.")

if __name__ == "__main__":
    run_simulation()