import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import CyberParticles from "../components/CyberParticles";
import AcmLogo from "../components/AcmLogo";
import AcmTeamSection from "../components/AcmTeamSection";
import { calculatePersona } from "../utils/personaEngine";
import { generateRandomScenarios } from "../utils/scenarioEngine";
import { triggerConfetti, downloadCardAsImage } from "../utils/canvasHelper";
import { audioEngine } from "../utils/audioSynth";
import { supabase } from "../supabaseClient";
import {
  Mic,
  MicOff,
  Keyboard,
  Sparkles,
  Zap,
  Clock,
  Bot,
  ArrowRight,
  RefreshCw,
  Download,
  Share2,
  CheckCircle2,
  Sliders,
  Code,
  Brain,
  Terminal,
  User,
  GraduationCap,
  Copy,
  Check,
  Building2,
  Bus,
  Lightbulb,
  HelpCircle,
  Award,
  ChevronRight
} from "lucide-react";

export default function PersonaQuiz() {
  // Step State: 'profile' -> 'q1' -> 'q2' -> 'analyzing' -> 'result'
  const [step, setStep] = useState("profile");

  // User Profile
  const [name, setName] = useState("");
  const [branch, setBranch] = useState("Computer Science & Engg (CSE)");
  const [studentType, setStudentType] = useState("Day Scholar");

  // Dynamic AI Generated Scenarios
  const [scenarios, setScenarios] = useState({ q1: "", q2: "" });

  // Answers
  const [answer1, setAnswer1] = useState("");
  const [answer2, setAnswer2] = useState("");

  // Input Mode: 'voice' | 'type'
  const [inputMode, setInputMode] = useState("voice");

  // Mic & Audio State
  const [isListening, setIsListening] = useState(false);
  const [sensitivityGain, setSensitivityGain] = useState(6.0); // Maximum raw sensitivity
  const [audioLevel, setAudioLevel] = useState(0);

  // Results
  const [personaResult, setPersonaResult] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // References for Web Speech & Web Audio
  const recognitionRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const micStreamRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Branch Options
  const branches = [
    "Computer Science & Engg (CSE)",
    "Data Science (DS)",
    "Artificial Intelligence & DA (AI&DA)",
    "Electronics & Comm Engg (ECE)",
    "Electrical Engineering (EE)",
    "Mechanical Engineering (ME)",
    "Civil Engineering (CE)",
    "Materials & Metallurgical (MME)",
    "Production & Industrial (PE)",
  ];

  // Generate dynamic scenarios on mount or retake
  useEffect(() => {
    const generated = generateRandomScenarios();
    setScenarios(generated);
  }, []);

  const currentQuestionText = step === "q1" ? scenarios.q1 : scenarios.q2;

  // Speak AI Question whenever step changes
  useEffect(() => {
    if ((step === "q1" || step === "q2") && currentQuestionText) {
      audioEngine.speakQuestion(currentQuestionText);
    } else {
      audioEngine.stopSpeaking();
    }
  }, [step, scenarios]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopMic();
      audioEngine.stopSpeaking();
    };
  }, []);

  // Initialize Mic & Audio Amplification with RAW AUDIO (NO NOISE SUPPRESSION / NO AUTOCORRECT)
  const startMic = async () => {
    audioEngine.playMicStart();
    setIsListening(true);

    const currentAnswerSetter = step === "q1" ? setAnswer1 : setAnswer2;

    // 1. Web Speech API setup with verbatim capture (no autocorrect)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "en-US";

        rec.onresult = (event) => {
          let transcript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          currentAnswerSetter((prev) => {
            return transcript;
          });
        };

        rec.onerror = (e) => {
          console.warn("Speech recognition error", e);
        };

        rec.onend = () => {
          if (isListening) {
            try { rec.start(); } catch (err) {}
          }
        };

        rec.start();
        recognitionRef.current = rec;
      } catch (err) {
        console.warn("Could not start SpeechRecognition", err);
      }
    } else {
      alert("Web Speech API not supported on this browser. You can type your answer directly!");
      setInputMode("type");
    }

    // 2. RAW Audio Stream: NO Noise Suppression, NO Echo Cancellation, NO Auto Gain
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
        video: false,
      });
      micStreamRef.current = stream;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const gainNode = ctx.createGain();
      gainNode.gain.value = sensitivityGain; // High sensitivity multiplier

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      source.connect(gainNode);
      gainNode.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        setAudioLevel(Math.min(100, Math.floor((avg / 128) * 100 * (sensitivityGain / 2))));
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();
    } catch (err) {
      console.warn("Mic MediaStream error", err);
    }
  };

  const stopMic = () => {
    setIsListening(false);
    setAudioLevel(0);

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      recognitionRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }

    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch (e) {}
      audioCtxRef.current = null;
    }
  };

  const toggleMic = () => {
    if (isListening) {
      stopMic();
    } else {
      startMic();
    }
  };

  // Submit Answer & Move Next
  const handleNextStep = () => {
    stopMic();
    audioEngine.playClick();

    if (step === "profile") {
      if (!name.trim()) {
        alert("Please enter your name to discover your PEC Persona!");
        return;
      }
      setStep("q1");
    } else if (step === "q1") {
      if (!answer1.trim()) {
        alert("Please speak or type your answer for Scenario 1!");
        return;
      }
      setStep("q2");
    } else if (step === "q2") {
      if (!answer2.trim()) {
        alert("Please speak or type your answer for Scenario 2!");
        return;
      }
      setStep("analyzing");

      setTimeout(() => {
        const res = calculatePersona({ 
          name, 
          branch: `${branch} (${studentType})`, 
          answer1, 
          answer2,
          scenario1: scenarios.q1,
          scenario2: scenarios.q2
        });
        setPersonaResult(res);
        setStep("result");
        triggerConfetti();
        audioEngine.playFanfare();
        saveResponseToDatabase(res);
      }, 2500);
    }
  };

  // Save Response to Supabase or LocalStorage
  const saveResponseToDatabase = async (res) => {
    const payload = {
      name: res.name,
      branch: res.branch,
      answer1,
      answer2,
      persona_title: res.personaTitle,
      recommended_wing: res.recommendedWing,
      cp_score: res.cpScore,
      ai_score: res.aiScore,
      dev_score: res.devScore,
      created_at: new Date().toISOString()
    };

    try {
      const existing = JSON.parse(localStorage.getItem("PEC_ACM_SUBMISSIONS") || "[]");
      existing.unshift(payload);
      localStorage.setItem("PEC_ACM_SUBMISSIONS", JSON.stringify(existing));
    } catch (e) {}

    try {
      await supabase.from("pec_acm_responses").insert([payload]);
    } catch (err) {}
  };

  // Dynamic Suggestion Pills based on scenario
  const getPills = (questionText) => {
    const qLower = (questionText || "").toLowerCase();
    if (qLower.includes("ctu") || qLower.includes("traffic") || qLower.includes("door") || qLower.includes("lock") || qLower.includes("scooter")) {
      return [
        "Take electric auto shortcut through Sector 11",
        "Jump balcony or pick lock with hairpin",
        "Email professor saying stuck in traffic",
        "Run 2 km sprint to L-Block hall",
        "Offer CTU bus driver extra samosa"
      ];
    }
    return [
      "Scan mess food quality using AI computer vision",
      "Automate CTU bus seat finder app",
      "Proxy attendance robot for 8 AM classes",
      "Library seat reserved scanner bot",
      "Hostel Wi-Fi auto booster gadget"
    ];
  };

  return (
    <div className="relative min-h-screen bg-[#020612] text-white font-sans overflow-hidden py-10 px-4 sm:px-6 lg:px-8 selection:bg-[#0075FF] selection:text-white">
      <CyberParticles />

      <div className="relative z-10 max-w-4xl mx-auto">
        
        {/* STEP 1: USER PROFILE ENTRY */}
        {step === "profile" && (
          <div className="bg-[#050c21]/95 border border-blue-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl animate-fade-in text-left">
            <div className="flex items-center gap-3.5 mb-6">
              <AcmLogo size="md" showText={false} />
              <div>
                <span className="text-xs font-black uppercase text-cyan-400 tracking-widest">PEC Chandigarh AI Persona Engine</span>
                <h2 className="text-2xl sm:text-3xl font-black text-white">Enter Your Student Details</h2>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-blue-200/80 mb-8">
              No signup or login required! Whether you are a <strong className="text-cyan-300">Day Scholar</strong> or <strong className="text-purple-300">Hosteller</strong>, enter your details to generate your shareable PEC Tech Persona Card & ACM Wing Recommendation.
            </p>

            <div className="space-y-6 mb-8">
              {/* Name Input */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
                  <User size={16} className="text-cyan-400" /> Your Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Aarav Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3.5 bg-[#030818] border border-blue-700/60 focus:border-cyan-400 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none transition font-semibold"
                />
              </div>

              {/* Branch Select */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
                    <GraduationCap size={16} className="text-purple-400" /> Engineering Branch (PEC)
                  </label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full px-4 py-3.5 bg-[#030818] border border-blue-700/60 focus:border-cyan-400 rounded-2xl text-sm text-white focus:outline-none transition font-semibold"
                  >
                    {branches.map((b) => (
                      <option key={b} value={b} className="bg-[#050c21] text-white">
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Day Scholar vs Hosteller Switch */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
                    <Building2 size={16} className="text-cyan-400" /> Campus Status
                  </label>
                  <select
                    value={studentType}
                    onChange={(e) => setStudentType(e.target.value)}
                    className="w-full px-4 py-3.5 bg-[#030818] border border-blue-700/60 focus:border-cyan-400 rounded-2xl text-sm text-white focus:outline-none transition font-semibold"
                  >
                    <option value="Day Scholar" className="bg-[#050c21]">🚌 Day Scholar</option>
                    <option value="Hosteller" className="bg-[#050c21]">🏢 Hosteller</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={handleNextStep}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#0075FF] via-[#00F0FF] to-[#7000FF] hover:scale-[1.01] text-slate-950 font-black text-base flex items-center justify-center gap-3 shadow-xl shadow-blue-500/30 transition cursor-pointer"
            >
              <span>Generate AI Scenarios & Start</span>
              <ArrowRight size={20} />
            </button>
          </div>
        )}

        {/* STEP 2 & 3: DYNAMIC AI GENERATED SCENARIO QUESTIONS */}
        {(step === "q1" || step === "q2") && (
          <div className="bg-[#050c21]/95 border border-blue-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl animate-fade-in text-left">
            
            {/* Header progress */}
            <div className="flex items-center justify-between border-b border-blue-900/60 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl border ${step === "q1" ? "bg-blue-600/20 border-blue-400/40 text-blue-400" : "bg-purple-600/20 border-purple-400/40 text-purple-400"}`}>
                  {step === "q1" ? <Clock size={24} /> : <Bot size={24} />}
                </div>
                <div>
                  <span className="text-xs font-black uppercase text-cyan-400 tracking-wider">
                    {step === "q1" ? "AI Scenario #1 (Randomized)" : "AI Scenario #2 (Randomized)"}
                  </span>
                  <h3 className="text-lg font-black text-white">
                    PEC Campus Survival Challenge
                  </h3>
                </div>
              </div>

              <span className="text-xs font-mono text-slate-400 bg-[#030818] px-3 py-1.5 rounded-full border border-slate-800">
                Candidate: <strong className="text-white">{name}</strong> ({studentType})
              </span>
            </div>

            {/* AI Question Box */}
            <div className="bg-[#030818] border border-cyan-500/30 rounded-2xl p-5 mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-xl pointer-events-none"></div>
              <p className="text-base sm:text-xl font-black text-cyan-200 leading-snug">
                "{currentQuestionText}"
              </p>
            </div>

            {/* Input Mode Switcher (Raw Ultra Sensitive Mic vs Typing) */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-4 bg-[#030818] p-2 rounded-2xl border border-blue-900/60 gap-3">
              <div className="flex items-center space-x-2 w-full sm:w-auto justify-center">
                <button
                  onClick={() => { audioEngine.playClick(); setInputMode("voice"); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                    inputMode === "voice"
                      ? "bg-gradient-to-r from-[#0075FF] to-[#00F0FF] text-slate-950 shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Mic size={16} />
                  <span>🎙️ Raw Sensitive Mic</span>
                </button>

                <button
                  onClick={() => { audioEngine.playClick(); setInputMode("type"); stopMic(); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                    inputMode === "type"
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Keyboard size={16} />
                  <span>⌨️ Type Answer</span>
                </button>
              </div>

              {inputMode === "voice" && (
                <div className="flex items-center gap-2 text-xs text-slate-400 px-3">
                  <Sliders size={14} className="text-cyan-400" />
                  <span>Raw Decibel Boost:</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={sensitivityGain}
                    onChange={(e) => setSensitivityGain(parseFloat(e.target.value))}
                    className="w-20 accent-cyan-400"
                  />
                  <span className="font-mono text-cyan-300 font-bold">{sensitivityGain}x</span>
                </div>
              )}
            </div>

            {/* RAW MIC ENGINE INTERFACE (NO NOISE SUPPRESSION) */}
            {inputMode === "voice" && (
              <div className="bg-[#040a1d] border border-blue-600/30 rounded-2xl p-6 mb-6 text-center">
                <div className="flex flex-col items-center justify-center gap-4">
                  
                  {/* Dynamic Mic Waveform Pulsing Circle */}
                  <button
                    onClick={toggleMic}
                    className={`relative w-24 h-24 rounded-full flex items-center justify-center border-4 transition-all duration-300 cursor-pointer shadow-2xl ${
                      isListening
                        ? "bg-red-500/20 border-red-500 text-red-400 scale-110 shadow-red-500/50 animate-pulse"
                        : "bg-blue-600/20 border-cyan-400 text-cyan-400 hover:scale-105 shadow-cyan-400/30"
                    }`}
                  >
                    {isListening ? <MicOff size={36} /> : <Mic size={36} />}
                  </button>

                  <span className="text-xs font-extrabold uppercase tracking-widest text-slate-300">
                    {isListening ? "🎙️ High-Sensitivity Raw Mic Active! Speak Now!" : "Tap Mic to Start Voice Capture"}
                  </span>

                  <span className="text-[10px] text-cyan-400 font-mono">
                    ⚡ Raw Audio Mode (Noise suppression off for maximum word accuracy)
                  </span>

                  {/* Real-time Dynamic Waveform Bars */}
                  {isListening && (
                    <div className="flex items-center gap-1.5 h-10 px-4 py-2 bg-slate-900/80 rounded-full border border-blue-500/30">
                      {[...Array(12)].map((_, idx) => {
                        const height = Math.max(15, (audioLevel * (idx % 3 + 1)) % 100);
                        return (
                          <div
                            key={idx}
                            className="w-1.5 bg-gradient-to-t from-cyan-500 to-[#0084FF] rounded-full transition-all duration-75"
                            style={{ height: `${height}%` }}
                          ></div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ANSWER TEXT EDITOR */}
            <div className="mb-6">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                <span>Your Spoken Transcript / Answer</span>
                <span className="text-[10px] text-cyan-400 font-mono">
                  {step === "q1" ? answer1.length : answer2.length} characters
                </span>
              </label>

              <textarea
                rows={4}
                placeholder="Speak or type your solution..."
                value={step === "q1" ? answer1 : answer2}
                onChange={(e) => (step === "q1" ? setAnswer1(e.target.value) : setAnswer2(e.target.value))}
                className="w-full p-4 bg-[#030818] border border-blue-700/60 focus:border-cyan-400 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none transition font-sans leading-relaxed shadow-inner"
              />
            </div>

            {/* Quick Answer Suggestion Pills */}
            <div className="mb-8">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Need Ideas? Tap a response pill:
              </span>
              <div className="flex flex-wrap gap-2">
                {getPills(currentQuestionText).map((pill) => (
                  <button
                    key={pill}
                    onClick={() => {
                      audioEngine.playClick();
                      if (step === "q1") setAnswer1((prev) => (prev ? prev + " " + pill : pill));
                      else setAnswer2((prev) => (prev ? prev + " " + pill : pill));
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#08153b] hover:bg-blue-900/60 border border-blue-700/40 hover:border-cyan-400 text-xs text-blue-200 hover:text-white transition cursor-pointer font-medium"
                  >
                    + {pill}
                  </button>
                ))}
              </div>
            </div>

            {/* Next / Submit Button */}
            <button
              onClick={handleNextStep}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#0075FF] via-[#00F0FF] to-[#7000FF] hover:scale-[1.01] text-slate-950 font-black text-base flex items-center justify-center gap-3 shadow-xl shadow-blue-500/30 transition cursor-pointer"
            >
              <span>{step === "q1" ? "Next AI Scenario" : "Analyze My PEC Persona"}</span>
              <ArrowRight size={20} />
            </button>

          </div>
        )}

        {/* STEP 4: AI ANALYSIS SCANNING SCREEN */}
        {step === "analyzing" && (
          <div className="bg-[#050c21]/95 border border-blue-500/40 rounded-3xl p-10 shadow-2xl backdrop-blur-xl text-center animate-pulse">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-600/20 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 animate-spin">
              <RefreshCw size={36} />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
              Analyzing Creative Logic...
            </h2>
            <p className="text-xs sm:text-sm text-cyan-300 max-w-md mx-auto mb-6">
              Evaluating response logic across CP, AI, and Dev vectors for PEC {studentType}...
            </p>

            <div className="w-full max-w-md mx-auto bg-slate-900 rounded-full h-3 border border-blue-500/40 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#0075FF] via-[#00F0FF] to-[#7000FF] animate-pulse w-full"></div>
            </div>
          </div>
        )}

        {/* STEP 5: THE FUN OUTPUT — SHAREABLE "PEC TECH PERSONA CARD" */}
        {step === "result" && personaResult && (
          <div className="space-y-6 text-center animate-fade-in">
            
            {/* The Main Persona Card Container (Export Target) */}
            <div
              id="persona-card-export"
              className="relative max-w-xl mx-auto rounded-3xl p-1 bg-gradient-to-br from-[#0084FF] via-[#00F0FF] to-[#7000FF] shadow-2xl text-left overflow-hidden"
            >
              <div className="bg-[#050b1e] rounded-[22px] p-6 sm:p-8 border border-blue-400/30 text-white relative">
                
                {/* Hologram Light Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

                {/* Card Header */}
                <div className="flex items-center justify-between border-b border-blue-900/60 pb-5 mb-6">
                  <AcmLogo size="md" showText={true} />
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest block">
                      OFFICIAL PERSONA CARD
                    </span>
                    <span className="text-[10px] text-slate-400">
                      PEC Chandigarh • {personaResult.timestamp}
                    </span>
                  </div>
                </div>

                {/* Candidate Name & Branch */}
                <div className="mb-6">
                  <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {personaResult.name}
                  </div>
                  <div className="text-xs font-semibold text-cyan-300 mt-1 flex items-center gap-1.5">
                    <GraduationCap size={14} />
                    <span>{personaResult.branch}</span>
                  </div>
                </div>

                {/* 👑 TITLE BADGE */}
                <div className="bg-gradient-to-r from-blue-900/80 via-indigo-900/80 to-purple-900/80 border border-cyan-400/50 rounded-2xl p-4 mb-6 shadow-lg">
                  <span className="text-[10px] font-black uppercase text-yellow-400 tracking-wider block mb-1">
                    👑 AI EVALUATED PERSONA TITLE
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-white">
                    "{personaResult.personaTitle}"
                  </div>
                </div>

                {/* 🎯 RECOMMENDED ACM WING */}
                <div className="bg-[#081538] border border-blue-500/40 rounded-2xl p-5 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                      🎯 RECOMMENDED PEC ACM WING
                    </span>
                    <span className="text-xs font-black bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 px-3 py-0.5 rounded-full">
                      {personaResult.recommendedWing}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {personaResult.wingDescription}
                  </p>
                </div>

                {/* VISUAL STATS BARS */}
                <div className="space-y-3 mb-6 bg-[#030818] p-4 rounded-2xl border border-slate-800">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1">
                    PEC Tech & Survival Metrics
                  </span>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-blue-400 flex items-center gap-1"><Terminal size={12} /> CP Logic & Speed</span>
                      <span className="font-mono text-white">{personaResult.cpScore}%</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: `${personaResult.cpScore}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-purple-400 flex items-center gap-1"><Brain size={12} /> AI Innovation</span>
                      <span className="font-mono text-white">{personaResult.aiScore}%</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: `${personaResult.aiScore}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-cyan-400 flex items-center gap-1"><Code size={12} /> Dev Execution</span>
                      <span className="font-mono text-white">{personaResult.devScore}%</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                      <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${personaResult.devScore}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* AI COMMENTARY QUOTES */}
                <div className="border-t border-blue-900/60 pt-4 text-[11px] text-blue-200/80 space-y-1.5 italic">
                  <p>💬 "{personaResult.lockComment}"</p>
                  <p>🤖 "{personaResult.robotComment}"</p>
                </div>

                {/* Card Footer */}
                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Verified by PEC ACM - CSS AI Engine</span>
                  <span className="font-mono">ID: ACM-{Math.floor(100000 + Math.random() * 900000)}</span>
                </div>

              </div>
            </div>

            {/* ACTION BUTTONS (BULLETPROOF PNG CARD EXPORT) */}
            <div className="max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  audioEngine.playClick();
                  downloadCardAsImage("persona-card-export", `${name.replace(/\s+/g, '_')}_PEC_ACM_Card.png`, personaResult);
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#0075FF] to-[#00F0FF] hover:scale-105 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-blue-500/30 transition cursor-pointer"
              >
                <Download size={18} />
                <span>Download Persona Card PNG</span>
              </button>

              <button
                onClick={() => {
                  audioEngine.playClick();
                  navigator.clipboard.writeText(window.location.href);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#081538] border border-blue-700/60 hover:border-cyan-400 text-white font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
              >
                {copiedLink ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
                <span>{copiedLink ? "Link Copied!" : "Share Link"}</span>
              </button>

              <button
                onClick={() => {
                  audioEngine.playClick();
                  setScenarios(generateRandomScenarios());
                  setStep("profile");
                  setAnswer1("");
                  setAnswer2("");
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <RefreshCw size={18} />
                <span>Retake (New AI Scenarios)</span>
              </button>
            </div>

            {/* NEW: QUESTION-BY-QUESTION CONSTRUCTIVE AI FEEDBACK SECTION */}
            <div className="w-full max-w-4xl mx-auto mt-10 text-left">
              <div className="bg-[#050b1e]/90 border border-blue-900/60 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
                
                {/* Feedback Header */}
                <div className="flex items-center gap-3 border-b border-blue-900/60 pb-5 mb-6">
                  <div className="p-2.5 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                    <Lightbulb size={24} />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">
                      SMART AI STRATEGIC COACH
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      Question-by-Question Evaluation & Coaching
                    </h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 mb-6 font-medium leading-relaxed">
                  Our AI evaluated your raw answers to both scenarios. Here is the breakdown of <strong className="text-emerald-300 font-bold">what you thought correctly</strong> and <strong className="text-cyan-300 font-bold">how you could have optimized it further</strong>:
                </p>

                {/* Scenario 1 & 2 Feedback Grid */}
                <div className="space-y-6">
                  
                  {/* Scenario 1 Feedback Card */}
                  {personaResult.feedbackQ1 && (
                    <div className="p-5 sm:p-6 rounded-2xl bg-[#030818] border border-blue-800/40 shadow-inner space-y-4">
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-900/40 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                          <h4 className="text-sm font-black text-white tracking-wide">
                            {personaResult.feedbackQ1.questionTitle}
                          </h4>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-blue-900/40 text-blue-300 border border-blue-700/50 px-2.5 py-1 rounded-full w-fit">
                          {personaResult.feedbackQ1.focusBadge}
                        </span>
                      </div>

                      {/* Question Text & Spoken Answer */}
                      <div className="bg-[#050e26] p-3.5 rounded-xl border border-blue-900/40 space-y-2">
                        <p className="text-xs text-slate-300 italic">
                          <strong className="text-slate-400 not-italic font-mono">Q:</strong> "{personaResult.feedbackQ1.questionText}"
                        </p>
                        <p className="text-xs text-cyan-200">
                          <strong className="text-slate-400 font-mono">Your Answer:</strong> "{personaResult.feedbackQ1.userAnswer}"
                        </p>
                      </div>

                      {/* Constructive Dual Analysis */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        
                        {/* What You Thought Correctly */}
                        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                          <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                            <CheckCircle2 size={15} />
                            <span>What You Thought Correctly</span>
                          </div>
                          <p className="text-xs text-slate-200 leading-relaxed">
                            {personaResult.feedbackQ1.thoughtCorrectly}
                          </p>
                        </div>

                        {/* How To Do It Better / AI Recommendation */}
                        <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
                          <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold uppercase tracking-wider">
                            <Sparkles size={15} />
                            <span>Optimal Engineering Approach</span>
                          </div>
                          <p className="text-xs text-slate-200 leading-relaxed">
                            {personaResult.feedbackQ1.betterWay}
                          </p>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* Scenario 2 Feedback Card */}
                  {personaResult.feedbackQ2 && (
                    <div className="p-5 sm:p-6 rounded-2xl bg-[#030818] border border-blue-800/40 shadow-inner space-y-4">
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-900/40 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
                          <h4 className="text-sm font-black text-white tracking-wide">
                            {personaResult.feedbackQ2.questionTitle}
                          </h4>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-purple-900/40 text-purple-300 border border-purple-700/50 px-2.5 py-1 rounded-full w-fit">
                          {personaResult.feedbackQ2.focusBadge}
                        </span>
                      </div>

                      {/* Question Text & Spoken Answer */}
                      <div className="bg-[#050e26] p-3.5 rounded-xl border border-blue-900/40 space-y-2">
                        <p className="text-xs text-slate-300 italic">
                          <strong className="text-slate-400 not-italic font-mono">Q:</strong> "{personaResult.feedbackQ2.questionText}"
                        </p>
                        <p className="text-xs text-purple-200">
                          <strong className="text-slate-400 font-mono">Your Idea:</strong> "{personaResult.feedbackQ2.userAnswer}"
                        </p>
                      </div>

                      {/* Constructive Dual Analysis */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        
                        {/* What You Thought Correctly */}
                        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                          <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                            <CheckCircle2 size={15} />
                            <span>What You Thought Correctly</span>
                          </div>
                          <p className="text-xs text-slate-200 leading-relaxed">
                            {personaResult.feedbackQ2.thoughtCorrectly}
                          </p>
                        </div>

                        {/* How To Do It Better / AI Recommendation */}
                        <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-2">
                          <div className="flex items-center gap-2 text-purple-300 text-xs font-bold uppercase tracking-wider">
                            <Zap size={15} />
                            <span>Pro Architectural Enhancement</span>
                          </div>
                          <p className="text-xs text-slate-200 leading-relaxed">
                            {personaResult.feedbackQ2.betterWay}
                          </p>
                        </div>

                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* NEW: PEC ACM STUDENT CHAPTER LEADERSHIP & TEAM AT END OF SESSION */}
            <AcmTeamSection />

          </div>
        )}

      </div>
    </div>
  );
}
