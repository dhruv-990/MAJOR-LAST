"""
Outage Sense – ML Flask API
Endpoints: POST /train, POST /predict, GET /health
"""

import os
import traceback

import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS

from model import train_model, predict, get_model, FEATURE_COLUMNS
from generate_dataset import generate_dataset, OUTPUT_PATH

app = Flask(__name__)
CORS(app)


# ── Health check ─────────────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    model_loaded = get_model() is not None
    return jsonify(
        {
            "status": "healthy",
            "service": "outage-sense-ml",
            "model_loaded": model_loaded,
        }
    )


# ── Train ────────────────────────────────────────────────────────
@app.route("/train", methods=["POST"])
def train():
    try:
        # Accept JSON body with optional parameters
        body = request.get_json(silent=True) or {}
        contamination = body.get("contamination", 0.05)
        regenerate = body.get("regenerate_dataset", False)

        # Generate dataset if it doesn't exist or regeneration requested
        if regenerate or not os.path.exists(OUTPUT_PATH):
            generate_dataset()

        data = pd.read_csv(OUTPUT_PATH)
        result = train_model(data, contamination=contamination)

        return jsonify({"success": True, "training_summary": result}), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


# ── Predict ──────────────────────────────────────────────────────
@app.route("/predict", methods=["POST"])
def predict_route():
    try:
        body = request.get_json()
        if body is None:
            return jsonify({"error": "Request body must be JSON"}), 400

        # Accept a single object or a list of objects
        records = body if isinstance(body, list) else [body]

        # Validate required fields
        for record in records:
            missing = [f for f in FEATURE_COLUMNS if f not in record]
            if missing:
                return (
                    jsonify({"error": f"Missing fields: {missing}"}),
                    400,
                )

        df = pd.DataFrame(records)
        results = predict(df)

        return jsonify({"success": True, "predictions": results}), 200

    except FileNotFoundError as e:
        return jsonify({"success": False, "error": str(e)}), 400

    except Exception as e:
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


# ── Entry point ──────────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.environ.get("ML_SERVICE_PORT", 5001))
    debug = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug)
