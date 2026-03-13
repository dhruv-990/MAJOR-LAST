"""
Outage Sense – Synthetic Dataset Generator
Produces realistic infrastructure metrics for training the anomaly detection model.
"""

import os
import numpy as np
import pandas as pd

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "data")
OUTPUT_PATH = os.path.join(OUTPUT_DIR, "metrics_dataset.csv")


def generate_dataset(n_normal: int = 5000, n_anomalous: int = 250):
    """
    Generate a synthetic dataset of infrastructure metrics.

    Normal ranges
    -------------
    cpu_usage      : 10 – 75 %
    memory_usage   : 20 – 80 %
    disk_usage     : 15 – 70 %
    network_latency: 1 – 100 ms
    pod_restarts   : 0 – 3

    Anomalous ranges
    -----------------
    cpu_usage      : 85 – 100 %
    memory_usage   : 85 – 100 %
    disk_usage     : 80 – 100 %
    network_latency: 200 – 2000 ms
    pod_restarts   : 5 – 50
    """
    np.random.seed(42)

    # ── Normal data ──────────────────────────────────────────────
    normal = pd.DataFrame(
        {
            "cpu_usage": np.random.uniform(10, 75, n_normal),
            "memory_usage": np.random.uniform(20, 80, n_normal),
            "disk_usage": np.random.uniform(15, 70, n_normal),
            "network_latency": np.random.uniform(1, 100, n_normal),
            "pod_restarts": np.random.randint(0, 4, n_normal),
        }
    )
    normal["label"] = 0  # normal

    # ── Anomalous data ───────────────────────────────────────────
    anomalous = pd.DataFrame(
        {
            "cpu_usage": np.random.uniform(85, 100, n_anomalous),
            "memory_usage": np.random.uniform(85, 100, n_anomalous),
            "disk_usage": np.random.uniform(80, 100, n_anomalous),
            "network_latency": np.random.uniform(200, 2000, n_anomalous),
            "pod_restarts": np.random.randint(5, 51, n_anomalous),
        }
    )
    anomalous["label"] = 1  # anomaly

    dataset = pd.concat([normal, anomalous], ignore_index=True).sample(
        frac=1, random_state=42
    )

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    dataset.to_csv(OUTPUT_PATH, index=False)
    print(f"✅ Dataset saved to {OUTPUT_PATH}  ({len(dataset)} rows)")
    return dataset


if __name__ == "__main__":
    generate_dataset()
