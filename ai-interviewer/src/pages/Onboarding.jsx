import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Phone, ArrowRight } from "lucide-react";

export default function Onboarding() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      alert("Please fill in all details before proceeding.");
      return;
    }
    
    // Save details to sessionStorage so they persist when moving into the interview room
    sessionStorage.setItem("candidate_name", fullName.trim());
    sessionStorage.setItem("candidate_phone", phone.trim());

    // Proceed cleanly to the instructions page
    navigate("/instructions");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-black tracking-tight">Complete Your Profile</h1>
          <p className="text-slate-400 text-sm mt-1">Please provide your contact details to begin the screening phase.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-slate-500" size={18} />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none transition text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Contact Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-3.5 text-slate-500" size={18} />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none transition text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3.5 mt-2 bg-gradient-to-r from-purple-600 to-indigo-500 font-bold rounded-xl shadow-lg hover:opacity-95 transition text-sm"
          >
            Save & Continue <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
