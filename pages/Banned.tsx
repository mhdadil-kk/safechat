import React from 'react';
import { ShieldAlert, Lock } from 'lucide-react';

export const Banned: React.FC = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-surface border border-red-900/50 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute top-0 left-0 w-32 h-32 bg-red-500 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-red-500 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                <ShieldAlert className="w-10 h-10 text-red-500" />
            </div>

            <h1 className="text-3xl font-bold text-white mb-2">Account Suspended</h1>
            <p className="text-slate-400 mb-6 leading-relaxed">
                Your access to SafeChat has been temporarily suspended due to a violation of our Community Guidelines.
            </p>

            <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-4 w-full mb-6">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Reason:</span>
                    <span className="text-red-400 font-medium">Inappropriate Behavior</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Duration:</span>
                    <span className="text-white font-medium">24 Hours</span>
                </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
                <Lock className="w-3 h-3" />
                <span>Ban ID: #8X92-B21</span>
            </div>
            
            <button className="mt-8 text-primary hover:text-primaryHover text-sm font-medium underline underline-offset-4">
                Appeal this decision
            </button>
        </div>
      </div>
    </div>
  );
};