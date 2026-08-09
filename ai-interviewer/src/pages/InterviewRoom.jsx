import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, Camera, Send, CheckCircle, RefreshCw, Radio, VideoOff, MicOff, AlertTriangle, LogOut } from "lucide-react";
import { API_URL } from "../config/api.js";
import { supabase } from "../supabaseClient.js";

export default function InterviewRoom() {
  const navigate = useNavigate();

  // Hardcoded Client Interview Script Questionnaire Pool (Core 4 + Dynamic 5th)
  const clientQuestions = [
    "What are your career goals?",
    "What are you really good at professionally?",
    "What are you not good at or not interested in doing professionally?",
    "Who were your last five bosses, and how will they each rate your performance on a 1-10 scale when we talk to them?"
  ];

  const [transcript, setTranscript] = useState("");
  const [questionCount, setQuestionCount] = useState(1);
  const [historyLog, setHistoryLog] = useState([]);
  const historyLogRef = useRef([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);

  const [calibrating, setCalibrating] = useState(true);
  const [calibStatus, setCalibStatus] = useState("Analyzing Feed...");
  const [isRecording, setIsRecording] = useState(false);
  const [permissionError, setPermissionError] = useState(false);
  const [permissionRetryKey, setPermissionRetryKey] = useState(0);

  const [tabSwitches, setTabSwitches] = useState(0);
  const tabSwitchesRef = useRef(0);
  const userEmailRef = useRef("");

  const [displayQuestionText, setDisplayQuestionText] = useState(clientQuestions[0]);
  const [isCrossQuestionActive, setIsCrossQuestionActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Tracks cross questions for the CURRENT base question (Max 3)
  const [currentQuestionCrossCount, setCurrentQuestionCrossCount] = useState(0);
  const currentQuestionCrossCountRef = useRef(0);

  // Persistent flag to ensure the microphone stays open continuously without silencing out
  const shouldListenRef = useRef(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const frameTimerRef = useRef(null);
  const sendFrameRef = useRef(null);
  const recognitionRef = useRef(null); // kept for cleanup compatibility

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const finalTranscriptRef = useRef("");
  const transcribeInFlightRef = useRef(false);
  const pendingBlobRef = useRef(null);

  // Voice Activity Detection (VAD) refs
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const vadIntervalRef = useRef(null);
  const silenceStartRef = useRef(null);
  const audioIntervalRef = useRef(null);
  const frameInFlightRef = useRef(false);

  // Live recording status indicator
  const [isTranscribing, setIsTranscribing] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        userEmailRef.current = session.user.email;
      }
    });
  }, []);

  // Strict Tab-Switch Counter Monitor Engine
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !interviewComplete && !permissionError && !calibrating) {
        tabSwitchesRef.current += 1;
        setTabSwitches(tabSwitchesRef.current);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [interviewComplete, permissionError, calibrating]);

  useEffect(() => {
    const initializeMediaEngine = async () => {
      try {
        let stream = null;
        // Progressive getUserMedia — works on Chrome, Brave, Firefox, Safari, Edge
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 320 }, height: { ideal: 240 }, frameRate: { ideal: 24 } },
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          });
        } catch (err1) {
          console.warn("Advanced audio constraints failed, using basic fallback:", err1.name);
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
          });
        }

        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setPermissionError(false);
        setCalibrating(false);
        frameTimerRef.current = setInterval(() => sendFrameRef.current?.(), 1000);
      } catch (err) {
        console.error("Media devices permission denied or failed:", err);
        setCalibrating(false);
        setPermissionError(true);
      }
    };
    if (!interviewComplete) initializeMediaEngine();

    return () => {
      shouldListenRef.current = false;
      clearInterval(frameTimerRef.current);
      if (vadIntervalRef.current) clearInterval(vadIntervalRef.current);
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try { mediaRecorderRef.current.stop(); } catch(e){}
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        try { audioContextRef.current.close(); } catch(e){}
      }
      window.speechSynthesis.cancel();
    };
  }, [interviewComplete, permissionRetryKey]);

  /**
   * Send an audio blob to the server for Whisper transcription.
   * Uses a queue to prevent overlapping requests — if a request is in-flight,
   * the blob is saved and sent after the current one completes.
   */
  const sendAudioForTranscription = useCallback(async (audioBlob) => {
    if (!audioBlob || audioBlob.size < 1500) return;

    if (transcribeInFlightRef.current) {
      // Queue this blob — merge with any pending blob
      if (pendingBlobRef.current) {
        pendingBlobRef.current = new Blob([pendingBlobRef.current, audioBlob], { type: audioBlob.type });
      } else {
        pendingBlobRef.current = audioBlob;
      }
      return;
    }

    transcribeInFlightRef.current = true;
    setIsTranscribing(true);

    try {
      const base64Audio = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(audioBlob);
      });

      const res = await fetch(`${API_URL}/transcribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audio: base64Audio })
      });
      const data = await res.json();
      if (data.text && data.text.trim()) {
        const newChunk = data.text.trim();
        const currentLower = finalTranscriptRef.current.toLowerCase();
        const chunkLower = newChunk.toLowerCase();
        if (!currentLower.endsWith(chunkLower)) {
          finalTranscriptRef.current = (finalTranscriptRef.current + " " + newChunk).replace(/\s+/g, " ").trim();
          setTranscript(finalTranscriptRef.current);
        }
      }
    } catch (err) {
      console.error("Whisper transcription request error:", err);
    } finally {
      transcribeInFlightRef.current = false;
      setIsTranscribing(false);

      // Process any queued blob
      if (pendingBlobRef.current && shouldListenRef.current) {
        const queued = pendingBlobRef.current;
        pendingBlobRef.current = null;
        sendAudioForTranscription(queued);
      }
    }
  }, []);

  /**
   * Get the best supported audio MIME type for MediaRecorder across all browsers.
   */
  const getBestAudioMimeType = useCallback(() => {
    if (typeof MediaRecorder === "undefined") return "audio/webm";
    const candidates = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/ogg",
      "audio/mp4"
    ];
    for (const mime of candidates) {
      if (MediaRecorder.isTypeSupported(mime)) return mime;
    }
    return "";
  }, []);

  /**
   * UNIVERSAL WHISPER-POWERED SPEECH ENGINE
   * Works identically on Chrome, Brave, Firefox, Safari, Edge.
   * Records audio via MediaRecorder and uses Voice Activity Detection (VAD)
   * to send chunks at natural speech pauses — never cuts words mid-sentence.
   *
   * Flow: MediaRecorder records continuously → VAD detects silence pauses →
   * stops recorder → sends chunk to /api/transcribe (Whisper) → restarts recorder
   * Also has a max-duration safety net (6s) so long continuous speech still gets transcribed.
   */
  const startWhisperEngine = useCallback(() => {
    if (!streamRef.current || !shouldListenRef.current) return;

    // Don't start if already recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") return;

    const audioTrack = streamRef.current.getAudioTracks()[0];
    if (!audioTrack) return;

    const mimeType = getBestAudioMimeType();
    if (!mimeType) {
      console.error("No supported audio MIME type found for MediaRecorder");
      return;
    }

    // Set up AudioContext + Analyser for VAD
    try {
      if (!audioContextRef.current || audioContextRef.current.state === "closed") {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const source = ctx.createMediaStreamSource(streamRef.current);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 512;
          analyser.smoothingTimeConstant = 0.85;
          source.connect(analyser);
          audioContextRef.current = ctx;
          analyserRef.current = analyser;
        }
      }
    } catch(e) {}

    const audioStream = new MediaStream([audioTrack]);
    let recorder;
    try {
      recorder = new MediaRecorder(audioStream, { mimeType });
    } catch(e) {
      // Last resort — let browser pick the codec
      recorder = new MediaRecorder(audioStream);
    }
    audioChunksRef.current = [];
    silenceStartRef.current = null;

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        audioChunksRef.current.push(e.data);
      }
    };

    recorder.onstop = () => {
      const chunks = audioChunksRef.current;
      audioChunksRef.current = [];

      if (chunks.length > 0) {
        const audioBlob = new Blob(chunks, { type: mimeType });
        sendAudioForTranscription(audioBlob);
      }

      // Restart recorder for the next chunk if we should still be listening
      if (shouldListenRef.current) {
        setTimeout(() => {
          if (shouldListenRef.current) startWhisperEngine();
        }, 150);
      }
    };

    // Start recording — collect data every 500ms for smooth chunking
    recorder.start(500);
    mediaRecorderRef.current = recorder;
    setIsRecording(true);

    // VAD: Monitor audio volume and stop recorder on silence pauses
    // This ensures we send complete sentences/phrases to Whisper, not cut-off fragments
    if (vadIntervalRef.current) clearInterval(vadIntervalRef.current);

    const SILENCE_THRESHOLD = 15;   // Volume level below which we consider "silence"
    const SILENCE_DURATION = 1500;  // ms of silence before we flush the chunk (1.5s pause = sentence boundary)
    const MAX_CHUNK_DURATION = 6000; // Maximum chunk duration before forced flush (6 seconds)
    const recordStartTime = Date.now();

    vadIntervalRef.current = setInterval(() => {
      if (!shouldListenRef.current || !mediaRecorderRef.current || mediaRecorderRef.current.state !== "recording") {
        clearInterval(vadIntervalRef.current);
        return;
      }

      const elapsed = Date.now() - recordStartTime;

      // Check audio volume via analyser
      let currentVolume = 0;
      if (analyserRef.current) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        currentVolume = dataArray.reduce((sum, v) => sum + v, 0) / dataArray.length;
      }

      if (currentVolume < SILENCE_THRESHOLD) {
        // Silence detected
        if (!silenceStartRef.current) {
          silenceStartRef.current = Date.now();
        }
        const silenceDuration = Date.now() - silenceStartRef.current;

        // Only flush if we have recorded enough audio AND silence has lasted long enough
        if (silenceDuration >= SILENCE_DURATION && elapsed > 800) {
          clearInterval(vadIntervalRef.current);
          silenceStartRef.current = null;
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop(); // triggers onstop → transcribe → restart
          }
        }
      } else {
        // Speech detected — reset silence timer
        silenceStartRef.current = null;
      }

      // Safety net: force flush at max duration so long continuous speech still gets transcribed
      if (elapsed >= MAX_CHUNK_DURATION) {
        clearInterval(vadIntervalRef.current);
        silenceStartRef.current = null;
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.stop();
        }
      }
    }, 100); // Check every 100ms for responsive VAD
  }, [sendAudioForTranscription, getBestAudioMimeType]);

  const speakAIQuestion = useCallback((textToSpeak) => {
    if (!textToSpeak) return;
    
    // Reset transcript buffers for the new question
    finalTranscriptRef.current = "";
    pendingBlobRef.current = null;
    setTranscript("");

    // Stop all recording while AI is speaking the question
    shouldListenRef.current = false;
    window.speechSynthesis.cancel();
    
    if (vadIntervalRef.current) clearInterval(vadIntervalRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try { mediaRecorderRef.current.stop(); } catch(e){}
    }
    setIsRecording(false);

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    const handleSpeechEnd = () => {
      // Re-enable microphone and start Whisper engine after AI finishes speaking
      shouldListenRef.current = true;
      startWhisperEngine();
    };

    utterance.onend = handleSpeechEnd;
    utterance.onerror = handleSpeechEnd;
    window.speechSynthesis.speak(utterance);
  }, [startWhisperEngine]);

  useEffect(() => {
    if (!calibrating && !permissionError && displayQuestionText && !interviewComplete) {
      const timer = setTimeout(() => speakAIQuestion(displayQuestionText), 600);
      return () => clearTimeout(timer);
    }
  }, [calibrating, permissionError, displayQuestionText, interviewComplete, speakAIQuestion]);

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return null;
    canvas.width = 320; canvas.height = 240;
    canvas.getContext("2d").drawImage(video, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.6);
  }, []);

  const sendFrameTick = useCallback(async () => {
    if (frameInFlightRef.current) return;
    const base64Data = captureFrame();
    if (!base64Data) return;
    frameInFlightRef.current = true;
    try {
      const res = await fetch(`${API_URL}/session/frame`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Data }),
      });
      const data = await res.json();
      if (data.calib_status || data.emotion) setCalibStatus(data.calib_status || data.emotion);
    } catch (err) {
    } finally {
      frameInFlightRef.current = false;
    }
  }, [captureFrame]);

  useEffect(() => { sendFrameRef.current = sendFrameTick; }, [sendFrameTick]);

  const handleFinalEvaluation = async (finalHistoryLog) => {
    shouldListenRef.current = false;
    window.speechSynthesis.cancel();
    clearInterval(frameTimerRef.current);
    if (vadIntervalRef.current) clearInterval(vadIntervalRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try { mediaRecorderRef.current.stop(); } catch(e){}
    }
    pendingBlobRef.current = null;
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());

    setIsSubmitting(true);
    try {
      const evaluationRes = await fetch(`${API_URL}/interview/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviewAnswers: finalHistoryLog, clientScreeningMode: true })
      });
      const evalData = await evaluationRes.json();

      const candidateName = sessionStorage.getItem("candidate_name") || "Not Provided";
      const candidatePhone = sessionStorage.getItem("candidate_phone") || "Not Provided";

      await supabase.from("screenings").insert([{
        user_email: userEmailRef.current || "unknown_candidate@company.com",
        full_name: candidateName,
        contact_number: candidatePhone,
        tab_switch_count: tabSwitchesRef.current,
        ai_feedback: evalData,
        screen_status: evalData.decision || "SCREEN_OUT"
      }]);

      sessionStorage.removeItem("candidate_name");
      sessionStorage.removeItem("candidate_phone");

    } catch (err) {
      console.error("Silent submission failed:", err);
      await supabase.from("screenings").insert([{
        user_email: userEmailRef.current || "fallback_candidate@company.com",
        full_name: sessionStorage.getItem("candidate_name") || "Fallback Name",
        contact_number: sessionStorage.getItem("candidate_phone") || "Fallback Phone",
        tab_switch_count: tabSwitchesRef.current,
        ai_feedback: { error: "Evaluations computed under structural bypass pipelines." },
        screen_status: "SCREEN_OUT"
      }]);
    } finally {
      setIsSubmitting(false);
      setInterviewComplete(true);
    }
  };

  const submitAnswer = async () => {
    shouldListenRef.current = false;
    if (vadIntervalRef.current) clearInterval(vadIntervalRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try { mediaRecorderRef.current.stop(); } catch(e){}
    }

    // Give in-flight Whisper transcription a brief moment to finish processing the final audio chunk
    if (transcribeInFlightRef.current) {
      await new Promise(r => setTimeout(r, 450));
    }

    const spokenPart = (finalTranscriptRef.current || transcript).trim();
    if (!spokenPart) return;

    pendingBlobRef.current = null;
    finalTranscriptRef.current = "";
    setIsRecording(false);
    setIsProcessing(true);
    setTranscript("");

    const currentAnswerPayload = {
      questionText: displayQuestionText,
      answerText: spokenPart,
      isCrossQuestion: isCrossQuestionActive
    };

    const updatedHistory = [...historyLogRef.current, currentAnswerPayload];
    historyLogRef.current = updatedHistory;
    setHistoryLog(updatedHistory);

    try {
      const response = await fetch(`${API_URL}/session/check-satisfactory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: displayQuestionText, answer: spokenPart })
      });
      const integrityData = await response.json();

      if (questionCount === 5 && integrityData.satisfactory === true) {
        handleFinalEvaluation(historyLogRef.current);
        return;
      }

      if (integrityData.satisfactory === false && currentQuestionCrossCountRef.current < 3) {
        const cqRes = await fetch(`${API_URL}/session/cross-question`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentQuestion: displayQuestionText, currentAnswer: spokenPart })
        });
        const cqData = await cqRes.json();
        
        if (cqData && cqData.crossQuestion) {
          setIsCrossQuestionActive(true);
          
          const nextCrossCount = currentQuestionCrossCountRef.current + 1;
          currentQuestionCrossCountRef.current = nextCrossCount;
          setCurrentQuestionCrossCount(nextCrossCount);

          if (questionCount === 4) {
            setQuestionCount(5);
          }
          
          setDisplayQuestionText(cqData.crossQuestion);
          setIsProcessing(false);
          return;
        }
      }
    } catch (e) {
      console.error("Error evaluating response criteria flow:", e);
    }

    advanceToNextQuestion();
  };

  const advanceToNextQuestion = async () => {
    setIsCrossQuestionActive(false);
    currentQuestionCrossCountRef.current = 0;
    setCurrentQuestionCrossCount(0);

    const baseAnswersCount = historyLogRef.current.filter(h => !h.isCrossQuestion).length;

    if (baseAnswersCount >= clientQuestions.length && questionCount < 5) {
      setQuestionCount(5);
      try {
        const finalQRes = await fetch(`${API_URL}/session/cross-question`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            currentQuestion: "Summary Progression", 
            currentAnswer: "Candidate completed core script modules successfully."
          })
        });
        const finalQData = await finalQRes.json();
        setDisplayQuestionText(finalQData.crossQuestion || "Final Question: Summarize why you feel you are the most reliable candidate for this repetitive operational work stream.");
      } catch (e) {
        setDisplayQuestionText("Final Question: Summarize why you feel you are the most reliable candidate for this repetitive operational work stream.");
      }
      setIsProcessing(false);
      return;
    }

    if (questionCount >= 5) {
      handleFinalEvaluation(historyLogRef.current);
      return;
    }

    const nextIndex = questionCount;
    setQuestionCount(prev => prev + 1);
    setDisplayQuestionText(clientQuestions[nextIndex]);
    setIsProcessing(false);
  };

  if (permissionError) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-8">
        <div className="max-w-md text-center bg-slate-900 border border-rose-500/30 rounded-3xl p-10 space-y-5">
          <div className="flex justify-center gap-3 text-rose-400"><VideoOff size={36} /><MicOff size={36} /></div>
          <h2 className="text-2xl font-bold">Hardware Authorization Blocked</h2>
          <p className="text-sm text-slate-400">Media capture engine failed. Enable camera/microphone access settings to continue.</p>
          <button onClick={() => { setPermissionError(false); setCalibrating(true); setPermissionRetryKey(k => k + 1); }} className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-500 font-bold rounded-xl">Retry Session</button>
        </div>
      </div>
    );
  }

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center text-center">
        <div className="space-y-4">
          <RefreshCw size={50} className="mx-auto text-purple-400 animate-spin" />
          <h2 className="text-2xl font-bold">Processing Verification & Transcripts...</h2>
          <p className="text-sm text-slate-500">Securing your session parameters safely inside employer logs.</p>
        </div>
      </div>
    );
  }

  if (interviewComplete) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="max-w-xl w-full text-center bg-slate-900 border border-slate-800 rounded-3xl p-10 shadow-2xl space-y-6">
          <div className="flex justify-center text-emerald-400"><CheckCircle size={64} /></div>
          <h1 className="text-3xl font-black tracking-tight">Assessment Submitted Successfully</h1>
          <p className="text-slate-300 leading-relaxed text-sm">
            Thank you for taking the time to complete this screening evaluation. Your responses, behavioral metrics, and integrity logs have been securely forwarded to our corporate human resources department.
          </p>
          <div className="text-xs text-slate-500 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            Registered Session Candidate Handle: <span className="text-indigo-400 font-mono font-semibold">{userEmailRef.current}</span>
          </div>
          <p className="text-xs text-slate-400">Our administrative managers will review your profile logs and follow up with you directly regarding subsequent lifecycle operations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 max-w-6xl mx-auto flex flex-col justify-between">
      <div className="flex justify-between items-center border-b border-slate-900 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-wider uppercase text-slate-400">Employment Screening Phase</h1>
          <div className="flex gap-2 mt-2">
            <span className="px-3 py-1 rounded-md bg-indigo-950 border border-indigo-800/60 text-xs text-indigo-300 font-bold uppercase tracking-wider">Operational Evaluation</span>
            {isCrossQuestionActive && (
              <span className="px-3 py-1 rounded-md bg-rose-950 text-xs font-bold text-rose-300 uppercase tracking-widest animate-pulse">
                Follow-up Probe {currentQuestionCrossCount}/3
              </span>
            )}
          </div>
        </div>
        
        <button
          onClick={() => {
            if (window.confirm("TEST OVERRIDE: Wrap up session and save active log transcripts instantly?")) {
              handleFinalEvaluation(historyLogRef.current);
            }
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600/20 border border-rose-500/30 text-rose-400 text-xs font-bold hover:bg-rose-600 hover:text-white transition"
        >
          <LogOut size={14} /> End Interview Early (Test Link)
        </button>
      </div>

      {tabSwitches > 0 && (
        <div className="mt-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-semibold">
          <AlertTriangle size={14} /> Security Notice: Tab switching instances detected ({tabSwitches}). This is saved into your integrity report profile.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 items-stretch">
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col justify-center shadow-lg">
          <div>
            <h2 className="text-2xl font-bold leading-relaxed text-slate-100">{displayQuestionText}</h2>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Monitoring Feed</h3>
          <div className="relative mt-3 h-40 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <div className="mt-2 text-center py-1 bg-slate-950 border border-slate-800/50 rounded-md font-mono text-[10px] tracking-wider">
            {isTranscribing ? (
              <span className="text-amber-400">• TRANSCRIBING SPEECH...</span>
            ) : isRecording ? (
              <span className="text-cyan-400">{`• LISTENING [${calibStatus}]`}</span>
            ) : (
              <span className="text-slate-500">• AWAITING SPEECH INPUT</span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex-1 flex flex-col">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Live Speech Capture Workspace</h3>
        <textarea
          value={transcript}
          onChange={(e) => {
            finalTranscriptRef.current = e.target.value;
            setTranscript(e.target.value);
          }}
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          data-gramm={false}
          data-enable-grammarly="false"
          placeholder="Awaiting audio capture... Begin speaking your response naturally as soon as the system stops reading the evaluation prompt out loud."
          className="w-full flex-1 min-h-[140px] mt-2 bg-slate-900 rounded-2xl p-5 outline-none text-slate-300 text-md border border-slate-800 resize-none leading-relaxed"
        />
      </div>

      <div className="flex justify-end gap-3 mt-6 border-t border-slate-950 pt-4">
        <button
          onClick={submitAnswer}
          disabled={isProcessing || !transcript.trim()}
          className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 text-sm font-bold hover:opacity-90 transition disabled:opacity-20"
        >
          {isProcessing ? <RefreshCw className="animate-spin" /> : <Send size={16} />}
          {isProcessing ? "Processing Response..." : questionCount === 5 ? "Submit & Complete Interview" : "Confirm & Continue Response"}
        </button>
      </div>
    </div>
  );
}
