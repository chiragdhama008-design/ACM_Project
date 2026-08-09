import React from "react";
import { Link, useLocation } from "react-router-dom";
import eicLogo from "./assets/eic_logo.png";
import { Mic, ShieldCheck, Flame, Sparkles } from "lucide-react";

const Header = ({ session, loading }) => {
  const location = useLocation();
  const isKioskPath = location.pathname === "/" || location.pathname === "/kiosk";

  return (
    <div className="w-full font-sans select-none border-b border-[#1e4635]/60 bg-[#060b18]">
      {/* 1. Top EIC Announcement Bar */}
      <div className="bg-gradient-to-r from-[#163b2c] via-[#060b18] to-[#1e4635] py-2 px-4 border-b border-[#10b981]/30 text-center text-xs font-semibold text-emerald-300 flex items-center justify-center space-x-2">
        <span className="flex items-center gap-1 bg-[#f49f1c]/20 text-[#f49f1c] px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-[#f49f1c]/40">
          <Flame size={12} className="animate-pulse" /> E-Summit Active
        </span>
        <span>Entrepreneurship & Incubation Cell (EIC) PEC Chandigarh — AI Pitch Practice Kiosk Enabled</span>
      </div>

      {/* 2. Main Navigation Header */}
      <header className="max-w-7xl mx-auto h-auto py-3 px-4 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand Logo and Title */}
        <Link to="/" className="flex items-center space-x-3 group cursor-pointer">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#10b981] to-[#f49f1c] rounded-full blur opacity-40 group-hover:opacity-80 transition duration-300"></div>
            <img
              src={eicLogo}
              alt="EIC PEC Chandigarh Logo"
              className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-[#10b981] shadow-lg transform group-hover:scale-105 transition duration-200"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-white text-base sm:text-lg tracking-tight group-hover:text-emerald-400 transition">
                EIC PEC CHANDIGARH
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#f49f1c] bg-[#f49f1c]/10 border border-[#f49f1c]/30 px-1.5 py-0.5 rounded">
                Kiosk
              </span>
            </div>
            <span className="text-[10px] sm:text-xs text-slate-400 font-medium">
              Entrepreneurship & Incubation Cell • PEC
            </span>
          </div>
        </Link>

        {/* Navigation Tabs (Responsive on Mobile & Desktop) */}
        <div className="flex items-center space-x-1.5 bg-[#0b132b] p-1 rounded-2xl border border-slate-800 w-full sm:w-auto justify-center">
          <Link
            to="/"
            className={`flex items-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all ${
              location.pathname === "/"
                ? "bg-gradient-to-r from-[#f49f1c] to-[#d97706] text-white shadow-md shadow-amber-950/50"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Sparkles size={14} />
            <span>Welcome</span>
          </Link>
          <Link
            to="/kiosk"
            className={`flex items-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all ${
              location.pathname === "/kiosk" || location.pathname === "/dashboard"
                ? "bg-gradient-to-r from-[#10b981] to-[#059669] text-white shadow-md shadow-emerald-950/50"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Mic size={14} />
            <span>2-Min Pitch Kiosk</span>
          </Link>
        </div>

        {/* Action / Badge */}
        <div className="hidden lg:flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 bg-[#163b2c]/60 border border-[#10b981]/40 px-3 py-1.5 rounded-xl">
            <Sparkles size={14} className="text-[#f49f1c]" />
            <span>E-Summit AI Live</span>
          </div>
        </div>
      </header>
    </div>

  );
};

export default Header;

