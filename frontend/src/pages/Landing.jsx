import React from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, Activity, ShieldAlert, Sparkles, Brain, Heart, EyeOff, BarChart2 } from 'lucide-react';

const Landing = () => {
  return (
    <div className="w-screen min-h-screen bg-dark-950 text-slate-100 flex flex-col relative overflow-x-hidden selection:bg-primary-500/30">
      
      {/* Decorative background glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-primary-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-accent-cyan/5 blur-[150px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between px-6 py-6 z-20 sticky top-0 bg-dark-950/80 backdrop-blur-md border-b border-slate-800/30">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-primary-500 to-accent-cyan p-2.5 rounded-xl shadow-lg shadow-primary-500/20">
            <Dumbbell className="w-5 h-5 text-dark-950" />
          </div>
          <div>
            <h1 className="text-lg font-black bg-gradient-to-r from-slate-100 to-accent-cyan bg-clip-text text-transparent tracking-wide">
              FitSense AI
            </h1>
            <span className="text-[9px] text-primary-400 font-bold tracking-widest uppercase block">
              Contactless Coach
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            to="/login" 
            className="text-xs font-semibold text-slate-350 hover:text-slate-100 transition-colors"
          >
            Sign In
          </Link>
          <Link 
            to="/register" 
            className="bg-gradient-to-r from-primary-500 to-primary-600 text-dark-950 font-bold px-4.5 py-2 rounded-xl text-xs shadow-lg shadow-primary-500/10 hover:shadow-primary-500/25 transition-all hover:scale-105 active:scale-95"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10">
        <div className="flex flex-col gap-6 text-center lg:text-left">
          <div className="inline-flex self-center lg:self-start items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-[10px] font-bold text-primary-400 uppercase tracking-widest animate-pulse">
            <Sparkles className="w-3.5 h-3.5" /> Next-Gen Contactless Sensing
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-slate-100 tracking-tight">
            Smart Fitness Coaching. <br />
            <span className="bg-gradient-to-r from-primary-500 via-primary-400 to-accent-cyan bg-clip-text text-transparent">
              Uniquely Contactless.
            </span>
          </h2>
          
          <p className="text-sm md:text-base text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
            No cameras. No wearable gadgets. FitSense AI harnesses radar sensing models (RuView) to track your pose coordinates, analyze breathing rhythms, and supply elite training plans in total privacy.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-4">
            <Link 
              to="/register" 
              className="bg-gradient-to-r from-primary-500 to-primary-600 text-dark-950 font-black px-8 py-3.5 rounded-xl text-sm shadow-xl shadow-primary-500/20 hover:scale-105 transition-transform text-center cursor-pointer"
            >
              Start Free Assessment
            </Link>
            <Link 
              to="/login" 
              className="bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-slate-300 px-8 py-3.5 rounded-xl text-sm font-semibold hover:border-primary-500/20 transition-all text-center cursor-pointer"
            >
              Access Dashboard
            </Link>
          </div>
        </div>

        {/* Hero Graphic Mockup */}
        <div className="w-full flex items-center justify-center relative">
          <div className="w-full max-w-md glass-panel rounded-3xl p-6 border-primary-500/15 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full blur-2xl" />
            
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-accent-rose animate-ping" />
                <span className="text-[10px] text-slate-450 uppercase font-mono tracking-widest">RuView Radar Stream</span>
              </div>
              <span className="text-[10px] text-accent-cyan bg-accent-cyan/10 border border-accent-cyan/20 px-2 py-0.5 rounded font-bold uppercase">Active</span>
            </div>

            {/* Waveform graphic */}
            <div className="h-32 w-full flex items-end gap-1.5 mb-5 px-2 relative border-b border-slate-800/40 pb-2">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
                <div className="border-t border-slate-400 w-full" />
                <div className="border-t border-slate-400 w-full" />
                <div className="border-t border-slate-400 w-full" />
              </div>
              
              {/* Animated waveform bars */}
              {[40, 65, 80, 55, 30, 45, 95, 75, 40, 60, 85, 90, 50, 35, 70, 80, 45, 60, 95, 75, 30, 50, 85, 60].map((h, i) => (
                <div 
                  key={i} 
                  style={{ height: `${h}%`, animationDelay: `${i * 80}ms` }}
                  className="flex-1 bg-gradient-to-t from-primary-500/80 to-accent-cyan/90 rounded-sm animate-pulse"
                />
              ))}
            </div>

            {/* Grid Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-850">
                <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold block">Heart Rhythm</span>
                <span className="text-xl font-black text-accent-rose glow-text-rose mt-1 block">74 <span className="text-[10px] text-slate-450 font-normal">BPM</span></span>
              </div>
              <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-850">
                <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold block">Respiration</span>
                <span className="text-xl font-black text-accent-cyan glow-text-cyan mt-1 block">16 <span className="text-[10px] text-slate-450 font-normal">BR</span></span>
              </div>
              <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-850 col-span-2 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold block">Exercise Detection</span>
                  <span className="text-xs font-bold text-slate-200 mt-0.5 block capitalize">Active Squats (8/20 reps)</span>
                </div>
                <Dumbbell className="w-5 h-5 text-primary-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="w-full max-w-7xl mx-auto px-6 py-16 md:py-24 z-10 border-t border-slate-800/40">
        <div className="text-center mb-16 flex flex-col gap-3">
          <span className="text-xs font-bold text-primary-400 uppercase tracking-widest font-mono">Platform Features</span>
          <h3 className="text-3xl md:text-4xl font-bold text-slate-100">
            Engineered for Privacy. Calibrated for Results.
          </h3>
          <p className="text-xs text-slate-450 max-w-xl mx-auto leading-relaxed">
            FitSense AI is built from the ground up to provide advanced tracking without the friction of wearable sensors or camera security risks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Card 1 */}
          <div className="glass-panel p-6 rounded-2xl border-slate-800/60 flex flex-col gap-4">
            <div className="p-3 bg-primary-500/10 rounded-xl text-primary-400 w-fit">
              <EyeOff className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-200">100% Camera Privacy</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              We never use a camera feed. Your body pose is translated dynamically using radar signals, securing your home workouts against data leaks.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel p-6 rounded-2xl border-slate-800/60 flex flex-col gap-4">
            <div className="p-3 bg-accent-cyan/10 rounded-xl text-accent-cyan w-fit">
              <Heart className="w-6 h-6 animate-pulse" />
            </div>
            <h4 className="text-sm font-bold text-slate-200">Vital Signs Mapping</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Track heart rate fluctuations and deep breathing zones directly through the radar's high-frequency signal processing.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel p-6 rounded-2xl border-slate-800/60 flex flex-col gap-4">
            <div className="p-3 bg-accent-emerald/10 rounded-xl text-accent-emerald w-fit">
              <Brain className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-200">Gemini AI Coaching</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Query the AI coach on posture guidelines, generate customized weekly calorie charts, and receive instant recovery summaries.
            </p>
          </div>

          {/* Card 4 */}
          <div className="glass-panel p-6 rounded-2xl border-slate-800/60 flex flex-col gap-4">
            <div className="p-3 bg-accent-rose/10 rounded-xl text-accent-rose w-fit">
              <BarChart2 className="w-6 h-6 animate-bounce" />
            </div>
            <h4 className="text-sm font-bold text-slate-200">Session Aggregations</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Log duration, calculate accurate MET calories based on body vitals, and view performance curves on clean Recharts graphs.
            </p>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="w-full bg-slate-950/80 border-t border-slate-850/60 py-8 px-6 mt-auto z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Dumbbell className="w-5 h-5 text-primary-400" />
            <span className="text-xs font-semibold text-slate-450">&copy; {new Date().getFullYear()} FitSense AI. All rights reserved.</span>
          </div>
          <div className="flex gap-6 text-xs text-slate-400">
            <a href="#privacy" className="hover:text-slate-100 transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-slate-100 transition-colors">Terms of Service</a>
            <a href="#sensor" className="hover:text-slate-100 transition-colors">RuView Sensing Specs</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
