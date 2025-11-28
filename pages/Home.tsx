import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, MessageSquare, ShieldCheck, Users, Globe, Zap, Sparkles } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ChatMode } from '../types';
import { APP_NAME } from '../constants';
import { GridBackground } from '../components/GridBackground';
import { socketService } from '../services/socketService';
import toast from 'react-hot-toast';

export const Home: React.FC = () => {
    const navigate = useNavigate();
    const [interests, setInterests] = useState('');
    const [onlineCount, setOnlineCount] = useState(0);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [pendingMode, setPendingMode] = useState<ChatMode | null>(null);

    useEffect(() => {
        // Connect to socket to get real-time count
        socketService.connect();

        const handleUserCount = (count: number) => {
            setOnlineCount(count + 15);
        };

        socketService.on('user_count', handleUserCount);

        return () => {
            socketService.off('user_count', handleUserCount);
        };
    }, []);

    const startChat = (mode: ChatMode) => {
        setPendingMode(mode);
        setShowTermsModal(true);
    };

    const handleAgree = () => {
        if (!pendingMode) return;

        const interestArray = interests.split(',').map(s => s.trim()).filter(Boolean);
        const queryParams = new URLSearchParams();
        queryParams.set('mode', pendingMode);
        if (interestArray.length > 0) {
            queryParams.set('interests', interestArray.join(','));
        }
        navigate(`/chat?${queryParams.toString()}`);
    };

    return (
        <div className="h-dvh relative flex flex-col overflow-y-auto bg-black">

            {/* Dynamic Background */}
            <GridBackground />

            {/* Navbar */}
            <header className="relative z-10 p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-3">
                    <div>
                        <img src="/logo.png" alt="Vissoo Logo" className="w-32 h-32 object-contain" />
                    </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 border border-white/10 backdrop-blur-md">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4F932] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#D4F932]"></span>
                    </span>
                    <span className="text-sm text-slate-300 font-medium">{onlineCount.toLocaleString()} online</span>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 flex-1 flex flex-col p-4 md:p-6 max-w-6xl mx-auto w-full">

                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full py-12 lg:py-0 lg:my-auto">

                    {/* Left Column: Hero Text */}
                    <div className="text-center lg:text-left space-y-8 animate-slide-up">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4F932]/10 border border-[#D4F932]/20 text-[#D4F932] text-sm font-medium">
                                <Zap className="w-4 h-4" />
                                <span>Next-Gen Video Chat</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]">
                                Connect <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4F932] to-[#B8D92C]">Instantly.</span>
                            </h2>
                            <p className="text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                                Experience crystal clear video calls with random strangers worldwide.
                                Safe, anonymous, and beautifully designed for genuine connections.
                            </p>
                        </div>

                        <div className="flex flex-wrap justify-center lg:justify-start gap-8 pt-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/5 rounded-lg">
                                    <ShieldCheck className="w-5 h-5 text-[#D4F932]" />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-white text-sm">Safe & Secure</div>
                                    <div className="text-xs text-slate-500">AI Moderation</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/5 rounded-lg">
                                    <Users className="w-5 h-5 text-[#D4F932]" />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-white text-sm">No Login</div>
                                    <div className="text-xs text-slate-500">Start Instantly</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/5 rounded-lg">
                                    <Globe className="w-5 h-5 text-[#D4F932]" />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-white text-sm">Global</div>
                                    <div className="text-xs text-slate-500">190+ Countries</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Action Card */}
                    <div className="w-full max-w-md mx-auto lg:ml-auto animate-slide-up delay-200">
                        <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden group hover:border-[#D4F932]/30 transition-colors duration-500">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4F932]/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all duration-700 group-hover:bg-[#D4F932]/10" />

                            <div className="space-y-6 relative">
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold text-white">Start Chatting</h3>
                                    <p className="text-slate-400 text-sm">Choose your vibe and meet someone new.</p>
                                </div>

                                <div className="space-y-4 relative">
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Interests</label>
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <div className="flex-1">
                                                <Input
                                                    value={interests}
                                                    onChange={(e) => setInterests(e.target.value)}
                                                    placeholder="Enter interests (e.g., music, gaming)..."
                                                    className="w-full bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-[#D4F932]/50 focus:ring-[#D4F932]/20 h-12"
                                                />
                                            </div>
                                            <Button
                                                onClick={() => startChat(ChatMode.VIDEO)}
                                                className="bg-[#D4F932] hover:bg-[#B8D92C] text-black font-bold px-8 h-12 shadow-[0_0_20px_rgba(212,249,50,0.2)] hover:shadow-[0_0_30px_rgba(212,249,50,0.4)] transition-all duration-300"
                                            >
                                                <Video className="w-5 h-5 mr-2" />
                                                Start Video
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <Button
                                            onClick={() => startChat(ChatMode.TEXT)}
                                            variant="secondary"
                                            className="h-auto py-4 flex-col gap-2 bg-white/5 hover:bg-white/10 border border-white/10"
                                        >
                                            <MessageSquare className="w-6 h-6 text-slate-300" />
                                            <span>Text</span>
                                        </Button>

                                        <Button
                                            onClick={() => startChat(ChatMode.VIDEO)}
                                            variant="primary"
                                            className="h-auto py-4 flex-col gap-2 bg-[#D4F932] hover:bg-[#B8D92C] text-black font-bold shadow-lg shadow-[#D4F932]/20"
                                        >
                                            <Video className="w-6 h-6" />
                                            <span>Video</span>
                                        </Button>
                                    </div>
                                </div>
                            </div>


                        </div>
                    </div>
                </div>
            </main>

            <footer className="relative z-10 p-6 text-center text-slate-600 text-xs">
                <div className="flex justify-center gap-6 mb-4">
                    <a href="#" className="hover:text-slate-400 transition-colors">Privacy</a>
                    <a href="#" className="hover:text-slate-400 transition-colors">Terms</a>
                    <a href="#" className="hover:text-slate-400 transition-colors">Guidelines</a>
                </div>
                &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
            </footer>

            {/* Terms Modal */}
            {showTermsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="max-w-md w-full bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl relative animate-slide-up">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4F932]/10 rounded-full blur-3xl -mr-16 -mt-16" />

                        <div className="relative space-y-6">
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-bold text-white">Before You Start</h3>
                                <p className="text-slate-400 text-sm">Please confirm you agree to our community guidelines</p>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5">
                                        <ShieldCheck className="w-5 h-5 text-[#D4F932]" />
                                    </div>
                                    <p className="text-white text-sm leading-relaxed">
                                        I am <span className="font-bold text-[#D4F932]">18 years or older</span> and agree to the Terms of Service.
                                    </p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5">
                                        <ShieldCheck className="w-5 h-5 text-[#D4F932]" />
                                    </div>
                                    <p className="text-white text-sm leading-relaxed">
                                        I will <span className="font-bold text-[#D4F932]">behave respectfully</span> and follow community guidelines.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    onClick={() => setShowTermsModal(false)}
                                    variant="secondary"
                                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleAgree}
                                    className="flex-1 bg-[#D4F932] hover:bg-[#B8D92C] text-black font-bold shadow-[0_0_20px_rgba(212,249,50,0.2)]"
                                >
                                    Agree & Continue
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};