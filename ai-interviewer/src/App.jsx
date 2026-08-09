import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./supabaseClient.js";
import Header from "./Header";
import WelcomeLanding from "./pages/WelcomeLanding";
import PitchKiosk from "./pages/PitchKiosk";

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
          {/* EIC PEC Chandigarh: Welcome Landing & Pitch Kiosk Routes */}
          <Route path="/" element={<WelcomeLanding />} />
          <Route path="/kiosk" element={<PitchKiosk />} />
          <Route path="/dashboard" element={<PitchKiosk />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}


export default App;

