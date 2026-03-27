import React from 'react';
import { Bell, Search, User } from 'lucide-react';

const Header = ({ title }) => {
  return (
    <header className="h-20 glass border-b border-slate-700/50 flex items-center justify-between px-8 sticky top-0 z-30">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
        <p className="text-sm text-slate-400 mt-1">Real-time optimization dashboard</p>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="hidden md:flex relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search junctions..." 
            className="bg-slate-800/50 border border-slate-700 rounded-full py-2 pl-10 pr-4 text-sm text-slate-200 outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all w-64"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-slate-400 hover:text-slate-200 transition-colors bg-slate-800/40 rounded-full border border-slate-700/50 hover:border-slate-600">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-slate-800"></span>
          </button>
          
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-0.5 shadow-lg relative cursor-pointer">
            <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center border-2 border-slate-800">
              <User size={18} className="text-slate-300" />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
