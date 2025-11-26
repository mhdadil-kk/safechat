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
        className={`w-full bg-surface border ${error ? 'border-accent' : 'border-slate-700'} text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-500 ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-accent">{error}</p>
      )}
    </div>
  );
};