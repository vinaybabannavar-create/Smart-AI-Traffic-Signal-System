import React, { useState, useEffect, useCallback } from 'react';
import { Camera, RadioReceiver, Zap, Maximize, Activity, AlertTriangle, BellRing } from 'lucide-react';
import Card from '../ui/Card';
import JunctionSimulation from './JunctionSimulationView';
import TrafficPredictorMap from './TrafficPredictorMap';

const LaneNode = ({ name, vehicles, score, active, signalColor }) => (
  <div className={`p-4 rounded-xl border ${active ? 'bg-slate-800/80 border-primary-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)] ring-1 ring-primary-500/50' : 'bg-slate-800/40 border-slate-700/50'} transition-all duration-500`}>
    <div className="flex justify-between items-center mb-3">
      <h4 className="font-semibold text-slate-200">{name}</h4>
      <div className={`w-4 h-4 rounded-full shadow-lg ${
        signalColor === 'green' ? 'bg-green-500 shadow-green-500/50 ring-2 ring-green-500/20 ring-offset-2 ring-offset-dark-900' : 
        signalColor === 'yellow' ? 'bg-yellow-500 shadow-yellow-500/50' : 
        'bg-red-500 shadow-red-500/50'
      }`}></div>
    </div>
    
    <div className="space-y-3">
      <div className="flex justify-between items-baseline">
        <span className="text-xs text-slate-400">Total Density Score (Σ)</span>
        <span className="text-2xl font-bold text-white">{score}</span>
      </div>
      
      <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary-500 to-indigo-500 transition-all duration-1000 ease-out"
          style={{ width: `${Math.min(100, (score / 300) * 100)}%` }}
        />
      </div>
      
      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-700/50">
        <div className="text-center bg-slate-900/50 rounded-lg py-2">
          <span className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">Bikes (x1)</span>
          <span className="font-semibold text-primary-400">{vehicles.bikes}</span>
        </div>
        <div className="text-center bg-slate-900/50 rounded-lg py-2">
          <span className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">Cars (x2)</span>
          <span className="font-semibold text-purple-400">{vehicles.cars}</span>
        </div>
        <div className="text-center bg-slate-900/50 rounded-lg py-2">
          <span className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">Buses (x5)</span>
          <span className="font-semibold text-emerald-400">{vehicles.buses}</span>
        </div>
      </div>
    </div>
  </div>
);

const PlanAView = () => {
  // Mock dynamic data simulating real-time CCTV analysis
  const [lanes, setLanes] = useState([
    { id: 'north', name: 'North Lane', bikes: 24, cars: 18, buses: 2 },
    { id: 'south', name: 'South Lane', bikes: 45, cars: 32, buses: 4 }, // High density
    { id: 'east', name: 'East Lane', bikes: 12, cars: 8, buses: 0 },
    { id: 'west', name: 'West Lane', bikes: 38, cars: 22, buses: 1 },
  ]);

  const calculateScore = (bikes, cars, buses) => bikes * 1 + cars * 2 + buses * 5;
  const scores = lanes.map(l => ({ ...l, score: calculateScore(l.bikes, l.cars, l.buses) }));
  
  const [activeLaneId, setActiveLaneId] = useState('south');
  const [aiTimer, setAiTimer] = useState(8);
  const [totalProcessed, setTotalProcessed] = useState(14234);
  const [emergencyLane, setEmergencyLane] = useState(null);

  // Handle Emergency Detection from Simulation
  const handleEmergency = useCallback((laneId) => {
    setEmergencyLane(laneId);
    // Force immediate switch to emergency lane
    setActiveLaneId(laneId);
    setAiTimer(10); // Give ambulance plenty of time
  }, []);

  // AI Timer Countdown Engine
  useEffect(() => {
    const countdown = setInterval(() => {
      setAiTimer(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  // AI Decision Engine Trigger (Max 10s)
  useEffect(() => {
    if (aiTimer === 0) {
      if (emergencyLane) {
        // Clear emergency state once passed (simulated)
        setEmergencyLane(null);
      }
      
      const nextLane = emergencyLane ? scores.find(l => l.id === emergencyLane) : scores.reduce((prev, current) => (prev.score > current.score) ? prev : current);
      setActiveLaneId(nextLane.id);
      
      // Allocate max 10s based on traffic density score
      const allocatedTime = Math.min(10, Math.max(4, Math.floor(nextLane.score / 10)));
      setAiTimer(allocatedTime);
    }
  }, [aiTimer, scores, emergencyLane]);

  // Simulate physical traffic arrival and processing
  useEffect(() => {
    const interval = setInterval(() => {
      setLanes(prev => prev.map(lane => {
        const isGreen = lane.id === activeLaneId;
        // Traffic leaves quickly if green, otherwise accumulates
        let b = lane.bikes + (isGreen ? -Math.floor(Math.random() * 4) : Math.floor(Math.random() * 3));
        let c = lane.cars + (isGreen ? -Math.floor(Math.random() * 3) : Math.floor(Math.random() * 2));
        let bus = lane.buses + (isGreen ? (Math.random()>.5 ? -1 : 0) : (Math.random()>.8 ? 1 : 0));
        
        return {
          ...lane,
          bikes: Math.max(0, b),
          cars: Math.max(0, c),
          buses: Math.max(0, bus)
        };
      }));
      // Advance daily total slightly every 3s
      setTotalProcessed(p => p + Math.floor(Math.random() * 5));
    }, 3000);
    return () => clearInterval(interval);
  }, [activeLaneId]);

  const activeLaneDetails = scores.find(l => l.id === activeLaneId) || scores[0];

  return (
    <div className="space-y-6">
      {/* Header section remains same */}
      <div className="flex flex-col md:flex-row gap-6 justify-between md:items-center">
        <div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Plan A: Junction Optimization</h2>
          <p className="text-slate-400 mt-1">Real-time lane density calculation & dynamic signal control</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2 flex items-center gap-3">
            <RadioReceiver size={18} className="text-primary-500 animate-pulse" />
            <span className="text-sm font-medium text-slate-200">Cameras Active (YOLOv8)</span>
          </div>
        </div>
      </div>

      {/* Main Layout: Stacked Vertically */}
      <div className="flex flex-col gap-6">
        
        {/* Top: Visualization Viewport (Full Width) */}
        <Card className="relative min-h-[500px] flex flex-col pt-4 overflow-hidden border-primary-500/20 bg-slate-900/40">
          <div className="absolute top-4 right-4 z-40">
            <button className="p-2 bg-slate-900/80 rounded-lg text-slate-400 hover:text-white transition-colors border border-slate-700/50 shadow-lg backdrop-blur-md">
              <Maximize size={18} />
            </button>
          </div>
          
          <div className="absolute top-4 left-4 z-40 bg-slate-900/80 rounded-lg px-3 py-1.5 border border-slate-700/50 shadow-lg backdrop-blur-md flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-xs font-mono text-slate-300">CCTV_FEED_01 // JUNCTION_MAIN</span>
          </div>

          <div className="flex-1 w-full relative group overflow-hidden rounded-xl border border-slate-800/50 min-h-[500px]">
             <JunctionSimulation 
               activeGreenLane={activeLaneId} 
               onEmergencyDetected={handleEmergency}
             />
             
             {/* Emergency Alert Banner */}
             {emergencyLane && (
               <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce">
                  <div className="bg-red-600/90 text-white px-6 py-3 rounded-full border-2 border-red-400 shadow-[0_0_30px_rgba(239,68,68,0.5)] flex items-center gap-3 backdrop-blur-md">
                    <BellRing className="animate-pulse" size={20} />
                    <span className="font-bold tracking-wider uppercase text-sm">Emergency Override: Ambulance Detected ({emergencyLane})</span>
                  </div>
               </div>
             )}
          </div>
        </Card>

        {/* AI Decision Engine Live - MOVED BELOW */}
        <div className="bg-dark-900/40 border border-primary-500/20 px-8 py-6 rounded-3xl backdrop-blur-xl shadow-2xl flex items-center justify-between">
            <div className="flex items-center gap-8">
                <div className="p-4 bg-primary-500/10 rounded-2xl border border-primary-500/20">
                   <Zap className="text-primary-400" size={32} />
                </div>
                <div>
                   <p className="text-[11px] text-primary-300 font-mono tracking-[0.3em] uppercase mb-1 animate-pulse">AI Decision Engine Live</p>
                   <p className="text-2xl font-black text-white tracking-tight">
                      Clearing {activeLaneDetails.name}
                   </p>
                </div>
            </div>
            
            <div className="flex gap-16 items-center">
                <div className="text-center">
                   <span className="block text-[11px] text-slate-500 uppercase tracking-widest mb-2 font-mono font-bold">Allocated Time</span>
                   <span className="font-mono text-purple-400 font-black text-4xl tracking-tighter">{aiTimer}s</span>
                </div>
                
                <div className="h-16 w-px bg-slate-700/50"></div>
                
                <div className="bg-slate-800/40 rounded-2xl px-8 py-4 text-center border border-slate-700/30">
                   <span className="block text-[11px] text-slate-500 uppercase tracking-widest mb-1 font-mono font-bold">Density Score</span>
                   <span className="font-mono text-primary-400 font-black text-3xl tracking-tighter">{activeLaneDetails.score}</span>
                </div>
            </div>
        </div>

        {/* Bottom: Telemetry Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left: System Handled Stats */}
          <div className="lg:col-span-1">
            <Card className="h-full flex flex-col justify-center p-8 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50">
              <p className="text-xs text-slate-400 font-mono tracking-[0.2em] uppercase mb-2">Total System Handled</p>
              <h3 className="text-4xl font-black text-white mb-4 tracking-tight">
                {totalProcessed.toLocaleString()}
              </h3>
              <div className="flex items-center gap-3">
                <div className="bg-primary-500/20 text-primary-400 text-xs px-3 py-1.5 rounded-full font-bold border border-primary-500/20 flex items-center gap-2">
                  <Activity size={12} /> +12 vehicles / min
                </div>
              </div>
            </Card>
          </div>

          {/* Right: Detailed Lane Scores (Horizontal list) */}
          <Card title="Live Density Scores" className="lg:col-span-3">
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-2">
                {scores.map((lane) => (
                  <LaneNode 
                    key={lane.id}
                    name={lane.name}
                    vehicles={{ bikes: lane.bikes, cars: lane.cars, buses: lane.buses }}
                    score={lane.score}
                    active={lane.id === activeLaneId}
                    signalColor={lane.id === activeLaneId ? 'green' : 'red'}
                  />
                ))}
             </div>
          </Card>
        </div>

        {/* New Predictive Traffic Map Section */}
        <TrafficPredictorMap />

      </div>
    </div>
  );
};

export default PlanAView;
