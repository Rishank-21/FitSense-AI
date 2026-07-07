import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import { User, Activity, Info, CheckCircle } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    height: user?.height || 175,
    weight: user?.weight || 70,
    age: user?.age || 25,
    gender: user?.gender || 'male',
    fitnessGoal: user?.fitnessGoal || 'maintenance'
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const result = await updateProfile(formData);
    setSaving(false);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  // BMI Calculation: Weight(kg) / (Height(m)^2)
  const heightInMeters = formData.height / 100;
  const bmi = Number((formData.weight / (heightInMeters * heightInMeters)).toFixed(1));

  const getBMICategory = (val) => {
    if (val < 18.5) return { name: 'Underweight', color: 'text-cyan-400', marker: '15%' };
    if (val < 25.0) return { name: 'Healthy Weight', color: 'text-emerald-450', marker: '42%' };
    if (val < 30.0) return { name: 'Overweight', color: 'text-amber-400', marker: '70%' };
    return { name: 'Obese', color: 'text-rose-500 font-bold', marker: '90%' };
  };

  const bmiCat = getBMICategory(bmi);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Vitals Form Column */}
      <GlassCard className="lg:col-span-2 border-slate-850">
        <div className="flex items-center gap-3 border-b border-slate-850 pb-5 mb-6">
          <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Physical Metrics Settings</h3>
            <p className="text-[10px] text-slate-450 mt-0.5">Keep stats calibrated for accurate MET calorie formulas</p>
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5 text-xs text-emerald-350">
            <CheckCircle className="w-4.5 h-4.5" />
            <span>Vitals profile updated successfully.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Age */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-350 px-1 uppercase tracking-wider">
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
                className="w-full px-4 py-3 bg-slate-900/60 rounded-xl border border-slate-800 focus:border-indigo-500/50 focus:outline-none text-xs focus:bg-slate-900"
              />
            </div>

            {/* Gender */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-350 px-1 uppercase tracking-wider">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-900/60 rounded-xl border border-slate-800 focus:border-indigo-500/50 focus:outline-none text-xs focus:bg-slate-900 text-slate-300"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Height */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-350 px-1 uppercase tracking-wider">
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
                className="w-full px-4 py-3 bg-slate-900/60 rounded-xl border border-slate-800 focus:border-indigo-500/50 focus:outline-none text-xs focus:bg-slate-900"
              />
            </div>

            {/* Weight */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-350 px-1 uppercase tracking-wider">
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
                className="w-full px-4 py-3 bg-slate-900/60 rounded-xl border border-slate-800 focus:border-indigo-500/50 focus:outline-none text-xs focus:bg-slate-900"
              />
            </div>

            {/* Goal */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-350 px-1 uppercase tracking-wider">
                Fitness Focus Goal
              </label>
              <select
                name="fitnessGoal"
                value={formData.fitnessGoal}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-900/60 rounded-xl border border-slate-800 focus:border-indigo-500/50 focus:outline-none text-xs focus:bg-slate-900 text-slate-300"
              >
                <option value="weight-loss">Weight Loss</option>
                <option value="muscle-gain">Muscle Gain</option>
                <option value="endurance">Endurance Training</option>
                <option value="flexibility">Flexibility & Yoga</option>
                <option value="maintenance">Body Maintenance</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-dark-950 font-bold py-3.5 rounded-xl transition-all duration-200 cursor-pointer text-xs"
          >
            {saving ? (
              <span className="w-5 h-5 border-2 border-dark-950 border-t-transparent rounded-full animate-spin inline-block" />
            ) : (
              'Save Calibration Profile'
            )}
          </button>
        </form>
      </GlassCard>

      {/* BMI Calculator Panel */}
      <GlassCard className="border-indigo-500/10 flex flex-col justify-between h-fit gap-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h4 className="text-sm font-bold text-slate-200">Body Mass Index (BMI)</h4>
          </div>

          <div className="text-center py-6 bg-slate-900/40 border border-slate-850 rounded-2xl">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Computed BMI</span>
            <p className="text-5xl font-black text-cyan-400 glow-text-cyan mt-1">{bmi}</p>
            <p className={`text-xs font-bold mt-2.5 ${bmiCat.color}`}>{bmiCat.name}</p>
          </div>

          {/* Visual BMI Scale Slider */}
          <div className="mt-8">
            <div className="relative w-full h-2 rounded-full bg-gradient-to-r from-cyan-450 via-emerald-500 to-rose-500 border border-slate-800">
              {/* Marker pin */}
              <div 
                className="absolute -top-1.5 w-5 h-5 bg-slate-100 rounded-full border-4 border-indigo-600 shadow-md shadow-indigo-600/50 -translate-x-1/2 transition-all duration-500"
                style={{ left: bmiCat.marker }}
              />
            </div>
            <div className="flex justify-between text-[8px] text-slate-400 font-semibold uppercase mt-3">
              <span>Under (&lt;18.5)</span>
              <span>Healthy (18.5-25)</span>
              <span>Over (&gt;25)</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2.5 items-start bg-slate-900/30 p-3 rounded-lg border border-slate-850 text-[10px] text-slate-450 leading-relaxed">
          <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>
            A healthy BMI ranges between **18.5 and 24.9**. Keep regular active workout sessions to stabilize metabolic rate.
          </span>
        </div>
      </GlassCard>

    </div>
  );
};

export default Profile;
