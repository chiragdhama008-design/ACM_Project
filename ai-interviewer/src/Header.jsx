import React from "react";
import { Link } from "react-router-dom";
import AcmLogo from "./components/AcmLogo";

export default function Header() {
  return (
    <div className="w-full font-sans select-none border-b border-blue-500/20 bg-[#020612]/90 backdrop-blur-xl sticky top-0 z-40">
      <header className="max-w-7xl mx-auto py-3.5 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        
        {/* PEC ACM Logo (Click goes to home) */}
        <Link to="/" className="flex items-center gap-3 group cursor-pointer">
          <AcmLogo size="md" showText={true} />
        </Link>

      </header>
    </div>
  );
}
