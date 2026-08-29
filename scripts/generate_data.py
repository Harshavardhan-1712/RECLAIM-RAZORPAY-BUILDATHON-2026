import pandas as pd
import numpy as np
import uuid
import os

# Set deterministic seed for reproducibility
np.random.seed(42)
NUM_SAMPLES = 5000
OUTPUT_PATH = "ml/datasets/reclaim_synthetic_data.csv"

def generate_synthetic_data(n_samples=NUM_SAMPLES):
    print(f"Generating {n_samples} synthetic failed transactions...")
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    
    transaction_ids = [f"RP_{uuid.uuid4().hex[:8].upper()}" for _ in range(n_samples)]
    customer_ids = [f"CUST_{np.random.randint(1000, 9999)}" for _ in range(n_samples)]
    
    # Amounts skewed towards smaller transactions, clipped to realistic bounds
    amounts = np.round(np.random.lognormal(mean=7.0, sigma=1.2, size=n_samples), 2)
    amounts = np.clip(amounts, 100, 150000) 
    
    error_codes = np.random.choice(
        ['GATEWAY_TIMEOUT', 'INSUFFICIENT_FUNDS', 'CUSTOMER_ABANDONED', '3D_SECURE_FAILED', 'RISK_BLOCKED'],
        p=[0.30, 0.25, 0.30, 0.10, 0.05], size=n_samples
    )
    
    historical_success_rates = np.random.beta(a=5, b=2, size=n_samples) 
    previous_failed_attempts = np.random.choice([0, 1, 2], p=[0.7, 0.2, 0.1], size=n_samples)
    time_of_day = np.random.randint(0, 24, size=n_samples)
    device_type = np.random.choice(['Mobile', 'Desktop'], p=[0.75, 0.25], size=n_samples)
    
    data = []
    
    for i in range(n_samples):
        err = error_codes[i]
        amt = amounts[i]
        hist_succ = historical_success_rates[i]
        prev_fail = previous_failed_attempts[i]
        
        # Base multiplier logic
        customer_modifier = (hist_succ * 1.2) - (prev_fail * 0.15)
        p_no_action = 0.01 
        p_retry_now = 0.05
        p_retry_delayed = 0.10
        p_reminder = 0.15
        p_incentive = 0.20
        
        # Causal logic injected so models can learn the patterns
        if err == 'GATEWAY_TIMEOUT':
            p_retry_now = 0.65  
            p_retry_delayed = 0.50
        elif err == 'INSUFFICIENT_FUNDS':
            p_retry_now = 0.02 
            p_retry_delayed = 0.35 
            p_reminder = 0.40   
        elif err == 'CUSTOMER_ABANDONED':
            p_retry_now = 0.0  
            p_retry_delayed = 0.0
            p_reminder = 0.30 
            p_incentive = 0.75 if amt > 2000 else 0.50 
        elif err == '3D_SECURE_FAILED':
            p_retry_now = 0.10
            p_reminder = 0.45  
        elif err == 'RISK_BLOCKED':
            p_retry_now = 0.0
            p_retry_delayed = 0.0
            p_reminder = 0.05
            p_incentive = 0.0
            
        probs = {
            'no_action': np.clip(p_no_action * customer_modifier, 0.01, 0.95),
            'retry_now': np.clip(p_retry_now * customer_modifier, 0.01, 0.95),
            'retry_delayed': np.clip(p_retry_delayed * customer_modifier, 0.01, 0.95),
            'reminder': np.clip(p_reminder * customer_modifier, 0.01, 0.95),
            'incentive_10': np.clip(p_incentive * customer_modifier, 0.01, 0.95)
        }
        
        # Sample ground truth based on generated probabilities
        outcomes = {f"outcome_{k}": np.random.binomial(1, v) for k, v in probs.items()}
        
        row = {
            "transaction_id": transaction_ids[i],
            "customer_id": customer_ids[i],
            "amount": amt,
            "error_code": err,
            "historical_success_rate": round(hist_succ, 3),
            "previous_failed_attempts": prev_fail,
            "time_of_day": time_of_day[i],
            "device_type": device_type[i],
            **outcomes
        }
        data.append(row)
        
    df = pd.DataFrame(data)
    df.to_csv(OUTPUT_PATH, index=False)
    print(f"✅ Successfully generated {n_samples} records and saved to {OUTPUT_PATH}")

if __name__ == "__main__":
    generate_synthetic_data()