import time
from typing import List, Dict, Any
from pydantic import BaseModel
from backend.app.counterfactual.optimizer import OptimizationResult, Transaction
from datetime import datetime

class AuditEvent(BaseModel):
    timestamp: str
    type: str 
    message: str
    meta: Dict[str, Any] = None

class ExecutionResult(BaseModel):
    transaction_id: str
    final_action_taken: str
    status: str
    audit_trail: List[AuditEvent]

class RazorpayTestModeClient:
    def execute_recovery(self, transaction_id: str, action: str) -> bool:
        if "FAIL_DEMO" in transaction_id and action in ["retry_now", "retry_delayed"]:
            raise Exception("502 Bad Gateway: simulated Razorpay test-mode upstream timeout.")
        time.sleep(0.5)
        return True

class RecoveryExecutionAgent:
    def __init__(self, rzp_client: RazorpayTestModeClient):
        self.rzp_client = rzp_client
        
    def _create_timestamp(self) -> str:
        return datetime.utcnow().strftime("%H:%M:%S.%f")[:-3]

    def execute_with_fallback(self, transaction: Transaction, plan: OptimizationResult) -> ExecutionResult:
        audit_trail = [
            AuditEvent(
                timestamp=self._create_timestamp(), type="ai_calc",
                message=f"Optimizer selected {plan.selected_action} (Expected Net: ₹{plan.expected_net_recovery})",
                meta={"confidence": plan.confidence}
            )
        ]
        
        primary_action = plan.selected_action
        
        try:
            audit_trail.append(AuditEvent(
                timestamp=self._create_timestamp(), type="execution",
               message=f"Initiating Razorpay test-mode recovery simulation for {primary_action}...",
                meta={
    "execution_mode": "razorpay_test_mode_simulation",
    "transaction_id": transaction.id
}
            ))
            
            self.rzp_client.execute_recovery(transaction.id, primary_action)
            audit_trail.append(AuditEvent(
                timestamp=self._create_timestamp(), type="recovery_success",
                message="Action executed successfully.", meta={"status": "captured"}
            ))
            return ExecutionResult(transaction_id=transaction.id, final_action_taken=primary_action, status="SUCCESS", audit_trail=audit_trail)
                
        except Exception as e:
            audit_trail.append(AuditEvent(timestamp=self._create_timestamp(), type="error", message=f"API Execution Failed: {str(e)}"))
            audit_trail.append(AuditEvent(timestamp=self._create_timestamp(), type="ai_calc", message="Activating fallback strategy..."))
            
            safe_actions = ["reminder", "incentive_10"]
            fallback_evals = [e for e in plan.evaluations if e.is_allowed and e.action in safe_actions and e.action != primary_action]
            
            if not fallback_evals:
                audit_trail.append(AuditEvent(timestamp=self._create_timestamp(), type="policy_block", message="No viable fallback actions. Escalating."))
                return ExecutionResult(transaction_id=transaction.id, final_action_taken="ESCALATED", status="ESCALATED", audit_trail=audit_trail)
                
            best_fallback = max(fallback_evals, key=lambda x: x.expected_net_recovery)
            audit_trail.append(AuditEvent(timestamp=self._create_timestamp(), type="execution", message=f"Executing fallback: {best_fallback.action}"))
            
            return ExecutionResult(transaction_id=transaction.id, final_action_taken=best_fallback.action, status="FALLBACK_SUCCESS", audit_trail=audit_trail)