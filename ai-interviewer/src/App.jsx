import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./supabaseClient.js";
import Header from "./Header";
import PitchKiosk from "./pages/PitchKiosk";
import Onboarding from "./pages/Onboarding";
import InterviewInstructions from "./pages/InterviewInstructions";
import InterviewRoom from "./pages/InterviewRoom";

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <Header session={session} loading={loading} />
      <main className="min-h-[calc(100vh-80px)] bg-[#060b18]">
        <Routes>
          {/* EIC PEC Chandigarh: AI Pitch Practice Kiosk Default Routes */}
          <Route path="/" element={<PitchKiosk />} />
          <Route path="/kiosk" element={<PitchKiosk />} />

          {/* Candidate Screening Routes */}
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/instructions" element={<InterviewInstructions currentUserSession={session} />} />
          <Route path="/room" element={<InterviewRoom currentUserSession={session} />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;

