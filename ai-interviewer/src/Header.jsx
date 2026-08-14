import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import AcmLogo from "./components/AcmLogo";
import SupabaseSetupModal from "./components/SupabaseSetupModal";
import { Sparkles, Mic, Volume2, VolumeX, Database, Trophy, Zap, Terminal } from "lucide-react";
import { audioEngine } from "./utils/audioSynth";

export default function Header() {
  const location = useLocation();
  const [isMuted, setIsMuted] = useState(false);
  const [showDbModal, setShowDbModal] = useState(false);

  const toggleSound = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    audioEngine.muted = nextState;
    if (!nextState) audioEngine.playClick();
  };

  const handleClickNav = () => {
    audioEngine.playClick();
  };

  return (
    <>
      <div className="w-full font-sans select-none border-b border-blue-900/40 bg-[#030712]/95 backdrop-blur-md sticky top-0 z-40">
        {/* Top Announcement Bar */}
        <div className="bg-gradient-to-r from-[#003B99] via-[#0075FF] to-[#6000FF] py-1.5 px-4 text-center text-xs font-semibold text-white flex items-center justify-center gap-3 shadow-md">
          <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
            <Zap size={12} className="animate-bounce text-yellow-300" /> PEC ACM FRESHER ORIENTATION
          </span>
          <span className="hidden sm:inline text-cyan-200">
            Discover Your Tech Persona & Official ACM Wing Recommendation
          </span>
        </div>

        {/* Main Header */}
        <header className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Logo & Brand Name */}
          <Link to="/" onClick={handleClickNav} className="flex items-center gap-3 group cursor-pointer">
            <AcmLogo size="md" showText={true} />
          </Link>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-1.5 bg-[#0a1229] p-1 rounded-2xl border border-blue-900/60 shadow-inner">
            <Link
              to="/"
              onClick={handleClickNav}
              className={`flex items-center space-x-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all ${
                location.pathname === "/"
                  ? "bg-gradient-to-r from-[#0075FF] to-[#00F0FF] text-slate-950 shadow-lg shadow-blue-500/30"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Sparkles size={14} />
              <span>Welcome</span>
            </Link>

            <Link
              to="/quiz"
              onClick={handleClickNav}
              className={`flex items-center space-x-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all ${
                location.pathname === "/quiz"
                  ? "bg-gradient-to-r from-[#0075FF] to-[#7000FF] text-white shadow-lg shadow-purple-500/30 animate-pulse"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Mic size={14} className="text-cyan-400" />
              <span>Persona Quiz</span>
            </Link>

            <Link
              to="/leaderboard"
              onClick={handleClickNav}
              className={`flex items-center space-x-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all ${
                location.pathname === "/leaderboard"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-pink-500/30"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Trophy size={14} className="text-yellow-400" />
              <span>Leaderboard</span>
            </Link>
          </div>

          {/* Controls: Audio Toggle & Supabase Setup */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSound}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold"
              title={isMuted ? "Unmute Audio" : "Mute Audio"}
            >
              {isMuted ? <VolumeX size={16} className="text-red-400" /> : <Volume2 size={16} className="text-cyan-400" />}
              <span className="hidden lg:inline">{isMuted ? "Sound Off" : "Sound On"}</span>
            </button>

            <button
              onClick={() => { audioEngine.playClick(); setShowDbModal(true); }}
              className="px-3.5 py-2 rounded-xl bg-[#091533] border border-blue-500/40 hover:border-cyan-400 text-cyan-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
            >
              <Database size={15} className="text-cyan-400" />
              <span>Supabase Guide</span>
            </button>
          </div>

        </header>
      </div>

      {/* Supabase Guide Modal */}
      <SupabaseSetupModal isOpen={showDbModal} onClose={() => setShowDbModal(false)} />
    </>
  );
}
