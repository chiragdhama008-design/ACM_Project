import React from "react";
import { ACM_HEADS, ACM_LEADS } from "../data/teamData";
import {
  Crown,
  Terminal,
  Brain,
  Code,
  Share2,
  Users,
  Layers,
  Megaphone,
  Sparkles,
  ShieldCheck,
  Award
} from "lucide-react";

export default function AcmTeamSection() {
  const getIcon = (iconName) => {
    switch (iconName) {
      case "Terminal": return <Terminal size={16} />;
      case "Brain": return <Brain size={16} />;
      case "Code": return <Code size={16} />;
      case "Share2": return <Share2 size={16} />;
      case "Users": return <Users size={16} />;
      case "Layers": return <Layers size={16} />;
      case "Megaphone": return <Megaphone size={16} />;
      case "Sparkles": return <Sparkles size={16} />;
      case "ShieldCheck": return <ShieldCheck size={16} />;
      default: return <Award size={16} />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-10 text-left">
      <div className="bg-[#050b1e]/90 border border-blue-900/50 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-blue-900/50 pb-5 mb-8 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-950/80 border border-blue-600/30 text-blue-300">
              <Crown size={22} />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-blue-300/80">
                PEC ACM Student Chapter • CSS
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Executive Heads & Domain Leads
              </h3>
            </div>
          </div>
          <span className="text-[11px] font-mono bg-blue-950/60 border border-blue-800/40 text-blue-300 px-3 py-1 rounded-full w-fit">
            Academic Session 2025-26
          </span>
        </div>

        {/* 1. EXECUTIVE HEADS */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
              Executive Heads
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {ACM_HEADS.map((head, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl bg-[#08122c]/80 border ${head.color.includes('border') ? head.color.split(' ')[1] : 'border-blue-900/40'} hover:border-blue-500/60 transition-all flex flex-col justify-between`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-sm font-bold text-white tracking-tight">
                    {head.name}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-950/80 text-blue-300 border border-blue-800/30 shrink-0">
                    {head.tag}
                  </span>
                </div>
                <div className="text-xs font-semibold text-blue-200/90 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  <span>{head.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. DOMAIN LEADS */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
              Domain Leads
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {ACM_LEADS.map((lead, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#08122c]/60 border border-blue-900/30 hover:border-blue-700/50 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-blue-950/90 border border-blue-800/40 text-blue-300">
                    {getIcon(lead.icon)}
                  </div>
                  <span className="text-xs font-bold text-slate-200">
                    {lead.domain}
                  </span>
                </div>
                <div className="space-y-1 pl-1">
                  {lead.names.map((n, i) => (
                    <div key={i} className="text-xs text-blue-100/90 font-medium flex items-center gap-1.5">
                      <span className="text-blue-400/70 text-[10px]">▸</span>
                      <span>{n}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
