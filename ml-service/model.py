"""
Outage Sense – ML Model Module
Isolation Forest for infrastructure anomaly detection
"""

import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
MODEL_PATH = os.path.join(MODEL_DIR, "isolation_forest.pkl")

FEATURE_COLUMNS = [
    "cpu_usage",
    "memory_usage",
    "disk_usage",
    "network_latency",
    "pod_restarts",
]


def get_model():
    """Load the trained model from disk, or return None if not found."""
    if os.path.exists(MODEL_PATH):
        return joblib.load(MODEL_PATH)
    return None


def train_model(data: pd.DataFrame, contamination: float = 0.05):
    """
    Train an Isolation Forest model on the provided DataFrame.

    Parameters
    ----------
    data : pd.DataFrame
        Must contain columns defined in FEATURE_COLUMNS.
    contamination : float
        Expected proportion of outliers in the data.

    Returns
    -------
    dict  Summary statistics of the training run.
    """
    os.makedirs(MODEL_DIR, exist_ok=True)

    X = data[FEATURE_COLUMNS].values

    model = IsolationForest(
        n_estimators=200,
        contamination=contamination,
        max_samples="auto",
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X)
    joblib.dump(model, MODEL_PATH)

    scores = model.decision_function(X)
    predictions = model.predict(X)

    return {
        "samples_trained": int(len(X)),
        "anomalies_found": int((predictions == -1).sum()),
        "contamination": contamination,
        "mean_score": float(np.mean(scores)),
        "model_path": MODEL_PATH,
    }


def predict(data: pd.DataFrame):
    """
    Predict anomalies for the incoming metrics data.

    Returns
    -------
    list[dict]  One result per row with prediction label and anomaly score.
    """
    model = get_model()
    if model is None:
        raise FileNotFoundError(
            "Model not trained yet. Call POST /train first."
        )

    X = data[FEATURE_COLUMNS].values
    predictions = model.predict(X)
    scores = model.decision_function(X)

    results = []
    for i in range(len(X)):
        results.append(
            {
                "cpu_usage": float(X[i][0]),
                "memory_usage": float(X[i][1]),
                "disk_usage": float(X[i][2]),
                "network_latency": float(X[i][3]),
                "pod_restarts": int(X[i][4]),
                "prediction": "anomaly" if predictions[i] == -1 else "normal",
                "anomaly_score": float(scores[i]),
            }
        )
    return results
