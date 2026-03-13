import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const configs = {
  cpu: {
    label: "CPU Usage (%)",
    field: "cpu_usage",
    borderColor: "#6366f1",
    bgFrom: "rgba(99,102,241,0.25)",
    bgTo: "rgba(99,102,241,0.02)",
  },
  memory: {
    label: "Memory Usage (%)",
    field: "memory_usage",
    borderColor: "#a855f7",
    bgFrom: "rgba(168,85,247,0.25)",
    bgTo: "rgba(168,85,247,0.02)",
  },
};

export default function MetricsChart({ metrics = [], type = "cpu" }) {
  const cfg = configs[type] || configs.cpu;
  const reversed = [...metrics].reverse();

  const labels = reversed.map((m) =>
    new Date(m.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  );

  const data = {
    labels,
    datasets: [
      {
        label: cfg.label,
        data: reversed.map((m) => m[cfg.field]),
        borderColor: cfg.borderColor,
        backgroundColor: (ctx) => {
          const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, cfg.bgFrom);
          gradient.addColorStop(1, cfg.bgTo);
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 5,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1e293b",
        titleColor: "#e2e8f0",
        bodyColor: "#94a3b8",
        borderColor: "#334155",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(51,65,85,0.3)" },
        ticks: { color: "#64748b", maxTicksLimit: 10, font: { size: 10 } },
      },
      y: {
        min: 0,
        max: 100,
        grid: { color: "rgba(51,65,85,0.3)" },
        ticks: {
          color: "#64748b",
          callback: (v) => `${v}%`,
          font: { size: 10 },
        },
      },
    },
  };

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">{cfg.label}</h3>
      <div className="h-64">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
