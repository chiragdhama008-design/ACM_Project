import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  Square,
  RefreshCw,
  Sparkles,
  Flame,
  Award,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  FileText,
  Building2,
  User,
  ArrowRight,
  Printer,
  Volume2,
  Clock,
  Layers,
  ChevronRight
} from "lucide-react";
import { API_URL } from "../config/api.js";
import { supabase } from "../supabaseClient.js";
import eicLogo from "../assets/eic_logo.png";

export default function PitchKiosk() {
  // Founder & Pitch Configuration State
  const [founderName, setFounderName] = useState("");
  const [startupName, setStartupName] = useState("");
  const [sector, setSector] = useState("AI & SaaS");
  const [duration, setDuration] = useState(90); // 90 or 120 seconds
  const [isConfigured, setIsConfigured] = useState(false);

  // Recording & Live Pitch State
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90);
  const [transcript, setTranscript] = useState("");
  const [manualText, setManualText] = useState("");
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  // AI Pitch Evaluation Results
  const [scorecard, setScorecard] = useState(null);
  const [savedToSupabase, setSavedToSupabase] = useState(false);
  const [evaluationId, setEvaluationId] = useState(null);

  // Interactive Investor Q&A State (2 Questions)
  const [activeQAIndex, setActiveQAIndex] = useState(null);
  const [selectedLang, setSelectedLang] = useState("en-IN");
  const [qaAnswers, setQaAnswers] = useState({});
  const [qaFeedback, setQaFeedback] = useState({});
  const [isEvaluatingQA, setIsEvaluatingQA] = useState(false);
  const [browserNotice, setBrowserNotice] = useState("");

  // Audio / Media Recording & Speech Recognition Refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);
  const recordingActiveRef = useRef(false);
  const liveTranscriptRef = useRef("");
  const recordedMimeTypeRef = useRef("");

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  // Clean up timer & recording on unmount
  useEffect(() => {
    return () => {
      recordingActiveRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  // Cross-browser supported MIME type detection (Safari iOS, Brave, Chrome, Firefox, Edge)
  const getSupportedMimeType = () => {
    if (typeof MediaRecorder === "undefined" || !MediaRecorder.isTypeSupported) {
      return "";
    }
    const types = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
      "audio/aac",
      "audio/ogg;codecs=opus",
      "audio/wav"
    ];
    for (const t of types) {
      if (MediaRecorder.isTypeSupported(t)) return t;
    }
    return "";
  };

  // Web SpeechRecognition Initialization — Multi-Accent & Cross-Browser Safe
  const startSpeechRecognition = () => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        recognition.lang = selectedLang || navigator.language || "en-IN";

        recognition.onresult = (event) => {
          let currentTranscript = "";
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript + " ";
          }
          liveTranscriptRef.current = currentTranscript;
          setTranscript(currentTranscript);
        };

        recognition.onend = () => {
          // Keep-alive loop while recording is active to prevent dropped mic input
          if (recordingActiveRef.current) {
            try {
              recognition.start();
            } catch (e) {}
          }
        };

        recognition.onerror = (err) => {
          console.warn("SpeechRecognition notice:", err.error);
          if (err.error === "service-not-allowed" || err.error === "not-allowed") {
            setBrowserNotice("Browser STT disabled. Using server-side AI audio transcription mode.");
          } else if (recordingActiveRef.current && err.error !== "aborted") {
            try { recognition.start(); } catch (e) {}
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      } else {
        setBrowserNotice("Server AI Audio Transcription Active (Brave / Safari / Firefox Mode)");
      }
    } catch (e) {
      setBrowserNotice("Server AI Audio Transcription Active");
    }
  };

  // Start Mic Pitch Recording
  const startPitch = async () => {
    recordingActiveRef.current = true;
    liveTranscriptRef.current = "";
    setTranscript("");
    setBrowserNotice("");
    setScorecard(null);
    setSavedToSupabase(false);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      const mimeType = getSupportedMimeType();
      recordedMimeTypeRef.current = mimeType;
      const recorderOptions = mimeType ? { mimeType } : undefined;

      const mediaRecorder = new MediaRecorder(stream, recorderOptions);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(1000);
      startSpeechRecognition();

      setIsRecording(true);
      setIsPaused(false);
      setTimeLeft(duration);

      // Countdown Timer
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            stopPitch();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Microphone access failed:", err);
      alert("Microphone access is required to record your elevator pitch. Please grant microphone permission or paste your pitch text.");
      setIsRecording(false);
      recordingActiveRef.current = false;
    }
  };

  // Pause / Resume Pitch Recording
  const togglePause = () => {
    if (!mediaRecorderRef.current) return;
    if (isPaused) {
      recordingActiveRef.current = true;
      mediaRecorderRef.current.resume();
      if (recognitionRef.current) try { recognitionRef.current.start(); } catch (e) {}
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            stopPitch();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setIsPaused(false);
    } else {
      recordingActiveRef.current = false;
      mediaRecorderRef.current.pause();
      if (recognitionRef.current) try { recognitionRef.current.stop(); } catch (e) {}
      if (timerRef.current) clearInterval(timerRef.current);
      setIsPaused(true);
    }
  };

  // Stop Pitch Recording & Process Audio
  const stopPitch = async () => {
    recordingActiveRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    setIsPaused(false);

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }

    // Combine audio chunks into blob & process pitch
    setTimeout(async () => {
      let finalPitchContent = (liveTranscriptRef.current || transcript).trim();

      // If live transcript is empty/short, or on Safari/Brave/Firefox, use server-side transcription
      if ((finalPitchContent.length < 10 || browserNotice) && audioChunksRef.current.length > 0) {
        const mimeType = recordedMimeTypeRef.current || "audio/webm";
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        if (audioBlob.size > 1000) {
          try {
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
              const base64Audio = reader.result;
              const response = await fetch(`${API_URL}/api/transcribe`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ audio: base64Audio })
              });
              const data = await response.json();
              if (data.text && data.text.length > 5) {
                finalPitchContent = data.text;
                setTranscript(data.text);
              }
              processAIEvaluation(finalPitchContent);
            };
            return;
          } catch (err) {
            console.warn("Server transcription fallback warning:", err);
          }
        }
      }

      processAIEvaluation(finalPitchContent);
    }, 500);
  };



  // Submit Text Pitch directly
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualText.trim()) return;
    setTranscript(manualText.trim());
    processAIEvaluation(manualText.trim());
  };

  // Process AI Pitch Evaluation via backend
  const processAIEvaluation = async (pitchTextContent) => {
    const textToEvaluate = pitchTextContent || manualText || transcript;
    if (!textToEvaluate || textToEvaluate.trim().length < 5) {
      alert("Please provide a pitch by speaking into the mic or entering your pitch text.");
      return;
    }

    setIsProcessingAI(true);
    try {
      const response = await fetch(`${API_URL}/api/pitch/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pitchText: textToEvaluate,
          startupName: startupName || "Stealth Startup",
          sector: sector,
          founderName: founderName || "Student Founder",
          durationSeconds: duration
        })
      });

      const result = await response.json();
      setScorecard(result);

      // Save to Supabase DB if client is connected
      saveToSupabase(result, textToEvaluate);
    } catch (error) {
      console.error("AI pitch evaluation processing error:", error);
      alert("AI pitch processing failed. Please check network connection.");
    } finally {
      setIsProcessingAI(false);
    }
  };

  // Save results to Supabase `pitch_evaluations` table
  const saveToSupabase = async (evalData, textContent) => {
    try {
      const { data, error } = await supabase
        .from("pitch_evaluations")
        .insert([
          {
            founder_name: founderName || "Student Founder",
            startup_name: startupName || "Stealth Startup",
            contact_info: sector,
            pitch_duration_seconds: duration,
            raw_transcript: textContent,
            clarity_hook_rating: evalData.clarityHookRating || 7,
            clarity_feedback: evalData.clarityFeedback || "",
            business_viability_index: evalData.businessViabilityIndex || 70,
            missing_pitch_elements: evalData.missingElements || [],
            pillars_breakdown: evalData.pillarsBreakdown || {},
            investor_questions: evalData.investorQuestions || [],
            recommendations: evalData.recommendations || []
          }
        ])
        .select();

      if (error) {
        console.warn("Supabase save notification (Run Supabase SQL script if table created newly):", error.message);
      } else if (data && data.length > 0) {
        setSavedToSupabase(true);
        setEvaluationId(data[0].id);
      }
    } catch (e) {
      console.warn("Supabase optional save notice:", e.message);
    }
  };

  // Evaluate Investor Q&A Answer
  const submitQAAnswer = async (qId, questionText) => {
    const answerText = qaAnswers[qId];
    if (!answerText || !answerText.trim()) return;

    setIsEvaluatingQA(true);
    try {
      const response = await fetch(`${API_URL}/api/pitch/evaluate-qa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: questionText,
          answer: answerText,
          startupName: startupName
        })
      });
      const data = await response.json();
      setQaFeedback((prev) => ({ ...prev, [qId]: data }));

      // Save Q&A to Supabase
      if (evaluationId) {
        await supabase.from("pitch_qa_responses").insert([
          {
            evaluation_id: evaluationId,
            question_number: qId,
            question_text: questionText,
            founder_answer: answerText,
            ai_feedback: JSON.stringify(data)
          }
        ]);
      }
    } catch (err) {
      console.error("QA evaluation error:", err);
    } finally {
      setIsEvaluatingQA(false);
    }
  };

  const resetKiosk = () => {
    setScorecard(null);
    setTranscript("");
    setManualText("");
    setQaAnswers({});
    setQaFeedback({});
    setActiveQAIndex(null);
    setTimeLeft(duration);
  };

  return (
    <div className="min-h-screen bg-[#060b18] text-slate-100 select-none pb-16">
      {/* 1. Kiosk Top Banner */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
        <div className="bg-gradient-to-r from-[#0b132b] via-[#163b2c] to-[#0b132b] border border-[#10b981]/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#f49f1c]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center space-x-5">
              <div className="relative">
                <img
                  src={eicLogo}
                  alt="EIC Logo"
                  className="w-20 h-20 rounded-full border-2 border-[#10b981] shadow-xl object-cover"
                />
                <div className="absolute -bottom-1 -right-1 bg-[#f49f1c] text-black font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  AI Kiosk
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                    The 2-Minute AI Pitch Practice Kiosk
                  </h1>
                </div>
                <p className="text-slate-300 text-sm mt-1 max-w-xl">
                  Real-time AI evaluation, Clarity & Hook Ratings, Business Viability Indexing, and Investor Cross-Examination for EIC Pitch Competitions.
                </p>
              </div>
            </div>

            {/* Quick Stats or Status Badge */}
            <div className="flex items-center gap-3 bg-[#060b18]/80 border border-[#10b981]/30 p-3 rounded-2xl">
              <Clock className="text-[#f49f1c]" size={24} />
              <div>
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Mode</div>
                <div className="text-sm font-black text-emerald-400">90s Pitch & Q&A Prep</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Startup Setup Form (If not configured) */}
      {!isConfigured ? (
        <div className="max-w-xl mx-auto px-4 mt-12">
          <div className="bg-[#0b132b] border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#1e4635] text-emerald-400 mb-2">
                <Building2 size={24} />
              </div>
              <h2 className="text-2xl font-bold text-white">Enter Pitch Details</h2>
              <p className="text-xs text-slate-400">
                Setup your startup details for the EIC Pitch Evaluator before stepping up to the mic.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsConfigured(true);
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                  Founder Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 text-slate-500" size={18} />
                  <input
                    type="text"
                    required
                    value={founderName}
                    onChange={(e) => setFounderName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-12 pr-4 py-3 bg-[#060b18] border border-slate-800 focus:border-[#10b981] rounded-xl text-sm outline-none text-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                  Startup / Project Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-3.5 text-slate-500" size={18} />
                  <input
                    type="text"
                    required
                    value={startupName}
                    onChange={(e) => setStartupName(e.target.value)}
                    placeholder="e.g. EcoGrid Technologies"
                    className="w-full pl-12 pr-4 py-3 bg-[#060b18] border border-slate-800 focus:border-[#10b981] rounded-xl text-sm outline-none text-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                  Industry Sector / Category
                </label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full px-4 py-3 bg-[#060b18] border border-slate-800 focus:border-[#10b981] rounded-xl text-sm outline-none text-white transition"
                >
                  <option value="AI & SaaS">AI & B2B SaaS</option>
                  <option value="FinTech">FinTech & Payments</option>
                  <option value="EdTech">EdTech & Learning</option>
                  <option value="BioTech & Health">BioTech & HealthCare</option>
                  <option value="CleanTech & EV">CleanTech, EV & Energy</option>
                  <option value="HardTech & Robotics">HardTech & Robotics</option>
                  <option value="Consumer & E-Commerce">Consumer D2C & E-Commerce</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                  Elevator Pitch Duration
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDuration(90)}
                    className={`py-3 rounded-xl text-xs font-bold border transition ${
                      duration === 90
                        ? "bg-[#1e4635] border-[#10b981] text-emerald-400"
                        : "bg-[#060b18] border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    90 Seconds (Fast Elevator)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDuration(120)}
                    className={`py-3 rounded-xl text-xs font-bold border transition ${
                      duration === 120
                        ? "bg-[#1e4635] border-[#10b981] text-emerald-400"
                        : "bg-[#060b18] border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    120 Seconds (2-Min Deck)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                  Speech Recognition Accent Sensitivity
                </label>
                <select
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  className="w-full px-4 py-3 bg-[#060b18] border border-slate-800 focus:border-[#10b981] rounded-xl text-sm outline-none text-white transition"
                >
                  <option value="en-IN">🇮🇳 English (India & South Asia) — High Accent Sensitivity</option>
                  <option value="en-US">🇺🇸 English (US & North America)</option>
                  <option value="en-GB">🇬🇧 English (UK & International)</option>
                  <option value="en-AU">🇦🇺 English (Australia & Oceania)</option>
                </select>
              </div>


              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-[#10b981] to-[#059669] hover:opacity-95 font-bold rounded-xl shadow-xl transition cursor-pointer text-white text-sm"
              >
                Commence AI Pitch Practice <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* 3. Main Kiosk Workspace */
        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8 space-y-8">
          {/* Active Founder Header Toolbar */}
          <div className="bg-[#0b132b] border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-[#1e4635] border border-[#10b981]/40 flex items-center justify-center text-emerald-400 font-bold text-lg">
                {startupName.charAt(0) || "S"}
              </div>
              <div>
                <h3 className="font-bold text-white text-base">{startupName}</h3>
                <p className="text-xs text-slate-400">
                  Founder: <span className="text-emerald-400 font-semibold">{founderName}</span> • Category:{" "}
                  <span className="text-[#f49f1c] font-semibold">{sector}</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsConfigured(false)}
              className="text-xs text-slate-400 hover:text-white border border-slate-800 hover:border-slate-600 px-3.5 py-1.5 rounded-lg transition"
            >
              Edit Startup Info
            </button>
          </div>

          {/* If No Scorecard Yet: Pitch Studio Stage */}
          {!scorecard && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column (2/3): Recording Console */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-[#0b132b] border border-slate-800 rounded-3xl p-8 shadow-2xl relative">
                  {/* Timer & Studio Visualizer */}
                  <div className="flex flex-col items-center justify-center text-center py-6 space-y-6">
                    <div className="relative flex items-center justify-center">
                      {/* Pulse ring when recording */}
                      {isRecording && !isPaused && (
                        <div className="absolute w-44 h-44 rounded-full border-4 border-[#f49f1c] animate-ping opacity-30"></div>
                      )}

                      <div
                        className={`w-36 h-36 rounded-full flex flex-col items-center justify-center border-4 transition-all duration-300 ${
                          isRecording
                            ? "bg-[#1e4635] border-[#10b981] shadow-2xl shadow-emerald-950/80 animate-pulse-glow"
                            : "bg-[#060b18] border-slate-800"
                        }`}
                      >
                        <Mic
                          size={38}
                          className={isRecording ? "text-[#f49f1c] animate-bounce" : "text-slate-500"}
                        />
                        <span className="text-2xl font-black text-white mt-1">
                          {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          {isRecording ? (isPaused ? "Paused" : "Live Mic") : "Ready"}
                        </span>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center space-x-4">
                      {!isRecording ? (
                        <button
                          onClick={startPitch}
                          disabled={isProcessingAI}
                          className="flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-bold rounded-2xl shadow-xl hover:opacity-95 transform hover:-translate-y-0.5 transition cursor-pointer text-base"
                        >
                          <Mic size={20} />
                          Start {duration}-Sec Pitch
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={togglePause}
                            className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 transition cursor-pointer text-sm"
                          >
                            {isPaused ? "Resume" : "Pause"}
                          </button>
                          <button
                            onClick={stopPitch}
                            className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold rounded-xl shadow-lg hover:opacity-95 transition cursor-pointer text-sm"
                          >
                            <Square size={16} /> Stop & Evaluate AI
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Real-time Live Speech Transcription Container — Verbatim Capture */}
                  <div className="mt-6 border-t border-slate-800/80 pt-6">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                        <Volume2 size={16} className="text-[#10b981]" /> Verbatim Spoken Transcript (No Auto-Correct)
                      </span>
                      <div className="flex items-center gap-2">
                        {browserNotice && (
                          <span className="text-[10px] text-amber-300 font-semibold bg-amber-950/60 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                            {browserNotice}
                          </span>
                        )}
                        {isRecording ? (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#f49f1c] bg-[#f49f1c]/10 border border-[#f49f1c]/30 px-2.5 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#f49f1c] animate-ping"></span> High-Sensitivity Mic Active
                          </span>
                        ) : (
                          transcript && (
                            <span className="text-[10px] text-emerald-400 font-bold bg-[#163b2c] border border-[#10b981]/30 px-2 py-0.5 rounded-full">
                              Verbatim Spoken Text Captured
                            </span>
                          )
                        )}
                      </div>
                    </div>


                    {isRecording ? (
                      <div className="min-h-[120px] max-h-[180px] overflow-y-auto bg-[#060b18] border border-[#10b981]/40 rounded-2xl p-4 text-slate-200 text-sm leading-relaxed italic">
                        {transcript || (
                          <span className="text-slate-500 not-italic">
                            Listening to your speech... Speak into the microphone.
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <textarea
                          rows={4}
                          value={transcript}
                          onChange={(e) => {
                            setTranscript(e.target.value);
                            liveTranscriptRef.current = e.target.value;
                          }}
                          placeholder={`Click "Start ${duration}-Sec Pitch" above and speak into your mic. Your exact spoken pitch will appear here.`}
                          className="w-full p-4 bg-[#060b18] border border-slate-800 focus:border-[#10b981] rounded-2xl text-sm outline-none text-slate-200 transition leading-relaxed"
                        />
                        {transcript.trim().length > 5 && (
                          <button
                            onClick={() => processAIEvaluation(transcript.trim())}
                            disabled={isProcessingAI}
                            className="px-6 py-2.5 bg-[#163b2c] border border-[#10b981]/40 text-emerald-300 font-bold rounded-xl hover:bg-[#10b981] hover:text-slate-950 transition cursor-pointer text-xs flex items-center gap-2"
                          >
                            <Sparkles size={14} /> Evaluate Recorded Pitch with AI
                          </button>
                        )}
                      </div>
                    )}
                  </div>


                  {/* Manual Text Pitch Fallback option */}
                  <div className="mt-6 border-t border-slate-800/80 pt-6">
                    <details className="group">
                      <summary className="text-xs text-slate-400 hover:text-white font-semibold cursor-pointer flex items-center justify-between">
                        <span>Prefer to paste your pitch deck transcript directly?</span>
                        <ChevronRight size={16} className="group-open:rotate-90 transition" />
                      </summary>
                      <form onSubmit={handleManualSubmit} className="mt-4 space-y-3">
                        <textarea
                          rows={4}
                          value={manualText}
                          onChange={(e) => setManualText(e.target.value)}
                          placeholder="Paste your 90-second elevator pitch text here..."
                          className="w-full p-4 bg-[#060b18] border border-slate-800 focus:border-[#10b981] rounded-2xl text-sm outline-none text-white transition"
                        />
                        <button
                          type="submit"
                          disabled={isProcessingAI || !manualText.trim()}
                          className="px-6 py-2.5 bg-[#1e4635] text-emerald-400 border border-[#10b981]/40 font-bold rounded-xl hover:bg-[#10b981] hover:text-white transition cursor-pointer text-xs"
                        >
                          Generate AI Evaluation from Text
                        </button>
                      </form>
                    </details>
                  </div>
                </div>
              </div>

              {/* Right Column (1/3): 4 Pitch Deck Pillars Guide */}
              <div className="space-y-6">
                <div className="bg-[#0b132b] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
                  <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
                    <Layers className="text-[#f49f1c]" size={22} />
                    <h3 className="font-bold text-white text-base">The 4 Pitch Pillars</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Ensure your 90-second pitch hits all 4 critical investor pillars to maximize your Business Viability Index:
                  </p>

                  <div className="space-y-3">
                    <div className="p-3.5 bg-[#060b18] border border-slate-800 rounded-2xl space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                        <span>1. Problem Statement</span>
                        <span className="text-[10px] text-slate-500">First 20s</span>
                      </div>
                      <p className="text-xs text-slate-400">State the acute customer pain point clearly & hit a strong hook.</p>
                    </div>

                    <div className="p-3.5 bg-[#060b18] border border-slate-800 rounded-2xl space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-[#f49f1c]">
                        <span>2. Market Size</span>
                        <span className="text-[10px] text-slate-500">20s-40s</span>
                      </div>
                      <p className="text-xs text-slate-400">Define your target market scale, TAM/SAM, or customer segment.</p>
                    </div>

                    <div className="p-3.5 bg-[#060b18] border border-slate-800 rounded-2xl space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                        <span>3. Business Model</span>
                        <span className="text-[10px] text-slate-500">40s-65s</span>
                      </div>
                      <p className="text-xs text-slate-400">Explain revenue streams, pricing, and how you monetize.</p>
                    </div>

                    <div className="p-3.5 bg-[#060b18] border border-slate-800 rounded-2xl space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-[#f49f1c]">
                        <span>4. Competitive Advantage</span>
                        <span className="text-[10px] text-slate-500">65s-90s</span>
                      </div>
                      <p className="text-xs text-slate-400">Highlight your defensibility, IP, proprietary tech, or team moat.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Processing Spinner Overlay */}
          {isProcessingAI && (
            <div className="bg-[#0b132b] border border-[#10b981]/50 rounded-3xl p-12 text-center shadow-2xl space-y-6 animate-pulse">
              <div className="inline-flex p-4 rounded-full bg-[#1e4635] text-emerald-400 mb-2">
                <RefreshCw size={40} className="animate-spin" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                AI Pitch Evaluator Processing Scorecard...
              </h2>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                Analyzing problem hook clarity, auditing the 4 business pillars, detecting missing pitch elements, and drafting investor cross-examination questions.
              </p>
            </div>
          )}

          {/* 4. AI Pitch Scorecard Result Dashboard */}
          {scorecard && !isProcessingAI && (
            <div className="space-y-8 print:text-black print:bg-white">
              {/* Scorecard Header Action Bar */}
              <div className="bg-[#0b132b] border border-[#10b981]/40 rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="bg-[#f49f1c] text-black font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                      EIC Official Pitch Scorecard
                    </span>
                    {savedToSupabase && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-[#1e4635] px-3 py-1 rounded-full border border-[#10b981]/40">
                        <CheckCircle2 size={14} /> Saved to Supabase
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-black text-white mt-2">
                    Evaluation & Viability Report for {startupName}
                  </h2>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 transition cursor-pointer"
                  >
                    <Printer size={15} /> Export Scorecard PDF
                  </button>
                  <button
                    onClick={resetKiosk}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-lg"
                  >
                    <RefreshCw size={15} /> Practice Again
                  </button>
                </div>
              </div>

              {/* Main Scorecard Gauge Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Clarity & Hook Rating */}
                <div className="bg-[#0b132b] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-[#1e4635] text-emerald-400 rounded-2xl">
                        <Sparkles size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">Clarity & Hook Rating</h3>
                        <p className="text-xs text-slate-400">Problem statement articulation & opening impact</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center bg-[#060b18] border border-[#10b981]/40 px-5 py-3 rounded-2xl">
                      <span className="text-3xl font-black text-[#10b981]">
                        {scorecard.clarityHookRating || 7}/10
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Score</span>
                    </div>
                  </div>

                  <div className="p-4 bg-[#060b18] border border-slate-800 rounded-2xl text-xs text-slate-300 leading-relaxed">
                    <strong className="text-emerald-400 block mb-1">Evaluator Rationale:</strong>
                    {scorecard.clarityFeedback}
                  </div>
                </div>

                {/* 2. Business Viability Index */}
                <div className="bg-[#0b132b] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-[#f49f1c]/20 text-[#f49f1c] rounded-2xl">
                        <TrendingUp size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">Business Viability Index</h3>
                        <p className="text-xs text-slate-400">Structural completeness across 4 pitch pillars</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center bg-[#060b18] border border-[#f49f1c]/40 px-5 py-3 rounded-2xl">
                      <span className="text-3xl font-black text-[#f49f1c]">
                        {scorecard.businessViabilityIndex || 75}%
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Index</span>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-[#10b981] to-[#f49f1c] h-full transition-all duration-1000"
                      style={{ width: `${scorecard.businessViabilityIndex || 75}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Missing Pitch Elements Alert Banner */}
              {scorecard.missingElements && scorecard.missingElements.length > 0 && (
                <div className="bg-amber-950/30 border border-[#f49f1c]/40 rounded-3xl p-6 shadow-xl space-y-3">
                  <div className="flex items-center space-x-3 text-[#f49f1c]">
                    <AlertTriangle size={24} />
                    <h3 className="font-extrabold text-base uppercase tracking-wider">
                      Identified Missing Pitch Elements (Critical Deck Gaps)
                    </h3>
                  </div>

                  <p className="text-xs text-slate-300">
                    The AI pitch evaluator detected the following missing or unstated components in your pitch:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {scorecard.missingElements.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center space-x-3 bg-[#060b18] border border-[#f49f1c]/30 rounded-2xl p-3.5 text-xs text-amber-200 font-semibold"
                      >
                        <span className="w-2 h-2 rounded-full bg-[#f49f1c] shrink-0"></span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4 Pillars Breakdown Grid */}
              {scorecard.pillarsBreakdown && (
                <div className="bg-[#0b132b] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
                  <h3 className="font-bold text-white text-lg flex items-center gap-2">
                    <Layers className="text-[#10b981]" size={20} /> 4 Pitch Deck Pillars Detailed Audit
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(scorecard.pillarsBreakdown).map(([key, val]) => (
                      <div
                        key={key}
                        className="bg-[#060b18] border border-slate-800 rounded-2xl p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                            {key.replace(/([A-Z])/g, " $1")}
                          </span>
                          <span
                            className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                              val.present
                                ? "bg-[#1e4635] text-emerald-400 border border-[#10b981]/40"
                                : "bg-red-950/60 text-red-400 border border-red-900/40"
                            }`}
                          >
                            {val.present ? `Score: ${val.score}/10` : "Missing"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{val.feedback}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Investor Q&A Simulation (2 Tough Cross-Examination Questions) */}
              {scorecard.investorQuestions && scorecard.investorQuestions.length > 0 && (
                <div className="bg-[#0b132b] border border-[#10b981]/40 rounded-3xl p-6 shadow-2xl space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-[#f49f1c]/20 text-[#f49f1c] rounded-2xl">
                        <HelpCircle size={26} />
                      </div>
                      <div>
                        <h3 className="font-black text-white text-xl">
                          Investor Q&A Simulation (Cross-Examination)
                        </h3>
                        <p className="text-xs text-slate-400">
                          Practice responding to 2 tough follow-up questions an angel investor will ask after your pitch.
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-[#f49f1c] bg-[#f49f1c]/10 border border-[#f49f1c]/30 px-3 py-1 rounded-full">
                      2 Questions Generated
                    </span>
                  </div>

                  <div className="space-y-6">
                    {scorecard.investorQuestions.map((q, idx) => (
                      <div
                        key={q.id || idx}
                        className="bg-[#060b18] border border-slate-800 rounded-2xl p-5 space-y-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#f49f1c] bg-[#f49f1c]/10 border border-[#f49f1c]/30 px-2 py-0.5 rounded">
                              Investor Question #{idx + 1}
                            </span>
                            <h4 className="font-bold text-white text-base mt-1">"{q.question}"</h4>
                            <p className="text-xs text-slate-400">
                              Investor Intent: <span className="italic text-slate-300">{q.intent}</span>
                            </p>
                          </div>

                          <button
                            onClick={() => setActiveQAIndex(activeQAIndex === q.id ? null : q.id)}
                            className="px-4 py-2 bg-[#1e4635] text-emerald-400 border border-[#10b981]/40 font-bold rounded-xl text-xs hover:bg-[#10b981] hover:text-white transition cursor-pointer shrink-0"
                          >
                            {activeQAIndex === q.id ? "Close Input" : "Answer Question"}
                          </button>
                        </div>

                        {/* Q&A Interactive Input Modal / Drawer */}
                        {activeQAIndex === q.id && (
                          <div className="pt-3 border-t border-slate-800 space-y-3">
                            <textarea
                              rows={3}
                              value={qaAnswers[q.id] || ""}
                              onChange={(e) =>
                                setQaAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                              }
                              placeholder="Type or present your answer to this investor question..."
                              className="w-full p-3.5 bg-[#0b132b] border border-slate-800 focus:border-[#10b981] rounded-xl text-xs outline-none text-white transition"
                            />

                            <button
                              onClick={() => submitQAAnswer(q.id, q.question)}
                              disabled={isEvaluatingQA || !qaAnswers[q.id]?.trim()}
                              className="px-5 py-2.5 bg-gradient-to-r from-[#10b981] to-[#059669] text-white font-bold rounded-xl text-xs hover:opacity-95 transition cursor-pointer"
                            >
                              {isEvaluatingQA ? "Evaluating Answer..." : "Submit Answer to Investor AI"}
                            </button>
                          </div>
                        )}

                        {/* Q&A AI Feedback Result */}
                        {qaFeedback[q.id] && (
                          <div className="mt-3 p-4 bg-[#0b132b] border border-[#10b981]/40 rounded-xl space-y-2 text-xs">
                            <div className="flex items-center justify-between text-emerald-400 font-bold">
                              <span>Investor Rating: {qaFeedback[q.id].rating}/10</span>
                              <span>Feedback Generated</span>
                            </div>
                            <p className="text-slate-300">{qaFeedback[q.id].feedback}</p>
                            {qaFeedback[q.id].improvementTip && (
                              <p className="text-[#f49f1c]">
                                <strong>Tip:</strong> {qaFeedback[q.id].improvementTip}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actionable Recommendations */}
              {scorecard.recommendations && scorecard.recommendations.length > 0 && (
                <div className="bg-[#0b132b] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                  <h3 className="font-bold text-white text-lg flex items-center gap-2">
                    <Award className="text-[#f49f1c]" size={22} /> Tactical Recommendations for E-Summit
                  </h3>

                  <div className="space-y-2">
                    {scorecard.recommendations.map((rec, idx) => (
                      <div
                        key={idx}
                        className="flex items-center space-x-3 bg-[#060b18] border border-slate-800/80 rounded-2xl p-3.5 text-xs text-slate-300"
                      >
                        <CheckCircle2 size={16} className="text-[#10b981] shrink-0" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
