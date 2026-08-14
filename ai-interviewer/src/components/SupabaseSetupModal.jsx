import React, { useState, useEffect } from "react";
import { Database, Copy, Check, ShieldCheck, Key, Server, Sparkles, X, Terminal, ExternalLink } from "lucide-react";

export default function SupabaseSetupModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [anonKey, setAnonKey] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const storedUrl = localStorage.getItem("PEC_ACM_SUPABASE_URL") || import.meta.env.VITE_SUPABASE_URL || "";
    const storedKey = localStorage.getItem("PEC_ACM_SUPABASE_KEY") || import.meta.env.VITE_SUPABASE_ANON_KEY || "";
    setSupabaseUrl(storedUrl);
    setAnonKey(storedKey);
  }, [isOpen]);

  if (!isOpen) return null;

  const sqlScript = `-- 1. Create public responses table (No Signup required!)
CREATE TABLE IF NOT EXISTS pec_acm_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  branch TEXT NOT NULL,
  answer1 TEXT,
  answer2 TEXT,
  persona_title TEXT,
  recommended_wing TEXT,
  cp_score INT,
  ai_score INT,
  dev_score INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE pec_acm_responses ENABLE ROW LEVEL SECURITY;

-- 3. Allow anonymous public insertion (freshers submit without login)
CREATE POLICY "Allow anonymous inserts" 
ON pec_acm_responses FOR INSERT 
WITH CHECK (true);

-- 4. Allow public reading of leaderboard/personas
CREATE POLICY "Allow public reads" 
ON pec_acm_responses FOR SELECT 
USING (true);`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveKeys = (e) => {
    e.preventDefault();
    localStorage.setItem("PEC_ACM_SUPABASE_URL", supabaseUrl.trim());
    localStorage.setItem("PEC_ACM_SUPABASE_KEY", anonKey.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#091024] border border-blue-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-white max-h-[90vh] overflow-y-auto">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition"
        >
          <X size={20} />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-blue-500/20 border border-blue-400/30 text-cyan-400">
            <Database size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Supabase Setup Guide
              <span className="text-xs font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                No Signup Needed
              </span>
            </h2>
            <p className="text-xs text-blue-200/70">
              Freshers only provide Name & Branch. Here is how to create the table in Supabase!
            </p>
          </div>
        </div>

        {/* Workflow steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#0b1633] p-4 rounded-2xl border border-blue-900/50">
            <div className="text-cyan-400 font-extrabold text-xs uppercase mb-1 flex items-center gap-1.5">
              <Server size={14} /> Step 1: Create Table
            </div>
            <p className="text-[11px] text-slate-300">
              Run the SQL script below in your Supabase SQL Editor.
            </p>
          </div>

          <div className="bg-[#0b1633] p-4 rounded-2xl border border-blue-900/50">
            <div className="text-emerald-400 font-extrabold text-xs uppercase mb-1 flex items-center gap-1.5">
              <ShieldCheck size={14} /> Step 2: Public RLS
            </div>
            <p className="text-[11px] text-slate-300">
              Allow anonymous inserts so users don't need any email/password login.
            </p>
          </div>

          <div className="bg-[#0b1633] p-4 rounded-2xl border border-blue-900/50">
            <div className="text-purple-400 font-extrabold text-xs uppercase mb-1 flex items-center gap-1.5">
              <Key size={14} /> Step 3: Paste Keys
            </div>
            <p className="text-[11px] text-slate-300">
              Paste your Supabase URL & Anon key below or add them to <code className="text-cyan-300">.env</code>.
            </p>
          </div>
        </div>

        {/* SQL Script Box */}
        <div className="mb-6">
          <div className="flex items-center justify-between bg-slate-900/90 px-4 py-2 rounded-t-2xl border border-slate-800 text-xs font-mono text-slate-300">
            <span className="flex items-center gap-2">
              <Terminal size={14} className="text-blue-400" /> Supabase SQL Editor Code
            </span>
            <button
              onClick={copySql}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-sans font-bold text-xs transition"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? "Copied SQL!" : "Copy SQL Script"}</span>
            </button>
          </div>
          <pre className="p-4 bg-[#050a18] border border-t-0 border-slate-800 rounded-b-2xl text-[11px] font-mono text-cyan-300/90 overflow-x-auto leading-relaxed max-h-48">
            {sqlScript}
          </pre>
        </div>

        {/* Interactive Key Input */}
        <form onSubmit={handleSaveKeys} className="bg-[#0b1633] p-5 rounded-2xl border border-blue-500/30">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Sparkles size={16} className="text-cyan-400" />
            Live Supabase Credentials Config (Saved Locally)
          </h3>

          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                placeholder="https://your-project.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full px-3 py-2 bg-[#050a18] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                Supabase Anon Key
              </label>
              <input
                type="password"
                placeholder="eyJhY... (anon key)"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                className="w-full px-3 py-2 bg-[#050a18] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-400 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Open Supabase Dashboard</span>
              <ExternalLink size={12} />
            </a>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 hover:scale-105 text-white font-bold text-xs shadow-lg shadow-blue-500/30 transition cursor-pointer"
            >
              {savedSuccess ? "Saved Successfully!" : "Save Credentials"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
