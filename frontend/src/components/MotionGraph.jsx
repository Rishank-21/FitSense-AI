import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import GlassCard from './GlassCard';
import { Activity } from 'lucide-react';

const MotionGraph = ({ activeFrame = null }) => {
  const [data, setData] = useState([]);

  // Accumulate the last 20 frames for real-time scrolling graph
  useEffect(() => {
    if (!activeFrame) return;

    setData((prev) => {
      const timeLabel = new Date(activeFrame.timestamp).toLocaleTimeString('en-US', {
        second: '2-digit',
        fractionalSecondDigits: 1
      });

      const newPoint = {
        time: timeLabel,
        intensity: activeFrame.motion?.intensity || 0,
        stability: activeFrame.pose?.stability || 0
      };

      const updated = [...prev, newPoint];
      if (updated.length > 25) {
        updated.shift();
      }
      return updated;
    });
  }, [activeFrame]);

  // Clean data when active session clears
  useEffect(() => {
    if (!activeFrame) {
      setData([]);
    }
  }, [activeFrame]);

  return (
    <GlassCard className="h-72 border-indigo-500/10">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-indigo-400 animate-pulse" />
        <h3 className="text-sm font-semibold text-slate-200">
          RuView Contactless Stream: Intensity & Pose Stability Waveform
        </h3>
      </div>
      
      <div className="w-full h-52">
        {data.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-xs text-slate-500 gap-1.5 border border-dashed border-slate-800 rounded-xl bg-slate-900/10">
            <span className="animate-ping w-2 h-2 rounded-full bg-indigo-500" />
            Waiting for live telemetry stream from RuView...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="intensityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E2856E" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#E2856E" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="stabilityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#88A2AA" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#88A2AA" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time" 
                stroke="#475569" 
                fontSize={9} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                domain={[0, 1.2]} 
                stroke="#475569" 
                fontSize={9} 
                tickLine={false} 
                axisLine={false} 
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(21, 36, 44, 0.95)', 
                  border: '1px solid rgba(226, 133, 110, 0.2)',
                  borderRadius: '12px',
                  fontSize: '10px'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="intensity" 
                name="Intensity" 
                stroke="#E2856E" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#intensityGrad)" 
              />
              <Area 
                type="monotone" 
                dataKey="stability" 
                name="Stability" 
                stroke="#88A2AA" 
                strokeWidth={1.5} 
                fillOpacity={1} 
                fill="url(#stabilityGrad)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </GlassCard>
  );
};

export default MotionGraph;
