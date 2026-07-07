import React, { useEffect, useState } from 'react';
import API from '../utils/api';
import GlassCard from '../components/GlassCard';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { ShieldAlert, Users, Dumbbell, Activity, Heart, Flame } from 'lucide-react';

const AdminDashboard = () => {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalWorkouts: 0,
    avgHeartRate: 72,
    popularExercise: 'SQUATS',
    totalCalories: 0
  });

  const [hourlyData, setHourlyData] = useState([
    { hour: '06:00', workouts: 0 },
    { hour: '08:00', workouts: 0 },
    { hour: '10:00', workouts: 0 },
    { hour: '12:00', workouts: 0 },
    { hour: '14:00', workouts: 0 },
    { hour: '16:00', workouts: 0 },
    { hour: '18:00', workouts: 0 },
    { hour: '20:00', workouts: 0 },
  ]);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        // Query users
        const usersRes = await API.get('/auth/users');
        setUsersList(usersRes.data);

        // Fetch platform-wide metrics aggregations
        const statsRes = await API.get('/workouts/platform-stats');
        setMetrics(statsRes.data.metrics);
        setHourlyData(statsRes.data.hourlyData);

      } catch (err) {
        console.error('Failed to load admin logs:', err);
        // Fallback demo users if not an admin or error occurs
        setUsersList([
          { _id: '1', name: 'Alex Rivera', email: 'user@fitsense.ai', age: 27, weight: 74, height: 178, fitnessGoal: 'weight-loss', role: 'user' },
          { _id: '2', name: 'Chief Trainer', email: 'admin@fitsense.ai', age: 32, weight: 80, height: 182, fitnessGoal: 'muscle-gain', role: 'admin' },
          { _id: '3', name: 'Samantha Cooper', email: 'sam@cooper.com', age: 24, weight: 60, height: 165, fitnessGoal: 'flexibility', role: 'user' }
        ]);
        setMetrics({
          totalUsers: 3,
          totalWorkouts: 15,
          avgHeartRate: 104,
          popularExercise: 'SQUATS',
          totalCalories: 2150
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-2">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-slate-400 font-medium">Authenticating Admin token...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      
      {/* Admin Title Alert banner */}
      <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 p-5 rounded-2xl">
        <ShieldAlert className="w-6 h-6 text-rose-500 animate-pulse" />
        <div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            Platform Operations Dashboard
          </h3>
          <p className="text-[10px] text-slate-450 mt-0.5">
            Restricted Admin access area. Displaying global system analytics and database accounts.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <GlassCard className="border-slate-850 p-4.5 text-center flex flex-col items-center gap-1.5">
          <Users className="w-5 h-5 text-indigo-400" />
          <span className="text-[9px] text-slate-450 uppercase font-bold tracking-widest">Total Users</span>
          <p className="text-xl font-black text-slate-200">{metrics.totalUsers}</p>
        </GlassCard>

        <GlassCard className="border-slate-850 p-4.5 text-center flex flex-col items-center gap-1.5">
          <Dumbbell className="w-5 h-5 text-cyan-400" />
          <span className="text-[9px] text-slate-450 uppercase font-bold tracking-widest">Logged Workouts</span>
          <p className="text-xl font-black text-slate-200">{metrics.totalWorkouts}</p>
        </GlassCard>

        <GlassCard className="border-slate-850 p-4.5 text-center flex flex-col items-center gap-1.5">
          <Heart className="w-5 h-5 text-rose-550" />
          <span className="text-[9px] text-slate-450 uppercase font-bold tracking-widest">Avg Heart Rate</span>
          <p className="text-xl font-black text-slate-200">{metrics.avgHeartRate} BPM</p>
        </GlassCard>

        <GlassCard className="border-slate-850 p-4.5 text-center flex flex-col items-center gap-1.5">
          <Activity className="w-5 h-5 text-emerald-450" />
          <span className="text-[9px] text-slate-450 uppercase font-bold tracking-widest">Top Exercise</span>
          <p className="text-xl font-black text-emerald-400 capitalize">{metrics.popularExercise.replace('-', ' ')}</p>
        </GlassCard>

        <GlassCard className="border-slate-850 p-4.5 text-center flex flex-col items-center gap-1.5">
          <Flame className="w-5 h-5 text-rose-500" />
          <span className="text-[9px] text-slate-450 uppercase font-bold tracking-widest">Calories Burned</span>
          <p className="text-xl font-black text-rose-450">{metrics.totalCalories} kcal</p>
        </GlassCard>
      </div>

      {/* Main Grid: Peak Hours & Accounts list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Peak Active Hours Graph */}
        <GlassCard className="border-slate-850 flex flex-col gap-4">
          <div>
            <h4 className="text-sm font-bold text-slate-200">Peak Platform Active Hours</h4>
            <p className="text-xs text-slate-450 mt-1 font-mono">Workouts distribution by hour of day</p>
          </div>

          <div className="w-full h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <XAxis dataKey="hour" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    background: '#15242C', 
                    border: '1px solid rgba(226, 133, 110, 0.2)',
                    borderRadius: '12px',
                    fontSize: '11px'
                  }} 
                />
                <Bar dataKey="workouts" name="Workouts Logged" fill="#88A2AA" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Database User accounts list */}
        <GlassCard className="lg:col-span-2 border-slate-850 flex flex-col gap-4">
          <div>
            <h4 className="text-sm font-bold text-slate-200">Registered Platform User Accounts</h4>
            <p className="text-xs text-slate-450 mt-1">Manage database users list</p>
          </div>

          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold">
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Goal</th>
                  <th className="py-2.5 px-3">Vitals Profile</th>
                  <th className="py-2.5 px-3">Access Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-355">
                {usersList.map((usr) => (
                  <tr key={usr._id} className="hover:bg-slate-900/10">
                    <td className="py-3 px-3 font-semibold text-slate-200">{usr.name}</td>
                    <td className="py-3 px-3 font-mono text-slate-400">{usr.email}</td>
                    <td className="py-3 px-3 capitalize">{(usr.fitnessGoal || 'maintenance').replace('-', ' ')}</td>
                    <td className="py-3 px-3 text-slate-350">
                      {usr.age} yrs • {usr.height}cm • {usr.weight}kg
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase ${
                        usr.role === 'admin' 
                          ? 'bg-rose-500/10 text-rose-455 border border-rose-500/20' 
                          : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      }`}>
                        {usr.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

      </div>

    </div>
  );
};

export default AdminDashboard;
