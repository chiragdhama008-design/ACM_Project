import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./Header";
import WelcomeLanding from "./pages/WelcomeLanding";
import PersonaQuiz from "./pages/PersonaQuiz";
import Leaderboard from "./pages/Leaderboard";

function App() {
  return (
    <BrowserRouter>
      <Header />
      <main className="min-h-[calc(100vh-80px)] bg-[#030712]">
        <Routes>
          {/* PEC ACM Student Chapter Routes */}
          <Route path="/" element={<WelcomeLanding />} />
          <Route path="/quiz" element={<PersonaQuiz />} />
          <Route path="/leaderboard" element={<Leaderboard />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
