import React, { useState } from 'react';
import axiosClient from '../api/axiosClient';
import { ShieldAlert, Activity, CheckCircle, XCircle, Play, AlertTriangle, Shield } from 'lucide-react';

const Watchdog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const simulateTraffic = async () => {
    setLoading(true);
    const fakeData = [
      { sales: 50, lag_7: 48 },
      { sales: 55, lag_7: 52 },
      { sales: 5000, lag_7: 10 }, // Critical anomaly
      { sales: 45, lag_7: 40 },
      { sales: 12, lag_7: 1200 }, // Another critical anomaly (low sales, high lag)
    ];
    try {
      const response = await axiosClient.post('/api/monitor/check', fakeData);
      setLogs(response.data);
    } catch (err) {
      console.error(err);
      // Handle potential backend connection errors
      setError("Failed to connect to backend. Is uvicorn running?");
    } finally {
      setLoading(false);
    }
  };

  const criticalCount = logs.filter(log => log.status === 'CRITICAL').length;
  const normalCount = logs.filter(log => log.status === 'OK').length; // Assuming 'OK' means normal

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-end mb-10 animate-fade-in">
        <div>
          <div className="inline-block mb-4">
            <span className="text-xs font-semibold text-red-400 bg-red-400/10 px-3 py-1 rounded-full border border-red-400/30">
              Autoencoder Neural Network
            </span>
          </div>
          <h1 className="text-6xl font-display font-bold text-fashion-cream mb-3 flex items-center gap-4">
            <ShieldAlert className="text-red-400" size={48} strokeWidth={1.5} />
            Anomaly Sentinel
          </h1>
          <p className="text-fashion-cream/60 text-lg font-light">
            Real-time fraud detection through reconstruction error analysis
          </p>
        </div>
        <button
          onClick={simulateTraffic}
          disabled={loading}
          className="btn-premium bg-red-500 hover:bg-red-400 shadow-[0_0_30px_rgba(239,68,68,0.3)] flex items-center gap-3 px-10"
        >
          <Play size={18} />
          {loading ? "Running..." : "Simulate Traffic"}
        </button>
      </div>

      {/* Stats Cards */}
      {logs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-slide-up">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-fashion-cream/50 text-sm font-semibold">Total Scanned</span>
              <Activity className="text-fashion-cream/30" size={20} />
            </div>
            <div className="text-4xl font-display font-bold text-fashion-cream">
              {logs.length}
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-fashion-cream/50 text-sm font-semibold">Threats Detected</span>
              <AlertTriangle className="text-red-400" size={20} />
            </div>
            <div className="text-4xl font-display font-bold text-red-400">
              {criticalCount}
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-fashion-cream/50 text-sm font-semibold">Clean Traffic</span>
              <Shield className="text-green-400" size={20} />
            </div>
            <div className="text-4xl font-display font-bold text-green-400">
              {normalCount}
            </div>
          </div>
        </div>
      )}

      {/* Logs Table */}
      <div className="glass-card overflow-hidden">
        <div className="bg-fashion-charcoal/30 px-6 py-4 border-b border-white/10">
          <h3 className="font-display font-bold text-fashion-cream text-xl">Transaction Monitor</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-fashion-charcoal/50 text-fashion-cream/60 uppercase text-xs font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Sales Volume</th>
                <th className="px-6 py-4">Reconstruction Error</th>
                <th className="px-6 py-4">Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-fashion-cream/80">
              {logs.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-16">
                    <div className="inline-block bg-white/5 p-6 rounded-full mb-4">
                      <Activity size={32} className="text-fashion-cream/20" />
                    </div>
                    <p className="text-fashion-cream/40 font-light">
                      No transactions logged. Run simulation to begin monitoring.
                    </p>
                  </td>
                </tr>
              )}
              {logs.map((log, idx) => (
                <tr
                  key={idx}
                  className={`transition-colors hover:bg-white/10 ${log.status === 'CRITICAL' ? 'bg-red-500/5 border-red-500/20' : 'hover:bg-white/5'}`}
                >
                  <td className="px-6 py-5">
                    {log.status === 'CRITICAL'
                      ? <XCircle className="text-red-400" size={24} strokeWidth={2} />
                      : <CheckCircle className="text-green-400" size={24} strokeWidth={2} />}
                  </td>
                  <td className="px-6 py-5 font-mono text-base font-semibold">
                    {log.sales?.toLocaleString()}
                  </td>
                  <td className="px-6 py-5 font-mono text-sm text-fashion-cream/60">
                    {log.reconstruction_error?.toFixed(4)}
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${log.status === 'CRITICAL' ? 'bg-red-500/20 text-red-300 border border-red-500/50' : 'bg-green-500/20 text-green-300 border border-green-500/50'}`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Panel */}
      <div className="glass-card p-6 mt-8 animate-fade-in">
        <h4 className="font-display font-bold text-fashion-cream mb-4">Detection Methodology</h4>
        <p className="text-fashion-cream/60 text-sm font-light leading-relaxed">
          The autoencoder neural network learns normal transaction patterns during training. When a transaction deviates significantly from learned patterns,
          the reconstruction error increases dramatically, triggering an anomaly alert. This unsupervised approach adapts to evolving fraud patterns without
          requiring labeled examples.
        </p>
      </div>
    </div>
  );
};
export default Watchdog;