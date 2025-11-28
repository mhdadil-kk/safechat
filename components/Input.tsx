import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-1">
          {label}
        </label>
      )}
      <input
        className={`w-full bg-white/5 border ${error ? 'border-red-500/50' : 'border-white/10'} text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500/50 focus:border-transparent outline-none transition-all placeholder:text-slate-500 backdrop-blur-sm ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-accent">{error}</p>
      )}
    </div>
  );
};