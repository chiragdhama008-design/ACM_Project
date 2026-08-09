import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./supabaseClient.js";
import Header from "./Header";
import Onboarding from "./pages/Onboarding"; // 🆕 Import Onboarding Page
import InterviewInstructions from "./pages/InterviewInstructions";
import InterviewRoom from "./pages/InterviewRoom";

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-semibold">
        Loading Assessment Portal...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Header session={session} loading={loading} />
      <main className="min-h-[calc(100vh-64px)] bg-slate-950">
        <Routes>
          {/* If authenticated, route through Onboarding input gate first */}
          <Route
            path="/"
            element={session ? <Navigate to="/onboarding" replace /> : (
              <div className="flex flex-col items-center justify-center text-center p-8 text-white min-h-[70vh]">
                <h1 className="text-4xl font-extrabold tracking-tight max-w-xl">
                  Company Automated Screening Portal
                </h1>
                <p className="text-slate-400 mt-4 max-w-md">
                  Please use the Sign In option above with your registered Google Account to start your interview evaluation.
                </p>
              </div>
            )}
          />
          <Route
            path="/onboarding"
            element={session ? <Onboarding /> : <Navigate to="/" replace />}
          />
          <Route
            path="/instructions"
            element={session ? <InterviewInstructions currentUserSession={session} /> : <Navigate to="/" replace />}
          />
          <Route
            path="/room"
            element={session ? <InterviewRoom currentUserSession={session} /> : <Navigate to="/" replace />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
