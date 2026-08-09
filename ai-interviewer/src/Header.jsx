import React from "react";
import { supabase } from "./supabaseClient";

const Header = ({ session, loading }) => {
  
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Authentication Error:", error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="w-full font-sans select-none">
      {/* 1. Informational Alert Banner (Sleek dark gold banner matching dark mode) */}
      {!session && (
        <div className="bg-[#1e1b10] border-b border-amber-500/20 py-2 px-4 text-center text-[11px] font-medium text-amber-400 flex items-center justify-center space-x-2">
          <span></span>
          <span>
            
          </span>
        </div>
      )}

      {/* 2. Main Action Header Navbar (Matching the dark theme background) */}
      <header className="bg-[#0b0f19] border-b border-slate-800/80 h-16 px-8 flex items-center justify-between">
        {/* Brand Logo and Title */}
        <div className="flex items-center space-x-3">
          <span className="text-xl"></span>
          <span className="font-semibold text-white text-base tracking-normal">
            
          </span>
        </div>

        {/* Auth Actions on the Right */}
        <div>
          {loading ? (
            <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          ) : session ? (
            <div className="flex items-center space-x-4">
              <div className="flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-100">
                  {session.user.user_metadata.full_name || "Authorized User"}
                </span>
                <span className="text-[10px] font-medium text-slate-400">
                  {session.user.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs font-semibold text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-950/80 border border-red-900/30 px-3.5 py-1.5 rounded-lg transition-all duration-200 cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            /* Custom Styled Google Authentication Button matching the main theme */
            <button
              onClick={handleGoogleLogin}
              className="flex items-center space-x-2.5 py-2 px-4 border border-slate-700/80 rounded-xl shadow-sm bg-[#121826] hover:bg-[#1a2133] hover:border-slate-600 text-slate-200 font-medium text-xs transition-all duration-200 cursor-pointer"
            >
              {/* Clean Google Vector SVG Icon */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Sign in with Google</span>
            </button>
          )}
        </div>
      </header>
    </div>
  );
};

export default Header;
