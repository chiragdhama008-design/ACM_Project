import React from "react";
import { Link } from "react-router-dom";
import {
  Mic,
  Sparkles,
  Flame,
  Award,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Target,
  BarChart3,
  HelpCircle,
  Building2,
  Users,
  Lightbulb,
  Rocket,
  ChevronRight
} from "lucide-react";
import eicLogo from "../assets/eic_logo.png";

export default function WelcomeLanding() {
  const scrollToFeatures = () => {
    const el = document.getElementById("features");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#060b18] text-white font-sans selection:bg-[#10b981] selection:text-black">
      {/* Background Decorative Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#10b981]/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-[#f49f1c]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-1/3 w-[#30rem] h-96 bg-emerald-900/10 rounded-full blur-3xl"></div>
      </div>

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* EIC Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#163b2c]/80 border border-[#10b981]/40 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-8 shadow-lg shadow-emerald-950/40">
          <Flame size={15} className="text-[#f49f1c]" />
          <span>ENTREPRENEURSHIP & INCUBATION CELL • PEC CHANDIGARH</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.15] mb-6">
          Elevate Your Startup Pitch with{" "}
          <span className="bg-gradient-to-r from-[#10b981] via-emerald-300 to-[#f49f1c] bg-clip-text text-transparent">
            Real-Time AI Pitch Intelligence
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-3xl mx-auto text-base sm:text-xl text-slate-300 font-normal leading-relaxed mb-10">
          Step up to the 2-minute elevator pitch kiosk. Speak naturally with high-sensitivity accent support, receive instant 4-pillar deck evaluation, and conquer tough AI investor cross-examination.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            to="/kiosk"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#10b981] via-emerald-500 to-[#059669] text-slate-950 font-extrabold text-base sm:text-lg flex items-center justify-center gap-3 shadow-xl shadow-emerald-600/25 hover:shadow-emerald-500/40 hover:scale-105 transition-all duration-300 group cursor-pointer"
          >
            <Mic size={22} className="group-hover:rotate-12 transition-transform" />
            <span>Launch Pitch Kiosk Now</span>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>

          <button
            onClick={scrollToFeatures}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#0d172e] border border-slate-700/80 hover:border-emerald-500/50 text-slate-200 font-bold text-base sm:text-lg flex items-center justify-center gap-2 hover:bg-[#121f3d] transition-all cursor-pointer"
          >
            <Sparkles size={18} className="text-[#f49f1c]" />
            <span>Explore Kiosk Features</span>
          </button>
        </div>

        {/* EIC Badge Banner preview */}
        <div className="relative max-w-4xl mx-auto rounded-3xl p-1 bg-gradient-to-r from-[#10b981]/40 via-[#f49f1c]/30 to-[#10b981]/40 shadow-2xl">
          <div className="bg-[#0b132b] rounded-[22px] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
            <div className="flex items-center gap-5 text-left">
              <img
                src={eicLogo}
                alt="EIC PEC Logo"
                className="w-16 h-16 rounded-full border-2 border-[#10b981] p-1 bg-[#060b18] object-cover shadow-md shrink-0"
              />
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  E-Summit Elevator Pitch Competition
                  <span className="text-[10px] bg-[#f49f1c]/20 text-[#f49f1c] px-2 py-0.5 rounded-full font-extrabold uppercase border border-[#f49f1c]/40">
                    Live Session
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Punjab Engineering College (PEC), Sector 12, Chandigarh. Open for all student founders & startup builders.
                </p>
              </div>
            </div>
            <Link
              to="/kiosk"
              className="shrink-0 px-5 py-2.5 rounded-xl bg-[#163b2c] hover:bg-[#1d4d3a] text-emerald-300 font-semibold text-xs border border-[#10b981]/40 flex items-center gap-2 transition"
            >
              <span>Start 90-Sec Pitch</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="border-y border-slate-800/80 bg-[#081024]/60 py-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4 rounded-2xl bg-[#0b132b]/40 border border-slate-800">
            <div className="text-3xl sm:text-4xl font-black text-emerald-400 mb-1">90s - 120s</div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Elevator Pitch Window</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#0b132b]/40 border border-slate-800">
            <div className="text-3xl sm:text-4xl font-black text-[#f49f1c] mb-1">4 Pillars</div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Deck Structural Check</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#0b132b]/40 border border-slate-800">
            <div className="text-3xl sm:text-4xl font-black text-emerald-400 mb-1">2 Questions</div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Investor Q&A Challenge</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#0b132b]/40 border border-slate-800">
            <div className="text-3xl sm:text-4xl font-black text-[#f49f1c] mb-1">100%</div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Verbatim Accent Accuracy</div>
          </div>
        </div>
      </section>

      {/* KIOSK FEATURES GRID */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-[#10b981] mb-2">
            State-Of-The-Art Evaluation Engine
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white">
            Designed to Polish Student Founders into Investor-Ready Pitchers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-[#0b132b] p-6 rounded-3xl border border-slate-800 hover:border-[#10b981]/50 transition duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
                <Mic size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Multi-Accent Mic Capture</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Highly sensitive voice recognition calibrated to recognize any accent or fluency level without auto-correction or word swapping.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-emerald-400 font-semibold">
              <span>Verbatim Transcripts</span>
              <CheckCircle2 size={16} />
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#0b132b] p-6 rounded-3xl border border-slate-800 hover:border-[#f49f1c]/50 transition duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#f49f1c] mb-5 group-hover:scale-110 transition-transform">
                <BarChart3 size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">4-Pillar Viability Index</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Evaluates Problem Statement, Target Market Size, Monetization Model, and Moat/Competitive Advantage with instant 0-100% scoring.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-[#f49f1c] font-semibold">
              <span>Instant Scorecard</span>
              <CheckCircle2 size={16} />
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-[#0b132b] p-6 rounded-3xl border border-slate-800 hover:border-[#10b981]/50 transition duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
                <HelpCircle size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">VC Cross-Examination</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Simulates tough Angel Investor cross-examination with 2 custom follow-up questions challenging your startup metrics.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-emerald-400 font-semibold">
              <span>Investor Q&A Simulation</span>
              <CheckCircle2 size={16} />
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-[#0b132b] p-6 rounded-3xl border border-slate-800 hover:border-[#f49f1c]/50 transition duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#f49f1c] mb-5 group-hover:scale-110 transition-transform">
                <Award size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">EIC Scorecard & Print</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Export and print your structured pitch scorecard complete with clarity ratings, missing elements, and tactical improvement tips.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-[#f49f1c] font-semibold">
              <span>Printable Report</span>
              <CheckCircle2 size={16} />
            </div>
          </div>
        </div>
      </section>

      {/* STEP BY STEP WORKFLOW */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-[#f49f1c] mb-2">
            Simple 4-Step Process
          </h2>
          <p className="text-3xl font-extrabold text-white">How the AI Pitch Kiosk Works</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[#0b132b]/60 border border-slate-800 rounded-2xl p-6 relative">
            <div className="text-3xl font-black text-emerald-500/30 mb-2">01</div>
            <h4 className="text-base font-bold text-white mb-1">Enter Startup Info</h4>
            <p className="text-xs text-slate-400">Input founder name, startup name, sector, and choose 90s or 120s duration.</p>
          </div>

          <div className="bg-[#0b132b]/60 border border-slate-800 rounded-2xl p-6 relative">
            <div className="text-3xl font-black text-emerald-500/30 mb-2">02</div>
            <h4 className="text-base font-bold text-white mb-1">Deliver Your Pitch</h4>
            <p className="text-xs text-slate-400">Speak into the microphone. High-sensitivity capture streams your exact words live.</p>
          </div>

          <div className="bg-[#0b132b]/60 border border-slate-800 rounded-2xl p-6 relative">
            <div className="text-3xl font-black text-emerald-500/30 mb-2">03</div>
            <h4 className="text-base font-bold text-white mb-1">Review Viability Score</h4>
            <p className="text-xs text-slate-400">Analyze your 4-Pillar deck breakdown, missing elements, and clarity rating.</p>
          </div>

          <div className="bg-[#0b132b]/60 border border-slate-800 rounded-2xl p-6 relative">
            <div className="text-3xl font-black text-[#f49f1c]/30 mb-2">04</div>
            <h4 className="text-base font-bold text-white mb-1">Answer VC Follow-Ups</h4>
            <p className="text-xs text-slate-400">Respond to 2 tough cross-examination questions and receive tactical pitch coaching.</p>
          </div>
        </div>
      </section>

      {/* FINAL CTA FOOTER BANNER */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="bg-gradient-to-r from-[#163b2c] via-[#0b132b] to-[#1e4635] rounded-3xl p-8 sm:p-12 border border-[#10b981]/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#10b981]/10 rounded-full blur-2xl pointer-events-none"></div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to Test Your Startup Pitch?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto mb-8">
            Experience the official EIC PEC Chandigarh AI Pitch Kiosk and sharpen your elevator pitch in minutes.
          </p>
          <Link
            to="/kiosk"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#10b981] to-[#059669] text-slate-950 font-extrabold text-base sm:text-lg shadow-lg hover:scale-105 transition-transform cursor-pointer"
          >
            <Rocket size={20} />
            <span>Enter Pitch Kiosk Dashboard</span>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 py-8 px-4 text-center text-xs text-slate-500">
        <p>© 2026 Entrepreneurship & Incubation Cell (EIC) • Punjab Engineering College (PEC), Chandigarh</p>
      </footer>
    </div>
  );
}
