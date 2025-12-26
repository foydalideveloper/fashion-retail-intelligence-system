// ============================================
// FILE 3: src/components/Navbar.jsx
// ============================================
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LineChart, Camera, AlertTriangle, LayoutDashboard, Sparkles } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path 
      ? "bg-fashion-gold/10 text-fashion-gold border-b-2 border-fashion-gold" 
      : "text-fashion-cream/60 hover:text-fashion-cream hover:bg-white/5";
  };

  return (
    <nav className="bg-fashion-obsidian/95 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-4 group">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-fashion-gold to-fashion-rose rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-fashion-gold/50 transition-all duration-300">
                <Sparkles size={24} className="text-fashion-obsidian" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-fashion-gold to-fashion-rose rounded-xl opacity-20 blur group-hover:opacity-40 transition-opacity"></div>
            </div>
            <div>
              <span className="text-2xl font-display font-bold text-fashion-cream tracking-tight">
                FRIS
              </span>
              <p className="text-xs text-fashion-cream/50 font-light tracking-widest uppercase">
                Intelligence Suite
              </p>
            </div>
          </Link>
          
          {/* Links */}
          <div className="flex space-x-1">
            <Link 
              to="/" 
              className={`px-5 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${isActive('/')}`}
            >
              <LayoutDashboard size={18} /> 
              <span className="hidden md:inline">Dashboard</span>
            </Link>
            
            <Link 
              to="/planner" 
              className={`px-5 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${isActive('/planner')}`}
            >
              <LineChart size={18} /> 
              <span className="hidden md:inline">Demand</span>
            </Link>
            
            <Link 
              to="/stylist" 
              className={`px-5 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${isActive('/stylist')}`}
            >
              <Camera size={18} /> 
              <span className="hidden md:inline">Visual AI</span>
            </Link>
            
            <Link 
              to="/watchdog" 
              className={`px-5 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${isActive('/watchdog')}`}
            >
              <AlertTriangle size={18} /> 
              <span className="hidden md:inline">Sentinel</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;