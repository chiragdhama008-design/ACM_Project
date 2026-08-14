import React from "react";

export default function AcmLogo({ size = "md", className = "", showText = true }) {
  // Dimension mapping
  const sizeMap = {
    xs: { box: "w-6 h-6", text: "text-[10px]", ring: "w-4 h-4", label: "text-xs" },
    sm: { box: "w-8 h-8", text: "text-xs", ring: "w-6 h-6", label: "text-sm" },
    md: { box: "w-11 h-11", text: "text-sm", ring: "w-8 h-8", label: "text-base" },
    lg: { box: "w-16 h-16", text: "text-xl", ring: "w-12 h-12", label: "text-xl" },
    xl: { box: "w-24 h-24", text: "text-3xl", ring: "w-18 h-18", label: "text-2xl" },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* PEC ACM Diamond Logo Icon */}
      <div className="relative group shrink-0">
        {/* Neon Glow Aura */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#0084FF] via-[#00F0FF] to-[#7000FF] rounded-xl blur-md opacity-70 group-hover:opacity-100 group-hover:blur-lg transition-all duration-300 animate-pulse"></div>

        {/* Diamond Outer Shape */}
        <div className={`relative ${currentSize.box} bg-gradient-to-br from-[#0084FF] via-[#0066FF] to-[#0040D0] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/40 transform rotate-45 border border-cyan-300/40 overflow-hidden`}>
          
          {/* Subtle inner reflection */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none"></div>

          {/* Inner White Circle & ACM Text (Un-rotated) */}
          <div className="transform -rotate-45 flex items-center justify-center">
            <div className={`${currentSize.ring} rounded-full border-2 border-white flex items-center justify-center shadow-inner`}>
              <span className={`font-black text-white tracking-tighter lowercase ${currentSize.text} leading-none font-sans select-none drop-shadow`}>
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
            <span className={`font-black tracking-tight text-white ${currentSize.label} drop-shadow-md flex items-center gap-1.5`}>
              PEC ACM
              <span className="text-[#00F0FF] font-extrabold text-[10px] sm:text-xs bg-[#0084FF]/20 px-2 py-0.5 rounded-md border border-[#0084FF]/40 tracking-wider">
                CSS
              </span>
            </span>
          </div>
          <span className="text-[10px] sm:text-xs text-blue-200/80 font-medium tracking-wide">
            Computing Student Society • PEC
          </span>
        </div>
      )}
    </div>
  );
}
