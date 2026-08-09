import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { askObjectWithFallback } from "./utils/aiProviders.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/api", (req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});

/**
 * Utility to filter out common Whisper silence hallucinations and prompt repetitions
 */
function cleanWhisperHallucinations(rawText) {
  if (!rawText) return "";
  let cleaned = rawText.trim();

  // Known Whisper silence hallucinations & prompt leaks
  const hallucinations = [
    /transcribe\s+exactly\s+what\s+is\s+spoken\s+verbatim\.?/gi,
    /this\s+is\s+an\s+interview\s+response\.?/gi,
    /subtitles?\s+by\s+.*/gi,
    /thank\s+you\s+for\s+watching\.?/gi,
    /amara\.org/gi,
    /^thank\s+you\.?$/gi,
    /^thanks\.?$/gi,
    /^bye\.?$/gi
  ];

  for (const regex of hallucinations) {
    cleaned = cleaned.replace(regex, "").trim();
  }

  return cleaned;
}

/**
 * PRIMARY SPEECH TRANSCRIPTION ENGINE
 * All browsers send recorded audio chunks here for server-side Whisper transcription.
 * This replaces the unreliable browser SpeechRecognition API entirely.
 * Whisper handles all accents, speech clarity levels, and non-native speakers accurately.
 */
app.post("/api/transcribe", async (req, res) => {
  try {
    const { audio } = req.body;
    if (!audio) {
      return res.json({ text: "" });
    }

    const matches = audio.match(/^data:(.+?);base64,(.+)$/s);
    let mimeType = "audio/webm";
    let base64Data = audio;
    if (matches && matches.length === 3) {
      mimeType = matches[1];
      base64Data = matches[2];
    } else {
      base64Data = audio.replace(/^data:[^;]+;base64,/, "");
    }

    const buffer = Buffer.from(base64Data, "base64");
    if (buffer.length < 1500) {
      // Audio buffer too tiny / silent chunk
      return res.json({ text: "" });
    }

    // Provider 1: Groq Whisper (whisper-large-v3-turbo) — fastest and most accurate
    if (process.env.GROQ_API_KEY) {
      try {
        const GroqModule = await import("groq-sdk");
        const Groq = GroqModule.default || GroqModule.Groq;
        const toFile = GroqModule.toFile;
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const cleanMime = mimeType.split(";")[0];
        const ext = cleanMime.includes("mp4") ? "mp4" : cleanMime.includes("ogg") ? "ogg" : "webm";
        const file = await toFile(buffer, `speech.${ext}`, { type: cleanMime });
        const transcription = await groq.audio.transcriptions.create({
          file: file,
          model: "whisper-large-v3-turbo",
          language: "en",
          temperature: 0.0,
          prompt: "Candidate interview response."
        });
        if (transcription && transcription.text) {
          const sanitizedText = cleanWhisperHallucinations(transcription.text);
          if (sanitizedText) {
            return res.json({ text: sanitizedText });
          }
        }
      } catch (groqErr) {
        console.error("Groq Whisper transcription failed, trying Gemini fallback:", groqErr.message || groqErr);
      }
    }

    // Provider 2: Gemini Multimodal Audio Transcription
    try {
      const ai = (await import("./config/gemini.js")).default;
      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: mimeType.split(";")[0],
                  data: base64Data
                }
              },
              {
                text: `You are a speech-to-text system. Transcribe the spoken audio EXACTLY as spoken verbatim.
If the audio contains no clear human speech, reply with NOTHING.
Reply with ONLY the raw transcript text, no instructions or meta comments.`
              }
            ]
          }
        ]
      });
      const text = response.text ? cleanWhisperHallucinations(response.text) : "";
      return res.json({ text });
    } catch (geminiErr) {
      console.error("Gemini audio transcription fallback error:", geminiErr.message || geminiErr);
    }

    res.json({ text: "" });
  } catch (err) {
    console.error("Transcription endpoint handler error:", err);
    res.json({ text: "" });
  }
});

/**
 * UTILITY: RANDOM ENGINE PICKER
 * Randomly shuffles our available pool to determine the primary evaluation target.
 * If that choice falls over due to runtime network issues or rate limits, 
 * askObjectWithFallback will still safely walk through the rest of your keys.
 */
function getRandomAIProvider() {
  const providers = ["gemini", "groq", "mistral"];
  const randomIndex = Math.floor(Math.random() * providers.length);
  return providers[randomIndex];
}

/**
 * CONVERSATIONAL FLOW INTERCEPTORS
 */
app.post("/api/session/check-satisfactory", async (req, res) => {
  const { question, answer } = req.body;

  if (!answer || !answer.trim()) {
    return res.json({ satisfactory: false });
  }

  const prompt = `You are a strict corporate operational recruiter screening a candidate's verbal response.

Question Asked: ${question}
Candidate Response: ${answer}

Evaluate if the candidate genuinely answered the question or if their response was vague, overly brief, defensive, or completely dodged the query.
For the 5th final question, if they give a solid conclusive statement, mark satisfactory as true to conclude the session.

Reply with ONLY valid JSON, no markdown fences:
{"satisfactory": true or false}`;

  // Choose a random provider for the evaluation loop check step
  const activeEngine = getRandomAIProvider();

  try {
    const { result, providerUsed } = await askObjectWithFallback(activeEngine, prompt);
    res.json({ satisfactory: !!result.satisfactory, provider: providerUsed });
  } catch (error) {
    console.error("Error evaluating response criteria (all providers failed):", error);
    const isSatisfactory = answer.trim().split(/\s+/).length > 5;
    res.json({ satisfactory: isSatisfactory, provider: "gemini" });
  }
});

app.post("/api/session/cross-question", async (req, res) => {
  const { currentQuestion, currentAnswer } = req.body;

  const prompt = `You are a corporate recruiter conducting a behavioral screening check.

Context:
The candidate was asked about their work ethic, career goals, or past managers, but their response was incomplete, defensive, or shallow.
Current Question: ${currentQuestion}
Candidate Response: ${currentAnswer}

Write ONE short, highly specific conversational follow-up query that digs into the gap of what they just said. Do not ask for code or technical syntax. Keep it strictly focused on operational accountability, honesty, or routine adherence.

Reply with ONLY valid JSON, no markdown fences:
{"crossQuestion": "..."}`;

  // 🔑 Pick a completely random engine to challenge the applicant on this node
  const activeEngine = getRandomAIProvider();

  try {
    const { result, providerUsed } = await askObjectWithFallback(activeEngine, prompt);
    res.json({ crossQuestion: result.crossQuestion, provider: providerUsed });
  } catch (error) {
    console.error("Error generating follow-up query (all providers failed):", error);
    res.json({ 
      crossQuestion: "Can you elaborate on your experience managing monotonous or highly repetitive tasks over an extended shift?", 
      provider: "gemini" 
    });
  }
});

/**
 * B2B BEHAVIORAL EVALUATION PIPELINE ENGINE
 */
app.post("/api/interview/evaluate", async (req, res) => {
  const { interviewAnswers } = req.body;

  if (!interviewAnswers || interviewAnswers.length === 0) {
    return res.json({ decision: "SCREEN_OUT", executiveSummary: "No response text captured." });
  }

  const evaluationPrompt = `You are an expert HR vetting compliance officer analyzing transcripts from an automated screening assessment.
  
Candidate Transcript Logs:
${JSON.stringify(interviewAnswers)}

Evaluate the applicant thoroughly on these 4 exact operational parameters:
1. Honesty: Can we trust them with company property? Do they answer questions truthfully and directly, reporting actions accurately without making up stories or dodging hard facts?
2. Professionalism & Autonomy: Will managers constantly need to push them to do basic tasks? Do they show respect for baseline workflows without being micromanaged?
3. Attendance & SOP Compliance: Will they join shifts on time, follow Standard Operating Procedures precisely, and hit daily action metrics without persistent oversight?
4. Monotonous Task Endurance: The job requires repetitive, monotonous operations for 6 to 8 hours daily. Do they have concrete experience staying reliable in these kinds of jobs?

Based on their answers, make an absolute binary decision: "SCREEN_IN" (Passed to live interview) or "SCREEN_OUT" (Rejected).

Reply with ONLY valid JSON, no markdown fences or backticks:
{
  "decision": "SCREEN_IN" or "SCREEN_OUT",
  "honestyAnalysis": "Detailed analysis text regarding trustworthiness and asset security...",
  "professionalismAnalysis": "Detailed analysis text regarding core baseline behaviors and discipline...",
  "enduranceAnalysis": "Detailed analysis text regarding long monotonous shift performance...",
  "executiveSummary": "Overall breakdown justification statement..."
}`;

  try {
    // We use your primary global engine to evaluate everything into a clean payload structure
    const { result } = await askObjectWithFallback("gemini", evaluationPrompt);
    res.json(result);
  } catch (error) {
    console.error("Evaluation framework error across all nodes:", error);
    res.json({
      decision: "SCREEN_OUT",
      executiveSummary: "Fallback execution due to response generation timeout issues across text clusters."
    });
  }
});

app.post("/api/session/start", (req, res) => res.json({ success: true }));
app.post("/api/session/frame", (req, res) => res.json({ emotion: "focused" }));
app.post("/api/session/next-question", (req, res) => res.json({ success: true }));
app.post("/api/session/end", (req, res) => res.json({ success: true }));

// ==========================================
// SERVE BUILT FRONTEND IN A SINGLE MONOLITH
// ==========================================
const frontendDistPath = path.join(__dirname, "../ai-interviewer/dist");
app.use(express.static(frontendDistPath));

app.use((req, res) => {
  res.sendFile(path.join(frontendDistPath, "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`B2B Screening Server running on port ${PORT} with Multi-Provider randomizers.`);
});
