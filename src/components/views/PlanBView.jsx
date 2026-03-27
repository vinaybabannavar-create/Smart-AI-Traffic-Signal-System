import React, { useState, useEffect } from 'react';
import { Network, ShieldAlert, ArrowRight, PauseCircle, PlayCircle, Settings2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import Card from '../ui/Card';

const generateHistoricalData = () => {
  return Array.from({ length: 20 }, (_, i) => ({
    time: `-${20 - i}m`,
    inflow: Math.floor(Math.random() * 60) + 40,
    released: Math.floor(Math.random() * 50) + 30,
  }));
};

const PlanBView = () => {
  const [inflowData, setInflowData] = useState(generateHistoricalData());
  const [isRestricted, setIsRestricted] = useState(false);
  const CONGESTION_THRESHOLD = 85;

  useEffect(() => {
    const interval = setInterval(() => {
      setInflowData(prev => {
        const newData = [...prev.slice(1)];
        const lastInflow = prev[prev.length - 1].inflow;
        
        // Random walk for inflow
        let nextInflow = lastInflow + (Math.random() * 20 - 10);
        nextInflow = Math.max(30, Math.min(120, nextInflow)); // Bound between 30 and 120
        
        setIsRestricted(nextInflow >= CONGESTION_THRESHOLD);
        
        let nextReleased = isRestricted ? 40 : nextInflow - (Math.random() * 10);

        newData.push({
          time: 'Now',
          inflow: Math.floor(nextInflow),
          released: Math.floor(nextReleased),
        });
        
        // Update time labels
        return newData.map((d, i) => ({
          ...d,
          time: i === 19 ? 'Now' : `-${19 - i}m`
        }));
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isRestricted]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6 justify-between md:items-center">
        <div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Plan B: Pre-Signal Regulation</h2>
          <p className="text-slate-400 mt-1">Preventing junction overload via 150m upstream batch release</p>
        </div>
        
        <div className={`px-4 py-2 rounded-xl flex items-center gap-3 border ${
          isRestricted 
            ? 'bg-red-500/10 border-red-500/30 text-red-500' 
            : 'bg-green-500/10 border-green-500/30 text-green-500'
        } transition-colors duration-300`}>
          {isRestricted ? <PauseCircle size={20} className="animate-pulse" /> : <PlayCircle size={20} />}
          <span className="font-semibold text-sm">
            {isRestricted ? 'BATCH RELEASE ACTIVE : THROTTLING' : 'OPEN FLOW : NORMAL TRAFFIC'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Control visualization */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="min-h-[400px]" title="Upstream Inflow vs Junction Release Rate" icon={Network}>
            <div className="flex-1 w-full min-h-[300px] mt-4 relative">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={inflowData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.75rem' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <ReferenceLine y={CONGESTION_THRESHOLD} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Congestion Threshold', fill: '#ef4444', fontSize: 12 }} />
                  <Line type="monotone" dataKey="inflow" name="Raw Inflow (veh/min)" stroke="#8b5cf6" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="released" name="Allowed Release (veh/min)" stroke="#10b981" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                <p className="text-xs text-slate-400 mb-1">Current Inflow Rate</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">{inflowData[19].inflow}</span>
                  <span className="text-xs text-slate-500">veh/min</span>
                </div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                <p className="text-xs text-slate-400 mb-1">Junction Release Rate</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-green-400">{inflowData[19].released}</span>
                  <span className="text-xs text-slate-500">veh/min</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* System Settings & Logic */}
        <div className="space-y-6">
          <Card title="Module Logic" icon={Settings2}>
            <div className="space-y-6 text-sm text-slate-300">
              
              <div className="relative pl-6 border-l border-slate-700/50">
                <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                <h4 className="font-semibold text-slate-200 mb-1">1. Continuous Monitoring</h4>
                <p className="text-xs text-slate-400">Cameras installed 150m at pre-signal zones scan incoming volume.</p>
              </div>
              
              <div className="relative pl-6 border-l border-slate-700/50">
                <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                <h4 className="font-semibold text-slate-200 mb-1">2. Threshold Evaluation</h4>
                <p className="text-xs text-slate-400">If Main Junction load {"<"} {CONGESTION_THRESHOLD}%, traffic flows freely.</p>
              </div>
              
              <div className="relative pl-6 border-l border-transparent">
                <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-red-500"></div>
                <h4 className="font-semibold text-slate-200 mb-1">3. Batch Release Protocol</h4>
                <p className="text-xs text-slate-400">If Main Junction spikes, Pre-Signals activate to throttle inflow into controlled batches.</p>
              </div>

            </div>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-indigo-500/30">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400">
                <ShieldAlert size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-slate-100 mb-2">Impact Analysis</h4>
                <p className="text-xs text-indigo-200/70 leading-relaxed mb-4">
                  By regulating flow before the junction, the system actively preventing deadlocks, reduces sudden congestion spikes, and creates overall grid stability.
                </p>
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400">
                  <ArrowRight size={14} /> View historical stability reports
                </div>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default PlanBView;
