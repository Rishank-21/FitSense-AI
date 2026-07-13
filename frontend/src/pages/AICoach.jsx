import React, { useState } from 'react';
import API from '../utils/api';
import GlassCard from '../components/GlassCard';
import { useAuth } from '../context/AuthContext';
import { 
  BrainCircuit, 
  Send, 
  Sparkles, 
  Calendar, 
  Activity,
  Bot,
  User
} from 'lucide-react';

const AI_SUGGESTIONS = [
  "Create a custom workout for a busy day",
  "How can I improve my push-up range of motion?",
  "What is the best MET warm-up sequence?",
  "Recommend a post-cardio recovery snack list"
];

const AICoach = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello ${user?.name}! I am your FitSense AI personal trainer. 

How can I help you reach your **${(user?.fitnessGoal || 'maintenance').replace('-', ' ')}** goals today?

You can write a custom question or click **Generate Custom Training Plan** above to formulate your weekly schedule!`
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [planLoading, setPlanLoading] = useState(false);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    // Add user message
    const updatedMessages = [...messages, { sender: 'user', text }];
    setMessages(updatedMessages);
    setInputText('');
    setLoading(true);

    try {
      const res = await API.post('/ai/posture', {
        exercise: user?.fitnessGoal || 'general fitness',
        poseHistory: [text]
      });

      setMessages([...updatedMessages, { sender: 'ai', text: res.data.advice }]);
    } catch (err) {
      console.error('Failed to query AI Coach:', err);
      setMessages([...updatedMessages, { 
        sender: 'ai', 
        text: '❌ Coach offline. Check your Gemini API connection. Fallback mock generated below:\n\nMaintain neutral spine, expand chest and synchronize breaths on exertion phases.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    setPlanLoading(true);
    try {
      const res = await API.post('/ai/recommend');
      setMessages(prev => [
        ...prev, 
        { sender: 'user', text: 'Generate my weekly training plan schedule' },
        { sender: 'ai', text: res.data.plan }
      ]);
    } catch (err) {
      console.error('Failed to generate weekly plan:', err);
      setMessages(prev => [
        ...prev,
        { sender: 'user', text: 'Generate my weekly training plan schedule' },
        { sender: 'ai', text: '❌ Failed to generate custom weekly plan. Ensure database seeding and configuration variables are set.' }
      ]);
    } finally {
      setPlanLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Settings / Controls Column */}
      <div className="flex flex-col gap-6">
        <GlassCard className="border-indigo-500/25 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-full blur-xl" />
          
          <div className="flex items-center gap-3">
            <BrainCircuit className="w-6 h-6 text-indigo-400" />
            <div>
              <h3 className="text-base font-bold text-slate-100">AI Coach Console</h3>
              <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Gemini Cognitive Engine</p>
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-4 leading-relaxed">
            Your trainer understands your goals, weight, height, and age to customize routines and advice.
          </p>

          <div className="mt-6 flex flex-col gap-3.5">
            <button
              onClick={handleGeneratePlan}
              disabled={planLoading}
              className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-dark-950 font-bold py-3 px-4 rounded-xl text-xs hover:shadow-lg hover:shadow-indigo-500/10 cursor-pointer flex items-center justify-center gap-2 group transition-all"
            >
              {planLoading ? (
                <span className="w-4 h-4 border-2 border-dark-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Calendar className="w-4 h-4 text-dark-950" />
                  <span>Generate Weekly Training Plan</span>
                </>
              )}
            </button>
          </div>
        </GlassCard>

        {/* Quick Suggestion Prompts */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">
            Quick Inquiries
          </h4>
          <div className="flex flex-col gap-2">
            {AI_SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(s)}
                className="w-full text-left py-2.5 px-4 bg-slate-900/40 hover:bg-slate-900 border border-slate-850 hover:border-indigo-500/20 text-xs font-medium text-slate-350 hover:text-slate-200 rounded-xl transition-all cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Console Column */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        
        {/* Chat log body */}
        <GlassCard className="flex-1 flex flex-col justify-between h-[520px] border-slate-850 p-5">
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4">
            {messages.map((m, idx) => (
              <div 
                key={idx} 
                className={`flex gap-3 max-w-[85%] ${
                  m.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'
                }`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
                  m.sender === 'user' 
                    ? 'bg-indigo-500 text-dark-950' 
                    : 'bg-slate-900 text-cyan-400 border border-slate-800'
                }`}>
                  {m.sender === 'user' ? <User className="w-4.5 h-4.5" /> : <Bot className="w-4.5 h-4.5" />}
                </div>

                {/* Message Bubble */}
                <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-indigo-500/10 text-indigo-105 border border-indigo-500/20 rounded-tr-none'
                    : 'bg-slate-900/60 text-slate-300 border border-slate-850 rounded-tl-none'
                }`}>
                  <div className="markdown-content space-y-1.5">
                    {m.text.split('\n').map((line, lineIdx) => {
                      if (line.startsWith('###')) {
                        return <h5 key={lineIdx} className="font-bold text-slate-200 mt-2 text-xs">{line.replace('###', '')}</h5>;
                      } else if (line.startsWith('####')) {
                        return <h5 key={lineIdx} className="font-semibold text-slate-350 text-[11px] mt-1.5">{line.replace('####', '')}</h5>;
                      } else if (line.startsWith('*') || line.startsWith('-')) {
                        return <li key={lineIdx} className="ml-2.5 list-disc mt-0.5">{line.substring(1).trim()}</li>;
                      } else if (line.startsWith('|')) {
                        // Render standard layout for plan calendars
                        return <p key={lineIdx} className="font-mono text-[10px] text-slate-400 mt-0.5">{line}</p>;
                      }
                      return <p key={lineIdx}>{line}</p>;
                    })}
                  </div>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-3 self-start max-w-[85%] items-center">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-cyan-400 border border-slate-800 flex items-center justify-center">
                  <Bot className="w-4.5 h-4.5 animate-pulse" />
                </div>
                <div className="bg-slate-900/40 p-4 rounded-2xl rounded-tl-none border border-slate-850 text-xs flex gap-1.5 text-slate-450 items-center">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="ml-2">Coach is thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Form input console */}
          <div className="mt-5 border-t border-slate-850/80 pt-4 flex gap-3 items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask anything about posture, diets, or exercises..."
              className="flex-1 bg-slate-900/60 px-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500/50 text-xs text-slate-200 focus:bg-slate-900 placeholder:text-slate-500"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={loading || !inputText.trim()}
              className="p-3 bg-gradient-to-tr from-indigo-500 to-cyan-550 hover:from-indigo-600 hover:to-cyan-600 rounded-xl text-dark-950 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-4 h-4 text-dark-950" />
            </button>
          </div>
        </GlassCard>

      </div>
    </div>
  );
};

export default AICoach;
