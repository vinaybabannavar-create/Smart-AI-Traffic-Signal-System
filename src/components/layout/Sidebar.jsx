import React from 'react';
import { LayoutDashboard, RadioReceiver, Network, Brain, Settings, Info, Menu } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = ({ activeView, setActiveView, isMobileOpen, setIsMobileOpen }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'plana', label: 'Plan A: Junction', icon: RadioReceiver },
    { id: 'planb', label: 'Plan B: Pre-Signal', icon: Network },
    { id: 'mlengine', label: 'ML Prediction', icon: Brain },
  ];

  return (
    <aside className="w-64 glass h-screen fixed left-0 top-0 z-40 hidden md:flex flex-col border-r border-slate-700/50">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
            <span className="font-bold text-xl text-white">AI</span>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-white tracking-wide">SmartTraffic</h1>
            <p className="text-xs text-slate-400 font-medium tracking-wider">SYSTEM v2.0</p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 px-4 flex-1">
        <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Modules</p>
        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const isActive = activeView === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group overflow-hidden ${
                  isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-nav"
                    className="absolute inset-0 bg-primary-500/10 border border-primary-500/20 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                )}
                <Icon size={20} className={`relative z-10 transition-colors ${isActive ? 'text-primary-500' : 'group-hover:text-primary-400'}`} />
                <span className="relative z-10 font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 mt-auto">
        <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary-500/20 rounded-full blur-xl"></div>
          <div className="absolute -left-4 -bottom-4 w-16 h-16 bg-indigo-500/20 rounded-full blur-xl"></div>
          
          <div className="flex items-center gap-3 mb-2 relative z-10">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse-slow"></div>
            <span className="text-sm font-medium text-slate-200">System Online</span>
          </div>
          <p className="text-xs text-slate-400 relative z-10">All nodes connected & optimizing.</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
