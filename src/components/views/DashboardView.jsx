import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Legend } from 'recharts';
import { Activity, CarFront, AlertTriangle, ArrowUpRight, ArrowDownRight, Users, Clock, Zap } from 'lucide-react';
import Card from '../ui/Card';

const fallbackTrafficData = [
  { time: '08:00', density: 65, avgWait: 40 },
  { time: '12:00', density: 60, avgWait: 35 },
  { time: '16:00', density: 80, avgWait: 110 },
];

const vehicleMix = [
  { name: 'Bikes (wt:1)', count: 4200, fill: '#3b82f6' },
  { name: 'Cars (wt:2)', count: 2800, fill: '#8b5cf6' },
  { name: 'Buses (wt:5)', count: 350, fill: '#10b981' },
];

const MetricBadge = ({ icon: Icon, title, value, trend, isPositive }) => (
  <Card className="hover:-translate-y-1 transition-transform cursor-pointer">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-slate-400 font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-100">{value}</h3>
      </div>
      <div className={`p-2 rounded-xl ${isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
        <Icon size={24} />
      </div>
    </div>
    <div className="mt-4 flex items-center gap-2">
      <span className={`text-sm font-semibold flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {isPositive ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
        {trend}
      </span>
      <span className="text-xs text-slate-500">vs last hour</span>
    </div>
  </Card>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-800 border border-slate-700 p-4 rounded-xl shadow-xl">
        <p className="text-slate-300 font-semibold mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.value} {entry.name.includes('Wait') ? 'sec' : (entry.name.includes('Density') ? '%' : '')}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const DashboardView = () => {
  const [statusStats, setStatusStats] = useState({ congestion: 78, wait: 80, processed: 12450, optimizations: 482 });
  const [chartData, setChartData] = useState(fallbackTrafficData);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statusRes, predictRes] = await Promise.all([
          fetch('http://127.0.0.1:5000/api/status'),
          fetch('http://127.0.0.1:5000/api/predict')
        ]);
        
        if (statusRes.ok) {
          const status = await statusRes.json();
          setStatusStats({
            congestion: status.overall_congestion,
            wait: status.avg_wait_time,
            processed: status.processed_vehicles,
            optimizations: status.ai_optimizations
          });
        }
        
        if (predictRes.ok) {
          const predict = await predictRes.json();
          const mappedData = predict.map(d => {
            const density = d.historical !== null ? d.historical : d.predicted;
            return {
              time: d.time,
              density: density,
              avgWait: Math.floor(density * 1.5)
            };
          });
          setChartData(mappedData);
        }
      } catch (err) {
        console.error("Dashboard failed to sync with backend.", err);
      }
    };
    
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000); // 10s sync
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricBadge icon={Activity} title="Current Congestion" value={`${statusStats.congestion}%`} trend={statusStats.congestion > 60 ? "+4.2%" : "-2.1%"} isPositive={statusStats.congestion < 60} />
        <MetricBadge icon={Clock} title="Avg. Waiting Time" value={`${Math.floor(statusStats.wait/60)}m ${statusStats.wait%60}s`} trend="-12s" isPositive={true} />
        <MetricBadge icon={CarFront} title="Processed Vehicles" value={statusStats.processed.toLocaleString()} trend="+1.2k" isPositive={false} />
        <MetricBadge icon={Zap} title="AI Optimizations" value={statusStats.optimizations.toLocaleString()} trend="+45" isPositive={true} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Traffic Density & Wait Times (24h)" icon={Activity} className="lg:col-span-2 min-h-[400px]">
          <div className="h-full w-full min-h-[300px] mt-4 relative">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDensity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorWait" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={36} iconType="circle"/>
                <Area type="monotone" dataKey="density" name="Density (%)" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorDensity)" />
                <Area type="monotone" dataKey="avgWait" name="Wait Time (s)" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorWait)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Vehicle Mix Analysis" icon={Users} className="min-h-[400px]">
          <div className="flex-1 flex flex-col justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={vehicleMix} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} width={80} />
                <Tooltip cursor={{ fill: '#334155', opacity: 0.4 }} content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={30}>
                  {vehicleMix.map((entry, index) => (
                    <cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            
            <div className="mt-8 space-y-4">
              <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2"><AlertTriangle size={16} className="text-indigo-400" /></div>
                <h4 className="text-indigo-400 font-semibold text-sm mb-1">Density Weighting</h4>
                <p className="text-slate-300 text-xs leading-relaxed">System applies multiplier weights (Bike: 1x, Car: 2x, Bus: 5x) to accurately model physical space consumption.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardView;
