import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CyberParticles from "../components/CyberParticles";
import AcmLogo from "../components/AcmLogo";
import { supabase } from "../supabaseClient";
import { audioEngine } from "../utils/audioSynth";
import {
  Trophy,
  Search,
  Filter,
  GraduationCap,
  Sparkles,
  Mic,
  Code,
  Brain,
  Terminal,
  RefreshCw,
  Award
} from "lucide-react";

export default function Leaderboard() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedWing, setSelectedWing] = useState("all");

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    let localData = [];

    // Fetch from localStorage fallback
    try {
      localData = JSON.parse(localStorage.getItem("PEC_ACM_SUBMISSIONS") || "[]");
    } catch (e) {}

    // Fetch from Supabase if active
    try {
      const { data, error } = await supabase
        .from("pec_acm_responses")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        setSubmissions(data);
      } else {
        setSubmissions(localData);
      }
    } catch (err) {
      setSubmissions(localData);
    } finally {
      setLoading(false);
    }
  };

  const filtered = submissions.filter((item) => {
    const matchesSearch =
      (item.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.branch || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.persona_title || "").toLowerCase().includes(search.toLowerCase());

    const matchesWing = selectedWing === "all" || item.recommended_wing === selectedWing;

    return matchesSearch && matchesWing;
  });

  return (
    <div className="relative min-h-screen bg-[#030712] text-white font-sans overflow-hidden py-10 px-4 sm:px-6 lg:px-8">
      <CyberParticles />

      <div className="relative z-10 max-w-6xl mx-auto text-left">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Trophy size={14} className="text-yellow-400" />
              <span>FRESHER PERSONA GALLERY • PEC CHANDIGARH</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white">
              PEC Tech Persona Leaderboard
            </h1>
          </div>

          <Link
            to="/quiz"
            onClick={() => audioEngine.playClick()}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#0075FF] to-[#00F0FF] text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition shrink-0 cursor-pointer"
          >
            <Mic size={16} />
            <span>Generate My Persona</span>
          </Link>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 bg-[#08122c]/90 p-4 rounded-2xl border border-blue-500/30 backdrop-blur-md">
          {/* Search Input */}
          <div className="sm:col-span-2 relative">
            <Search size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by candidate name, branch, or persona title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#04091a] border border-blue-900/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-medium"
            />
          </div>

          {/* Wing Filter */}
          <div className="relative">
            <select
              value={selectedWing}
              onChange={(e) => setSelectedWing(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#04091a] border border-blue-900/60 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 font-semibold"
            >
              <option value="all">All Wings (Dev, ML, CP, CyberSec)</option>
              <option value="ACM-Dev">ACM-Dev (Development)</option>
              <option value="ACM-ML">ACM-ML (Machine Learning)</option>
              <option value="ACM-CP">ACM-CP (Competitive Coding)</option>
              <option value="ACM-CyberSec">ACM-CyberSec (Cybersecurity)</option>
            </select>
          </div>
        </div>

        {/* Submissions Cards Grid */}
        {loading ? (
          <div className="text-center py-20 text-cyan-300 flex items-center justify-center gap-3">
            <RefreshCw size={24} className="animate-spin" />
            <span className="font-bold">Loading Fresher Personas...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-[#08122c]/80 border border-slate-800 rounded-3xl p-12 text-center">
            <Trophy size={48} className="mx-auto text-slate-600 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No Persona Cards Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
              Be the first fresher to answer the 2 scenario questions and claim your title!
            </p>
            <Link
              to="/quiz"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center gap-2"
            >
              <Sparkles size={14} /> Start Quiz Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item, idx) => (
              <div
                key={item.id || idx}
                className="bg-[#070e24] rounded-3xl p-6 border border-blue-500/30 hover:border-cyan-400 transition-all duration-300 hover:-translate-y-1 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-extrabold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 px-2.5 py-0.5 rounded-full">
                      {item.recommended_wing || "ACM-Dev"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString() : "Recent"}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-white mb-1">
                    {item.name}
                  </h3>
                  <p className="text-xs font-semibold text-cyan-300 flex items-center gap-1 mb-4">
                    <GraduationCap size={14} /> {item.branch}
                  </p>

                  <div className="bg-[#0b183b] p-3 rounded-2xl border border-blue-500/30 mb-4">
                    <span className="text-[9px] font-black uppercase text-yellow-400 tracking-wider block mb-0.5">
                      👑 Persona Title
                    </span>
                    <div className="text-sm font-black text-white">
                      "{item.persona_title}"
                    </div>
                  </div>
                </div>

                {/* Score Indicators */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-blue-900/60 text-center text-[10px]">
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-blue-900/40">
                    <span className="text-blue-400 block font-bold">CP</span>
                    <span className="font-black text-white">{item.cp_score || 85}%</span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-purple-900/40">
                    <span className="text-purple-400 block font-bold">AI</span>
                    <span className="font-black text-white">{item.ai_score || 88}%</span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-xl border border-cyan-900/40">
                    <span className="text-cyan-400 block font-bold">Dev</span>
                    <span className="font-black text-white">{item.dev_score || 90}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
