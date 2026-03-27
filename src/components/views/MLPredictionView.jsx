import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertOctagon, Activity, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ComposedChart, Line } from 'recharts';
import Card from '../ui/Card';

// Generate Mock Time-Series Data: Historical + Future Predictions
const generatePredictionData = () => {
  const currentHour = new Date().getHours();
  const data = [];
  
  // Last 12 hours (Historical)
  for (let i = 12; i >= 0; i--) {
    let hour = currentHour - i;
    if (hour < 0) hour += 24;
    const baseCongestion = 40 + Math.sin(hour * Math.PI / 12) * 30 + Math.random() * 10;
    
    data.push({
      time: `${hour}:00`,
      historical: Math.max(10, Math.min(95, Math.floor(baseCongestion))),
      predicted: null,
      upperBound: null,
      lowerBound: null,
      isFuture: false
    });
  }
  
  // Next 12 hours (Predicted by "ML Engine")
  let lastVal = data[data.length - 1].historical;
  for (let i = 1; i <= 12; i++) {
    let hour = currentHour + i;
    if (hour >= 24) hour -= 24;
    
    // Simulate ML prediction (following a daily trend but with confidence intervals)
    const trend = Math.sin(hour * Math.PI / 12) * 30;
    const predictionBase = 45 + trend + (Math.random() * 5 - 2.5);
    const confidenceMargin = i * 2; // Margin grows the further into the future we predict
    
    data.push({
      time: `${hour}:00`,
      historical: null,
      predicted: Math.max(10, Math.min(95, Math.floor(predictionBase))),
      upperBound: Math.min(100, Math.floor(predictionBase + confidenceMargin)),
      lowerBound: Math.max(0, Math.floor(predictionBase - confidenceMargin)),
      isFuture: true
    });
  }
  
  // Connect the last historical point to the first predicted point for visual continuity
  data[12].predicted = data[12].historical;
  data[12].upperBound = data[12].historical;
  data[12].lowerBound = data[12].historical;
  
  return data;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const isFuture = payload.some(p => p.dataKey === 'predicted' && p.value !== null && p.payload.historical === null);
    
    return (
      <div className="bg-dark-800 border border-slate-700 p-4 rounded-xl shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          {isFuture ? <Brain size={14} className="text-purple-400" /> : <Activity size={14} className="text-blue-400" />}
          <p className="text-slate-200 font-semibold">{label}</p>
        </div>
        
        {payload.map((entry, index) => {
          if (entry.value === null) return null;
          
          let name = entry.name;
          let color = entry.color;
          
          if (entry.dataKey === 'historical') { name = 'Actual Congestion'; color = '#3b82f6'; }
          if (entry.dataKey === 'predicted') { name = 'ML Prediction'; color = '#a855f7'; }
          if (entry.dataKey === 'upperBound') { name = 'Confidence Upper'; color = 'rgba(168, 85, 247, 0.3)'; }
          if (entry.dataKey === 'lowerBound') { name = 'Confidence Lower'; color = 'rgba(168, 85, 247, 0.3)'; }
          
          if (entry.dataKey === 'upperBound' || entry.dataKey === 'lowerBound') return null; // Hide raw bounds from tooltip

          return (
            <p key={index} style={{ color }} className="text-sm font-medium">
              {name}: {entry.value}%
            </p>
          );
        })}
        {isFuture && (
           <p className="text-xs text-purple-400/70 mt-2 border-t border-slate-700 pt-1">
             AI Confidence: {Math.floor(100 - (payload[0]?.payload?.upperBound - payload[0]?.payload?.lowerBound))}%
           </p>
        )}
      </div>
    );
  }
  return null;
};

const MLPredictionView = () => {
  const [data, setData] = useState([]);
  const [analyzing, setAnalyzing] = useState(true);
  const [error, setError] = useState(null);

  const activeFeatures = data.find(d => d.isFuture && d.features)?.features;
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const weatherMap = ['Clear', 'Rain', 'Storm'];

  useEffect(() => {
    // Fetch data from real Python ML Backend
    const fetchPrediction = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/predict');
        if (!response.ok) throw new Error('Network response was not ok');
        const json = await response.json();
        setData(json);
        setAnalyzing(false);
      } catch (err) {
        console.error("Backend fetch error:", err);
        setError("Failed to connect to backend engine. Is app.py running?");
        setAnalyzing(false);
      }
    };
    
    fetchPrediction();
    
    // Refresh periodically
    const interval = setInterval(fetchPrediction, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6 justify-between md:items-center">
        <div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400 flex items-center gap-2">
            <Brain className="text-purple-500" /> Advanced ML Analytics
          </h2>
          <p className="text-slate-400 mt-1">Time-series traffic forecasting and anomaly prediction</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-slate-800/60 border border-purple-500/30 rounded-xl px-4 py-2 flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${analyzing ? 'bg-yellow-500 animate-pulse' : 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]'}`}></div>
            <span className="text-sm font-medium text-purple-200">
              {analyzing ? 'Running Regression...' : 'Model: RandomForestRegressor (Scikit-Learn)'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* ML Stats Column */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border-purple-500/20">
            <h3 className="text-sm text-slate-400 mb-4 uppercase tracking-wider font-semibold">Model Status</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Accuracy (Last 24h)</span>
                  <span className="text-green-400 font-bold">94.2%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-[94.2%]"></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Data Points Analyzed</span>
                  <span className="text-purple-400 font-bold">12.4M</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-700/50">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-300">Live Inference Parameters</span>
                  <span className="text-blue-400 font-bold flex items-center gap-1"><Zap size={10} /> Sync</span>
                </div>
                {activeFeatures ? (
                <div className="grid grid-cols-3 gap-2">
                   <div className="bg-slate-900/50 p-2 rounded text-center border border-slate-700/30">
                      <span className="block text-[9px] text-slate-500 uppercase tracking-widest mb-0.5">Day</span>
                      <span className="text-xs text-white font-medium">{days[activeFeatures.day]}</span>
                   </div>
                   <div className="bg-slate-900/50 p-2 rounded text-center border border-slate-700/30">
                      <span className="block text-[9px] text-slate-500 uppercase tracking-widest mb-0.5">Hour</span>
                      <span className="text-xs text-white font-medium">{activeFeatures.hour < 10 ? '0': ''}{activeFeatures.hour}:00</span>
                   </div>
                   <div className="bg-slate-900/50 p-2 rounded text-center border border-slate-700/30">
                      <span className="block text-[9px] text-slate-500 uppercase tracking-widest mb-0.5">Weather</span>
                      <span className="text-xs text-white font-medium">{weatherMap[activeFeatures.weather]}</span>
                   </div>
                </div>
                ) : <span className="text-xs text-slate-500">Loading parameters...</span>}
              </div>
            </div>
          </Card>
          
          <Card title="AI Suggested Actions" icon={Zap}>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-slate-300">
                <span className="bg-green-500/20 text-green-400 p-1 rounded"><TrendingUp size={12} /></span>
                <span className="text-xs mt-0.5">Extend Plan A Green time by 15s at North Lane starting 16:45.</span>
              </li>
              <li className="flex items-start gap-2 text-slate-300">
                <span className="bg-purple-500/20 text-purple-400 p-1 rounded"><Brain size={12} /></span>
                <span className="text-xs mt-0.5">Pre-emptively engage Plan B batch release at 16:30 for incoming East traffic.</span>
              </li>
            </ul>
          </Card>
        </div>

        {/* Prediction Chart */}
        <Card className="lg:col-span-3 min-h-[500px]" title="24-Hour Congestion Forecast" icon={TrendingUp}>
          <div className="flex-1 w-full mt-4 h-full relative">
            
            {analyzing && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-dark-800/80 backdrop-blur-sm rounded-xl">
                 <div className="flex flex-col items-center gap-3">
                   <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
                   <p className="text-purple-400 font-mono text-sm tracking-widest uppercase animate-pulse">Processing Tensors...</p>
                 </div>
              </div>
            )}
            
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorHist" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  {/* Stripes pattern for prediction area */}
                  <pattern id="patternPred" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <rect width="4" height="8" fill="#a855f7" fillOpacity="0.1" />
                  </pattern>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ top: -10 }} />
                
                {/* Historical Area */}
                <Area type="monotone" dataKey="historical" name="Actual Data" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorHist)" isAnimationActive={!analyzing} />
                
                {/* Confidence Interval (Area between bounds) */}
                <Area type="monotone" dataKey="upperBound" stroke="none" fill="url(#patternPred)" isAnimationActive={!analyzing} />
                <Area type="monotone" dataKey="lowerBound" stroke="none" fill="#1e293b" isAnimationActive={!analyzing} />
                
                {/* ML Prediction Line */}
                <Line type="monotone" dataKey="predicted" name="ML Prediction" stroke="#a855f7" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 3, fill: '#a855f7', strokeWidth: 0 }} isAnimationActive={!analyzing} />
                
              </ComposedChart>
            </ResponsiveContainer>
            
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-slate-500 font-medium px-10">
              <span>Historical Input Window</span>
              <span className="text-purple-400">Future Forecasting Window</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MLPredictionView;
