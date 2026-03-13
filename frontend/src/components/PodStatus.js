import React from "react";

const statusColor = {
  Running: "bg-emerald-400",
  Pending: "bg-amber-400",
  Failed: "bg-red-500",
  Succeeded: "bg-blue-400",
  Unknown: "bg-slate-500",
};

export default function PodStatus({ pods = [] }) {
  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">Pod Health</h3>

      {pods.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-slate-500">
          <span className="text-4xl mb-2">🐳</span>
          <p className="text-sm">No pods reported yet</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {pods.map((pod) => (
            <div
              key={pod._id}
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/40 hover:bg-slate-800/70 transition"
            >
              {/* Status dot */}
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  statusColor[pod.status] || statusColor.Unknown
                } ${pod.status === "Failed" ? "animate-pulse" : ""}`}
              />

              {/* Pod info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">
                  {pod.name}
                </p>
                <p className="text-[10px] text-slate-500">
                  ns: {pod.namespace} · {pod.node || "—"}
                </p>
              </div>

              {/* Stats */}
              <div className="text-right shrink-0">
                <p className="text-xs text-slate-400">
                  Restarts:{" "}
                  <span
                    className={
                      pod.restart_count > 3
                        ? "text-red-400 font-bold"
                        : "text-slate-300"
                    }
                  >
                    {pod.restart_count}
                  </span>
                </p>
                <p className="text-[10px] text-slate-500">{pod.status}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
