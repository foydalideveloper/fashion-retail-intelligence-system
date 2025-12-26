import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Planner from './pages/Planner';
import Stylist from './pages/Stylist';
import Watchdog from './pages/Watchdog';
import ChatWidget from './components/ChatWidget'; 

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/stylist" element={<Stylist />} />
            <Route path="/watchdog" element={<Watchdog />} />
          </Routes>
        </main>
        
        {/* The Chat Bubble lives here, outside the Routes */}
        <ChatWidget />
        
      </div>
    </Router>
  );
}

export default App;