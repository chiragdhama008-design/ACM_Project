import React from "react";
import { Link } from "react-router-dom";
import CyberParticles from "../components/CyberParticles";
import AcmLogo from "../components/AcmLogo";
import AcmTeamSection from "../components/AcmTeamSection";
import Footer from "../components/Footer";
import {
  Sparkles,
  Zap,
  Code,
  Brain,
  Terminal,
  ArrowRight,
  Bot,
  Clock,
  CheckCircle2,
  Share2,
  Radio,
  Building2,
  Bus
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
        <div className="absolute -top-40 -left-40 w-[35rem] h-[35rem] bg-[#5a7fa6]/20 rounded-full blur-[140px]"></div>
        <div className="absolute top-1/3 -right-40 w-[35rem] h-[35rem] bg-[#5a7fa6]/10 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-10 left-1/3 w-[40rem] h-[40rem] bg-[#7000FF]/10 rounded-full blur-[160px]"></div>
      </div>

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center z-10">
        
        {/* Static Subdued Tech Tag (No sparkling, eye-friendly faded blue, static) */}
        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-[#071126]/90 border border-blue-500/30 text-blue-200/90 text-xs font-bold uppercase tracking-wider mb-8 shadow-sm backdrop-blur-md">
          <Radio size={14} className="text-blue-400/80" />
          <span>PEC ACM STUDENT CHAPTER • COMPUTING STUDENT SOCIETY</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6">
          Unleash Your PEC Tech Persona & Discover Your{" "}
          <span className="bg-gradient-to-r from-[#5a7fa6] via-[#5a7fa6] to-[#5a7fa6] bg-clip-text text-transparent drop-shadow-[0_10px_20px_rgba(90,126,166,0.4)]">
            Ideal ACM Wing
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-3xl mx-auto text-base sm:text-xl text-blue-100/90 font-medium leading-relaxed mb-10">
          Open for all PEC Chandigarh students — <strong className="text-cyan-300">Day Scholars & Hostellers</strong>! Answer 2 dynamic AI-generated real-life scenario questions to generate your shareable <strong className="text-cyan-300 font-extrabold">PEC Tech Persona Card</strong>!
        </p>

        {/* PRIMARY LAUNCH BUTTON */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
          <Link
            to="/quiz"
            onClick={handleLaunch}
            className="relative group px-10 py-5 rounded-2xl bg-gradient-to-r from-[#0075FF] via-[#00F0FF] to-[#0066FF] text-slate-950 font-black text-xl flex items-center justify-center gap-3.5 shadow-[0_0_50px_rgba(0,240,255,0.4)] hover:shadow-[0_0_70px_rgba(0,240,255,0.7)] hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

            <Sparkles size={26} className="group-hover:rotate-12 transition-transform text-slate-950 shrink-0" />
            <span className="tracking-tight">Launch Persona AI Analyzer</span>
            <ArrowRight size={24} className="group-hover:translate-x-1.5 transition-transform shrink-0" />
          </Link>
        </div>

        {/* Dynamic AI Scenario Preview Banner */}
        <div className="relative max-w-4xl mx-auto rounded-3xl p-1 bg-gradient-to-r from-[#0084FF]/70 via-[#00F0FF]/50 to-[#8B5CF6]/70 shadow-[0_20px_50px_rgba(0,117,255,0.25)]">
          <div className="bg-[#050c21]/95 rounded-[22px] p-6 sm:p-8 border border-blue-500/30 text-left backdrop-blur-xl">
            <div className="w-full max-w-md mx-auto bg-slate-900 rounded-full h-3 border border-blue-500/40 overflow-hidden mb-6">
              <div className="h-full bg-gradient-to-r from-[#5a7fa6] via-[#5a7fa6] to-[#7000FF] w-full"></div>
            </div>
            <div className="flex items-center justify-between border-b border-blue-900/60 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <AcmLogo size="sm" showText={false} />
                <div>
                  <h3 className="text-lg font-black text-white">Dynamic AI PEC Scenarios</h3>
                  <p className="text-xs text-blue-200/70">Randomized every session for Day Scholars & Hostellers</p>
                </div>
              </div>
              <span className="text-xs font-black bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                <Sparkles size={14} /> AI Generated Questions
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#08153b] border border-blue-500/40 hover:border-cyan-400 transition-all flex gap-3.5 group">
                <div className="p-3 rounded-xl bg-blue-600/20 border border-blue-400/40 text-blue-400 shrink-0 h-fit group-hover:scale-110 transition-transform">
                  <Clock size={24} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-cyan-400 tracking-widest flex items-center gap-1">
                    <Bus size={12} /> Day Scholar & Hostel Attendance Emergencies
                  </span>
                  <p className="text-xs font-bold text-white mt-1 leading-snug">
                    Randomized scenarios testing CTU bus traffic sprints, jammed locks, and 8 AM 75% attendance lecture survival!
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#08153b] border border-purple-500/40 hover:border-purple-400 transition-all flex gap-3.5 group">
                <div className="p-3 rounded-xl bg-purple-600/20 border border-purple-400/40 text-purple-400 shrink-0 h-fit group-hover:scale-110 transition-transform">
                  <Bot size={24} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-purple-400 tracking-widest flex items-center gap-1">
                    <Building2 size={12} /> PEC Campus Tech & Robot Ideas
                  </span>
                  <p className="text-xs font-bold text-white mt-1 leading-snug">
                    Design futuristic gadgets and AI robots to solve mess food, library seat rushes, or campus commuting hassles!
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
          <div className="text-xl sm:text-2xl font-black text-white">
            "{/*personaResult.personaTitle*/}"
          </div>
          <p className="text-xs text-gray-400 mt-1">AI-generated title based on your answers</p>
          <p className="text-3xl sm:text-4xl font-black text-white mt-4">
            Which PEC ACM Wing Matches Your Natural Vibe?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* ACM-Dev Card */}
          <div className="bg-[#050d24] p-8 rounded-3xl border border-blue-500/30 hover:border-cyan-400 transition-all duration-300 group hover:-translate-y-2 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>
            <div>
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
                <Code size={32} />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-black text-white">ACM-Dev</h3>
                <span className="text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 px-2.5 py-1 rounded-full border border-cyan-400/30">
                  Development
                </span>
              </div>
              <p className="text-xs text-blue-100/80 leading-relaxed mb-6">
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
          <div className="bg-[#050d24] p-8 rounded-3xl border border-purple-500/30 hover:border-purple-400 transition-all duration-300 group hover:-translate-y-2 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>
            <div>
              <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-400/40 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                <Brain size={32} />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-black text-white">ACM-AI</h3>
                <span className="text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 px-2.5 py-1 rounded-full border border-purple-400/30">
                  Artificial Intelligence
                </span>
              </div>
              <p className="text-xs text-blue-100/80 leading-relaxed mb-6">
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
          <div className="bg-[#050d24] p-8 rounded-3xl border border-blue-600/30 hover:border-blue-400 transition-all duration-300 group hover:-translate-y-2 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
            <div>
              <div className="w-14 h-14 rounded-2xl bg-blue-500/15 border border-blue-400/40 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                <Terminal size={32} />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-black text-white">ACM-CP</h3>
                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-full border border-blue-400/30">
                  Competitive Coding
                </span>
              </div>
              <p className="text-xs text-blue-100/80 leading-relaxed mb-6">
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
            className="inline-flex items-center gap-3 px-9 py-4.5 rounded-2xl bg-gradient-to-r from-[#0075FF] via-[#00F0FF] to-[#7000FF] text-slate-950 font-black text-lg shadow-xl hover:scale-105 transition-transform cursor-pointer"
          >
            <Sparkles size={22} className="text-slate-950" />
            <span>Launch Persona AI Analyzer</span>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
