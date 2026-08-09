import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { Brain, Clock, Play, Loader2, PenLine } from "lucide-react";
import { API_URL } from "../config/api.js";

export default function Interviews() {
  const navigate = useNavigate();

  const [domain, setDomain] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);

  const domains = ["DSA", "Web Dev", "DBMS", "OS", "OOP", "CN"];
  const difficulties = ["Easy", "Medium", "Hard"];
  const durations = ["15 Min", "30 Min", "45 Min"];

  // 🔑 A typed custom subject always wins over a clicked domain button —
  // picking one clears the other, so there's never ambiguity about
  // which one the interview should actually use.
  const handleSelectDomain = (item) => {
    setDomain(item);
    setCustomSubject("");
  };

  const handleCustomSubjectChange = (e) => {
    const value = e.target.value;
    setCustomSubject(value);
    if (value.trim()) setDomain("");
  };

  // 🔑 This is what actually gets used to generate/label the interview —
  // whichever of the two the user set. NOT pushed back into the `domains`
  // array, so it never clutters this picker for future sessions; it just
  // rides along in this one interview's state and surfaces later wherever
  // topic/domain is displayed (e.g. the Dashboard).
  const effectiveDomain = customSubject.trim() || domain;
  const isCustomSubject = !!customSubject.trim();

  const handleStartInterview = async () => {
    if (!effectiveDomain || !difficulty || !duration) {
      alert("Please select all interview settings.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/interview/generate-topic-multi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: effectiveDomain, difficulty, duration })
      });

      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "Failed to generate track questions.");

      // 🔑 Route through the instructions page first, not straight to
      // /room. It forwards this exact state on to InterviewRoom once the
      // candidate confirms they're ready.
      navigate("/instructions", {
        state: {
          domain: effectiveDomain,
          difficulty,
          duration,
          customQuestions: data.questions,
          isResumeInterview: false,
          topic: effectiveDomain,
          isCustomSubject
        },
      });
    } catch (err) {
      console.error(err);
      alert("Error starting AI Interview session: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar />

      <div className="flex-1 p-8">
        <div>
          <h1 className="text-4xl font-bold">Interview Center</h1>
          <p className="text-slate-400 mt-2">Configure your interview and start practicing.</p>
        </div>

        <div className="mt-8 bg-slate-900 border border-slate-800 rounded-3xl p-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Brain className="text-purple-400" />
              <h2 className="text-2xl font-semibold">Choose Domain</h2>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {domains.map((item) => (
                <button
                  key={item}
                  disabled={loading}
                  onClick={() => handleSelectDomain(item)}
                  className={`p-4 rounded-2xl border transition-all duration-300 ${
                    domain === item && !isCustomSubject
                      ? "bg-purple-600 border-purple-500 shadow-lg shadow-purple-900/40"
                      : "bg-slate-950 border-slate-700 hover:border-purple-500"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* 🆕 Custom subject input — for anyone whose branch/subject
                isn't in the list above (e.g. Thermodynamics, Circuit
                Design, Structural Analysis). Not added to the grid above,
                so the picker stays clean for everyone else. */}
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <PenLine size={18} className="text-slate-400" />
                <span className="text-sm font-semibold text-slate-300">
                  Type your own subject instead
                </span>
              </div>
              <input
                type="text"
                value={customSubject}
                onChange={handleCustomSubjectChange}
                disabled={loading}
                placeholder="e.g. Thermodynamics, Structural Analysis, Circuit Design..."
                className={`w-full px-5 py-3 rounded-xl bg-slate-950 border outline-none text-white placeholder-slate-600 transition-all duration-300 ${
                  isCustomSubject
                    ? "border-purple-500 shadow-lg shadow-purple-900/40"
                    : "border-slate-700 focus:border-purple-500"
                }`}
              />
            </div>
          </div>

          <div className="mt-10">
            <h2 className="text-2xl font-semibold mb-4">Difficulty</h2>
            <div className="flex gap-4">
              {difficulties.map((item) => (
                <button
                  key={item}
                  disabled={loading}
                  onClick={() => setDifficulty(item)}
                  className={`px-6 py-3 rounded-xl border transition-all duration-300 ${
                    difficulty === item
                      ? "bg-cyan-600 border-cyan-500 shadow-lg shadow-cyan-900/40"
                      : "border-slate-700 hover:border-cyan-500"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="text-cyan-400" />
              <h2 className="text-2xl font-semibold">Duration</h2>
            </div>

            <div className="flex gap-4">
              {durations.map((item) => (
                <button
                  key={item}
                  disabled={loading}
                  onClick={() => setDuration(item)}
                  className={`px-6 py-3 rounded-xl border transition-all duration-300 ${
                    duration === item
                      ? "bg-purple-600 border-purple-500 shadow-lg shadow-purple-900/40"
                      : "border-slate-700 hover:border-purple-500"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10 bg-slate-950 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-4">Interview Summary</h3>
            <p className="text-slate-300">
              Domain: <span className="text-purple-400">{effectiveDomain || "Not Selected"}</span>
              {isCustomSubject && (
                <span className="ml-2 text-xs bg-purple-500/10 text-purple-300 px-2 py-1 rounded-full border border-purple-500/20 uppercase tracking-wider">
                  Custom
                </span>
              )}
            </p>
            <p className="text-slate-300 mt-2">Difficulty: <span className="text-cyan-400">{difficulty || "Not Selected"}</span></p>
            <p className="text-slate-300 mt-2">Duration: <span className="text-purple-400">{duration || "Not Selected"}</span></p>
          </div>

          <button
            onClick={handleStartInterview}
            disabled={loading}
            className="mt-8 flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:scale-105 transition font-semibold disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Generating Questions...
              </>
            ) : (
              <>
                <Play size={20} />
                Start Interview
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
