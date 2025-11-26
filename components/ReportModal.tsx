import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from './Button';
import { REPORT_CATEGORIES } from '../constants';
import { ReportPayload } from '../types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (report: ReportPayload) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [category, setCategory] = useState<string>('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit({
      category: category as any,
      reason: category,
      description
    });
    setSubmitted(true);
    setTimeout(() => {
        setSubmitted(false);
        setCategory('');
        setDescription('');
        onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-900/50">
          <h3 className="text-lg font-bold flex items-center gap-2 text-white">
            <AlertTriangle className="w-5 h-5 text-accent" />
            Report User
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in duration-300">
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                <h4 className="text-xl font-bold text-white mb-2">Report Received</h4>
                <p className="text-slate-400">Thank you for keeping our community safe.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-400">
                Reports are anonymous and reviewed by our AI moderation system and human team.
              </p>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Reason</label>
                <div className="grid grid-cols-1 gap-2">
                  {REPORT_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`text-left px-4 py-3 rounded-lg border transition-all ${
                        category === cat.id 
                          ? 'bg-primary/20 border-primary text-white' 
                          : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                 <label className="text-sm font-medium text-slate-200">Details (Optional)</label>
                 <textarea
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:ring-2 focus:ring-primary outline-none resize-none h-24"
                    placeholder="Describe what happened..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                 />
              </div>

              <div className="pt-2">
                <Button 
                    className="w-full" 
                    variant="danger" 
                    disabled={!category}
                    onClick={handleSubmit}
                >
                    Submit Report
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};