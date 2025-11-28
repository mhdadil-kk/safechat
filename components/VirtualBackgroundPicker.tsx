import React, { useState } from 'react';
import { Image as ImageIcon, X, Ban, Aperture } from 'lucide-react';
import { virtualBackgroundService, VirtualBackgroundType } from '../services/VirtualBackgroundService';

const VIRTUAL_BACKGROUNDS = [
    { id: 'none', label: 'None', type: 'none', icon: Ban },
    { id: 'blur', label: 'Blur', type: 'blur', icon: Aperture },
    {
        id: 'office',
        label: 'Office',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=200&auto=format&fit=crop'
    },
    {
        id: 'home',
        label: 'Home',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1484154218962-a1c00207099b?q=80&w=2074&auto=format&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1484154218962-a1c00207099b?q=80&w=200&auto=format&fit=crop'
    },
    {
        id: 'cafe',
        label: 'Cafe',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2047&auto=format&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=200&auto=format&fit=crop'
    }
];

export const VirtualBackgroundPicker: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedId, setSelectedId] = useState('none');

    const handleSelect = (bg: any) => {
        setSelectedId(bg.id);
        virtualBackgroundService.setBackground(bg.type as VirtualBackgroundType, bg.url);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-3.5 rounded-full transition-all ${selectedId !== 'none' ? 'bg-purple-500/20 text-purple-300' : 'hover:bg-white/10 text-white'}`}
                title="Virtual Background"
            >
                <ImageIcon className="w-5 h-5" />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-transparent"
                        onClick={() => setIsOpen(false)}
                    />

                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-80 p-4 rounded-2xl glass-panel shadow-2xl z-50 animate-slide-up">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-white">Video Background</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-slate-400 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            {VIRTUAL_BACKGROUNDS.map((bg) => (
                                <button
                                    key={bg.id}
                                    onClick={() => handleSelect(bg)}
                                    className={`relative group rounded-lg overflow-hidden aspect-square border-2 transition-all ${selectedId === bg.id
                                            ? 'border-primary shadow-lg shadow-primary/20'
                                            : 'border-transparent hover:border-white/20'
                                        }`}
                                >
                                    {bg.thumbnail ? (
                                        <div
                                            className="w-full h-full"
                                            style={{
                                                background: `url(${bg.thumbnail})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center'
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-white/5 flex items-center justify-center">
                                            {bg.icon && <bg.icon className="w-6 h-6 text-slate-400" />}
                                        </div>
                                    )}

                                    <div className="absolute bottom-0 left-0 right-0 p-1 bg-black/60 text-[10px] text-white text-center truncate">
                                        {bg.label}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
