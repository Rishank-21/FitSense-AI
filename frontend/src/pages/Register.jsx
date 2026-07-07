import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import { Dumbbell, ShieldAlert } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    height: 175,
    weight: 70,
    age: 25,
    gender: 'male',
    fitnessGoal: 'maintenance',
    role: 'user'
  });

  const [adminExists, setAdminExists] = useState(true);
  const { register, error, setError } = useAuth();
  const [localLoading, setLocalLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const res = await API.get('/auth/admin-check');
        setAdminExists(res.data.adminExists);
      } catch (err) {
        console.error('Failed to verify admin status:', err);
      }
    };
    checkAdminStatus();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalLoading(true);
    // If admin already exists, force role to user just in case
    const submissionData = {
      ...formData,
      role: adminExists ? 'user' : formData.role
    };
    const result = await register(submissionData);
    setLocalLoading(false);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="w-screen min-h-screen flex items-center justify-center p-6 bg-dark-950 overflow-y-auto relative">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="w-full max-w-lg glass-panel rounded-3xl p-8 z-10 border border-indigo-500/10 shadow-2xl relative my-10">
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="bg-gradient-to-tr from-indigo-500 to-cyan-400 p-2.5 rounded-xl shadow-lg">
            <Dumbbell className="w-6 h-6 text-dark-950" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-100 to-cyan-300 bg-clip-text text-transparent">
            Create FitSense Account
          </h2>
          <p className="text-xs text-slate-400">
            Set up your vitals profile for contactless analytics
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-350">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider px-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Alex Rivera"
                className="w-full px-4 py-2.5 bg-slate-900/60 rounded-xl border border-slate-800 focus:border-indigo-500/50 focus:outline-none text-xs focus:bg-slate-900"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider px-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="alex@fitsense.ai"
                className="w-full px-4 py-2.5 bg-slate-900/60 rounded-xl border border-slate-800 focus:border-indigo-500/50 focus:outline-none text-xs focus:bg-slate-900"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider px-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-slate-900/60 rounded-xl border border-slate-800 focus:border-indigo-500/50 focus:outline-none text-xs focus:bg-slate-900"
              />
            </div>

            {/* Age */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider px-1">
                Age
              </label>
              <input
                type="number"
                name="age"
                required
                min="10"
                max="100"
                value={formData.age}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-900/60 rounded-xl border border-slate-800 focus:border-indigo-500/50 focus:outline-none text-xs focus:bg-slate-900"
              />
            </div>

            {/* Gender */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider px-1">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-900/60 rounded-xl border border-slate-800 focus:border-indigo-500/50 focus:outline-none text-xs focus:bg-slate-900 text-slate-300"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Height */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider px-1">
                Height (cm)
              </label>
              <input
                type="number"
                name="height"
                required
                min="100"
                max="250"
                value={formData.height}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-900/60 rounded-xl border border-slate-800 focus:border-indigo-500/50 focus:outline-none text-xs focus:bg-slate-900"
              />
            </div>

            {/* Weight */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider px-1">
                Weight (kg)
              </label>
              <input
                type="number"
                name="weight"
                required
                min="30"
                max="250"
                value={formData.weight}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-900/60 rounded-xl border border-slate-800 focus:border-indigo-500/50 focus:outline-none text-xs focus:bg-slate-900"
              />
            </div>

            {/* Fitness Goal */}
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider px-1">
                Fitness Goal
              </label>
              <select
                name="fitnessGoal"
                value={formData.fitnessGoal}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-900/60 rounded-xl border border-slate-800 focus:border-indigo-500/50 focus:outline-none text-xs focus:bg-slate-900 text-slate-300"
              >
                <option value="weight-loss">Weight Loss</option>
                <option value="muscle-gain">Muscle Gain</option>
                <option value="endurance">Endurance Training</option>
                <option value="flexibility">Flexibility & Yoga</option>
                <option value="maintenance">Body Maintenance</option>
              </select>
            </div>

            {/* Conditional Access Role Selection */}
            {!adminExists && (
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider px-1">
                  Create Platform Role (First Administrator setup)
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-900/60 rounded-xl border border-cyan-500/35 focus:border-indigo-500/50 focus:outline-none text-xs focus:bg-slate-900 text-slate-200 font-semibold"
                >
                  <option value="user">Standard User</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={localLoading}
            className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-dark-950 font-bold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/10 cursor-pointer"
          >
            {localLoading ? (
              <span className="w-5 h-5 border-2 border-dark-950 border-t-transparent rounded-full animate-spin inline-block" />
            ) : (
              'Create Profile & Start Coaching'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
