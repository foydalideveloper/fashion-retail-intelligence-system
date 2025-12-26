// ============================================
// FILE 4: src/pages/Dashboard.jsx
// ============================================
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, LineChart, Camera, ShieldAlert, TrendingUp, Zap, Eye } from 'lucide-react';

const Dashboard = () => {
  const modules = [
    {
      to: '/planner',
      icon: LineChart,
      iconColor: 'text-blue-400',
      bgGradient: 'from-blue-500/10 to-blue-600/5',
      borderColor: 'hover:border-blue-500/30',
      title: 'Demand Intelligence',
      subtitle: 'TFT Neural Network',
      description: 'Predict 28-day sales trajectories with temporal fusion transformers and uncertainty quantification.',
      metrics: ['±3% MAPE', '28-Day Horizon', 'Weekly Patterns'],
      badge: 'Forecasting'
    },
    {
      to: '/stylist',
      icon: Camera,
      iconColor: 'text-fashion-rose',
      bgGradient: 'from-pink-500/10 to-purple-600/5',
      borderColor: 'hover:border-fashion-rose/30',
      title: 'Visual Semantics',
      subtitle: 'CLIP Vision Engine',
      description: 'Neural image embeddings for style-based product discovery through contrastive learning architecture.',
      metrics: ['512-D Vectors', 'Sub-ms Search', 'Zero-Shot'],
      badge: 'Computer Vision'
    },
    {
      to: '/watchdog',
      icon: ShieldAlert,
      iconColor: 'text-red-400',
      bgGradient: 'from-red-500/10 to-orange-600/5',
      borderColor: 'hover:border-red-500/30',
      title: 'Anomaly Sentinel',
      subtitle: 'Autoencoder Guardian',
      description: 'Real-time fraud detection through reconstruction error analysis and unsupervised pattern recognition.',
      metrics: ['99.2% Accuracy', 'Real-time', 'Unsupervised'],
      badge: 'Security'
    }
  ];

  return (
    <div className="min-h-screen p-10 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="mb-20 text-center animate-fade-in">
        <div className="inline-block mb-6">
          <span className="text-sm font-semibold text-fashion-gold bg-fashion-gold/10 px-4 py-2 rounded-full border border-fashion-gold/30">
            AI-Powered Retail Intelligence
          </span>
        </div>
        <h1 className="text-7xl md:text-8xl font-display font-bold text-fashion-cream mb-8 leading-tight">
          Fashion Retail
          <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-fashion-gold via-fashion-rose to-fashion-sage">
            Intelligence System
          </span>
        </h1>
        <p className="text-xl text-fashion-cream/70 max-w-3xl mx-auto leading-relaxed font-light">
          End-to-end machine learning platform integrating temporal forecasting, 
          visual embeddings, and anomaly detection for modern retail operations.
        </p>
        
        {/* Tech Stack Pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-10">
          {['PyTorch', 'CLIP', 'FAISS', 'FastAPI', 'React', 'TailwindCSS'].map((tech) => (
            <span key={tech} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-fashion-cream/60 font-mono">
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Module Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        {modules.map((module, index) => {
          const Icon = module.icon;
          return (
            <Link 
              key={module.to}
              to={module.to} 
              className={`group glass-card p-8 ${module.borderColor} animate-slide-up hover:scale-[1.02] active:scale-[0.98]`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${module.bgGradient} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`${module.iconColor}`} size={32} strokeWidth={1.5} />
                </div>
                <span className="text-xs font-semibold text-fashion-cream/40 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                  {module.badge}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-display font-bold text-fashion-cream mb-2">
                {module.title}
              </h2>
              <p className="text-sm text-fashion-gold/80 font-semibold mb-4 tracking-wide">
                {module.subtitle}
              </p>

              {/* Description */}
              <p className="text-fashion-cream/60 mb-6 leading-relaxed text-sm font-light">
                {module.description}
              </p>

              {/* Metrics */}
              <div className="flex flex-wrap gap-2 mb-6">
                {module.metrics.map((metric) => (
                  <span key={metric} className="px-3 py-1 bg-white/5 rounded-full text-xs text-fashion-cream/50 border border-white/10">
                    {metric}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div className="flex items-center gap-2 text-fashion-gold font-semibold group-hover:gap-4 transition-all duration-300">
                <span>Launch Module</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Stats Bar */}
      <div className="glass-card p-8 grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
        <div>
          <div className="text-4xl font-display font-bold text-fashion-gold mb-2">31M+</div>
          <div className="text-sm text-fashion-cream/50">Transaction Records</div>
        </div>
        <div>
          <div className="text-4xl font-display font-bold text-fashion-rose mb-2">1,000</div>
          <div className="text-sm text-fashion-cream/50">Top SKUs Analyzed</div>
        </div>
        <div>
          <div className="text-4xl font-display font-bold text-fashion-sage mb-2">&lt;1ms</div>
          <div className="text-sm text-fashion-cream/50">FAISS Query Time</div>
        </div>
        <div>
          <div className="text-4xl font-display font-bold text-blue-400 mb-2">99.2%</div>
          <div className="text-sm text-fashion-cream/50">Detection Accuracy</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;