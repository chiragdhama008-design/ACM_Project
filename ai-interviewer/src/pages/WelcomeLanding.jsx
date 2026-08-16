import React from "react";
import { Link } from "react-router-dom";
import CyberParticles from "../components/CyberParticles";
import AcmLogo from "../components/AcmLogo";
import AcmTeamSection from "../components/AcmTeamSection";
import Footer from "../components/Footer";
import {
  Sparkles,
  Code,
  Brain,
  Terminal,
  ArrowRight,
  CheckCircle2,
  Radio,
  Shield
} from "lucide-react";
import { audioEngine } from "../utils/audioSynth";

export default function WelcomeLanding() {
  const handleLaunch = () => {
    audioEngine.playClick();
  };

  return (
    <div className="relative min-h-screen bg-[#020612] text-white font-sans selection:bg-[#0075FF] selection:text-white overflow-hidden">
      {/* Interactive Cyber Particles Canvas */}
      <CyberParticles />

      {/* Cyber Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

      {/* Futuristic Background Light Orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[35rem] h-[35rem] bg-[#00F0FF]/20 rounded-full blur-[140px]"></div>
        <div className="absolute top-1/3 -right-40 w-[35rem] h-[35rem] bg-[#7000FF]/20 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-10 left-1/3 w-[40rem] h-[40rem] bg-[#FF007A]/15 rounded-full blur-[160px]"></div>
      </div>

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center z-10">
        
        {/* Static Tech Tag */}
        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-[#071126]/90 border border-cyan-500/40 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-8 shadow-[0_0_20px_rgba(0,240,255,0.2)] backdrop-blur-md">
          <Radio size={14} className="text-cyan-400 animate-pulse" />
          <span>PEC ACM STUDENT CHAPTER • COMPUTING STUDENT SOCIETY</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6">
          Find Your{" "}
          <span className="bg-gradient-to-r from-[#00F0FF] via-[#7000FF] to-[#FF007A] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(0,240,255,0.8)] font-black">
            PEC ACM Wing
          </span>{" "}
          & Claim Your Persona Card
        </h1>

        {/* Subtitle */}
        <p className="max-w-3xl mx-auto text-base sm:text-xl text-blue-100/90 font-medium leading-relaxed mb-10">
          Open for all PEC Chandigarh students — <strong className="text-cyan-300">Day Scholars & Hostellers</strong>! Answer 2 quick fun campus questions to get your personalized <strong className="text-cyan-300 font-extrabold">PEC Tech Persona Card</strong> emailed straight to you! 🎓
        </p>

        {/* PRIMARY LAUNCH BUTTON */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
          <Link
            to="/quiz"
            onClick={handleLaunch}
            className="relative group px-10 py-5 rounded-full bg-gradient-to-r from-[#0075FF] to-[#00F0FF] text-slate-950 font-black text-xl flex items-center justify-center gap-3.5 shadow-[0_0_35px_rgba(0,240,255,0.4)] hover:shadow-[0_0_50px_rgba(0,240,255,0.7)] hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

            <Sparkles size={24} className="group-hover:rotate-12 transition-transform text-slate-950 shrink-0" />
            <span className="tracking-tight">Find Your ACM Wing ✨</span>
            <ArrowRight size={22} className="group-hover:translate-x-1.5 transition-transform shrink-0" />
          </Link>
        </div>
      </section>

      {/* THE 4 PEC ACM WINGS SHOWCASE */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 border-t border-blue-900/40">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Which PEC ACM Wing Matches Your Natural Vibe?
          </h2>
          <p className="text-sm text-blue-200/70 mt-2">Take the 2-minute quiz to discover your wing and get your official card!</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* ACM-Dev Card */}
          <div className="bg-[#050d24] p-7 rounded-3xl border border-cyan-500/30 hover:border-cyan-400 transition-all duration-300 group hover:-translate-y-2 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>
            <div>
              <div className="w-13 h-13 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-400 mb-5 group-hover:scale-110 transition-transform">
                <Code size={30} />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-black text-white">ACM-Dev</h3>
                <span className="text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 px-2.5 py-1 rounded-full border border-cyan-400/30">
                  Development
                </span>
              </div>
              <p className="text-xs text-blue-100/80 leading-relaxed mb-5">
                Full-Stack Web & App Development, Open Source, Hardware/IoT, Cloud Systems, and Hackathons.
              </p>
            </div>
            <ul className="space-y-2 text-xs text-slate-300 border-t border-blue-900/60 pt-3">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-cyan-400" />
                <span>Web / App & IoT Hardware</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-cyan-400" />
                <span>Hackathons & Open Source</span>
              </li>
            </ul>
          </div>

          {/* ACM-ML Card */}
          <div className="bg-[#050d24] p-7 rounded-3xl border border-purple-500/30 hover:border-purple-400 transition-all duration-300 group hover:-translate-y-2 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>
            <div>
              <div className="w-13 h-13 rounded-2xl bg-purple-500/15 border border-purple-400/40 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-110 transition-transform">
                <Brain size={30} />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-black text-white">ACM-ML</h3>
                <span className="text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 px-2.5 py-1 rounded-full border border-purple-400/30">
                  Machine Learning
                </span>
              </div>
              <p className="text-xs text-blue-100/80 leading-relaxed mb-5">
                Machine Learning, Deep Learning, Data Science, NLP, Computer Vision, and Intelligent Systems.
              </p>
            </div>
            <ul className="space-y-2 text-xs text-slate-300 border-t border-purple-900/60 pt-3">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-purple-400" />
                <span>Deep Learning & LLMs</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-purple-400" />
                <span>Vision, NLP & Data Science</span>
              </li>
            </ul>
          </div>

          {/* ACM-CP Card */}
          <div className="bg-[#050d24] p-7 rounded-3xl border border-blue-600/30 hover:border-blue-400 transition-all duration-300 group hover:-translate-y-2 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
            <div>
              <div className="w-13 h-13 rounded-2xl bg-blue-500/15 border border-blue-400/40 flex items-center justify-center text-blue-400 mb-5 group-hover:scale-110 transition-transform">
                <Terminal size={30} />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-black text-white">ACM-CP</h3>
                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-full border border-blue-400/30">
                  Competitive Coding
                </span>
              </div>
              <p className="text-xs text-blue-100/80 leading-relaxed mb-5">
                Data Structures, Algorithms, Dynamic Programming, Codeforces, CodeChef contests, and ICPC.
              </p>
            </div>
            <ul className="space-y-2 text-xs text-slate-300 border-t border-blue-900/60 pt-3">
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

          {/* ACM-CyberSec Card */}
          <div className="bg-[#050d24] p-7 rounded-3xl border border-emerald-500/30 hover:border-emerald-400 transition-all duration-300 group hover:-translate-y-2 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
            <div>
              <div className="w-13 h-13 rounded-2xl bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
                <Shield size={30} />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-black text-white">ACM-CyberSec</h3>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-400/30">
                  Cybersecurity
                </span>
              </div>
              <p className="text-xs text-blue-100/80 leading-relaxed mb-5">
                Ethical Hacking, Capture The Flag (CTF), Network Security, Cryptography, and Bug Bounties.
              </p>
            </div>
            <ul className="space-y-2 text-xs text-slate-300 border-t border-emerald-900/60 pt-3">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>Ethical Hacking & CTFs</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>Network Security & Crypto</span>
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* PEC ACM LEADERSHIP & TEAM SHOWCASE */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 mb-10">
        <AcmTeamSection />
      </section>

      {/* FINAL BOTTOM LAUNCH CTA BANNER */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center relative z-10">
        <div className="bg-gradient-to-r from-[#061438] via-[#020612] to-[#120738] rounded-3xl p-8 sm:p-12 border border-blue-500/40 shadow-2xl relative overflow-hidden">
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
            Ready to Discover Your Persona?
          </h2>
          <p className="text-blue-200/80 text-sm sm:text-base max-w-xl mx-auto mb-8">
            Open for Day Scholars & Hostellers across all PEC branches!
          </p>
          <Link
            to="/quiz"
            onClick={handleLaunch}
            className="inline-flex items-center gap-3 px-9 py-4 rounded-full bg-gradient-to-r from-[#0075FF] to-[#00F0FF] text-slate-950 font-black text-lg shadow-xl hover:scale-105 transition-transform cursor-pointer"
          >
            <Sparkles size={22} className="text-slate-950" />
            <span>Take the Quiz ✨</span>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
