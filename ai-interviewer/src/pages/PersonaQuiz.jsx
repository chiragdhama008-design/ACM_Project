import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import CyberParticles from "../components/CyberParticles";
import AcmLogo from "../components/AcmLogo";
import AcmTeamSection from "../components/AcmTeamSection";
import { calculatePersona } from "../utils/personaEngine";
import { generateRandomScenarios } from "../utils/scenarioEngine";
import { triggerConfetti, downloadCardAsImage, generateCardDataUrl } from "../utils/canvasHelper";
import { audioEngine } from "../utils/audioSynth";
import { supabase } from "../supabaseClient";
import { API_URL } from "../config/api.js";
import {
  Keyboard,
  Sparkles,
  Zap,
  Clock,
  ArrowRight,
  RefreshCw,
  Download,
  Share2,
  CheckCircle2,
  Code,
  Brain,
  Terminal,
  Shield,
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
  Mail,
  Send,
  SendHorizontal
} from "lucide-react";

export default function PersonaQuiz() {
  // Step State: 'profile' -> 'q1' -> 'q2' -> 'analyzing' -> 'result'
  const [step, setStep] = useState("profile");

  // User Profile
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [branch, setBranch] = useState("Computer Science (CSE)");
  const [studentType, setStudentType] = useState("Day Scholar");

  // Dynamic Questions
  const [scenarios, setScenarios] = useState({ q1: "", q2: "" });

  // Answers
  const [answer1, setAnswer1] = useState("");
  const [answer2, setAnswer2] = useState("");

  // Mic / Voice State
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [micNotice, setMicNotice] = useState("");
  const [micBlocked, setMicBlocked] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingActiveRef = useRef(false);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const mediaStreamRef = useRef(null);

  // Results & Email State
  const [personaResult, setPersonaResult] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null); // { success: boolean, message: string }

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

  // Generate scenarios on mount or retake
  useEffect(() => {
    const generated = generateRandomScenarios();
    setScenarios(generated);
  }, []);

  const currentQuestionText = step === "q1" ? scenarios.q1 : scenarios.q2;

  // Speak Question whenever step changes
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

  // SPEECH-TO-TEXT ENGINE
  const startListening = async () => {
    audioEngine.playClick();
    audioEngine.stopSpeaking();
    setMicBlocked(false);
    setMicNotice("🎙️ Listening... speak naturally!");
    recordingActiveRef.current = true;
    audioChunksRef.current = [];

    let stream = null;

    try {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: false,
            autoGainControl: true
          }
        });
      } catch (strictErr) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      mediaStreamRef.current = stream;
      setIsListening(true);
      setMicNotice("🎙️ Mic active! Speak your answer...");

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
      } catch (e) {}

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
      recordingActiveRef.current = false;
      setIsListening(false);
      cleanupAudioAnalyser();

      if (
        micErr.name === "NotAllowedError" ||
        micErr.name === "PermissionDeniedError" ||
        micErr.name === "SecurityError"
      ) {
        setMicBlocked(true);
        setMicNotice("⚠️ Mic permission blocked by browser. Please enable mic access or type below.");
      } else {
        setMicNotice("⚠️ Could not access mic. You can type your answer below.");
      }
      return;
    }

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

        recognition.onend = () => {
          if (recordingActiveRef.current) {
            try { recognition.start(); } catch (e) {}
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      }
    } catch (err) {}
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

    setTimeout(async () => {
      if (audioChunksRef.current.length > 0) {
        const audioBlob = new Blob(audioChunksRef.current, { type: audioChunksRef.current[0]?.type || "audio/webm" });
        if (audioBlob.size > 1200) {
          setIsTranscribing(true);
          setMicNotice("⚡ Converting voice to text...");

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
          } finally {
            setIsTranscribing(false);
          }
        }
      }
      setMicNotice("✓ Voice captured! You can refine or edit below.");
    }, 400);
  };

  // Submit Answer & Move Next
  const handleNextStep = () => {
    audioEngine.playClick();
    stopListening();

    if (step === "profile") {
      if (!name.trim()) {
        alert("Please enter your name!");
        return;
      }
      if (!email.trim() || !email.includes("@")) {
        alert("Please enter your PEC email ID (e.g. yourname.bt25cse@pec.edu.in) so we can send your Persona Card!");
        return;
      }
      setStep("q1");
    } else if (step === "q1") {
      if (!answer1.trim() || answer1.trim().length < 2) {
        alert("Please speak or type your idea for Question 1 (or tap one of the quick idea buttons)!");
        return;
      }
      setStep("q2");
    } else if (step === "q2") {
      if (!answer2.trim() || answer2.trim().length < 2) {
        alert("Please speak or type your idea for Question 2 (or tap one of the quick idea buttons)!");
        return;
      }
      setStep("analyzing");

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
                email: email || "",
                branch: `${branch} (${studentType})`,
                personaTitle: data.personaTitle || "Full-Stack Phantom",
                recommendedWing: data.recommendedWing || "ACM-Dev",
                wingDescription: data.wingDescription || "Practical problem solver built for PEC Chandigarh.",
                cpScore: data.cpScore ?? 75,
                mlScore: data.mlScore ?? 75,
                devScore: data.devScore ?? 75,
                cyberScore: data.cyberScore ?? 70,
                hostelSurvival: Math.min(99, Math.max(0, Math.floor(((data.cpScore || 0) + (data.devScore || 0)) / 2))),
                chaosIq: Math.min(99, Math.max(0, Math.floor(((data.mlScore || 0) + (data.cyberScore || 0)) / 2))),
                lockComment: `Question 1: "${answer1.substring(0, 45)}..."`,
                robotComment: `Question 2: "${answer2.substring(0, 45)}..."`,
                feedbackQ1: {
                  ...data.feedbackQ1,
                  questionTitle: "Question 1: Problem Solving Strategy",
                  questionText: scenarios.q1,
                  userAnswer: answer1
                },
                feedbackQ2: {
                  ...data.feedbackQ2,
                  questionTitle: "Question 2: Creative Tech Concept",
                  questionText: scenarios.q2,
                  userAnswer: answer2
                },
                superpower: "Your aptitude was evaluated across Logic, Machine Learning, Dev & Cybersecurity.",
                timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              };
            }
          }
        } catch (e) {}

        if (!finalResult) {
          finalResult = calculatePersona({
            name,
            branch: `${branch} (${studentType})`,
            answer1,
            answer2,
            scenario1: scenarios.q1,
            scenario2: scenarios.q2
          });
          finalResult.email = email;
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

  // Save Response to Database
  const saveResponseToDatabase = async (res) => {
    const payload = {
      name: res.name,
      email: email,
      branch: res.branch,
      answer1,
      answer2,
      persona_title: res.personaTitle,
      recommended_wing: res.recommendedWing,
      cp_score: res.cpScore,
      ml_score: res.mlScore,
      dev_score: res.devScore,
      cyber_score: res.cyberScore,
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

  // Send Persona Card via Email
  const handleSendEmail = async () => {
    if (!email || !email.includes("@")) {
      alert("Please enter a valid email address!");
      return;
    }
    audioEngine.playClick();
    setEmailSending(true);
    setEmailStatus(null);

    try {
      const cardImageDataUrl = generateCardDataUrl(personaResult);

      const response = await fetch(`${API_URL}/api/persona/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: personaResult?.name,
          branch: personaResult?.branch,
          personaTitle: personaResult?.personaTitle,
          recommendedWing: personaResult?.recommendedWing,
          wingDescription: personaResult?.wingDescription,
          cpScore: personaResult?.cpScore,
          mlScore: personaResult?.mlScore,
          devScore: personaResult?.devScore,
          cyberScore: personaResult?.cyberScore,
          cardImageBase64: cardImageDataUrl
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setEmailStatus({
          success: true,
          message: `🎉 Persona card sent to ${email}! Check your inbox.`
        });
      } else {
        setEmailStatus({
          success: false,
          message: data.error || "Could not send email right now. You can still download your PNG card below!"
        });
      }
    } catch (err) {
      setEmailStatus({
        success: false,
        message: "Email service temporarily unavailable. Please download your card PNG below!"
      });
    } finally {
      setEmailSending(false);
    }
  };

  // Fun Quick Idea Suggestions for PEC Chandigarh
  const getPills = () => {
    if (step === "q1") {
      return [
        "Sprint straight via workshop lane & ask friend to proxy roll call",
        "Pre-order Nescafe patties via WhatsApp group to skip line",
        "Split token queue: one gets printout, other gets signatures",
        "Set up an RFID tracker on hostel snack box",
        "Use CTU live bus tracker & hop onto auto at Sector 11"
      ];
    } else {
      return [
        "Build a live hostel mess menu rating & feedback app",
        "Anonymously report the leaked USB to CC lab admin without opening files",
        "Build a library charging port & desk occupancy sensor app",
        "Automate smart AC thermostat controller for CC lab",
        "Build an AI note summarizer for PEC mid-sem exam slides"
      ];
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
                <span className="text-xs font-black uppercase text-cyan-400 tracking-widest">PEC ACM STUDENT CHAPTER</span>
                <h2 className="text-2xl sm:text-3xl font-black text-white">Enter Your Student Details</h2>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-blue-200/80 mb-8">
              No signup required! Enter your details to discover which PEC ACM Wing matches your vibe, get your <strong className="text-cyan-300">PEC Persona Card</strong>, and have it emailed straight to you.
            </p>

            <div className="space-y-6 mb-8">
              {/* Name & Email in 2 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name Input */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
                    <User size={16} className="text-cyan-400" /> Full Name
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

                {/* Email Input */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
                    <Mail size={16} className="text-cyan-400" /> College Email ID
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. aarav.bt25cse@pec.edu.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    autoComplete="off"
                    className="w-full px-4 py-3.5 bg-[#030818] border border-blue-700/60 focus:border-cyan-400 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none transition font-semibold"
                  />
                </div>
              </div>

              {/* Branch Select */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
                    <GraduationCap size={16} className="text-purple-400" /> Engineering Branch
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
              className="w-full py-4 rounded-full bg-gradient-to-r from-[#0075FF] to-[#00F0FF] hover:scale-[1.01] text-slate-950 font-black text-base flex items-center justify-center gap-3 shadow-lg shadow-cyan-500/25 transition cursor-pointer"
            >
              <span>Let's Go! 🚀</span>
              <ArrowRight size={20} />
            </button>
          </div>
        )}

        {/* STEP 2 & 3: QUESTIONS */}
        {(step === "q1" || step === "q2") && (
          <div className="bg-[#050c21]/95 border border-cyan-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl animate-fade-in text-left">
            
            {/* Header progress */}
            <div className="flex items-center justify-between border-b border-blue-900/60 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl border ${step === "q1" ? "bg-blue-600/20 border-cyan-400/40 text-cyan-400" : "bg-purple-600/20 border-purple-400/40 text-purple-400"}`}>
                  {step === "q1" ? <Terminal size={22} /> : <Brain size={22} />}
                </div>
                <div>
                  <span className="text-xs font-black uppercase text-cyan-400 tracking-wider">
                    {step === "q1" ? "Question 1 of 2" : "Question 2 of 2"}
                  </span>
                  <h3 className="text-lg font-black text-white">
                    PEC Campus Scenario
                  </h3>
                </div>
              </div>

              <span className="text-xs font-mono text-slate-400 bg-[#030818] px-3 py-1.5 rounded-full border border-slate-800">
                <strong className="text-white">{name}</strong> ({studentType})
              </span>
            </div>

            {/* Question Box */}
            <div className="bg-[#030818] border border-cyan-500/40 rounded-2xl p-5 mb-6 relative overflow-hidden shadow-lg shadow-cyan-500/10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-xl pointer-events-none"></div>
              <p className="text-base sm:text-lg font-bold text-cyan-100 leading-relaxed">
                "{currentQuestionText}"
              </p>
            </div>

            {/* MIC CONTROLS */}
            <div className="mb-5 p-4 rounded-2xl bg-[#061438] border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={isListening ? stopListening : startListening}
                  className={`px-5 py-3 rounded-full font-black text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg cursor-pointer w-full sm:w-auto ${
                    isListening
                      ? "bg-red-600 hover:bg-red-700 text-white animate-pulse shadow-red-500/40"
                      : "bg-gradient-to-r from-[#00F0FF] to-[#0075FF] text-slate-950 hover:scale-105 shadow-cyan-500/30"
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff size={18} />
                      <span>🛑 Done Speaking</span>
                    </>
                  ) : (
                    <>
                      <Mic size={18} />
                      <span>🎤 Tap to Speak</span>
                    </>
                  )}
                </button>

                {isListening && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-950/70 border border-red-500/50 text-red-300 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
                    <span>Listening:</span>
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
                    <span>Transcribing...</span>
                  </div>
                )}
              </div>

              <span className="text-xs text-blue-200/80 italic text-center sm:text-right">
                {micNotice || "💡 Speak your answer or type below — any short idea works!"}
              </span>
            </div>

            {/* Answer Textarea */}
            <div className="mb-6">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2 text-cyan-300">
                  <Keyboard size={15} />
                  <span>Your Idea / Solution</span>
                </span>
                <span className="text-[11px] text-cyan-400 font-mono">
                  {step === "q1" ? answer1.length : answer2.length} chars
                </span>
              </label>

              <textarea
                rows={4}
                placeholder="What's your move? Describe your quick plan or hack here (or use the Mic above)..."
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
                Need Ideas? Tap a quick option:
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
                    className="px-3.5 py-1.5 rounded-full bg-[#08153b] hover:bg-cyan-950/60 border border-blue-700/40 hover:border-cyan-400 text-xs text-blue-200 hover:text-cyan-200 transition cursor-pointer font-medium"
                  >
                    + {pill}
                  </button>
                ))}
              </div>
            </div>

            {/* Next / Submit Button */}
            <button
              onClick={handleNextStep}
              className="w-full py-4 rounded-full bg-gradient-to-r from-[#0075FF] to-[#00F0FF] hover:scale-[1.01] text-slate-950 font-black text-base flex items-center justify-center gap-3 shadow-lg shadow-cyan-500/25 transition cursor-pointer"
            >
              <span>{step === "q1" ? "Next Question →" : "Show My Results! 🎉"}</span>
              <ArrowRight size={20} />
            </button>

          </div>
        )}

        {/* STEP 4: SCANNING SCREEN */}
        {step === "analyzing" && (
          <div className="bg-[#050c21]/95 border border-blue-500/40 rounded-3xl p-10 shadow-2xl backdrop-blur-xl text-center animate-pulse">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-600/20 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 animate-spin">
              <RefreshCw size={36} />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
              Analyzing Your Tech Vibe...
            </h2>
            <p className="text-xs sm:text-sm text-cyan-300 max-w-md mx-auto mb-6">
              Matching your responses with PEC ACM wings (CP, ML, Dev, CyberSec)...
            </p>

            <div className="w-full max-w-md mx-auto bg-slate-900 rounded-full h-3 border border-cyan-500/40 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#00F0FF] via-[#7000FF] to-[#FF007A] animate-pulse w-full"></div>
            </div>
          </div>
        )}

        {/* STEP 5: THE PERSONA CARD OUTPUT */}
        {step === "result" && personaResult && (
          <div className="space-y-6 text-center animate-fade-in">
            
            {/* The Main Persona Card Container */}
            <div
              id="persona-card-export"
              className="relative max-w-xl mx-auto rounded-3xl p-1 bg-gradient-to-br from-[#00F0FF] via-[#7000FF] to-[#FF007A] shadow-[0_0_50px_rgba(0,240,255,0.4)] text-left overflow-hidden"
            >
              <div className="bg-[#050b1e] rounded-[22px] p-6 sm:p-8 border border-cyan-400/40 text-white relative">
                
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

                {/* 4 STATS BARS */}
                <div className="space-y-3 mb-6 bg-[#030818] p-4 rounded-2xl border border-slate-800">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1">
                    Tech Aptitude Breakdown
                  </span>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-blue-400 flex items-center gap-1"><Terminal size={12} /> CP Logic</span>
                      <span className="font-mono text-white">{personaResult.cpScore}%</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: `${personaResult.cpScore}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-purple-400 flex items-center gap-1"><Brain size={12} /> Machine Learning</span>
                      <span className="font-mono text-white">{personaResult.mlScore}%</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: `${personaResult.mlScore}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-cyan-400 flex items-center gap-1"><Code size={12} /> Software Development</span>
                      <span className="font-mono text-white">{personaResult.devScore}%</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                      <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${personaResult.devScore}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-emerald-400 flex items-center gap-1"><Shield size={12} /> Cybersecurity</span>
                      <span className="font-mono text-white">{personaResult.cyberScore}%</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                      <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${personaResult.cyberScore}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Verified by PEC ACM Student Chapter</span>
                  <span className="font-mono">ID: ACM-{Math.floor(100000 + Math.random() * 900000)}</span>
                </div>

              </div>
            </div>

            {/* EMAIL STATUS ALERT */}
            {emailStatus && (
              <div className={`max-w-xl mx-auto p-4 rounded-2xl text-sm font-semibold text-center border animate-fade-in ${
                emailStatus.success 
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200' 
                  : 'bg-amber-950/80 border-amber-500/50 text-amber-200'
              }`}>
                {emailStatus.message}
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3">
              {/* Email Persona Card Button */}
              <button
                onClick={handleSendEmail}
                disabled={emailSending}
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:scale-105 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition cursor-pointer disabled:opacity-50"
              >
                {emailSending ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Sending to {email}...</span>
                  </>
                ) : (
                  <>
                    <Mail size={18} />
                    <span>Email My Persona Card 📧</span>
                  </>
                )}
              </button>

              {/* Download PNG Button */}
              <button
                onClick={() => {
                  audioEngine.playClick();
                  downloadCardAsImage("persona-card-export", `${name.replace(/\s+/g, '_')}_PEC_ACM_Card.png`, personaResult);
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-gradient-to-r from-[#0075FF] to-[#00F0FF] hover:scale-105 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition cursor-pointer"
              >
                <Download size={18} />
                <span>Save Persona Card</span>
              </button>

              {/* Retake Button */}
              <button
                onClick={() => {
                  audioEngine.playClick();
                  setScenarios(generateRandomScenarios());
                  setStep("profile");
                  setAnswer1("");
                  setAnswer2("");
                  setEmailStatus(null);
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <RefreshCw size={18} />
                <span>Try Again</span>
              </button>
            </div>

            {/* QUESTION FEEDBACK SECTION */}
            <div className="w-full max-w-4xl mx-auto mt-10 text-left">
              <div className="bg-[#050b1e]/90 border border-blue-900/60 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
                
                <div className="flex items-center gap-3 border-b border-blue-900/60 pb-5 mb-6">
                  <div className="p-2.5 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                    <Lightbulb size={24} />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">
                      PEC ACM MENTOR FEEDBACK
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      Your Problem Solving Breakdown
                    </h3>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Scenario 1 Feedback Card */}
                  {personaResult.feedbackQ1 && (
                    <div className="p-5 sm:p-6 rounded-2xl bg-[#030818] border border-blue-800/40 shadow-inner space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-900/40 pb-3">
                        <h4 className="text-sm font-black text-white tracking-wide">
                          {personaResult.feedbackQ1.questionTitle}
                        </h4>
                        <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border bg-blue-900/40 text-blue-300 border-blue-700/50 w-fit">
                          {personaResult.feedbackQ1.focusBadge}
                        </span>
                      </div>

                      <div className="bg-[#050e26] p-3.5 rounded-xl border border-blue-900/40 space-y-2">
                        <p className="text-xs text-slate-300 italic">
                          <strong className="text-slate-400 not-italic font-mono">Q:</strong> "{personaResult.feedbackQ1.questionText}"
                        </p>
                        <p className="text-xs text-cyan-200">
                          <strong className="text-slate-400 font-mono">Your Answer:</strong> "{personaResult.feedbackQ1.userAnswer}"
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-200 space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
                            <CheckCircle2 size={15} />
                            <span>What Worked</span>
                          </div>
                          <p className="text-xs text-slate-200 leading-relaxed">
                            {personaResult.feedbackQ1.thoughtCorrectly}
                          </p>
                        </div>

                        <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
                          <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold uppercase tracking-wider">
                            <Sparkles size={15} />
                            <span>Pro Tip</span>
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
                        <h4 className="text-sm font-black text-white tracking-wide">
                          {personaResult.feedbackQ2.questionTitle}
                        </h4>
                        <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border bg-purple-900/40 text-purple-300 border-purple-700/50 w-fit">
                          {personaResult.feedbackQ2.focusBadge}
                        </span>
                      </div>

                      <div className="bg-[#050e26] p-3.5 rounded-xl border border-blue-900/40 space-y-2">
                        <p className="text-xs text-slate-300 italic">
                          <strong className="text-slate-400 not-italic font-mono">Q:</strong> "{personaResult.feedbackQ2.questionText}"
                        </p>
                        <p className="text-xs text-purple-200">
                          <strong className="text-slate-400 font-mono">Your Idea:</strong> "{personaResult.feedbackQ2.userAnswer}"
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-200 space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
                            <CheckCircle2 size={15} />
                            <span>What Worked</span>
                          </div>
                          <p className="text-xs text-slate-200 leading-relaxed">
                            {personaResult.feedbackQ2.thoughtCorrectly}
                          </p>
                        </div>

                        <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-2">
                          <div className="flex items-center gap-2 text-purple-300 text-xs font-bold uppercase tracking-wider">
                            <Zap size={15} />
                            <span>Pro Tip</span>
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

            {/* TEAM SECTION */}
            <AcmTeamSection />

          </div>
        )}

      </div>
    </div>
  );
}
