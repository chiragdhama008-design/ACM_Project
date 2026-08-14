import React from "react";

export default function AcmLogo({ size = "md", className = "", showText = true }) {
  // Dimension mapping
  const sizeMap = {
    xs: { box: "w-6 h-6", text: "text-[10px]", ring: "w-4 h-4", label: "text-xs" },
    sm: { box: "w-8 h-8", text: "text-xs", ring: "w-6 h-6", label: "text-sm" },
    md: { box: "w-11 h-11", text: "text-sm", ring: "w-8.5 h-8.5", label: "text-base" },
    lg: { box: "w-16 h-16", text: "text-xl", ring: "w-12 h-12", label: "text-xl" },
    xl: { box: "w-24 h-24", text: "text-3xl", ring: "w-18 h-18", label: "text-2xl" },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center gap-3.5 ${className}`}>
      {/* PEC ACM Diamond Logo Icon */}
      <div className="relative group shrink-0">
        {/* Dynamic Glowing Halo */}
        <div className="absolute -inset-1.5 bg-gradient-to-r from-[#0084FF] via-[#00F0FF] to-[#7000FF] rounded-2xl blur-lg opacity-80 group-hover:opacity-100 group-hover:blur-xl transition-all duration-300 animate-pulse"></div>

        {/* Outer Rotating Cyber Border Ring */}
        <div className="absolute -inset-1 rounded-2xl border border-cyan-400/40 opacity-50 group-hover:rotate-180 transition-transform duration-700 pointer-events-none"></div>

        {/* Diamond Outer Shape */}
        <div className={`relative ${currentSize.box} bg-gradient-to-br from-[#0084FF] via-[#0066FF] to-[#0038B8] rounded-xl flex items-center justify-center shadow-xl shadow-blue-500/50 transform rotate-45 border border-cyan-200/50 overflow-hidden`}>
          
          {/* Inner Light Flare Reflection */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent pointer-events-none"></div>

          {/* Inner White Circle & ACM Text (Un-rotated) */}
          <div className="transform -rotate-45 flex items-center justify-center">
            <div className={`${currentSize.ring} rounded-full border-[2.5px] border-white flex items-center justify-center shadow-inner`}>
              <span className={`font-black text-white tracking-tighter lowercase ${currentSize.text} leading-none font-sans select-none drop-shadow-md`}>
                acm
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* PEC ACM Brand Text */}
      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2">
            <span className={`font-black tracking-tight text-white ${currentSize.label} drop-shadow-lg flex items-center gap-1.5`}>
              PEC ACM
              <span className="text-[#00F0FF] font-extrabold text-[10px] sm:text-xs bg-[#0084FF]/25 px-2 py-0.5 rounded-md border border-[#0084FF]/50 tracking-wider shadow-sm">
                CSS
              </span>
            </span>
          </div>
          <span className="text-[10px] sm:text-xs text-blue-200/90 font-medium tracking-wide">
            Computing Student Society • PEC
          </span>
        </div>
      )}
    </div>
  );
}
