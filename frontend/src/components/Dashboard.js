import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import MetricsChart from "./MetricsChart";
import AlertList from "./AlertList";
import PodStatus from "./PodStatus";
import AnomalyPanel from "./AnomalyPanel";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export default function Dashboard() {
  const [metrics, setMetrics] = useState([]);
  const [latestMetric, setLatestMetric] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [pods, setPods] = useState([]);
  const [alertStats, setAlertStats] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [metricsRes, latestRes, alertsRes, podsRes, statsRes] =
        await Promise.allSettled([
          axios.get(`${API}/metrics?limit=50`),
          axios.get(`${API}/metrics/latest`),
          axios.get(`${API}/alerts?limit=20`),
          axios.get(`${API}/pods`),
          axios.get(`${API}/alerts/stats`),
        ]);

      if (metricsRes.status === "fulfilled")
        setMetrics(metricsRes.value.data.data || []);
      if (latestRes.status === "fulfilled")
        setLatestMetric(latestRes.value.data.data);
      if (alertsRes.status === "fulfilled")
        setAlerts(alertsRes.value.data.data || []);
      if (podsRes.status === "fulfilled")
        setPods(podsRes.value.data.data || []);
      if (statsRes.status === "fulfilled")
        setAlertStats(statsRes.value.data.data || {});
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  // Summary cards data
  const cards = [
    {
      label: "CPU Usage",
      value: latestMetric ? `${latestMetric.cpu_usage?.toFixed(1)}%` : "N/A",
      color: "from-indigo-500 to-blue-600",
      icon: "⚡",
    },
    {
      label: "Memory Usage",
      value: latestMetric ? `${latestMetric.memory_usage?.toFixed(1)}%` : "N/A",
      color: "from-purple-500 to-pink-600",
      icon: "🧠",
    },
    {
      label: "Disk Usage",
      value: latestMetric ? `${latestMetric.disk_usage?.toFixed(1)}%` : "N/A",
      color: "from-cyan-500 to-teal-600",
      icon: "💾",
    },
    {
      label: "Active Alerts",
      value: alertStats.unacknowledged ?? 0,
      color: "from-red-500 to-orange-600",
      icon: "🚨",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* ── Summary cards ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <div
            key={i}
            className="card group relative overflow-hidden"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div
              className={`absolute inset-0 opacity-[0.06] bg-gradient-to-br ${card.color} group-hover:opacity-[0.12] transition-opacity`}
            />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                  {card.label}
                </p>
                <p className="text-2xl font-bold text-white">{card.value}</p>
              </div>
              <span className="text-3xl opacity-60">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MetricsChart metrics={metrics} type="cpu" />
        <MetricsChart metrics={metrics} type="memory" />
      </div>

      {/* ── Anomaly detection + Pods ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnomalyPanel />
        <PodStatus pods={pods} />
      </div>

      {/* ── Alerts ─────────────────────────────────────────── */}
      <AlertList alerts={alerts} onRefresh={fetchData} />
    </div>
  );
}
