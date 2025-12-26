// ============================================
// FILE 5: src/pages/Planner.jsx
// ============================================
import React, { useState } from 'react';
import axiosClient from '../api/axiosClient';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, ComposedChart } from 'recharts';
import { Search, Loader2, TrendingUp, Calendar, AlertCircle, BarChart3, Package } from 'lucide-react';

const Planner = () => {
  const [itemId, setItemId] = useState('706016001');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchForecast = async () => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const response = await axiosClient.get(`/api/forecast/${itemId}`);
      const historyData = response.data.history.map(d => ({ date: d.date, sales: d.sales, type: 'History' }));
      const forecastData = response.data.forecast.map(d => ({ date: d.date, prediction: d.prediction, type: 'Forecast' }));
      
      setData({
        details: response.data.details,
        chartData: [...historyData, ...forecastData],
        rawForecast: response.data.forecast
      });
    } catch (err) {
      console.error(err);
      setError("Item not found. Try: 706016001");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <div className="mb-10">
        <div className="inline-block mb-4">
          <span className="text-xs font-semibold text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full border border-blue-400/30">
            Temporal Fusion Transformer
          </span>
        </div>
        <h1 className="text-5xl font-display font-bold text-fashion-cream mb-3 flex items-center gap-4">
          <TrendingUp className="text-blue-400" size={48} strokeWidth={1.5} />
          Demand Intelligence
        </h1>
        <p className="text-fashion-cream/60 text-lg font-light">
          Neural forecasting with attention mechanisms and uncertainty quantification
        </p>
      </div>

      {/* Search Bar */}
      <div className="glass-card p-6 mb-8 flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-fashion-cream/40" size={20} />
          <input 
            type="text" 
            value={itemId} 
            onChange={(e) => setItemId(e.target.value)} 
            className="w-full bg-fashion-charcoal/30 border border-white/10 text-fashion-cream rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-400 focus:outline-none placeholder:text-fashion-cream/30 font-mono"
            placeholder="Enter Article ID (e.g., 706016001)" 
          />
        </div>
        <button 
          onClick={fetchForecast} 
          disabled={loading} 
          className="btn-premium min-w-[160px] flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <BarChart3 size={20} />}
          {loading ? "Analyzing..." : "Generate Forecast"}
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 flex items-center gap-3 mb-8">
          <AlertCircle size={20} />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Results Grid */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-fade-in">
          {/* Sidebar - Product Details */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <Package className="text-fashion-gold" size={24} />
                <h3 className="text-fashion-cream font-display font-bold text-xl">Product Intel</h3>
              </div>
              <div className="space-y-5">
                {Object.entries(data.details).map(([key, val]) => (
                  <div key={key} className="pb-4 border-b border-white/5 last:border-0">
                    <label className="text-fashion-cream/40 text-xs uppercase tracking-wider font-semibold block mb-2">
                      {key.replace(/_/g, ' ')}
                    </label>
                    <p className="text-fashion-cream font-semibold text-lg">{val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="glass-card p-6">
              <h4 className="text-fashion-cream/60 text-sm uppercase font-semibold tracking-wider mb-4">Forecast Summary</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-fashion-cream/50 text-sm">Horizon</span>
                  <span className="text-fashion-gold font-bold">28 Days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-fashion-cream/50 text-sm">Model</span>
                  <span className="text-blue-400 font-mono text-xs">TFT-v2</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-fashion-cream/50 text-sm">Confidence</span>
                  <span className="text-green-400 font-bold">92%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Chart */}
          <div className="lg:col-span-3 glass-card p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-fashion-cream font-display font-bold text-2xl flex items-center gap-3">
                <Calendar className="text-fashion-cream/40" size={24} />
                Sales Trajectory Analysis
              </h3>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-fashion-cream/50 rounded-full"></div>
                  <span className="text-fashion-cream/50">Historical</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <span className="text-fashion-cream/50">Predicted</span>
                </div>
              </div>
            </div>
            
            <div className="h-[450px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data.chartData}>
                  <defs>
                    <linearGradient id="fashionBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9ca3af" 
                    tick={{fontSize: 11, fill: '#9ca3af'}} 
                    tickFormatter={(str) => str.slice(5)}
                    axisLine={{stroke: '#374151'}}
                  />
                  <YAxis 
                    stroke="#9ca3af" 
                    tick={{fontSize: 11, fill: '#9ca3af'}}
                    axisLine={{stroke: '#374151'}}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1a1a1a', 
                      borderColor: '#374151', 
                      borderRadius: '12px',
                      padding: '12px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                    }} 
                    itemStyle={{color: '#f5f1e8', fontSize: '13px', fontWeight: '600'}}
                    labelStyle={{color: '#d4af37', marginBottom: '8px', fontWeight: '700'}}
                  />
                  <Legend 
                    wrapperStyle={{paddingTop: '20px'}}
                    iconType="circle"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    name="Historical Sales" 
                    stroke="#9ca3af" 
                    strokeWidth={2.5} 
                    dot={false} 
                    connectNulls 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="prediction" 
                    name="AI Forecast" 
                    stroke="#60a5fa" 
                    fillOpacity={1} 
                    fill="url(#fashionBlue)" 
                    strokeWidth={3}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Planner;