import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SPAWN_RATE = 1200; 
const AMBULANCE_COOLDOWN = 180000; // 3 minutes

// Stop threshold: vehicles stop at 35% progress (well before 50% center)
const STOP_LINE = 28;

const JunctionSimulation = ({ activeGreenLane, onEmergencyDetected }) => {
  const [vehicles, setVehicles] = useState([]);
  const [vehicleIdCounter, setVehicleIdCounter] = useState(0);

  // Short Siren Burst - plays for 5 seconds only when ambulance spawns
  const playSirenBurst = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'triangle';
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
      oscillator.start();
      
      let toggle = true;
      const sirenInterval = setInterval(() => {
        oscillator.frequency.exponentialRampToValueAtTime(toggle ? 960 : 640, audioCtx.currentTime + 0.4);
        toggle = !toggle;
      }, 500);

      // Auto-stop after 5 seconds
      setTimeout(() => {
        clearInterval(sirenInterval);
        oscillator.stop();
        audioCtx.close();
      }, 5000);
    } catch (e) { console.error("Audio error", e); }
  }, []);

  // Vehicle Spawner
  useEffect(() => {
    const interval = setInterval(() => {
      const lanes = ['north', 'south', 'east', 'west'];
      const randomLane = lanes[Math.floor(Math.random() * lanes.length)];
      
      const now = Date.now();
      const storedLastTime = parseInt(localStorage.getItem('lastAmbulanceTime') || '0');
      const canSpawnAmbulance = (now - storedLastTime) > AMBULANCE_COOLDOWN;
      
      const roll = Math.random();
      let type = 'car';
      if (roll < 0.05 && canSpawnAmbulance) {
        type = 'ambulance';
        localStorage.setItem('lastAmbulanceTime', now.toString());
      }
      else if (roll < 0.25) type = 'bus';
      else if (roll < 0.5) type = 'bike';
      
      setVehicles(prev => {
        if (prev.length > 45) return prev;
        
        const newVehicle = {
          id: `v_${vehicleIdCounter}`,
          lane: randomLane,
          subLane: Math.floor(Math.random() * 3), 
          type: type,
          confidence: type === 'ambulance' ? 0.99 : (0.85 + Math.random() * 0.14),
          progress: 0, 
          state: 'approaching' 
        };

        if (type === 'ambulance') {
          onEmergencyDetected?.(randomLane);
          playSirenBurst();
        }

        return [...prev, newVehicle];
      });
      setVehicleIdCounter(c => c + 1);
    }, SPAWN_RATE);
    
    return () => clearInterval(interval);
  }, [vehicleIdCounter, onEmergencyDetected, playSirenBurst]);

  // Vehicle Physics & Queueing Engine
  useEffect(() => {
    const engine = setInterval(() => {
      setVehicles(prev => {
        return prev.map(v => {
          let newProgress = v.progress;
          let newState = v.state;
          const isGreen = activeGreenLane === v.lane;

          // Queueing: Check for vehicle ahead in same lane & subLane
          const vehicleAhead = prev.find(other => 
            other.id !== v.id && 
            other.lane === v.lane && 
            other.subLane === v.subLane && 
            other.progress > v.progress && 
            (other.progress - v.progress) < 12
          );
          const isBlocked = !!vehicleAhead;
          
          if (v.state === 'approaching') {
            if (isBlocked) {
              // Blocked by vehicle ahead - don't move
            } else if (v.progress >= STOP_LINE && !isGreen && v.type !== 'ambulance') {
              // At stop line and light is red
              newState = 'waiting';
            } else {
              const speed = v.type === 'ambulance' ? 3 : (v.type === 'bike' ? 1.5 : (v.type === 'car' ? 2 : 1.2));
              newProgress += speed;
            }
          } else if (v.state === 'waiting') {
            if (isGreen && !isBlocked) {
              newState = 'passing';
            }
          } else if (v.state === 'passing') {
            if (isBlocked && v.progress < 80) {
              // Blocked
            } else {
              const speed = v.type === 'ambulance' ? 3.5 : (v.type === 'bike' ? 2 : (v.type === 'car' ? 2.5 : 1.5));
              newProgress += speed;
              if (newProgress > 100) newState = 'done';
            }
          }
          
          return { ...v, progress: newProgress, state: newState };
        }).filter(v => v.state !== 'done');
      });
    }, 50); 

    return () => clearInterval(engine);
  }, [activeGreenLane]);

  return (
    <div className="w-full h-full min-h-[500px] bg-dark-950 rounded-xl relative overflow-hidden flex items-center justify-center border border-slate-700/50 shadow-inner">
      {/* Map Grid */}
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(#475569 1px, transparent 1px), linear-gradient(90deg, #475569 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      {/* Roads (w-52 / 208px) */}
      <div className="absolute top-0 bottom-0 w-52 left-1/2 -translate-x-1/2 bg-slate-800 border-l-2 border-r-2 border-slate-700/50 shadow-2xl flex justify-center">
         <div className="w-[1px] h-full absolute left-1/4 opacity-20 border-dashed border-l border-slate-400"></div>
         <div className="w-[1px] h-full absolute left-2/4 opacity-5 border-l border-slate-400"></div>
         <div className="w-[1px] h-full absolute left-3/4 opacity-20 border-dashed border-l border-slate-400"></div>
         <div className="w-[4px] h-full bg-yellow-500/20 flex justify-between px-[1px]">
            <div className="w-[0.5px] h-full bg-yellow-500/40"></div>
            <div className="w-[0.5px] h-full bg-yellow-500/40"></div>
         </div>
      </div>
      
      <div className="absolute left-0 right-0 h-52 top-1/2 -translate-y-1/2 bg-slate-800 border-t-2 border-b-2 border-slate-700/50 shadow-2xl flex flex-col justify-center">
         <div className="h-[1px] w-full absolute top-1/4 opacity-20 border-dashed border-t border-slate-400"></div>
         <div className="h-[1px] w-full absolute top-2/4 opacity-5 border-t border-slate-400"></div>
         <div className="h-[1px] w-full absolute top-3/4 opacity-20 border-dashed border-t border-slate-400"></div>
         <div className="h-[4px] w-full bg-yellow-500/20 flex flex-col justify-between py-[1px]">
            <div className="h-[0.5px] w-full bg-yellow-500/40"></div>
            <div className="h-[0.5px] w-full bg-yellow-500/40"></div>
         </div>
      </div>

      <div className="absolute w-52 h-52 bg-slate-800/80 z-0"></div>
      
      {/* Stop Line Indicators */}
      <div className="absolute w-[104px] h-[2px] border-t-2 border-dashed border-white/20 z-10" style={{ top: '28%', left: 'calc(50% - 104px)' }}></div>
      <div className="absolute w-[104px] h-[2px] border-t-2 border-dashed border-white/20 z-10" style={{ bottom: '28%', left: '50%' }}></div>
      <div className="absolute h-[104px] w-[2px] border-l-2 border-dashed border-white/20 z-10" style={{ left: '28%', top: '50%' }}></div>
      <div className="absolute h-[104px] w-[2px] border-l-2 border-dashed border-white/20 z-10" style={{ right: '28%', top: 'calc(50% - 104px)' }}></div>

      {/* Traffic Lights */}
      <div className={`absolute top-[calc(50%-140px)] left-[calc(50%-65px)] w-4 h-4 rounded-full ${activeGreenLane === 'north' ? 'bg-green-500 shadow-[0_0_20px_#10b981]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'} z-20 border-2 border-dark-900`} />
      <div className={`absolute bottom-[calc(50%-140px)] left-[calc(50%+45px)] w-4 h-4 rounded-full ${activeGreenLane === 'south' ? 'bg-green-500 shadow-[0_0_20px_#10b981]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'} z-20 border-2 border-dark-900`} />
      <div className={`absolute left-[calc(50%-140px)] top-[calc(50%+45px)] w-4 h-4 rounded-full ${activeGreenLane === 'west' ? 'bg-green-500 shadow-[0_0_20px_#10b981]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'} z-20 border-2 border-dark-900`} />
      <div className={`absolute right-[calc(50%-140px)] top-[calc(50%-65px)] w-4 h-4 rounded-full ${activeGreenLane === 'east' ? 'bg-green-500 shadow-[0_0_20px_#10b981]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'} z-20 border-2 border-dark-900`} />

      {/* Vehicles */}
      <AnimatePresence>
        {vehicles.map(v => {
           let left, top;
           
           const subLaneOffset = (v.subLane === 0) ? -75 : ((v.subLane === 1) ? -50 : -25); 
           
           if (v.lane === 'north') {
             left = `calc(50% + ${subLaneOffset}px)`; top = `${v.progress}%`;
           } else if (v.lane === 'south') {
             left = `calc(50% - ${subLaneOffset}px)`; top = `${100 - v.progress}%`;
           } else if (v.lane === 'west') {
             top = `calc(50% - ${subLaneOffset}px)`; left = `${v.progress}%`;
           } else {
             top = `calc(50% + ${subLaneOffset}px)`; left = `${100 - v.progress}%`;
           }

           const color = v.type === 'car' ? 'bg-purple-500' : 
                         (v.type === 'bus' ? 'bg-emerald-500' : 
                         (v.type === 'ambulance' ? 'bg-white shadow-[0_0_15px_white]' : 'bg-blue-500'));
           
           const size = v.type === 'car' ? 'w-5 h-8' : 
                        (v.type === 'bus' ? 'w-6 h-14' : 
                        (v.type === 'ambulance' ? 'w-6 h-10' : 'w-3 h-5'));
           
           const rotation = (v.lane === 'north' || v.lane === 'south') ? 'rotate-0' : 'rotate-90';
           const labelTransform = (v.lane === 'east' || v.lane === 'west') ? '-rotate-90 -translate-x-10' : 'rotate-0 -translate-y-12';

           return (
             <motion.div
               key={v.id}
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1, left, top }}
               exit={{ opacity: 0, scale: 0.8 }}
               transition={{ duration: 0.1 }}
               className={`absolute z-20 ${rotation} flex items-center justify-center -translate-x-1/2 -translate-y-1/2`}
             >
                <div className={`${color} ${size} rounded shadow-2xl border border-white/20 relative`}>
                    {v.type === 'ambulance' && (
                        <div className="absolute inset-0 flex flex-col justify-around py-2 items-center text-[7px] font-bold text-red-600">
                            AMB
                            <div className="flex gap-1">
                                <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 0.25 }} className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6]"></motion.div>
                                <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.25 }} className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_#ef4444]"></motion.div>
                            </div>
                        </div>
                    )}
                </div>
                
                {v.progress > 5 && v.progress < 95 && (
                  <div className={`absolute ${labelTransform} pointer-events-none flex flex-col items-center z-30`}>
                    <div className={`bg-dark-900/95 border ${v.type === 'ambulance' ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'border-primary-500/70'} text-[10px] font-mono ${v.type === 'ambulance' ? 'text-red-400' : 'text-primary-300'} px-2 py-0.5 whitespace-nowrap rounded-[4px] backdrop-blur-md shadow-2xl`}>
                       {v.type.toUpperCase()}:{(v.confidence * 100).toFixed(1)}%
                    </div>
                  </div>
                )}
             </motion.div>
           )
        })}
      </AnimatePresence>
      
      {/* HUD Overview */}
      <div className="absolute top-4 right-4 bg-dark-900/95 border border-slate-700/50 px-4 py-3 rounded-xl backdrop-blur-xl text-[10px] flex flex-col gap-2.5 z-30 shadow-2xl border-l-4 border-l-primary-500">
         <div className="text-slate-400 font-mono text-[9px] uppercase tracking-[0.2em] border-b border-white/5 pb-1.5">AI Detection</div>
         <div className="text-slate-200 font-mono flex items-center gap-3"><div className="w-4 h-4 bg-white rounded flex items-center justify-center border border-red-500"><div className="w-2 h-2 bg-red-500 animate-ping rounded-full"></div></div>Ambulance</div>
         <div className="text-slate-300 font-mono flex items-center gap-3"><div className="w-4 h-4 bg-emerald-500 rounded"></div>Bus</div>
         <div className="text-slate-300 font-mono flex items-center gap-3"><div className="w-4 h-4 bg-purple-500 rounded"></div>Car</div>
         <div className="text-slate-300 font-mono flex items-center gap-3"><div className="w-4 h-4 bg-blue-500 rounded"></div>Bike</div>
      </div>
      
    </div>
  );
};

export default JunctionSimulation;
