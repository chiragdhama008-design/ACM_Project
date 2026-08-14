import React from "react";
import { Link } from "react-router-dom";
import CyberParticles from "../components/CyberParticles";
import AcmLogo from "../components/AcmLogo";
import Footer from "../components/Footer";
import {
  Mic,
  Sparkles,
  Zap,
  Code,
  Brain,
  Terminal,
  Trophy,
  ArrowRight,
  ShieldCheck,
  Flame,
  Bot,
  DoorClosed,
  CheckCircle2,
  Share2,
  Cpu,
  Layers
} from "lucide-react";
import { audioEngine } from "../utils/audioSynth";

export default function WelcomeLanding() {
  const handleStart = () => {
    audioEngine.playClick();
  };

  return (
    <div className="relative min-h-screen bg-[#030712] text-white font-sans selection:bg-[#0075FF] selection:text-white overflow-hidden">
      {/* Interactive Cyber Particles Background */}
      <CyberParticles />

      {/* Hero Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[30rem] h-[30rem] bg-blue-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute top-1/3 -right-32 w-[30rem] h-[30rem] bg-cyan-500/15 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-10 left-1/3 w-[36rem] h-[36rem] bg-purple-600/15 rounded-full blur-[140px]"></div>
      </div>

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center z-10">
        
        {/* PEC ACM Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#08173d]/90 border border-blue-500/40 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-8 shadow-xl shadow-blue-950/60 backdrop-blur-md">
          <Zap size={16} className="text-[#00F0FF] animate-pulse" />
          <span>PEC ACM STUDENT CHAPTER • COMPUTING STUDENT SOCIETY</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6">
          Unleash Your PEC Tech Persona & Discover Your{" "}
          <span className="bg-gradient-to-r from-[#0084FF] via-[#00F0FF] to-[#A855F7] bg-clip-text text-transparent drop-shadow-lg">
            Ideal ACM Wing
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-3xl mx-auto text-base sm:text-xl text-blue-100/80 font-normal leading-relaxed mb-10">
          Answer 2 funny real-life PEC hostel scenarios using your voice or keyboard. Our AI evaluates your creative problem-solving logic to generate your shareable <strong className="text-cyan-300">PEC Tech Persona Card</strong>!
        </p>

        {/* CTA Launch Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-16">
          <Link
            to="/quiz"
            onClick={handleStart}
            className="w-full sm:w-auto px-9 py-4 rounded-2xl bg-gradient-to-r from-[#0075FF] via-[#00F0FF] to-[#0066FF] text-slate-950 font-black text-lg flex items-center justify-center gap-3 shadow-2xl shadow-blue-500/40 hover:shadow-cyan-400/60 hover:scale-105 transition-all duration-300 group cursor-pointer"
          >
            <Mic size={24} className="group-hover:rotate-12 transition-transform text-slate-950" />
            <span>Launch Persona AI Analyzer</span>
            <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/leaderboard"
            onClick={handleStart}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#091533] border border-blue-700/60 hover:border-cyan-400 text-slate-200 font-bold text-base sm:text-lg flex items-center justify-center gap-2 hover:bg-[#0c1d47] transition-all cursor-pointer"
          >
            <Trophy size={20} className="text-yellow-400" />
            <span>View Fresher Leaderboard</span>
          </Link>
        </div>

        {/* Dynamic Scenario Showcase Banner */}
        <div className="relative max-w-4xl mx-auto rounded-3xl p-1 bg-gradient-to-r from-[#0084FF]/60 via-[#00F0FF]/40 to-[#8B5CF6]/60 shadow-2xl">
          <div className="bg-[#070e24] rounded-[22px] p-6 sm:p-8 border border-blue-900/60 text-left">
            <div className="flex items-center justify-between border-b border-blue-900/60 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <AcmLogo size="sm" showText={false} />
                <div>
                  <h3 className="text-lg font-black text-white">The 2 Real-Life PEC Scenarios</h3>
                  <p className="text-xs text-blue-200/70">Engineered to test your natural engineering instincts</p>
                </div>
              </div>
              <span className="text-xs font-black bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 px-3 py-1 rounded-full uppercase">
                60-Sec AI Quiz
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Question 1 preview */}
              <div className="p-4 rounded-2xl bg-[#0b1638] border border-blue-500/30 flex gap-3">
                <div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-400/40 text-blue-400 shrink-0 h-fit">
                  <DoorClosed size={22} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider">Scenario #1</span>
                  <p className="text-xs font-bold text-white mt-1 leading-snug">
                    "You have 10 minutes before a 75% attendance lecture and your hostel door lock is jammed. What's your move?"
                  </p>
                </div>
              </div>

              {/* Question 2 preview */}
              <div className="p-4 rounded-2xl bg-[#0b1638] border border-blue-500/30 flex gap-3">
                <div className="p-2.5 rounded-xl bg-purple-600/20 border border-purple-400/40 text-purple-400 shrink-0 h-fit">
                  <Bot size={22} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-purple-400 tracking-wider">Scenario #2</span>
                  <p className="text-xs font-bold text-white mt-1 leading-snug">
                    "If you could build a robot to solve ONE annoying problem in PEC hostels or mess food, what would it do?"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE 3 PEC ACM WINGS SHOWCASE */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 border-t border-blue-900/40">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-xs font-black uppercase tracking-widest text-[#00F0FF] mb-2">
            Find Your Technological Tribe
          </h2>
          <p className="text-3xl sm:text-4xl font-black text-white">
            Which PEC ACM Wing Matches Your Vibe?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* ACM-Dev Card */}
          <div className="bg-[#08122c] p-8 rounded-3xl border border-blue-500/30 hover:border-cyan-400 transition-all duration-300 group hover:-translate-y-2 flex flex-col justify-between shadow-xl">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
                <Code size={30} />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-black text-white">ACM-Dev</h3>
                <span className="text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 px-2.5 py-1 rounded-full border border-cyan-400/30">
                  Development
                </span>
              </div>
              <p className="text-xs text-blue-100/70 leading-relaxed mb-6">
                Full-Stack Web & App Development, Open Source, Hardware/IoT, Cloud Systems, and Hackathon Championship teams.
              </p>
            </div>
            <ul className="space-y-2 text-xs text-slate-300 border-t border-blue-900/60 pt-4">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-cyan-400" />
                <span>Web / App & IoT Hardware</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-cyan-400" />
                <span>Hackathon & Open Source Projects</span>
              </li>
            </ul>
          </div>

          {/* ACM-AI Card */}
          <div className="bg-[#08122c] p-8 rounded-3xl border border-purple-500/30 hover:border-purple-400 transition-all duration-300 group hover:-translate-y-2 flex flex-col justify-between shadow-xl">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-400/40 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                <Brain size={30} />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-black text-white">ACM-AI</h3>
                <span className="text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 px-2.5 py-1 rounded-full border border-purple-400/30">
                  Artificial Intelligence
                </span>
              </div>
              <p className="text-xs text-blue-100/70 leading-relaxed mb-6">
                Machine Learning, Deep Learning, Generative AI Models, Computer Vision, Robotics, NLP, and Autonomous Agents.
              </p>
            </div>
            <ul className="space-y-2 text-xs text-slate-300 border-t border-purple-900/60 pt-4">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-purple-400" />
                <span>Deep Learning & LLMs</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-purple-400" />
                <span>Vision, NLP & Smart Robotics</span>
              </li>
            </ul>
          </div>

          {/* ACM-CP Card */}
          <div className="bg-[#08122c] p-8 rounded-3xl border border-blue-600/30 hover:border-blue-400 transition-all duration-300 group hover:-translate-y-2 flex flex-col justify-between shadow-xl">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-blue-500/15 border border-blue-400/40 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                <Terminal size={30} />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-black text-white">ACM-CP</h3>
                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-full border border-blue-400/30">
                  Competitive Coding
                </span>
              </div>
              <p className="text-xs text-blue-100/70 leading-relaxed mb-6">
                Data Structures, Algorithms, Dynamic Programming, Codeforces, CodeChef contests, ICPC, and Speed Logic.
              </p>
            </div>
            <ul className="space-y-2 text-xs text-slate-300 border-t border-blue-900/60 pt-4">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-blue-400" />
                <span>Algorithmic Optimization</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-blue-400" />
                <span>Codeforces & ICPC Training</span>
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* THE PERSONA OUTPUT FEATURES */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 border-t border-blue-900/40">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          
          <div className="p-6 rounded-3xl bg-[#070e24] border border-blue-900/60">
            <div className="text-3xl font-black text-cyan-400 mb-2 flex items-center justify-center gap-2">
              <Trophy size={28} /> 👑 Custom Title
            </div>
            <p className="text-xs text-blue-200/70">
              Get titled as "The Future CP Mastermind", "The AI Pioneer", or "The Hackathon Builder"!
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#070e24] border border-blue-900/60">
            <div className="text-3xl font-black text-purple-400 mb-2 flex items-center justify-center gap-2">
              <Mic size={28} /> 🎙️ Dual Input
            </div>
            <p className="text-xs text-blue-200/70">
              Speak via ultra-sensitive microphone with real-time waveform or type your answer directly!
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#070e24] border border-blue-900/60">
            <div className="text-3xl font-black text-pink-400 mb-2 flex items-center justify-center gap-2">
              <Share2 size={28} /> 📸 PNG Export
            </div>
            <p className="text-xs text-blue-200/70">
              Download high-definition PNG Persona Card to share on Instagram & WhatsApp stories!
            </p>
          </div>

        </div>
      </section>

      {/* FINAL CTA FOOTER */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center relative z-10">
        <div className="bg-gradient-to-r from-[#08163b] via-[#03091e] to-[#12083b] rounded-3xl p-8 sm:p-12 border border-blue-500/40 shadow-2xl relative overflow-hidden">
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
            Ready to Discover Your Persona?
          </h2>
          <p className="text-blue-200/80 text-sm sm:text-base max-w-xl mx-auto mb-8">
            Join freshers across all branches at PEC. Takes only 60 seconds!
          </p>
          <Link
            to="/quiz"
            onClick={handleStart}
            className="inline-flex items-center gap-3 px-9 py-4 rounded-2xl bg-gradient-to-r from-[#0075FF] via-[#00F0FF] to-[#7000FF] text-slate-950 font-black text-lg shadow-xl hover:scale-105 transition-transform cursor-pointer"
          >
            <Sparkles size={22} className="text-slate-950" />
            <span>Start Persona Quiz Now</span>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
