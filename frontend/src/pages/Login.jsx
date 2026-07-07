import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, Mail, Lock, ArrowRight, ShieldAlert } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, setError } = useAuth();
  const [localLoading, setLocalLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalLoading(true);
    const result = await login(email, password);
    setLocalLoading(false);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="w-screen min-h-screen flex items-center justify-center relative p-6 bg-dark-950 overflow-hidden">
      {/* Decorative Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="w-full max-w-md glass-panel rounded-3xl p-8 z-10 border border-indigo-500/10 shadow-2xl relative">
        {/* Brand Banner */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="bg-gradient-to-tr from-indigo-500 to-cyan-400 p-3 rounded-2xl shadow-xl shadow-indigo-500/20">
            <Dumbbell className="w-8 h-8 text-dark-950" />
          </div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-indigo-100 to-cyan-300 bg-clip-text text-transparent">
            FitSense AI
          </h2>
          <p className="text-xs text-slate-400 text-center font-medium">
            Contactless sensing personal training coach
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-350">
            <ShieldAlert className="w-4.5 h-4.5 text-rose-450 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-350 px-1 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4.5 w-5 h-5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@fitsense.ai"
                className="w-full pl-12 pr-4 py-3.5 bg-slate-900/60 rounded-xl border border-slate-800/80 focus:border-indigo-500/50 focus:outline-none text-sm transition-all placeholder:text-slate-600 focus:bg-slate-900"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-350 px-1 uppercase tracking-wider">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-4.5 w-5 h-5 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3.5 bg-slate-900/60 rounded-xl border border-slate-800/80 focus:border-indigo-500/50 focus:outline-none text-sm transition-all placeholder:text-slate-600 focus:bg-slate-900"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={localLoading}
            className="w-full mt-2 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-dark-950 font-bold py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 group cursor-pointer hover:shadow-indigo-500/35"
          >
            {localLoading ? (
              <span className="w-5 h-5 border-2 border-dark-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to Coach</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        {/* Register redirection */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
