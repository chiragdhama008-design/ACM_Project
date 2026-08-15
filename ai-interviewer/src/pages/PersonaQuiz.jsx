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
import { API_URL } from "../config/api.js";
import {
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
  ChevronRight,
  AlertTriangle,
  AlertCircle,
  Mic,
  MicOff,
  Volume2,
  Loader2,
  ShieldAlert,
  Info
} from "lucide-react";

export default function PersonaQuiz() {
  // Step State: 'profile' -> 'q1' -> 'q2' -> 'analyzing' -> 'result'
  const [step, setStep] = useState("profile");

  // User Profile
  const [name, setName] = useState("");
  const [branch, setBranch] = useState("Computer Science (CSE)");
  const [studentType, setStudentType] = useState("Day Scholar");

  // Dynamic AI Generated Scenarios
  const [scenarios, setScenarios] = useState({ q1: "", q2: "" });

  // Answers
  const [answer1, setAnswer1] = useState("");
  const [answer2, setAnswer2] = useState("");

  // Mic / Speech-to-Text State
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [micNotice, setMicNotice] = useState("");
  const [micBlocked, setMicBlocked] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0); // 0 to 100 sensitivity level

  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingActiveRef = useRef(false);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const mediaStreamRef = useRef(null);

  // Results
  const [personaResult, setPersonaResult] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Branch Options
  const branches = [
    "Computer Science (CSE)",
    "Computer Science (CSE) – AI",
    "Computer Science (CSE) – DS",
    "BDes",
    "Electronics & Comm Engg (ECE)",
    "Electrical Engineering (EE)",
    "Mechanical Engineering (ME)",
    "Civil Engineering (CE)",
    "Materials & Metallurgical (MME)",
    "Production & Industrial (PE)"
  ];

  // Check microphone permissions on mount if browser supports Permissions API
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: "microphone" }).then((perm) => {
        if (perm.state === "denied") {
          setMicBlocked(true);
        }
        perm.onchange = () => {
          if (perm.state === "granted") {
            setMicBlocked(false);
          } else if (perm.state === "denied") {
            setMicBlocked(true);
          }
        };
      }).catch(() => {});
    }
  }, []);

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

  // Clean up audio & mic on unmount or step change
  useEffect(() => {
    return () => {
      audioEngine.stopSpeaking();
      stopListening();
    };
  }, []);

  // Stop mic when leaving questions
  useEffect(() => {
    if (step !== "q1" && step !== "q2") {
      stopListening();
    }
  }, [step]);

  // Helper to cleanup Web Audio Context
  const cleanupAudioAnalyser = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  };

  // ==========================================
  // HIGH-SENSITIVITY SPEECH-TO-TEXT ENGINE
  // ==========================================
  const startListening = async () => {
    audioEngine.playClick();
    audioEngine.stopSpeaking(); // Stop AI question playback so mic doesn't pick it up
    setMicBlocked(false);
    setMicNotice("🎙️ Activating high-sensitivity microphone...");
    recordingActiveRef.current = true;
    audioChunksRef.current = [];

    let stream = null;

    // 1. Capture Ultra-Sensitive Audio Stream with Progressive Constraints
    try {
      try {
        // High sensitivity: autoGainControl on, echoCancellation on, noiseSuppression false/adaptive so soft voices aren't cut
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: false,
            autoGainControl: true
          }
        });
      } catch (strictErr) {
        // Fallback to basic audio constraint for restrictive browsers / mobile
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      mediaStreamRef.current = stream;
      setIsListening(true);
      setMicNotice("🎙️ High sensitivity mic active. Speak now (Whisper AI will transcribe verbatim)...");

      // Setup Real-time Web Audio Volume Analyser
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          analyser.smoothingTimeConstant = 0.5;
          source.connect(analyser);
          analyserRef.current = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateVolume = () => {
            if (!recordingActiveRef.current) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const average = sum / dataArray.length;
            const normalized = Math.min(100, Math.round((average / 128) * 100));
            setAudioLevel(normalized);
            animFrameRef.current = requestAnimationFrame(updateVolume);
          };
          updateVolume();
        }
      } catch (e) {
        console.warn("Audio analyser initialization notice:", e);
      }

      // Initialize MediaRecorder for Whisper backend transcription
      const mimeTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
        "audio/aac",
        "audio/ogg"
      ];
      let selectedMime = "";
      for (const m of mimeTypes) {
        if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m)) {
          selectedMime = m;
          break;
        }
      }

      const recorderOptions = selectedMime ? { mimeType: selectedMime } : undefined;
      const mediaRecorder = new MediaRecorder(stream, recorderOptions);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(250);

    } catch (micErr) {
      console.error("Microphone access failed:", micErr);
      recordingActiveRef.current = false;
      setIsListening(false);
      cleanupAudioAnalyser();

      if (
        micErr.name === "NotAllowedError" ||
        micErr.name === "PermissionDeniedError" ||
        micErr.name === "SecurityError"
      ) {
        setMicBlocked(true);
        setMicNotice("⚠️ Microphone permission is blocked by your browser. Please follow the instructions below to enable it.");
      } else {
        setMicNotice("⚠️ Could not access microphone. Please check your system audio settings or type below.");
      }
      return;
    }

    // 2. Parallel Instant SpeechRecognition (if available in Chrome/Edge for instant live preview)
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        recognition.lang = navigator.language || "en-IN";

        recognition.onresult = (event) => {
          let fullText = "";
          for (let i = 0; i < event.results.length; i++) {
            fullText += event.results[i][0].transcript + " ";
          }
          const cleanText = fullText.trim();
          if (cleanText) {
            if (step === "q1") {
              setAnswer1(cleanText);
            } else if (step === "q2") {
              setAnswer2(cleanText);
            }
          }
        };

        recognition.onerror = (err) => {
          console.warn("SpeechRecognition notice:", err.error);
        };

        recognition.onend = () => {
          if (recordingActiveRef.current) {
            try { recognition.start(); } catch (e) {}
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      }
    } catch (err) {
      console.warn("Web Speech API notice:", err);
    }
  };

  const stopListening = async () => {
    if (!recordingActiveRef.current && !isListening) return;
    recordingActiveRef.current = false;
    setIsListening(false);
    cleanupAudioAnalyser();
    audioEngine.playClick();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      } catch (e) {}
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }

    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      } catch (e) {}
      mediaStreamRef.current = null;
    }

    // Send recorded audio to high-accuracy Whisper server
    setTimeout(async () => {
      if (audioChunksRef.current.length > 0) {
        const audioBlob = new Blob(audioChunksRef.current, { type: audioChunksRef.current[0]?.type || "audio/webm" });
        if (audioBlob.size > 1200) {
          setIsTranscribing(true);
          setMicNotice("⚡ Processing high-accuracy AI speech transcription (Whisper)...");

          try {
            const base64Audio = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(audioBlob);
            });

            const res = await fetch(`${API_URL}/api/transcribe`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ audio: base64Audio })
            });

            if (res.ok) {
              const data = await res.json();
              if (data && data.text && data.text.trim()) {
                const whisperText = data.text.trim();
                if (step === "q1") {
                  setAnswer1((prev) => (whisperText.length > prev.length ? whisperText : prev || whisperText));
                } else if (step === "q2") {
                  setAnswer2((prev) => (whisperText.length > prev.length ? whisperText : prev || whisperText));
                }
              }
            }
          } catch (err) {
            console.warn("Whisper transcription sync warning:", err);
          } finally {
            setIsTranscribing(false);
          }
        }
      }
      setMicNotice("✓ High-accuracy voice input captured! You can refine or edit below.");
    }, 400);
  };

  // Submit Answer & Move Next
  const handleNextStep = () => {
    audioEngine.playClick();
    stopListening();

    if (step === "profile") {
      if (!name.trim()) {
        alert("Please enter your name to discover your PEC Persona!");
        return;
      }
      setStep("q1");
    } else if (step === "q1") {
      if (!answer1.trim() || answer1.trim().length < 2) {
        alert("Please speak or type your solution for Scenario 1 (or tap one of the suggested answer pills)!");
        return;
      }
      setStep("q2");
    } else if (step === "q2") {
      if (!answer2.trim() || answer2.trim().length < 2) {
        alert("Please speak or type your solution for Scenario 2 (or tap one of the suggested answer pills)!");
        return;
      }
      setStep("analyzing");

      // Attempt live LLM server evaluation with fallback to client-side deterministic engine
      const evaluateAsync = async () => {
        let finalResult = null;
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000);

          const response = await fetch(`${API_URL}/api/persona/evaluate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name,
              branch: `${branch} (${studentType})`,
              scenario1: scenarios.q1,
              answer1,
              scenario2: scenarios.q2,
              answer2
            }),
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            if (data && data.feedbackQ1 && data.feedbackQ2) {
              finalResult = {
                name: name || "PEC Student",
                branch: `${branch} (${studentType})`,
                personaTitle: data.personaTitle || "Full-Stack Phantom",
                recommendedWing: data.recommendedWing || "ACM-Dev",
                wingDescription: data.wingDescription || "Practical problem solver built for PEC Chandigarh.",
                cpScore: data.cpScore ?? 75,
                aiScore: data.aiScore ?? 75,
                devScore: data.devScore ?? 75,
                hostelSurvival: Math.min(99, Math.max(0, Math.floor(((data.cpScore || 0) + (data.devScore || 0)) / 2))),
                chaosIq: Math.min(99, Math.max(0, Math.floor(((data.aiScore || 0) + (data.cpScore || 0)) / 2))),
                lockComment: `Scenario 1 analyzed: "${answer1.substring(0, 45)}..."`,
                robotComment: `Scenario 2 analyzed: "${answer2.substring(0, 45)}..."`,
                feedbackQ1: {
                  ...data.feedbackQ1,
                  questionTitle: "Scenario 1: Optimization & Workflow Strategy",
                  questionText: scenarios.q1,
                  userAnswer: answer1
                },
                feedbackQ2: {
                  ...data.feedbackQ2,
                  questionTitle: "Scenario 2: Intelligent Systems Architecture",
                  questionText: scenarios.q2,
                  userAnswer: answer2
                },
                superpower: "Aptitude evaluated across Algorithmic Logic, Machine Intelligence & System Building.",
                timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              };
            }
          }
        } catch (e) {
          // Backend offline or timeout
        }

        // Client-side deterministic fallback
        if (!finalResult) {
          finalResult = calculatePersona({
            name,
            branch: `${branch} (${studentType})`,
            answer1,
            answer2,
            scenario1: scenarios.q1,
            scenario2: scenarios.q2
          });
        }

        setPersonaResult(finalResult);
        setStep("result");
        triggerConfetti();
        audioEngine.playFanfare();
        saveResponseToDatabase(finalResult);
      };

      setTimeout(evaluateAsync, 1800);
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

  // Dynamic Suggestion Pills precisely mapped to real-life CP, AI/ML, and Dev scenarios
  const getPills = () => {
    if (step === "q1") {
      const qLower = (scenarios.q1 || "").toLowerCase();
      if (qLower.includes("canteen") || qLower.includes("cafeteria") || qLower.includes("fest") || qLower.includes("printing")) {
        return [
          "FIFO token pre-ordering queue on mobile app",
          "Split counters: Express drinks vs Cooked meals",
          "Dynamic priority queue for students with upcoming classes",
          "Live digital queue status board at entrance",
          "Batch preparation scheduling for peak-demand snacks"
        ];
      } else if (qLower.includes("shuttle") || qLower.includes("transit") || qLower.includes("route") || qLower.includes("commute")) {
        return [
          "Dynamic route prioritization based on lecture building schedules",
          "Electric auto ride-pooling with live student dispatch",
          "Direct green corridor express shuttles to L-Block & Library",
          "Real-time GPS telemetry queue tracker on student portal",
          "Scheduled high-frequency loops during 8:45 AM rush"
        ];
      } else if (qLower.includes("hackathon") || qLower.includes("mentor") || qLower.includes("match")) {
        return [
          "Automated bipartite matching algorithm with skill tags",
          "Time-slot conflict matrix for mentor scheduling",
          "Project workstation reservation queue",
          "Live skill exchange board with verified GitHub/project tags",
          "Dynamic milestone checkpoint reminders"
        ];
      } else {
        return [
          "Centralized digital verification registry with QR claim tags",
          "Two-factor physical descriptor verification to prevent false claims",
          "Automated push notifications for newly found items",
          "Secure drop-off lockers with timestamped camera logs"
        ];
      }
    } else {
      // Step === "q2" (AI/ML & Dev Intelligent Systems)
      const qLower = (scenarios.q2 || "").toLowerCase();
      if (qLower.includes("study") || qLower.includes("exam") || qLower.includes("notes") || qLower.includes("slide")) {
        return [
          "RAG vector pipeline summarizing lecture slides & past exam papers",
          "Automated flashcard generator for key formulas & definitions",
          "Semantic search engine across course syllabi and lab guides",
          "Smart peer study group matcher based on weak syllabus topics",
          "Audio-to-text transcript bot for complex lecture audio"
        ];
      } else if (qLower.includes("library") || qLower.includes("space") || qLower.includes("seat") || qLower.includes("port")) {
        return [
          "Privacy-safe edge-AI desk occupancy counter (YOLO)",
          "Overhead PIR motion / thermal sensors on study tables",
          "15-minute seat reservation hold via mobile app",
          "Live heat-map dashboard of vacant study booths",
          "Smart power-socket availability indicator"
        ];
      } else if (qLower.includes("food") || qLower.includes("mess") || qLower.includes("freshness") || qLower.includes("waste")) {
        return [
          "Automated image-based food freshness audit station",
          "QR code rating system linked directly to catering portal",
          "Daily meal demand predictor to minimize food waste",
          "Real-time kitchen temperature & hygiene telemetry",
          "Automated menu popularity & inventory forecasting"
        ];
      } else {
        return [
          "Smart PIR occupancy relays toggling lab rigs & lights",
          "Automated overnight power-down with safe experiment override",
          "Ambient temperature + load-balancing HVAC controller",
          "Centralized energy telemetry dashboard for faculty"
        ];
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-[#020612] text-white font-sans overflow-hidden py-10 px-4 sm:px-6 lg:px-8 selection:bg-[#00F0FF] selection:text-slate-950">
      <CyberParticles />

      <div className="relative z-10 max-w-4xl mx-auto">
        
        {/* STEP 1: USER PROFILE ENTRY */}
        {step === "profile" && (
          <div className="bg-[#050c21]/95 border border-cyan-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl animate-fade-in text-left">
            <div className="flex items-center gap-3.5 mb-6">
              <AcmLogo size="md" showText={false} />
              <div>
                <span className="text-xs font-black uppercase text-cyan-400 tracking-widest">PEC Chandigarh AI Persona Engine</span>
                <h2 className="text-2xl sm:text-3xl font-black text-white">Enter Your Student Details</h2>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-blue-200/80 mb-8">
              No signup or login required! Whether you are a <strong className="text-cyan-300">Day Scholar</strong> or <strong className="text-purple-300">Hosteller</strong>, enter your details to generate your shareable <strong className="text-cyan-300">PEC Tech Persona Card</strong> & ACM Wing Recommendation.
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
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  autoComplete="off"
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
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#0075FF] via-[#00F0FF] to-[#7000FF] hover:scale-[1.01] text-slate-950 font-black text-base flex items-center justify-center gap-3 shadow-xl shadow-cyan-500/30 transition cursor-pointer"
            >
              <span>Generate Real-Life Tech Scenarios & Start</span>
              <ArrowRight size={20} />
            </button>
          </div>
        )}

        {/* STEP 2 & 3: DYNAMIC AI GENERATED SCENARIO QUESTIONS WITH HIGH-ACCURACY MIC */}
        {(step === "q1" || step === "q2") && (
          <div className="bg-[#050c21]/95 border border-cyan-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl animate-fade-in text-left">
            
            {/* Header progress */}
            <div className="flex items-center justify-between border-b border-blue-900/60 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl border ${step === "q1" ? "bg-blue-600/20 border-cyan-400/40 text-cyan-400" : "bg-purple-600/20 border-purple-400/40 text-purple-400"}`}>
                  {step === "q1" ? <Terminal size={24} /> : <Brain size={24} />}
                </div>
                <div>
                  <span className="text-xs font-black uppercase text-cyan-400 tracking-wider">
                    {step === "q1" ? "Real-Life Scenario #1 (Optimization & Logic)" : "Real-Life Scenario #2 (Intelligent Systems)"}
                  </span>
                  <h3 className="text-lg font-black text-white">
                    PEC Practical Engineering Scenario
                  </h3>
                </div>
              </div>

              <span className="text-xs font-mono text-slate-400 bg-[#030818] px-3 py-1.5 rounded-full border border-slate-800">
                Candidate: <strong className="text-white">{name}</strong> ({studentType})
              </span>
            </div>

            {/* AI Question Box */}
            <div className="bg-[#030818] border border-cyan-500/40 rounded-2xl p-5 mb-6 relative overflow-hidden shadow-lg shadow-cyan-500/10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-xl pointer-events-none"></div>
              <p className="text-base sm:text-lg font-bold text-cyan-100 leading-relaxed">
                "{currentQuestionText}"
              </p>
            </div>

            {/* 🎙️ HIGH-ACCURACY MIC AUDIO INPUT CONTROLS */}
            <div className="mb-5 p-4 rounded-2xl bg-[#061438] border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={isListening ? stopListening : startListening}
                  className={`px-5 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg cursor-pointer w-full sm:w-auto ${
                    isListening
                      ? "bg-red-600 hover:bg-red-700 text-white animate-pulse shadow-red-500/40"
                      : "bg-gradient-to-r from-[#00F0FF] to-[#0075FF] text-slate-950 hover:scale-105 shadow-cyan-500/30"
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff size={18} />
                      <span>Stop & Transcribe (Mic Active)</span>
                    </>
                  ) : (
                    <>
                      <Mic size={18} />
                      <span>Speak Answer (Universal High-Sensitivity Mic)</span>
                    </>
                  )}
                </button>

                {/* 📊 Live Audio Sensitivity Waveform Visualizer */}
                {isListening && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-950/70 border border-red-500/50 text-red-300 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
                    <span>Voice Input:</span>
                    <div className="flex items-end gap-1 h-4 px-1">
                      <div className="w-1 bg-cyan-400 rounded-full transition-all duration-75" style={{ height: `${Math.max(4, Math.min(16, (audioLevel * 0.16)))}px` }}></div>
                      <div className="w-1 bg-cyan-300 rounded-full transition-all duration-75" style={{ height: `${Math.max(6, Math.min(16, (audioLevel * 0.22)))}px` }}></div>
                      <div className="w-1 bg-teal-300 rounded-full transition-all duration-75" style={{ height: `${Math.max(4, Math.min(16, (audioLevel * 0.28)))}px` }}></div>
                      <div className="w-1 bg-cyan-400 rounded-full transition-all duration-75" style={{ height: `${Math.max(6, Math.min(16, (audioLevel * 0.20)))}px` }}></div>
                      <div className="w-1 bg-cyan-200 rounded-full transition-all duration-75" style={{ height: `${Math.max(4, Math.min(16, (audioLevel * 0.14)))}px` }}></div>
                    </div>
                  </div>
                )}

                {isTranscribing && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/70 border border-cyan-400/50 text-cyan-300 text-xs font-bold animate-pulse">
                    <Loader2 size={14} className="animate-spin" />
                    <span>Whisper AI Transcribing...</span>
                  </div>
                )}
              </div>

              <span className="text-xs text-blue-200/80 italic text-center sm:text-right">
                {micNotice || "💡 Speak naturally in any accent — Whisper AI transcribes accurately. Or type below."}
              </span>
            </div>

            {/* ⚠️ BROWSER MICROPHONE PERMISSION BLOCKED HELPER */}
            {micBlocked && (
              <div className="mb-5 p-4 rounded-2xl bg-amber-950/50 border border-amber-500/50 text-amber-100 text-xs shadow-xl animate-fade-in">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="text-amber-400 shrink-0 mt-0.5" size={20} />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-amber-300 text-sm font-bold">
                        Microphone Blocked by Browser / Search Engine
                      </strong>
                      <button
                        onClick={startListening}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
                      >
                        <RefreshCw size={12} />
                        <span>Retry Access</span>
                      </button>
                    </div>
                    <p className="text-amber-200/90 leading-relaxed">
                      Your browser has blocked microphone permissions for this site. Follow these quick steps to unblock:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                      <div className="p-2 bg-[#020612]/70 rounded-xl border border-amber-500/30">
                        <strong className="text-cyan-300 block mb-0.5">🌐 Chrome / Edge / Brave:</strong>
                        Click the 🔒 lock / 🎛️ tune icon on the left of your URL address bar → Toggle <strong>Microphone</strong> to <strong>Allow</strong>.
                      </div>
                      <div className="p-2 bg-[#020612]/70 rounded-xl border border-amber-500/30">
                        <strong className="text-orange-300 block mb-0.5">🦊 Firefox:</strong>
                        Click the Permissions icon left of URL → Clear the blocked microphone permission → Reload page.
                      </div>
                      <div className="p-2 bg-[#020612]/70 rounded-xl border border-amber-500/30">
                        <strong className="text-purple-300 block mb-0.5">🧭 Safari / Mobile:</strong>
                        Tap 'aA' or Website Settings in search bar → Set Microphone to <strong>Allow</strong>.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ANSWER TEXT EDITOR (WITH ZERO AUTOCORRECT) */}
            <div className="mb-6">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2 text-cyan-300">
                  <Keyboard size={15} />
                  <span>Your Solution / Thought Process</span>
                </span>
                <span className="text-[11px] text-cyan-400 font-mono">
                  {step === "q1" ? answer1.length : answer2.length} characters
                </span>
              </label>

              <textarea
                rows={5}
                placeholder="Describe your practical step-by-step logic, system flow, or features in your own words (or use the Mic above)..."
                value={step === "q1" ? answer1 : answer2}
                onChange={(e) => (step === "q1" ? setAnswer1(e.target.value) : setAnswer2(e.target.value))}
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                autoComplete="off"
                className="w-full p-4 bg-[#030818] border border-blue-700/60 focus:border-cyan-400 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none transition font-sans leading-relaxed shadow-inner"
              />
            </div>

            {/* Quick Answer Suggestion Pills */}
            <div className="mb-8">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Need Ideas? Tap a strategy pill:
              </span>
              <div className="flex flex-wrap gap-2">
                {getPills().map((pill) => (
                  <button
                    key={pill}
                    onClick={() => {
                      audioEngine.playClick();
                      if (step === "q1") {
                        setAnswer1((prev) => (prev ? `${prev}. ${pill}` : pill));
                      } else {
                        setAnswer2((prev) => (prev ? `${prev}. ${pill}` : pill));
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#08153b] hover:bg-cyan-950/60 border border-blue-700/40 hover:border-cyan-400 text-xs text-blue-200 hover:text-cyan-200 transition cursor-pointer font-medium"
                  >
                    + {pill}
                  </button>
                ))}
              </div>
            </div>

            {/* Next / Submit Button */}
            <button
              onClick={handleNextStep}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#0075FF] via-[#00F0FF] to-[#7000FF] hover:scale-[1.01] text-slate-950 font-black text-base flex items-center justify-center gap-3 shadow-xl shadow-cyan-500/30 transition cursor-pointer"
            >
              <span>{step === "q1" ? "Next Scenario (Scenario #2)" : "Evaluate Tech Aptitude & ACM Wing"}</span>
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

            <div className="w-full max-w-md mx-auto bg-slate-900 rounded-full h-3 border border-cyan-500/40 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#00F0FF] via-[#7000FF] to-[#FF007A] animate-pulse w-full"></div>
            </div>
          </div>
        )}

        {/* STEP 5: THE FUN OUTPUT — SHAREABLE "PEC TECH PERSONA CARD" */}
        {step === "result" && personaResult && (
          <div className="space-y-6 text-center animate-fade-in">
            
            {/* The Main Persona Card Container (Export Target) */}
            <div
              id="persona-card-export"
              className="relative max-w-xl mx-auto rounded-3xl p-1 bg-gradient-to-br from-[#00F0FF] via-[#7000FF] to-[#FF007A] shadow-[0_0_50px_rgba(0,240,255,0.4)] text-left overflow-hidden"
            >
              <div className="bg-[#050b1e] rounded-[22px] p-6 sm:p-8 border border-cyan-400/40 text-white relative">
                
                {/* Hologram Light Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>

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
                <div className="bg-gradient-to-r from-blue-900/90 via-indigo-900/90 to-purple-900/90 border border-cyan-400/60 rounded-2xl p-4 mb-6 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
                  <span className="text-[10px] font-black uppercase text-yellow-400 tracking-wider block mb-1">
                    👑 OFFICIAL ACM PERSONA TITLE
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-white">
                    "{personaResult.personaTitle}"
                  </div>
                </div>

                {/* 🎯 RECOMMENDED ACM WING */}
                <div className="bg-[#081538] border border-cyan-500/40 rounded-2xl p-5 mb-6 shadow-inner">
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
                    PEC Tech Aptitude Metrics
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
                      <span className="text-purple-400 flex items-center gap-1"><Brain size={12} /> AI & Machine Intelligence</span>
                      <span className="font-mono text-white">{personaResult.aiScore}%</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: `${personaResult.aiScore}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-cyan-400 flex items-center gap-1"><Code size={12} /> Full-Stack Dev Architecture</span>
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
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#0075FF] via-[#00F0FF] to-[#7000FF] hover:scale-105 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/30 transition cursor-pointer"
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
                          <span className={`w-2.5 h-2.5 rounded-full ${personaResult.feedbackQ1.status === 'GIBBERISH' ? 'bg-red-400' : personaResult.feedbackQ1.status === 'OFF_TOPIC' ? 'bg-amber-400' : 'bg-blue-400'}`}></span>
                          <h4 className="text-sm font-black text-white tracking-wide">
                            {personaResult.feedbackQ1.questionTitle}
                          </h4>
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border w-fit ${
                          personaResult.feedbackQ1.status === 'GIBBERISH' 
                            ? 'bg-red-950/60 border-red-500/40 text-red-300' 
                            : personaResult.feedbackQ1.status === 'OFF_TOPIC'
                            ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                            : 'bg-blue-900/40 text-blue-300 border-blue-700/50'
                        }`}>
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
                        
                        {/* Box 1: Assessment / Thought Correctly */}
                        <div className={`p-4 rounded-xl border space-y-2 ${
                          personaResult.feedbackQ1.status === 'GIBBERISH' 
                            ? 'bg-red-950/20 border-red-500/30 text-red-200' 
                            : personaResult.feedbackQ1.status === 'OFF_TOPIC'
                            ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                            : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                        }`}>
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                            {personaResult.feedbackQ1.status === 'GIBBERISH' ? (
                              <>
                                <AlertTriangle size={15} className="text-red-400" />
                                <span className="text-red-300">Answer Evaluation</span>
                              </>
                            ) : personaResult.feedbackQ1.status === 'OFF_TOPIC' ? (
                              <>
                                <AlertCircle size={15} className="text-amber-400" />
                                <span className="text-amber-300">Concept Analysis</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 size={15} className="text-emerald-400" />
                                <span className="text-emerald-300">What You Thought Correctly</span>
                              </>
                            )}
                          </div>
                          <p className="text-xs text-slate-200 leading-relaxed">
                            {personaResult.feedbackQ1.thoughtCorrectly}
                          </p>
                        </div>

                        {/* Box 2: Optimal Engineering Approach */}
                        <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
                          <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold uppercase tracking-wider">
                            <Sparkles size={15} />
                            <span>
                              {personaResult.feedbackQ1.status === 'GIBBERISH' ? 'Recommended Campus Strategy' : 'Optimal Engineering Approach'}
                            </span>
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
                          <span className={`w-2.5 h-2.5 rounded-full ${personaResult.feedbackQ2.status === 'GIBBERISH' ? 'bg-red-400' : personaResult.feedbackQ2.status === 'OFF_TOPIC' ? 'bg-amber-400' : 'bg-purple-400'}`}></span>
                          <h4 className="text-sm font-black text-white tracking-wide">
                            {personaResult.feedbackQ2.questionTitle}
                          </h4>
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border w-fit ${
                          personaResult.feedbackQ2.status === 'GIBBERISH' 
                            ? 'bg-red-950/60 border-red-500/40 text-red-300' 
                            : personaResult.feedbackQ2.status === 'OFF_TOPIC'
                            ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                            : 'bg-purple-900/40 text-purple-300 border-purple-700/50'
                        }`}>
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
                        
                        {/* Box 1: Assessment / Thought Correctly */}
                        <div className={`p-4 rounded-xl border space-y-2 ${
                          personaResult.feedbackQ2.status === 'GIBBERISH' 
                            ? 'bg-red-950/20 border-red-500/30 text-red-200' 
                            : personaResult.feedbackQ2.status === 'OFF_TOPIC'
                            ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                            : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                        }`}>
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                            {personaResult.feedbackQ2.status === 'GIBBERISH' ? (
                              <>
                                <AlertTriangle size={15} className="text-red-400" />
                                <span className="text-red-300">Answer Evaluation</span>
                              </>
                            ) : personaResult.feedbackQ2.status === 'OFF_TOPIC' ? (
                              <>
                                <AlertCircle size={15} className="text-amber-400" />
                                <span className="text-amber-300">Concept Analysis</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 size={15} className="text-emerald-400" />
                                <span className="text-emerald-300">What You Thought Correctly</span>
                              </>
                            )}
                          </div>
                          <p className="text-xs text-slate-200 leading-relaxed">
                            {personaResult.feedbackQ2.thoughtCorrectly}
                          </p>
                        </div>

                        {/* Box 2: Optimal Engineering Approach */}
                        <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-2">
                          <div className="flex items-center gap-2 text-purple-300 text-xs font-bold uppercase tracking-wider">
                            <Zap size={15} />
                            <span>
                              {personaResult.feedbackQ2.status === 'GIBBERISH' ? 'Viable AI Project Architecture' : 'Pro Architectural Enhancement'}
                            </span>
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
