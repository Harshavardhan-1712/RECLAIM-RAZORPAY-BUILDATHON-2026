import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import roc_auc_score, brier_score_loss
import joblib
import os

DATA_PATH = "ml/datasets/reclaim_synthetic_data.csv"
MODEL_DIR = "ml/models/"
ACTIONS = ["retry_now", "retry_delayed", "reminder", "incentive_10", "no_action"]

def train_and_evaluate():
    print("Loading synthetic dataset...")
    df = pd.read_csv(DATA_PATH)
    
    numeric_features = ["amount", "historical_success_rate", "previous_failed_attempts", "time_of_day"]
    categorical_features = ["error_code", "device_type"]
    
    X = df[numeric_features + categorical_features]
    
    preprocessor = ColumnTransformer(transformers=[
        ('num', StandardScaler(), numeric_features),
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
    ])
    
    os.makedirs(MODEL_DIR, exist_ok=True)
    
    print("\nTraining Calibrated Counterfactual Models...\n" + "-"*50)
    
    for action in ACTIONS:
        label_col = f"outcome_{action}"
        y = df[label_col]
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        base_rf = RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42)
        calibrated_rf = CalibratedClassifierCV(base_rf, method='isotonic', cv=3)
        
        pipeline = Pipeline(steps=[('preprocessor', preprocessor), ('classifier', calibrated_rf)])
        pipeline.fit(X_train, y_train)
        
        y_pred_proba = pipeline.predict_proba(X_test)[:, 1]
        auc = roc_auc_score(y_test, y_pred_proba)
        brier = brier_score_loss(y_test, y_pred_proba)
        
        print(f"Action: {action.upper()}")
        print(f"  - ROC AUC:     {auc:.4f} (Ability to rank)")
        print(f"  - Brier Score: {brier:.4f} (Probability calibration)")
        
        joblib.dump(pipeline, os.path.join(MODEL_DIR, f"model_{action}.joblib"))
        
    print("-" * 50 + f"\n✅ All {len(ACTIONS)} models trained and saved to {MODEL_DIR}")

if __name__ == "__main__":
    train_and_evaluate()