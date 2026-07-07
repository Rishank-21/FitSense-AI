import React, { useEffect, useState } from 'react';
import API from '../utils/api';
import GlassCard from '../components/GlassCard';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { LineChart as LineIcon, Activity, Flame, Clock, Award, History } from 'lucide-react';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [workoutsList, setWorkoutsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const historyRes = await API.get('/workouts/history');
        setData(historyRes.data);

        const listRes = await API.get('/workouts');
        setWorkoutsList(listRes.data);
      } catch (err) {
        console.error('Failed to load analytics records:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-2">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-slate-400 font-medium">Processing biometric history...</span>
      </div>
    );
  }

  const summary = data?.summary || { totalWorkouts: 0, totalCalories: 0, totalDurationMinutes: 0, totalReps: 0, avgHeartRate: 72, avgBreathingRate: 16 };
  const recentActivity = data?.recentActivity || [];
  const exerciseBreakdown = data?.exerciseBreakdown || [];

  return (
    <div className="flex flex-col gap-8">
      
      {/* Metrics Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="border-slate-850 py-4 px-5">
          <div className="flex justify-between items-center text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Workouts logged</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-slate-200 mt-2">{summary.totalWorkouts} sessions</p>
        </GlassCard>

        <GlassCard className="border-slate-850 py-4 px-5">
          <div className="flex justify-between items-center text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Aggregate Energy</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-400 mt-2">{summary.totalCalories} kcal</p>
        </GlassCard>

        <GlassCard className="border-slate-850 py-4 px-5">
          <div className="flex justify-between items-center text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Active Duration</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-cyan-300 mt-2">{summary.totalDurationMinutes} minutes</p>
        </GlassCard>

        <GlassCard className="border-slate-850 py-4 px-5">
          <div className="flex justify-between items-center text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Repetitions completed</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2">{summary.totalReps} cycles</p>
        </GlassCard>
      </div>

      {/* Historical Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Calorie burn curve over time */}
        <GlassCard className="border-slate-850">
          <h4 className="text-sm font-bold text-slate-200 mb-6 flex items-center gap-2">
            <LineIcon className="w-4.5 h-4.5 text-rose-500" />
            Calorie Output Trend
          </h4>
          <div className="w-full h-64">
            {recentActivity.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                Log a workout to populate trending curves
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={recentActivity} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={9} />
                  <YAxis stroke="#64748b" fontSize={9} />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#15242C', 
                      border: '1px solid rgba(226, 133, 110, 0.2)',
                      borderRadius: '12px',
                      fontSize: '11px'
                    }} 
                  />
                  <Line type="monotone" dataKey="calories" stroke="#F42C04" strokeWidth={3} dot={{ fill: '#F42C04' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </GlassCard>

        {/* Exercise distribution Radar chart */}
        <GlassCard className="border-slate-850">
          <h4 className="text-sm font-bold text-slate-200 mb-6 flex items-center gap-2">
            <Activity className="w-4.5 h-4.5 text-cyan-400" />
            Exercise Distribution Matrix
          </h4>
          <div className="w-full h-64 flex items-center justify-center">
            {exerciseBreakdown.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                Awaiting multiple exercise logs
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={exerciseBreakdown}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis dataKey="name" stroke="#64748b" fontSize={9} />
                  <PolarRadiusAxis stroke="#64748b" fontSize={8} />
                  <Radar name="Workout Type Count" dataKey="count" stroke="#E2856E" fill="#E2856E" fillOpacity={0.3} />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#15242C', 
                      border: '1px solid rgba(226, 133, 110, 0.2)',
                      borderRadius: '12px',
                      fontSize: '11px'
                    }} 
                  />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        </GlassCard>

      </div>

      {/* History log listing */}
      <GlassCard className="border-slate-850">
        <h4 className="text-sm font-bold text-slate-200 mb-6 flex items-center gap-2">
          <History className="w-4.5 h-4.5 text-indigo-400" />
          Complete Workout History Log
        </h4>

        <div className="overflow-x-auto">
          {workoutsList.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No workout history logged in MongoDB database.</p>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 text-slate-400 font-bold">
                  <th className="py-3 px-4">Date/Time</th>
                  <th className="py-3 px-4">Workout</th>
                  <th className="py-3 px-4">Repetitions</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Energy Burned</th>
                  <th className="py-3 px-4">Heart Rate (Avg/Peak)</th>
                  <th className="py-3 px-4">Sensing status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-350">
                {workoutsList.map((w, index) => (
                  <tr key={index} className="hover:bg-slate-900/10 transition-colors">
                    <td className="py-3 px-4">
                      {new Date(w.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-200 capitalize">{w.exercise}</td>
                    <td className="py-3 px-4">
                      {w.reps} <span className="text-slate-500">/ {w.goalReps}</span>
                    </td>
                    <td className="py-3 px-4">{Math.round(w.duration / 60)} min</td>
                    <td className="py-3 px-4 text-rose-450 font-bold">{w.calories} kcal</td>
                    <td className="py-3 px-4">
                      {w.avgHeartRate} BPM <span className="text-slate-500">/ {w.peakHeartRate || w.avgHeartRate}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        w.status === 'completed' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {w.status || 'completed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </GlassCard>

    </div>
  );
};

export default Analytics;
