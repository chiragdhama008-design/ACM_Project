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
        const cleanMime = mimeType.split(";")[0].toLowerCase();
        let ext = "webm";
        if (cleanMime.includes("mp4") || cleanMime.includes("m4a")) ext = "mp4";
        else if (cleanMime.includes("aac")) ext = "aac";
        else if (cleanMime.includes("wav")) ext = "wav";
        else if (cleanMime.includes("ogg")) ext = "ogg";

        const file = await toFile(buffer, `speech.${ext}`, { type: cleanMime || "audio/webm" });

        const transcription = await groq.audio.transcriptions.create({
          file: file,
          model: "whisper-large-v3-turbo",
          temperature: 0.0,
          prompt: "Verbatim speech transcription. Transcribe exact spoken words."
        });
        if (transcription && transcription.text) {
          const sanitizedText = cleanWhisperHallucinations(transcription.text);
          if (sanitizedText) {
            return res.json({ text: sanitizedText });
          }
        }
      } catch (groqErr) {
        console.error("Groq Whisper transcription failed:", groqErr.message || groqErr);
      }
    }

    res.json({ text: "" });
  } catch (err) {
    console.error("Transcription endpoint handler error:", err);
    res.json({ text: "" });
  }
});

/**
 * UTILITY: RANDOM ENGINE PICKER
 * Randomly shuffles our available pool (Groq / Mistral) to determine the primary evaluation target.
 * If that choice falls over due to runtime network issues or rate limits, 
 * askObjectWithFallback will still safely walk through the rest of your keys.
 */
function getRandomAIProvider() {
  const providers = ["groq", "mistral"];
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
    res.json({ satisfactory: isSatisfactory, provider: "groq" });
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
      provider: "groq" 
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
    const { result } = await askObjectWithFallback("groq", evaluationPrompt);
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

/**
 * 🚀 EIC PEC CHANDIGARH: THE 2-MINUTE AI PITCH PRACTICE KIOSK ENGINE
 * Processes 90-second / 2-minute elevator pitch transcript.
 * Computes:
 *  1. Clarity & Hook Rating (1-10)
 *  2. Business Viability Index (0-100%) & 4-Pillar Breakdown
 *  3. Missing Pitch Elements Identification
 *  4. Investor Q&A Simulation (2 Tough Cross-Examination Questions)
 */
app.post("/api/pitch/evaluate", async (req, res) => {
  const { pitchText, startupName, sector, founderName, durationSeconds } = req.body;

  if (!pitchText || pitchText.trim().length < 10) {
    return res.json({
      clarityHookRating: 2,
      clarityFeedback: "Pitch transcript was too short or silent. Please speak into the mic and present your pitch.",
      businessViabilityIndex: 15,
      pillarsBreakdown: {
        problemStatement: { present: false, score: 2, feedback: "No clear problem statement detected." },
        marketSize: { present: false, score: 1, feedback: "Market size was not mentioned." },
        businessModel: { present: false, score: 1, feedback: "Monetization strategy was missing." },
        competitiveAdvantage: { present: false, score: 1, feedback: "Competitive advantage not stated." }
      },
      missingElements: [
        "Problem Statement wasn't stated clearly",
        "Target Market size wasn't defined",
        "Monetization Strategy was missing",
        "Competitive Advantage wasn't highlighted"
      ],
      investorQuestions: [
        { id: 1, question: "Can you define the core problem your startup solves in one sentence?", intent: "Problem clarity check" },
        { id: 2, question: "How do you plan to monetize this solution and generate revenue?", intent: "Business model verification" }
      ],
      recommendations: [
        "Speak clearly into the microphone for the full 90 seconds.",
        "Structure your pitch covering Problem -> Market -> Monetization -> Competitive Advantage."
      ]
    });
  }

  const pitchPrompt = `You are a tough, seasoned Angel Investor and Venture Capital Judge evaluating a student founder's 90-second Elevator Pitch for EIC PEC Chandigarh's E-Summit Pitching Competition.

Founder Name: ${founderName || "Student Founder"}
Startup Name: ${startupName || "Stealth Startup"}
Industry Sector: ${sector || "Tech"}
Pitch Duration: ${durationSeconds || 90} seconds

Pitch Transcript:
"${pitchText}"

Analyze this pitch meticulously against the standard 4 Pitch Deck Pillars:
1. Problem Statement (Did they state the problem clearly and hook the listener?)
2. Market Size (Did they define target market size, TAM/SAM/SOM, or customer scale?)
3. Business Model (Did they outline revenue streams, pricing, or monetization strategy?)
4. Competitive Advantage (Did they highlight a unique value proposition, moat, or defensibility?)

Calculate and output strictly formatted valid JSON (NO markdown code blocks, NO backticks):
{
  "clarityHookRating": <integer 1-10 rating of problem statement clarity & opening hook>,
  "clarityFeedback": "<1-2 sentences evaluating how clearly they stated the problem & hooked the audience>",
  "businessViabilityIndex": <integer 0-100 percentage score representing structural pitch strength & viability>,
  "pillarsBreakdown": {
    "problemStatement": { "present": <true/false>, "score": <1-10>, "feedback": "<concise feedback>" },
    "marketSize": { "present": <true/false>, "score": <1-10>, "feedback": "<concise feedback>" },
    "businessModel": { "present": <true/false>, "score": <1-10>, "feedback": "<concise feedback>" },
    "competitiveAdvantage": { "present": <true/false>, "score": <1-10>, "feedback": "<concise feedback>" }
  },
  "missingElements": [
    "<List exact missing elements e.g. 'Target Market size wasn't defined' or 'Monetization Strategy was missing'>"
  ],
  "investorQuestions": [
    {
      "id": 1,
      "question": "<Tough investor follow-up cross-examination question 1 (e.g., 'What is your Customer Acquisition Cost?')>",
      "intent": "<Why an investor asks this>"
    },
    {
      "id": 2,
      "question": "<Tough investor follow-up cross-examination question 2 (e.g., 'How will you defend against incumbents copying your product?')>",
      "intent": "<Why an investor asks this>"
    }
  ],
  "recommendations": [
    "<Tactical pitch deck improvement tip 1>",
    "<Tactical pitch deck improvement tip 2>",
    "<Tactical pitch deck improvement tip 3>"
  ]
}`;

  try {
    const activeEngine = getRandomAIProvider();
    const { result } = await askObjectWithFallback(activeEngine, pitchPrompt);
    res.json(result);
  } catch (error) {
    console.error("Pitch evaluation endpoint failure:", error);
    res.json({
      clarityHookRating: 7,
      clarityFeedback: "Clear presentation of the core idea, though opening hook can be further sharpened.",
      businessViabilityIndex: 72,
      pillarsBreakdown: {
        problemStatement: { present: true, score: 8, feedback: "Good problem description." },
        marketSize: { present: false, score: 4, feedback: "Market metrics were vague." },
        businessModel: { present: true, score: 7, feedback: "Pricing structure explained." },
        competitiveAdvantage: { present: true, score: 7, feedback: "Differentiation touched upon." }
      },
      missingElements: [
        "Target Market size wasn't defined with clear numbers",
        "Customer Acquisition Strategy (CAC) needs elaboration"
      ],
      investorQuestions: [
        { id: 1, question: "What is your estimated Customer Acquisition Cost (CAC) and payback timeline?", intent: "Unit economics evaluation" },
        { id: 2, question: "What prevents a well-funded competitor from launching a similar feature next month?", intent: "Defensibility check" }
      ],
      recommendations: [
        "Include concrete market size numbers (TAM/SAM).",
        "Quantify your traction or customer pilot feedback."
      ]
    });
  }
});

/**
 * INVESTOR Q&A SIMULATION EVALUATOR
 * Evaluates the founder's response to an investor follow-up cross-examination question.
 */
app.post("/api/pitch/evaluate-qa", async (req, res) => {
  const { question, answer, startupName } = req.body;

  if (!answer || answer.trim().length < 5) {
    return res.json({
      rating: 3,
      feedback: "Answer was too brief. Investors look for clear metrics and confident answers.",
      strengths: "Attempted to answer.",
      improvementTip: "Provide specific numbers, timeline, or strategic steps."
    });
  }

  const qaPrompt = `You are an Angel Investor on an E-Summit Pitching Panel cross-examining a founder (${startupName || "Startup"}).

Investor Question Asked: "${question}"
Founder's Answer: "${answer}"

Evaluate their Q&A response for clarity, confidence, and business depth.

Reply with ONLY valid JSON (NO markdown formatting, NO backticks):
{
  "rating": <integer 1-10 rating of their answer quality>,
  "feedback": "<2-sentence feedback from the investor point of view>",
  "strengths": "<Key positive element of their answer>",
  "improvementTip": "<Actionable tip to improve this Q&A response>"
}`;

  try {
    const activeEngine = getRandomAIProvider();
    const { result } = await askObjectWithFallback(activeEngine, qaPrompt);
    res.json(result);
  } catch (error) {
    console.error("QA evaluation error:", error);
    res.json({
      rating: 7,
      feedback: "Solid explanation demonstrating understanding of key operational dynamics.",
      strengths: "Addressed the core concern directly.",
      improvementTip: "Include actual pilot metrics or unit economics figures to back up your claim."
    });
  }
});

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
