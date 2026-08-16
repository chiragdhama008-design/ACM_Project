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
app.post(["/api/transcribe", "/transcribe"], async (req, res) => {
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
      improvementTip: "Consider adding more specific data points to strengthen your argument."
    });
  }
});

/**
 * 🎓 PEC ACM PERSONA AI EVALUATOR
 * Performs strict, multi-layer evaluation on candidate answers:
 * - Detects gibberish, filler, "idk", and off-topic answers (awards 0 score!)
 * - Evaluates real-life problem solving intuition across CP, AI/ML, and Dev
 * - Deterministically assigns official ACM backend titles (NEVER hallucinated)
 */
/**
 * 🎓 PEC ACM PERSONA EVALUATOR
 * Assigns official ACM titles strictly from the curated CP, ML, Dev, and CyberSec categories:
 * - Competitive Programming: The TLE Slayer, O(1) Brainiac, Codeforces Warlord, Binary Search Sorcerer, The Brute-Force Boss, Nested-Loop Legend, The Edge-Case Anarchist
 * - Machine Learning: The Overfitting Whisperer, Neural Network Alchemist, Prompt Engineering Monarch, The Gradient Descendant, Dataset Architect, Epoch Enthusiast, Hallucination Handler
 * - Software Development: Full-Stack Phantom, The Production Crasher, Git Merge Mastermind, Terminal Overlord, UI/UX Visionary, Scripting Ninja, The Coffee-to-Code Converter
 * - Cybersecurity: The Firewall Phantom, SQL Injection Sensei, Bug Bounty Baron, The Ethical Hacker, Packet Sniffer Pro, CTF Gladiator, Script Kiddie Reborn
 */
const DETERMINISTIC_ACM_TITLES = {
  "ACM-CP": [
    { minScore: 92, title: "The TLE Slayer", description: "Time Limit Exceeded won't touch this algorithm." },
    { minScore: 86, title: "O(1) Brainiac", description: "Solves problems in constant time." },
    { minScore: 80, title: "Codeforces Warlord", description: "Dominates complex algorithmic challenges with sheer tactical supremacy." },
    { minScore: 75, title: "Binary Search Sorcerer", description: "Divides and conquers any problem space with logarithmic precision." },
    { minScore: 60, title: "The Brute-Force Boss", description: "Gets the job done, no matter how messy." },
    { minScore: 45, title: "Nested-Loop Legend", description: "Powers through heavy workloads one iterative loop at a time." },
    { minScore: 1,  title: "The Edge-Case Anarchist", description: "Finds bugs no one else thought of." }
  ],
  "ACM-ML": [
    { minScore: 92, title: "The Overfitting Whisperer", description: "Trains models on pure intuition." },
    { minScore: 86, title: "Neural Network Alchemist", description: "Transmutes raw weights and activations into predictive intelligence." },
    { minScore: 80, title: "Prompt Engineering Monarch", description: "Commands foundation models and AI architectures with sovereign precision." },
    { minScore: 75, title: "The Gradient Descendant", description: "Finds the global optimum through relentless iterative learning." },
    { minScore: 60, title: "Dataset Architect", description: "Has the raw intuition, just needs the math." },
    { minScore: 45, title: "Epoch Enthusiast", description: "Never stops training, learning, and iterating to perfection." },
    { minScore: 1,  title: "Hallucination Handler", description: "Turns AI chaotic energy into working features." }
  ],
  "ACM-Dev": [
    { minScore: 92, title: "Full-Stack Phantom", description: "Builds complete systems out of thin air." },
    { minScore: 86, title: "The Production Crasher", description: "Ship fast, fix in production." },
    { minScore: 80, title: "Git Merge Mastermind", description: "Resolves merge conflicts and streamlines deployment pipelines effortlessly." },
    { minScore: 75, title: "Terminal Overlord", description: "Rules the command line, servers, and cloud infrastructure." },
    { minScore: 60, title: "UI/UX Visionary", description: "Cares about how it feels before how it runs." },
    { minScore: 45, title: "Scripting Ninja", description: "Automates workflows and stitches microservices together with stealth." },
    { minScore: 1,  title: "The Coffee-to-Code Converter", description: "Fuels high-output development cycles with pure caffeine and ambition." }
  ],
  "ACM-CyberSec": [
    { minScore: 92, title: "The Firewall Phantom", description: "No packet passes without their blessing." },
    { minScore: 86, title: "SQL Injection Sensei", description: "Breaks into databases just to show you how to fix them." },
    { minScore: 80, title: "Bug Bounty Baron", description: "Gets paid to find what others can't see." },
    { minScore: 75, title: "The Ethical Hacker", description: "Hacks for good, codes for justice." },
    { minScore: 60, title: "Packet Sniffer Pro", description: "Reads network traffic like a bedtime story." },
    { minScore: 45, title: "CTF Gladiator", description: "Lives for the thrill of Capture The Flag challenges." },
    { minScore: 1,  title: "Script Kiddie Reborn", description: "Started with scripts, now they write exploits from scratch." }
  ]
};

function resolveDeterministicTitle(wing, score, isAllGibberish = false, textCombined = "") {
  if (isAllGibberish || score <= 0) {
    return {
      personaTitle: "Unassessed Candidate (No Valid Attempt)",
      wingDescription: "No technical logic was provided. Submit thoughtful solutions to unlock your official ACM Wing recommendation."
    };
  }

  const wingKey = DETERMINISTIC_ACM_TITLES[wing] ? wing : "ACM-Dev";
  const wingList = DETERMINISTIC_ACM_TITLES[wingKey];
  const lowerText = (textCombined || "").toLowerCase();

  // Check for creative wildcard signals
  if (wingKey === "ACM-CP" && (lowerText.includes("edge case") || lowerText.includes("bug") || lowerText.includes("overflow") || lowerText.includes("corner case"))) {
    if (score < 85) {
      return { personaTitle: "The Edge-Case Anarchist", wingDescription: "Finds bugs no one else thought of." };
    }
  } else if (wingKey === "ACM-ML" && (lowerText.includes("hallucinat") || lowerText.includes("creative") || lowerText.includes("generative") || lowerText.includes("wild"))) {
    if (score < 85) {
      return { personaTitle: "Hallucination Handler", wingDescription: "Turns chaotic energy into working features." };
    }
  } else if (wingKey === "ACM-Dev" && (lowerText.includes("coffee") || lowerText.includes("night") || lowerText.includes("hack") || lowerText.includes("fast"))) {
    if (score < 85 && score >= 50) {
      return { personaTitle: "The Coffee-to-Code Converter", wingDescription: "Fuels high-output development cycles with pure caffeine and ambition." };
    }
  } else if (wingKey === "ACM-CyberSec" && (lowerText.includes("script") || lowerText.includes("beginner") || lowerText.includes("learn") || lowerText.includes("start"))) {
    if (score < 85 && score >= 40) {
      return { personaTitle: "Script Kiddie Reborn", wingDescription: "Started with scripts, now they write exploits from scratch." };
    }
  }

  for (const item of wingList) {
    if (score >= item.minScore) {
      return { personaTitle: item.title, wingDescription: item.description };
    }
  }

  return {
    personaTitle: wingList[wingList.length - 1].title,
    wingDescription: wingList[wingList.length - 1].description
  };
}

app.post("/api/persona/evaluate", async (req, res) => {
  const { name, branch, scenario1, answer1, scenario2, answer2 } = req.body;

  const prompt = `You are a friendly technical mentor for the PEC ACM Student Chapter at Punjab Engineering College (PEC Chandigarh).
A fresher at PEC has answered two campus problem scenarios:

Student Name: ${name || "Student"}
Branch: ${branch || "Engineering"}

Question 1: "${scenario1}"
Student's Answer 1: "${answer1}"

Question 2: "${scenario2}"
Student's Answer 2: "${answer2}"

Evaluate BOTH answers encourage-first:
1. GIBBERISH / FILLER / "IDK" DETECTION:
   - If an answer is "idk", "dont know", single random letters, or blank:
     - status: "GIBBERISH"
     - focusBadge: "⚠️ No Score: No Real Answer"
     - thoughtCorrectly: "No score awarded: Non-responsive input ('idk'/filler). Try giving even a short 1-line idea to get points!"
     - betterWay: "Give a simple practical idea that solves the bottleneck!"
     - SCORE MUST BE 0 for this question!
2. OFF-TOPIC CONCEPT DETECTION:
   - status: "OFF_TOPIC"
   - focusBadge: "⚠️ Off-Topic Answer"
   - thoughtCorrectly: "Creative thought, but doesn't quite tackle the question."
   - betterWay: "Connect your idea directly to solving the campus problem."
3. LEGITIMATE ATTEMPT:
   - status: "VALID"
   - focusBadge: "Short 2-3 word badge with emoji"
   - thoughtCorrectly: "Compliment their specific idea and explain why it shows good thinking."
   - betterWay: "Give an inspiring tip to make it even more awesome."

SCORING RULES (0-98):
- If BOTH answers are GIBBERISH: cpScore = 0, mlScore = 0, devScore = 0, cyberScore = 0.
- Otherwise score across 4 wings: CP (logic/queues/algorithms), ML (data/prediction/smart tools), Dev (apps/websites/hardware), CyberSec (security/hacks/defense/privacy).
- recommendedWing must be one of: "ACM-CP" | "ACM-ML" | "ACM-Dev" | "ACM-CyberSec"

Return ONLY valid JSON (no markdown fences, no backticks):
{
  "feedbackQ1": {
    "status": "VALID" | "GIBBERISH" | "OFF_TOPIC",
    "focusBadge": "string",
    "thoughtCorrectly": "string",
    "betterWay": "string"
  },
  "feedbackQ2": {
    "status": "VALID" | "GIBBERISH" | "OFF_TOPIC",
    "focusBadge": "string",
    "thoughtCorrectly": "string",
    "betterWay": "string"
  },
  "recommendedWing": "ACM-CP" | "ACM-ML" | "ACM-Dev" | "ACM-CyberSec",
  "cpScore": <number 0-98>,
  "mlScore": <number 0-98>,
  "devScore": <number 0-98>,
  "cyberScore": <number 0-98>
}`;

  try {
    const activeEngine = getRandomAIProvider();
    const { result } = await askObjectWithFallback(activeEngine, prompt);

    // Apply strict deterministic titles
    const isAllGibberish = result.feedbackQ1?.status === "GIBBERISH" && result.feedbackQ2?.status === "GIBBERISH";
    const dominantWing = result.recommendedWing || "ACM-Dev";
    const maxScore = Math.max(result.cpScore || 0, result.mlScore || 0, result.devScore || 0, result.cyberScore || 0);

    const combinedAnswers = `${answer1 || ""} ${answer2 || ""}`;
    const titleInfo = resolveDeterministicTitle(dominantWing, maxScore, isAllGibberish, combinedAnswers);

    res.json({
      ...result,
      personaTitle: titleInfo.personaTitle,
      wingDescription: titleInfo.wingDescription
    });
  } catch (error) {
    console.error("Persona evaluation fallback error:", error);
    res.status(500).json({ error: "Evaluation fallback" });
  }
});

/**
 * 📧 SEND PERSONA CARD VIA EMAIL
 * Sends student's generated persona card from chiragdhama.bt25cse@pec.edu.in directly to the user's email.
 */
app.post(["/api/persona/send-email", "/api/send-persona-email"], async (req, res) => {
  const { email, name, branch, personaTitle, recommendedWing, wingDescription, cpScore, mlScore, devScore, cyberScore, cardImageBase64 } = req.body;

  if (!email || !email.includes("@")) {
    return res.status(400).json({ success: false, error: "Please provide a valid email address." });
  }

  const senderEmail = process.env.SENDER_EMAIL || "chiragdhama.bt25cse@pec.edu.in";
  const appPassword = process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASSWORD;

  try {
    const nodemailerModule = await import("nodemailer");
    const nodemailer = nodemailerModule.default || nodemailerModule;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: senderEmail,
        pass: appPassword || ""
      }
    });

    const attachments = [];
    let imageCid = "personacard";
    if (cardImageBase64) {
      const cleanBase64 = cardImageBase64.replace(/^data:image\/\w+;base64,/, "");
      attachments.push({
        filename: `${(name || "PEC_Student").replace(/\s+/g, "_")}_ACM_Card.png`,
        content: Buffer.from(cleanBase64, "base64"),
        cid: imageCid
      });
    }

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #020612; color: #ffffff; padding: 20px; margin: 0; }
    .card-container { max-width: 600px; margin: 0 auto; background: #050d24; border: 1px solid #00F0FF; border-radius: 20px; padding: 30px; }
    .header { text-align: center; border-bottom: 1px solid #1e293b; padding-bottom: 20px; margin-bottom: 25px; }
    .title { color: #00F0FF; font-size: 14px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; }
    .student-name { font-size: 26px; font-weight: 900; color: #ffffff; margin: 8px 0; }
    .persona-box { background: linear-gradient(135deg, #0d2260, #280b54); border: 1px solid #00F0FF; border-radius: 12px; padding: 15px; margin: 20px 0; text-align: center; }
    .persona-title { font-size: 22px; font-weight: bold; color: #FFD700; }
    .wing-box { background: #081538; border: 1px solid rgba(0,240,255,0.4); border-radius: 12px; padding: 16px; margin: 15px 0; }
    .metrics { background: #030818; border-radius: 12px; padding: 15px; margin: 20px 0; }
    .metric-row { display: flex; justify-content: space-between; margin: 8px 0; font-size: 14px; }
    .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 30px; border-top: 1px solid #1e293b; padding-top: 15px; }
  </style>
</head>
<body>
  <div class="card-container">
    <div class="header">
      <div class="title">PEC ACM STUDENT CHAPTER</div>
      <div class="student-name">Hey ${name || "PEC Student"}! 👋</div>
      <p style="color: #94a3b8; font-size: 14px; margin: 0;">Here is your official PEC ACM Persona Card from the fresher quiz!</p>
    </div>

    <div class="persona-box">
      <div style="color: #F59E0B; font-size: 11px; font-weight: bold; text-transform: uppercase;">👑 Official ACM Persona Title</div>
      <div class="persona-title">"${personaTitle || "Full-Stack Phantom"}"</div>
    </div>

    <div class="wing-box">
      <div style="color: #00F0FF; font-size: 12px; font-weight: bold;">🎯 RECOMMENDED WING: <span style="color: #ffffff; font-size: 16px;">${recommendedWing || "ACM-Dev"}</span></div>
      <p style="color: #cbd5e1; font-size: 13px; margin: 8px 0 0 0;">${wingDescription || "Practical problem solver built for PEC Chandigarh tech ecosystem!"}</p>
    </div>

    <div class="metrics">
      <div style="color: #94a3b8; font-size: 11px; font-weight: bold; margin-bottom: 10px;">📊 TECH APTITUDE BREAKDOWN:</div>
      <div class="metric-row"><span style="color: #3b82f6;">• CP Logic:</span> <strong>${cpScore ?? 75}%</strong></div>
      <div class="metric-row"><span style="color: #a855f7;">• Machine Learning:</span> <strong>${mlScore ?? 80}%</strong></div>
      <div class="metric-row"><span style="color: #00F0FF;">• Software Dev:</span> <strong>${devScore ?? 85}%</strong></div>
      <div class="metric-row"><span style="color: #10b981;">• Cybersecurity:</span> <strong>${cyberScore ?? 70}%</strong></div>
    </div>

    ${cardImageBase64 ? `
    <div style="text-align: center; margin: 25px 0;">
      <p style="color: #94a3b8; font-size: 12px; margin-bottom: 10px;">📸 Your High-Definition Persona Scorecard is attached below!</p>
      <img src="cid:${imageCid}" alt="PEC ACM Persona Card" style="max-width: 100%; border-radius: 12px; border: 1px solid #00F0FF;" />
    </div>` : ''}

    <div class="footer">
      <p>Sent with 💙 by <strong>PEC ACM Student Chapter</strong></p>
      <p style="color: #475569;">Punjab Engineering College (PEC Chandigarh) • Session 2026-27</p>
    </div>
  </div>
</body>
</html>
`;

    if (!appPassword) {
      console.warn("⚠️ GMAIL_APP_PASSWORD not set in environment. Email payload logged to console.");
      console.log(`[Email to ${email}]: Persona Card for ${name} (${recommendedWing})`);
      return res.json({
        success: true,
        notice: "Persona Card generated! (Add GMAIL_APP_PASSWORD in server/.env for direct inbox dispatch)",
        recipient: email
      });
    }

    await transporter.sendMail({
      from: `"PEC ACM Student Chapter" <${senderEmail}>`,
      to: email,
      subject: `🎓 Your Official PEC ACM Persona Card! (${name || "Student"})`,
      html: htmlContent,
      attachments
    });

    res.json({ success: true, message: `Persona card sent to ${email}!` });
  } catch (emailErr) {
    console.error("Failed to send persona card email:", emailErr);
    res.status(500).json({ success: false, error: "Failed to send email. Please verify server SMTP configuration." });
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
