import React from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const severityStyles = {
  critical: "border-l-red-500 bg-red-500/5",
  high: "border-l-orange-500 bg-orange-500/5",
  medium: "border-l-amber-500 bg-amber-500/5",
  low: "border-l-blue-500 bg-blue-500/5",
};

const severityBadge = {
  critical: "badge-critical",
  high: "badge-anomaly",
  medium: "badge-warning",
  low: "badge-normal",
};

export default function AlertList({ alerts = [], onRefresh }) {
  const acknowledge = async (id) => {
    try {
      await axios.put(`${API}/alerts/${id}/acknowledge`);
      if (onRefresh) onRefresh();
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-300">Recent Alerts</h3>
        <span className="text-xs text-slate-500">{alerts.length} alerts</span>
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-slate-500">
          <span className="text-4xl mb-2">✅</span>
          <p className="text-sm">No alerts – all systems healthy</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {alerts.map((alert) => (
            <div
              key={alert._id}
              className={`flex items-start gap-3 p-3 rounded-lg border-l-4 transition-all duration-200 hover:translate-x-1 ${
                severityStyles[alert.severity] || severityStyles.low
              } ${alert.acknowledged ? "opacity-50" : ""}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`badge ${severityBadge[alert.severity] || "badge-normal"}`}>
                    {alert.severity?.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(alert.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono truncate">
                  {alert.message}
                </p>
              </div>

              {!alert.acknowledged && (
                <button
                  onClick={() => acknowledge(alert._id)}
                  className="shrink-0 px-2.5 py-1 text-[10px] font-semibold rounded-md bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500/30 transition"
                >
                  ACK
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
