import React, { useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export default function AnomalyPanel() {
  const [formData, setFormData] = useState({
    cpu_usage: "",
    memory_usage: "",
    disk_usage: "",
    network_latency: "",
    pod_restarts: "",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [training, setTraining] = useState(false);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handlePredict = async () => {
    setLoading(true);
    setResult(null);
    try {
      const payload = {
        cpu_usage: parseFloat(formData.cpu_usage),
        memory_usage: parseFloat(formData.memory_usage),
        disk_usage: parseFloat(formData.disk_usage),
        network_latency: parseFloat(formData.network_latency),
        pod_restarts: parseInt(formData.pod_restarts, 10),
      };
      const { data } = await axios.post(`${API}/predict`, payload);
      if (data.success && data.predictions?.length > 0) {
        setResult(data.predictions[0]);
      }
    } catch (err) {
      setResult({ error: err.response?.data?.error || err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleTrain = async () => {
    setTraining(true);
    try {
      await axios.post(`${API}/predict/train`);
      alert("Model trained successfully!");
    } catch (err) {
      alert("Training failed: " + (err.response?.data?.error || err.message));
    } finally {
      setTraining(false);
    }
  };

  const fields = [
    { name: "cpu_usage", label: "CPU %", placeholder: "0-100" },
    { name: "memory_usage", label: "Memory %", placeholder: "0-100" },
    { name: "disk_usage", label: "Disk %", placeholder: "0-100" },
    { name: "network_latency", label: "Latency (ms)", placeholder: "1-2000" },
    { name: "pod_restarts", label: "Restarts", placeholder: "0-50" },
  ];

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-300">
          Anomaly Detection
        </h3>
        <button
          onClick={handleTrain}
          disabled={training}
          className="text-[10px] px-3 py-1 rounded-md bg-cyan-500/15 text-cyan-400 font-semibold hover:bg-cyan-500/30 transition disabled:opacity-40"
        >
          {training ? "Training…" : "Train Model"}
        </button>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
        {fields.map((f) => (
          <div key={f.name}>
            <label className="block text-[10px] text-slate-500 mb-1">
              {f.label}
            </label>
            <input
              type="number"
              name={f.name}
              value={formData[f.name]}
              onChange={handleChange}
              placeholder={f.placeholder}
              className="w-full px-2.5 py-1.5 text-xs rounded-md bg-slate-800 border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
        ))}
      </div>

      <button
        onClick={handlePredict}
        disabled={loading}
        className="w-full py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition disabled:opacity-40"
      >
        {loading ? "Analysing…" : "Run Prediction"}
      </button>

      {/* Result */}
      {result && (
        <div className="mt-4 p-3 rounded-lg bg-slate-800/60">
          {result.error ? (
            <p className="text-xs text-red-400">{result.error}</p>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <span
                  className={`badge ${
                    result.prediction === "anomaly"
                      ? "badge-anomaly"
                      : "badge-normal"
                  }`}
                >
                  {result.prediction?.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Score:{" "}
                <span className="text-white font-mono">
                  {result.anomaly_score?.toFixed(4)}
                </span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
