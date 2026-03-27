import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Info, AlertTriangle, CheckCircle, TrendingUp, Activity, Clock, Zap, Search, Layers, MoreVertical, Wifi, ShieldCheck } from 'lucide-react';

const TrafficPredictorMap = () => {
  const [selectedPath, setSelectedPath] = useState('All');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [activeSignal, setActiveSignal] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null); // 'ok' | 'error'
  const [liveRoutes, setLiveRoutes] = useState([
    { name: 'Bridge Bypass', time: '11m', status: 'Optimal', delay: '-4m', color: 'emerald' },
    { name: 'Industrial Loop', time: '16m', status: 'Moderate', delay: '+2m', color: 'orange' },
    { name: 'Skyway Direct', time: '24m', status: 'Blocked', delay: '+12m', color: 'red' },
    { name: 'Sector 4 Tunnel', time: '19m', status: 'Moderate', delay: '+5m', color: 'orange' }
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
      setActiveSignal(prev => (prev + 1) % 4);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const [statusRes, predictRes] = await Promise.all([
        fetch('http://127.0.0.1:5000/api/status'),
        fetch('http://127.0.0.1:5000/api/predict')
      ]);
      if (!statusRes.ok || !predictRes.ok) throw new Error('Bad response');
      const status = await statusRes.json();
      const predict = await predictRes.json();

      // Derive route times from overall congestion
      const base = status.overall_congestion || 50;
      setLiveRoutes([
        { name: 'Bridge Bypass', time: `${Math.max(8, Math.round(base * 0.12))}m`, status: base < 40 ? 'Optimal' : base < 70 ? 'Moderate' : 'Blocked', delay: base < 40 ? `-${Math.round(base*0.05)}m` : `+${Math.round(base*0.05)}m`, color: base < 40 ? 'emerald' : base < 70 ? 'orange' : 'red' },
        { name: 'Industrial Loop', time: `${Math.max(10, Math.round(base * 0.18))}m`, status: 'Moderate', delay: `+${Math.round(base*0.04)}m`, color: 'orange' },
        { name: 'Skyway Direct', time: `${Math.max(14, Math.round(base * 0.28))}m`, status: base > 65 ? 'Blocked' : 'Moderate', delay: `+${Math.round(base*0.14)}m`, color: base > 65 ? 'red' : 'orange' },
        { name: 'Sector 4 Tunnel', time: `${Math.max(12, Math.round(base * 0.22))}m`, status: base < 55 ? 'Moderate' : 'Blocked', delay: `+${Math.round(base*0.08)}m`, color: base < 55 ? 'orange' : 'red' },
      ]);
      setSyncStatus('ok');
      setLastSynced(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Sync failed:', err);
      setSyncStatus('error');
    } finally {
      setIsSyncing(false);
    }
  };

  const junctions = [
    { id: 1, name: 'North Crossing', status: 'High', color: 'bg-red-500', density: '88%', x: '25%', y: '15%' },
    { id: 2, name: 'Central Terminal', status: 'Med', color: 'bg-orange-500', density: '45%', x: '50%', y: '40%' },
    { id: 3, name: 'South Interchange', status: 'Low', color: 'bg-emerald-500', density: '12%', x: '75%', y: '75%' },
    { id: 4, name: 'East Bypass', status: 'High', color: 'bg-red-500', density: '91%', x: '85%', y: '25%' },
    { id: 5, name: 'West Gate', status: 'Low', color: 'bg-emerald-500', density: '18%', x: '15%', y: '45%' },
    { id: 6, name: 'Bridge Terminal', status: 'Med', color: 'bg-orange-500', density: '52%', x: '45%', y: '70%' },
    { id: 7, name: 'Industrial Hub', status: 'Low', color: 'bg-emerald-500', density: '08%', x: '80%', y: '45%' },
  ];

  return (
    <div className="w-full mt-16 flex flex-col gap-8 pb-20">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 px-6 relative">
         <div className="flex flex-col gap-3">
             <div className="flex items-center gap-4">
                 <div className="p-4 bg-primary-500/10 rounded-3xl border border-primary-500/20 shadow-2xl">
                    <Navigation className="w-8 h-8 text-primary-400" />
                 </div>
                 <div>
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic selection:bg-white underline decoration-white decoration-solid selection:bg-white">Metropolitan Forecast Grid</h2>
                    <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500 mt-1 uppercase tracking-[0.3em] font-bold underline decoration-white decoration-solid selection:bg-white">
                        <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
                        <span>Live GIS Sync: Active</span>
                        <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
                        <Wifi className="w-3 h-3 text-primary-500" />
                        <span>Signal Nodes: 42</span>
                    </div>
                 </div>
             </div>
         </div>

         <div className="flex flex-wrap gap-4 items-center">
             <div className="bg-slate-900/80 border border-slate-800 rounded-2xl px-6 py-3 flex items-center gap-4 shadow-xl">
                <Clock className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-mono text-slate-300 font-bold underline decoration-white decoration-solid selection:bg-white tracking-widest">{currentTime}</span>
             </div>
             <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-6 py-3 flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase underline decoration-white decoration-solid selection:bg-white tracking-[0.2em] font-bold text-white underline decoration-white decoration-solid selection:bg-white text-white font-bold underline decoration-white decoration-solid selection:bg-white italic selection:bg-white">Neural Secure</span>
             </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 px-4">
        {/* Complex Multi-Path Map Viewport */}
        <div className="lg:col-span-3 relative h-[600px] rounded-[4rem] overflow-hidden border border-slate-800/80 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] group">
           {/* Dense City Map Base */}
           <div 
              className="absolute inset-0 bg-cover bg-center transition-all duration-[60s] ease-linear repeat-infinite scale-150 brightness-[0.7] saturate-[1.3]"
              style={{ backgroundImage: `url('/city_map.png')` }}
           />

           {/* Interactive Overlays */}
           <div className="absolute inset-0 bg-gradient-to-t from-dark-950/90 via-transparent to-dark-950/20" />
           
           {/* HUD UI Elements */}
           <div className="absolute top-8 left-8 flex flex-col gap-4">
              <div className="bg-dark-900/90 backdrop-blur-3xl border border-white/10 p-5 rounded-[2.5rem] shadow-2xl flex items-center gap-4">
                 <div className="bg-primary-500 p-3 rounded-2xl shadow-[0_0_20px_#3b82f6]">
                    <Layers className="w-5 h-5 text-white" />
                 </div>
                 <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-bold text-white underline decoration-white decoration-solid selection:bg-white">Prediction Level</div>
                    <div className="text-sm text-white font-bold underline decoration-white decoration-solid selection:bg-white font-bold text-white underline decoration-white decoration-solid selection:bg-white">Multi-Junction Synthesis</div>
                 </div>
              </div>
           </div>

           {/* Multi-Path SVG Network */}
           <svg className="absolute inset-0 w-full h-full drop-shadow-[0_0_20px_rgba(59,130,246,0.2)]" viewBox="0 0 1000 600">
              <defs>
                 <mask id="pathMask">
                    <rect width="1000" height="600" fill="white" />
                 </mask>
              </defs>

              {/* Path 1: Expressway (Congested) */}
              <motion.path d="M 0 100 L 250 100 L 850 150 L 1000 150" fill="transparent" strokeWidth="12" stroke="#ef4444" strokeLinecap="round" opacity="0.4" strokeDasharray="15 15" />
              {[0, 1, 2, 3].map(i => (
                <motion.circle key={`red-${i}`} r="5" fill="#ef4444">
                   <animateMotion dur={`${5+i}s`} repeatCount="indefinite" path="M 0 100 L 250 100 L 850 150 L 1000 150" />
                </motion.circle>
              ))}

              {/* Path 2: Harbor Bypass (Optimal Green) */}
              <motion.path 
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3 }}
                d="M 50 100 L 50 450 L 450 450 L 450 600" 
                fill="transparent" strokeWidth="16" stroke="#10b981" strokeLinecap="round" 
                className="filter drop-shadow-[0_0_15px_#10b981]" 
              />
              {[0, 1, 2, 3, 4].map(i => (
                <motion.circle key={`green-${i}`} r="7" fill="#fff" className="shadow-[0_0_20px_#fff]">
                   <animateMotion dur={`${3+i}s`} repeatCount="indefinite" path="M 50 100 L 50 450 L 450 450 L 450 600" />
                </motion.circle>
              ))}

              {/* Path 3: Industrial Cross (Moderate Orange) */}
              <motion.path d="M 500 0 L 500 400 L 850 400 L 850 600" fill="transparent" strokeWidth="10" stroke="#f59e0b" strokeLinecap="round" opacity="0.5" />
              {[0, 1].map(i => (
                <motion.circle key={`orange-${i}`} r="5" fill="#f59e0b">
                   <animateMotion dur={`${4+i}s`} repeatCount="indefinite" path="M 500 0 L 500 400 L 850 400 L 850 600" />
                </motion.circle>
              ))}

              {/* Path 4: Small Arterial Road */}
              <motion.path d="M 250 0 L 250 450 L 0 450" fill="transparent" strokeWidth="8" stroke="#3b82f6" strokeLinecap="round" opacity="0.3" strokeDasharray="5 5" />
           </svg>

           {/* Junction Nodes */}
           {junctions.map((j) => (
              <div key={j.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ top: j.y, left: j.x }}>
                 <div className="flex flex-col items-center gap-3">
                    <div className={`p-2 rounded-full ${j.color} shadow-[0_0_30px_currentColor] border-2 border-white/30 animate-pulse`}>
                        <div className="w-3 h-3 bg-white/40 rounded-full"></div>
                    </div>
                    <motion.div className="bg-dark-900/90 border border-white/10 px-5 py-2.5 rounded-[2rem] shadow-2xl backdrop-blur-2xl whitespace-nowrap overflow-hidden">
                       <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${j.color}`}></div>
                          <div>
                             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest underline decoration-white decoration-solid selection:bg-white">{j.name}</p>
                             <p className="text-[11px] text-white font-bold underline decoration-white decoration-solid selection:bg-white uppercase tracking-tight font-bold text-white underline decoration-white decoration-solid selection:bg-white font-bold text-white underline decoration-white decoration-solid selection:bg-white underline decoration-white decoration-solid selection:bg-white">Status: {j.status} ({j.density})</p>
                          </div>
                       </div>
                    </motion.div>
                 </div>
              </div>
           ))}

           {/* Prediction Insight Overlay */}
           <div className="absolute bottom-10 right-10 max-w-sm">
              <motion.div initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="bg-emerald-600/90 border-2 border-emerald-400 p-8 rounded-[3.5rem] shadow-3xl backdrop-blur-2xl overflow-hidden relative border-b-8 border-emerald-800">
                 <div className="relative z-10">
                    <div className="flex items-center gap-6 mb-4">
                       <div className="p-4 bg-white/20 rounded-[2rem]">
                          <Zap className="w-8 h-8 text-white animate-pulse" />
                       </div>
                       <div>
                          <p className="text-white font-black text-lg uppercase tracking-widest underline decoration-white decoration-solid selection:bg-white italic selection:bg-white">Optimal Shift Found</p>
                          <p className="text-white/70 text-xs underline decoration-white decoration-solid selection:bg-white font-medium underline decoration-white decoration-solid selection:bg-white underline decoration-white decoration-solid selection:bg-white">Neural Engine predicts heavy congestion at <span className="text-white font-black underline decoration-white decoration-solid selection:bg-white">North Crossing</span>. Rerouting via Harbor Bypass.</p>
                       </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/20 pt-4">
                       <div className="text-center">
                          <p className="text-[9px] text-white/50 uppercase tracking-widest underline decoration-white decoration-solid selection:bg-white">Savings</p>
                          <p className="text-2xl font-black text-white underline decoration-white decoration-solid selection:bg-white tracking-tighter uppercase tracking-tighter underline decoration-white decoration-solid selection:bg-white underline decoration-white decoration-solid selection:bg-white">+18.4m</p>
                       </div>
                       <div className="text-center">
                          <p className="text-[9px] text-white/50 uppercase tracking-widest underline decoration-white decoration-solid selection:bg-white">Efficiency</p>
                          <p className="text-2xl font-black text-white underline decoration-white decoration-solid selection:bg-white tracking-tighter uppercase tracking-tighter underline decoration-white decoration-solid selection:bg-white underline decoration-white decoration-solid selection:bg-white">96.2%</p>
                       </div>
                    </div>
                 </div>
              </motion.div>
           </div>
        </div>

        {/* Real-time Telemetry Grid Sidebar */}
        <div className="flex flex-col gap-4">
             <div className="bg-dark-900/80 border border-slate-800 p-8 rounded-[3.5rem] flex-1 flex flex-col gap-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                   <p className="text-[12px] font-black text-slate-500 uppercase tracking-widest underline decoration-white decoration-solid selection:bg-white">Route Diversity Index</p>
                   <Layers className="w-4 h-4 text-slate-700 hover:text-primary-500 transition-colors cursor-pointer" />
                </div>

                <div className="space-y-4">
                   {liveRoutes.map((route, i) => (
                      <motion.div key={i} whileHover={{ x: 8 }} className="p-5 bg-dark-800/40 border border-white/5 rounded-[2.5rem] group cursor-pointer hover:bg-white/5 transition-all">
                         <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest underline decoration-white decoration-solid selection:bg-white font-bold text-white underline decoration-white decoration-solid selection:bg-white">{route.name}</span>
                            <div className={`w-2 h-2 rounded-full bg-${route.color}-500 shadow-[0_0_10px_currentColor]`}></div>
                         </div>
                         <div className="flex justify-between items-end">
                            <div className="text-3xl font-black text-white underline decoration-white decoration-solid selection:bg-white tracking-tighter italic selection:bg-white">{route.time}</div>
                            <span className={`text-[11px] font-mono font-black ${route.color === 'emerald' ? 'text-emerald-400' : (route.color === 'red' ? 'text-red-400' : 'text-orange-400')} uppercase`}>{route.delay}</span>
                         </div>
                      </motion.div>
                   ))}
                </div>

                <div className="mt-auto pt-8 border-t border-white/5">
                    <button
                      onClick={handleSync}
                      disabled={isSyncing}
                      className="w-full bg-gradient-to-r from-primary-600 to-indigo-600 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black text-[11px] py-5 rounded-[2rem] uppercase tracking-[0.2em] shadow-xl shadow-primary-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      {isSyncing ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          Syncing...
                        </>
                      ) : 'Sync Regional Data'}
                    </button>
                    {lastSynced && (
                      <p className={`text-center text-[10px] mt-2 font-mono ${syncStatus === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>
                        {syncStatus === 'error' ? '⚠ Sync failed — check backend' : `✓ Last synced: ${lastSynced}`}
                      </p>
                    )}
                 </div>
             </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficPredictorMap;
