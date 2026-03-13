import React, { useEffect, useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export default function Header() {
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get(`${API}/alerts/stats`);
        if (data.success) setAlertCount(data.data.unacknowledged);
      } catch {
        /* ignore */
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-dark-800/60 backdrop-blur border-b border-slate-800">
      <div>
        <h2 className="text-lg font-semibold text-white">
          Infrastructure Dashboard
        </h2>
        <p className="text-xs text-slate-500">
          Real-time monitoring &amp; anomaly detection
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* Alert bell */}
        <div className="relative">
          <button className="relative p-2 rounded-lg hover:bg-slate-800 transition">
            <span className="text-xl">🔔</span>
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {alertCount > 9 ? "9+" : alertCount}
              </span>
            )}
          </button>
        </div>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold">
          A
        </div>
      </div>
    </header>
  );
}
