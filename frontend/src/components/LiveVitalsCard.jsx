import React from 'react';
import GlassCard from './GlassCard';
import { Heart, Wind, ShieldAlert } from 'lucide-react';
import { Activity as ActivityIcon } from 'lucide-react';

const LiveVitalsCard = ({ heartRate = 72, breathingRate = 16, poseStability = 1.0 }) => {
  // Speed of heartbeat animation is proportional to actual BPM
  const heartDuration = Math.max(0.4, 60 / Math.max(40, heartRate));

  // Speed of breathing animation is proportional to actual Breathing Rate
  const breathDuration = Math.max(1.5, 60 / Math.max(6, breathingRate));

  const getHeartRateZone = (bpm) => {
    if (bpm < 60) return { label: 'Resting', color: 'text-cyan-400' };
    if (bpm < 100) return { label: 'Normal', color: 'text-emerald-400' };
    if (bpm < 130) return { label: 'Fat Burn', color: 'text-indigo-400' };
    return { label: 'Peak Cardio', color: 'text-rose-500 font-bold animate-pulse' };
  };

  const getBreathingStatus = (br) => {
    if (br < 12) return { label: 'Slow & Deep', color: 'text-cyan-400' };
    if (br < 20) return { label: 'Normal', color: 'text-emerald-400' };
    return { label: 'Rapid/HIIT', color: 'text-rose-400 font-semibold' };
  };

  const hrZone = getHeartRateZone(heartRate);
  const brStatus = getBreathingStatus(breathingRate);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Heart Rate Card */}
      <GlassCard className="flex items-center justify-between border-rose-500/10 hover:border-rose-500/30 transition-all duration-300">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
            Heart Rate
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold glow-text-rose text-rose-500">
              {heartRate}
            </span>
            <span className="text-xs text-slate-350">BPM</span>
          </div>
          <span className={`text-xs mt-1 ${hrZone.color}`}>
            • {hrZone.label}
          </span>
        </div>
        <div className="relative p-4 rounded-full bg-rose-500/10">
          <Heart
            className="w-10 h-10 text-rose-500"
            style={{
              animation: `heart-pulse ${heartDuration}s infinite ease-in-out`
            }}
          />
        </div>
      </GlassCard>

      {/* Breathing Rate Card */}
      <GlassCard className="flex items-center justify-between border-cyan-500/10 hover:border-cyan-500/30 transition-all duration-300">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
            Breathing Rate
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold glow-text-cyan text-cyan-400">
              {breathingRate}
            </span>
            <span className="text-xs text-slate-350">BPM</span>
          </div>
          <span className={`text-xs mt-1 ${brStatus.color}`}>
            • {brStatus.label}
          </span>
        </div>
        <div className="relative p-4 rounded-full bg-cyan-500/10 overflow-hidden flex items-center justify-center">
          <Wind
            className="w-10 h-10 text-cyan-400"
            style={{
              animation: `breath-wave ${breathDuration}s infinite ease-in-out`
            }}
          />
        </div>
      </GlassCard>

      {/* Contactless Signal Stability Card */}
      <GlassCard className="flex items-center justify-between border-emerald-500/10 hover:border-emerald-500/30 transition-all duration-300">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
            Sensing Confidence
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold glow-text-emerald text-emerald-400">
              {Math.round(poseStability * 100)}%
            </span>
          </div>
          <span className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            {poseStability > 0.85 ? (
              <span className="text-emerald-400">• Signal Optimal</span>
            ) : poseStability > 0.70 ? (
              <span className="text-amber-400">• Signal Wobbling</span>
            ) : (
              <span className="text-rose-400 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> High Noise
              </span>
            )}
          </span>
        </div>
        <div className="p-4 rounded-full bg-emerald-500/10">
          <ActivityIcon
            className={`w-10 h-10 text-emerald-400 ${poseStability < 0.70 ? 'animate-bounce' : 'animate-pulse'}`}
          />
        </div>
      </GlassCard>
    </div>
  );
};

// Dummy element import


export default LiveVitalsCard;
