import React, { useState } from "react";
import { Link } from "react-router-dom";
import AcmLogo from "./components/AcmLogo";
import SupabaseSetupModal from "./components/SupabaseSetupModal";
import { Volume2, VolumeX, Database, Sparkles } from "lucide-react";
import { audioEngine } from "./utils/audioSynth";

export default function Header() {
  const [isMuted, setIsMuted] = useState(false);
  const [showDbModal, setShowDbModal] = useState(false);

  const toggleSound = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    audioEngine.muted = nextState;
    if (!nextState) audioEngine.playClick();
  };

  return (
    <>
      <div className="w-full font-sans select-none border-b border-blue-500/20 bg-[#020612]/90 backdrop-blur-xl sticky top-0 z-40">
        <header className="max-w-7xl mx-auto py-3.5 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          
          {/* PEC ACM Logo (Click goes to home) */}
          <Link to="/" onClick={() => audioEngine.playClick()} className="flex items-center gap-3 group cursor-pointer">
            <AcmLogo size="md" showText={true} />
          </Link>

          {/* Right Action Controls: Audio Toggle & Supabase Guide */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSound}
              className="p-2.5 rounded-2xl bg-[#08122c] border border-blue-900/60 hover:border-cyan-400 text-slate-300 hover:text-white transition flex items-center gap-2 text-xs font-semibold shadow-lg shadow-blue-950/40 cursor-pointer"
              title={isMuted ? "Unmute Audio Effects" : "Mute Audio Effects"}
            >
              {isMuted ? <VolumeX size={17} className="text-red-400" /> : <Volume2 size={17} className="text-cyan-400 animate-pulse" />}
              <span className="hidden sm:inline text-xs font-bold">{isMuted ? "Sound Off" : "Sound On"}</span>
            </button>

            <button
              onClick={() => { audioEngine.playClick(); setShowDbModal(true); }}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#08173d] to-[#0d2259] border border-blue-500/40 hover:border-cyan-400 text-cyan-300 hover:text-white text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-blue-950/40 cursor-pointer"
            >
              <Database size={15} className="text-cyan-400" />
              <span>Supabase Setup</span>
            </button>
          </div>

        </header>
      </div>

      {/* Supabase Guide Modal */}
      <SupabaseSetupModal isOpen={showDbModal} onClose={() => setShowDbModal(false)} />
    </>
  );
}
