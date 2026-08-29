import pandas as pd
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

# --- Data Structures ---
class Transaction(BaseModel):
    id: str
    amount: float
    error_code: str
    historical_success_rate: float
    previous_failed_attempts: int
    time_of_day: int
    device_type: str
    
class ActionEvaluation(BaseModel):
    action: str
    is_allowed: bool
    policy_reason: Optional[str]
    p_recovery: float
    expected_net_recovery: float
    costs_incurred: float

class OptimizationResult(BaseModel):
    transaction_id: str
    selected_action: str
    expected_net_recovery: float
    confidence: float
    evaluations: List[ActionEvaluation]

# --- Policy Engine ---
class MerchantPolicies:
    def __init__(self):
        self.min_amount_for_incentive = 500.0  
        self.max_incentive_cap = 1000.0        
        self.max_retries = 2
        
    def check_action_allowed(self, transaction: Transaction, action: str) -> tuple[bool, str]:
        if action == "incentive_10":
            if transaction.amount < self.min_amount_for_incentive:
                return False, f"Amount ₹{transaction.amount} below incentive threshold (₹{self.min_amount_for_incentive})"
            
        if action in ["retry_now", "retry_delayed"]:
            if transaction.previous_failed_attempts >= self.max_retries:
                return False, f"Max retries ({self.max_retries}) exceeded"
                
        if transaction.error_code == "RISK_BLOCKED" and action not in ["no_action", "reminder"]:
            return False, "Financial actions disabled for RISK_BLOCKED. Only communication allowed."
            
        return True, "Passed all policies"

# --- Core Optimizer ---
class CounterfactualOptimizer:
    def __init__(self, models_dict: Dict[str, Any], policies: MerchantPolicies):
        self.models = models_dict
        self.policies = policies
        self.actions = ["no_action", "retry_now", "retry_delayed", "reminder", "incentive_10"]
        
    def _calculate_costs(self, amount: float, action: str) -> float:
        costs = 0.0
        if action in ["retry_now", "retry_delayed"]:
            costs += 2.0  # Gateway fee
        elif action == "reminder":
            costs += 1.0  # SMS fee
        elif action == "incentive_10":
            costs += min(amount * 0.10, self.policies.max_incentive_cap)
        return costs

    def evaluate(self, transaction: Transaction) -> OptimizationResult:
        evaluations = []
       # Force the exact column order that the scikit-learn pipeline expects
        features_df = pd.DataFrame([{
            "amount": transaction.amount,
            "historical_success_rate": transaction.historical_success_rate,
            "previous_failed_attempts": transaction.previous_failed_attempts,
            "time_of_day": transaction.time_of_day,
            "error_code": transaction.error_code,
            "device_type": transaction.device_type
        }])
        
        for action in self.actions:
            is_allowed, reason = self.policies.check_action_allowed(transaction, action)
            
            if not is_allowed:
                evaluations.append(ActionEvaluation(
                    action=action, is_allowed=False, policy_reason=reason,
                    p_recovery=0.0, expected_net_recovery=0.0, costs_incurred=0.0
                ))
                continue
                
            model = self.models[action]
            p_recovery = model.predict_proba(features_df)[0][1] 
            
            costs = self._calculate_costs(transaction.amount, action)
            expected_net = (p_recovery * transaction.amount) - costs
            
            evaluations.append(ActionEvaluation(
                action=action, is_allowed=True, policy_reason=reason,
                p_recovery=round(p_recovery, 4), expected_net_recovery=round(expected_net, 2), costs_incurred=round(costs, 2)
            ))
            
        valid_evaluations = [e for e in evaluations if e.is_allowed]
        best_action = max(valid_evaluations, key=lambda x: x.expected_net_recovery)
        
        return OptimizationResult(
            transaction_id=transaction.id,
            selected_action=best_action.action,
            expected_net_recovery=best_action.expected_net_recovery,
            confidence=best_action.p_recovery,
            evaluations=evaluations
        )