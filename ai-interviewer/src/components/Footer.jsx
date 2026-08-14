import React from "react";
import AcmLogo from "./AcmLogo";

const Footer = () => (
  <footer className="border-t border-blue-900/40 bg-[#02050e] py-10 px-4 text-center text-xs text-slate-400 space-y-3 relative z-10">
    <div className="flex items-center justify-center mb-2">
      <AcmLogo size="sm" showText={true} />
    </div>
    <p className="font-semibold text-slate-300">
      PEC ACM Student Chapter • <span className="text-[#00F0FF] font-extrabold">Computing Student Society (PEC ACM - CSS)</span>
    </p>
    <p className="text-slate-500 text-[11px]">
      © 2026 Punjab Engineering College (PEC), Sector 12, Chandigarh. All Rights Reserved.
    </p>
  </footer>
);

export default Footer;
