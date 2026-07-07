import React from 'react';
import GlassCard from './GlassCard';
import { Timer, Flame, Target } from 'lucide-react';

const LiveWorkoutTimer = ({ duration = 0, reps = 0, goalReps = 40, calories = 0, exercise = '' }) => {
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const percentage = Math.min(100, Math.round((reps / Math.max(1, goalReps)) * 100));

  const isTimerExercise = ['plank', 'yoga'].includes(exercise.toLowerCase());

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Active Time */}
      <GlassCard className="flex items-center gap-4.5 border-indigo-500/10">
        <div className="p-3.5 bg-indigo-500/10 rounded-xl">
          <Timer className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
            Elapsed Time
          </span>
          <p className="text-3xl font-black font-mono tracking-wider text-indigo-300">
            {formatTime(duration)}
          </p>
        </div>
      </GlassCard>

      {/* Calories */}
      <GlassCard className="flex items-center gap-4.5 border-rose-500/10">
        <div className="p-3.5 bg-rose-500/10 rounded-xl">
          <Flame className="w-6 h-6 text-rose-450" />
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
            Energy Output
          </span>
          <p className="text-3xl font-black font-mono text-rose-400">
            {calories} <span className="text-sm font-semibold text-slate-400">kcal</span>
          </p>
        </div>
      </GlassCard>

      {/* Reps Tracker / Interval Hold */}
      <GlassCard className="flex flex-col gap-2 border-emerald-500/10">
        <div className="flex items-center gap-4.5">
          <div className="p-3.5 bg-emerald-500/10 rounded-xl">
            <Target className="w-6 h-6 text-emerald-450" />
          </div>
          <div className="flex-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
              {isTimerExercise ? 'Interval Index' : 'Reps Met'}
            </span>
            <p className="text-2xl font-extrabold text-slate-200">
              {reps} <span className="text-xs text-slate-400 font-semibold">/ {goalReps} {isTimerExercise ? 'units' : 'reps'}</span>
            </p>
          </div>
          <span className="text-lg font-black text-emerald-400">{percentage}%</span>
        </div>

        {/* Rep completion progress bar */}
        <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden mt-1 border border-slate-700/50">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </GlassCard>
    </div>
  );
};

export default LiveWorkoutTimer;
