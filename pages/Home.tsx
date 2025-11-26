import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, MessageSquare, ShieldCheck, Users, Globe, Zap } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ChatMode } from '../types';
import { APP_NAME } from '../constants';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [interests, setInterests] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const startChat = (mode: ChatMode) => {
    if (!agreedToTerms) {
        alert("Please agree to the Terms of Service to continue.");
        return;
    }
    const interestArray = interests.split(',').map(s => s.trim()).filter(Boolean);
    const queryParams = new URLSearchParams();
    queryParams.set('mode', mode);
    if (interestArray.length > 0) {
        queryParams.set('interests', interestArray.join(','));
    }
    navigate(`/chat?${queryParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-slate-900 to-slate-800 flex flex-col">
      
      {/* Navbar */}
      <header className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
                <Globe className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">{APP_NAME}</h1>
        </div>
        <div className="text-sm text-slate-400 font-medium">
            <span className="text-green-400">●</span> 24,103 online
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 max-w-4xl mx-auto w-full text-center space-y-12">
        
        {/* Hero */}
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-10 duration-700">
            <h2 className="text-5xl md:text-7xl font-black tracking-tight text-white drop-shadow-2xl">
                Meet <span className="text-primary">New</span> People.
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Connect instantly with strangers from around the world. Secure, fast, and moderated for your safety.
            </p>
        </div>

        {/* Action Card */}
        <div className="bg-surface/50 backdrop-blur-xl border border-slate-700 p-8 rounded-3xl shadow-2xl w-full max-w-md mx-auto space-y-8 animate-in zoom-in duration-500 delay-150">
            
            {/* Interests Input */}
            <div className="space-y-2 text-left">
                <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Your Interests (Optional)</label>
                <Input 
                    placeholder="e.g. Anime, Coding, Music..." 
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    className="bg-black/20 border-slate-600 focus:border-primary"
                />
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-4">
                <button 
                    onClick={() => startChat(ChatMode.TEXT)}
                    className="group relative flex flex-col items-center justify-center p-6 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 rounded-2xl transition-all hover:-translate-y-1"
                >
                    <MessageSquare className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-lg">Text Chat</span>
                </button>

                <button 
                    onClick={() => startChat(ChatMode.VIDEO)}
                    className="group relative flex flex-col items-center justify-center p-6 bg-gradient-to-br from-primary to-indigo-700 hover:to-indigo-600 rounded-2xl shadow-lg shadow-primary/25 transition-all hover:-translate-y-1"
                >
                    <Video className="w-8 h-8 text-white mb-3 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-lg text-white">Video Chat</span>
                </button>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 text-left p-3 bg-black/20 rounded-xl border border-slate-700/50">
                <input 
                    type="checkbox" 
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-slate-600 text-primary focus:ring-primary bg-slate-800"
                />
                <label htmlFor="terms" className="text-xs text-slate-400 leading-snug cursor-pointer select-none">
                    I verify I am 18+ and agree to the Terms of Service. I understand nudity and abusive behavior are not tolerated.
                </label>
            </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-3xl pt-8 border-t border-slate-800">
            <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-slate-800 rounded-full">
                    <ShieldCheck className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="font-bold text-slate-200">AI Moderated</h3>
                <p className="text-sm text-slate-500">Real-time protection against harmful content.</p>
            </div>
            <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-slate-800 rounded-full">
                    <Zap className="w-6 h-6 text-yellow-400" />
                </div>
                <h3 className="font-bold text-slate-200">Fast Matching</h3>
                <p className="text-sm text-slate-500">Connect in seconds with our optimized queue.</p>
            </div>
            <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-slate-800 rounded-full">
                    <Users className="w-6 h-6 text-pink-400" />
                </div>
                <h3 className="font-bold text-slate-200">Anonymous</h3>
                <p className="text-sm text-slate-500">No login required. Your privacy is priority.</p>
            </div>
        </div>
      </main>

      <footer className="p-6 text-center text-slate-600 text-sm">
        &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
      </footer>
    </div>
  );
};