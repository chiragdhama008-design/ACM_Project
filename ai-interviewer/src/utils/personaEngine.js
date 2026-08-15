// Intelligent AI Persona Analysis & Deterministic Scoring Engine for PEC ACM Student Chapter

/**
 * Deterministic Backend Title Registry (Rule-based, NEVER AI Hallucinated)
 * Strictly assigned from the curated list:
 * - CP: The TLE Slayer, O(1) Brainiac, Codeforces Warlord, Binary Search Sorcerer, The Brute-Force Boss, Nested-Loop Legend, The Edge-Case Anarchist
 * - AI: The Overfitting Whisperer, Neural Network Alchemist, Prompt Engineering Monarch, The Gradient Descendant, Dataset Architect, Epoch Enthusiast, Hallucination Handler
 * - Dev: Full-Stack Phantom, The Production Crasher, Git Merge Mastermind, Terminal Overlord, UI/UX Visionary, Scripting Ninja, The Coffee-to-Code Converter
 */
export const DETERMINISTIC_TITLES = {
  "ACM-CP": [
    { minScore: 92, title: "The TLE Slayer", description: "Time Limit Exceeded won't touch this algorithm." },
    { minScore: 86, title: "O(1) Brainiac", description: "Solves problems in constant time." },
    { minScore: 80, title: "Codeforces Warlord", description: "Dominates complex algorithmic challenges with sheer tactical supremacy." },
    { minScore: 75, title: "Binary Search Sorcerer", description: "Divides and conquers any problem space with logarithmic precision." },
    { minScore: 60, title: "The Brute-Force Boss", description: "Gets the job done, no matter how messy." },
    { minScore: 45, title: "Nested-Loop Legend", description: "Powers through heavy workloads one iterative loop at a time." },
    { minScore: 1,  title: "The Edge-Case Anarchist", description: "Finds bugs no one else thought of." }
  ],
  "ACM-AI": [
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
  ]
};

export function getDeterministicTitle(wing, score, isAllGibberish = false, textCombined = "") {
  if (isAllGibberish || score <= 0) {
    return {
      title: "Unassessed Candidate (No Valid Attempt)",
      description: "No technical logic was provided. Submit thoughtful, structured solutions to unlock your official ACM Wing recommendation."
    };
  }

  const wingKey = DETERMINISTIC_TITLES[wing] ? wing : "ACM-Dev";
  const wingList = DETERMINISTIC_TITLES[wingKey];
  const lowerText = (textCombined || "").toLowerCase();

  // Check for creative wildcard signals
  if (wingKey === "ACM-CP" && (lowerText.includes("edge case") || lowerText.includes("bug") || lowerText.includes("overflow") || lowerText.includes("corner case"))) {
    if (score < 85) {
      return { title: "The Edge-Case Anarchist", description: "Finds bugs no one else thought of." };
    }
  } else if (wingKey === "ACM-AI" && (lowerText.includes("hallucinat") || lowerText.includes("creative") || lowerText.includes("generative") || lowerText.includes("wild"))) {
    if (score < 85) {
      return { title: "Hallucination Handler", description: "Turns AI chaotic energy into working features." };
    }
  } else if (wingKey === "ACM-Dev" && (lowerText.includes("coffee") || lowerText.includes("night") || lowerText.includes("hack") || lowerText.includes("fast"))) {
    if (score < 85 && score >= 50) {
      return { title: "The Coffee-to-Code Converter", description: "Fuels high-output development cycles with pure caffeine and ambition." };
    }
  }

  for (const item of wingList) {
    if (score >= item.minScore) {
      return { title: item.title, description: item.description };
    }
  }

  return {
    title: wingList[wingList.length - 1].title,
    description: wingList[wingList.length - 1].description
  };
}

/**
 * Checks if an input string is gibberish, filler, keyboard mash, "idk", or low-effort.
 */
export function detectGibberishOrLowEffort(text) {
  if (!text || typeof text !== "string") return { isGibberish: true, reason: "empty" };
  const trimmed = text.trim();
  if (trimmed.length < 3) return { isGibberish: true, reason: "too_short" };

  const lower = trimmed.toLowerCase();

  // Known repetitive filler words & "idk" expressions
  const fillerPatterns = [
    /^([a-z])\1{2,}$/i, // aaa, zzzz
    /^(blah\s*)+$/i,
    /^(na\s*)+$/i,
    /^(la\s*)+$/i,
    /^(ha\s*)+$/i,
    /^(da\s*)+$/i,
    /^(yo\s*)+$/i,
    /^(test\s*)+$/i,
    /^(asdf\s*)+$/i,
    /^(qwerty\s*)+$/i,
    /^(xyz\s*)+$/i,
    /^(abc\s*)+$/i,
    /^(idk|dont know|dunno|nothing|none|no|yes|ok|okay|skip|pass|nope|not sure|n\/a|idk bro|i dont know|i do not know|no idea|cant say|can not say)$/i
  ];

  for (const pattern of fillerPatterns) {
    if (pattern.test(lower)) {
      return { isGibberish: true, reason: "filler_pattern" };
    }
  }

  // Exact check for common unhelpful phrases
  if (
    lower === "idk" ||
    lower.startsWith("i dont know") ||
    lower.startsWith("i don't know") ||
    lower.startsWith("no idea") ||
    lower === "dont know" ||
    lower === "dunno" ||
    lower === "asdf" ||
    lower === "qwerty" ||
    lower === "testing" ||
    lower === "..." ||
    lower === "n/a"
  ) {
    return { isGibberish: true, reason: "idk_phrase" };
  }

  // Check character diversity (keyboard spam like "asdfghjk" or "qweqweqwe")
  const uniqueChars = new Set(lower.replace(/\s+/g, "").split(""));
  if (trimmed.length >= 7 && uniqueChars.size <= 3) {
    return { isGibberish: true, reason: "low_char_diversity" };
  }

  // Single very short word
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length === 1 && trimmed.length < 5) {
    return { isGibberish: true, reason: "single_short_word" };
  }

  return { isGibberish: false, reason: "valid" };
}

/**
 * Detects if an answer is completely mismatched or irrelevant to the technical problem.
 */
export function detectOffTopic(questionText, answerText) {
  const lowerAns = (answerText || "").toLowerCase();
  const trimmed = lowerAns.trim();

  // If the user answers completely irrelevant gibberish
  if (trimmed.length < 5) return { isOffTopic: false };

  // If answer discusses unrelated personal activities with zero logic
  const isCompletelyUnrelated = 
    (lowerAns.includes("movie") || lowerAns.includes("cricket") || lowerAns.includes("pubg") || lowerAns.includes("song")) &&
    !lowerAns.includes("app") && !lowerAns.includes("system") && !lowerAns.includes("queue") && !lowerAns.includes("data");

  if (isCompletelyUnrelated) {
    return {
      isOffTopic: true,
      issue: "The response discusses unrelated topics instead of proposing a systematic solution."
    };
  }

  return { isOffTopic: false };
}

/**
 * Intelligent Question-by-Question Feedback Generator for Real-Life Scenarios
 */
export function generateQuestionFeedback(questionText, answerText, questionNumber, wing) {
  const ans = (answerText || "").trim();
  const lowerAns = ans.toLowerCase();
  const lowerQ = (questionText || "").toLowerCase();

  // 1. GIBBERISH / FILLER / IDK DETECTION -> STRICT ZERO SCORE FEEDBACK
  const gibberishCheck = detectGibberishOrLowEffort(ans);
  if (gibberishCheck.isGibberish) {
    let idealDemo = "";
    if (questionNumber === 1) {
      idealDemo = "A solid engineering breakdown: 1) Deploy a mobile pre-ordering token queue (FIFO / priority-based), 2) Split food counters into Express (pre-packaged) vs Prep (custom orders) to reduce queue wait time, 3) Display live digital queue estimates on a student portal.";
    } else {
      idealDemo = "A viable intelligent architecture: 1) Edge IoT sensors or overhead PIR sensors measuring space/device occupancy, 2) Fast API microservice processing live state telemetry, 3) Real-time mobile dashboard giving students instant vacant desk recommendations without capturing personal camera footage.";
    }

    return {
      questionTitle: questionNumber === 1 ? "Scenario 1: Optimization & Workflow Strategy" : "Scenario 2: Intelligent Systems Architecture",
      questionText,
      userAnswer: ans || "(No answer provided)",
      status: "GIBBERISH",
      focusBadge: "⚠️ No Score (0%): Filler / IDK Detected",
      badgeStyle: "bg-red-950/60 border-red-500/40 text-red-300",
      thoughtCorrectly: `❌ No technical score awarded (0%): You entered "${ans || 'blank text'}", which provides no structured logic or problem-solving attempt. In technical evaluations, answers must outline an approach to earn domain points.`,
      betterWay: `💡 How an engineer solves this scenario: ${idealDemo}`
    };
  }

  // 2. OFF-TOPIC CONCEPT DETECTION
  const offTopicCheck = detectOffTopic(questionText, ans);
  if (offTopicCheck.isOffTopic) {
    return {
      questionTitle: questionNumber === 1 ? "Scenario 1: Optimization & Workflow Strategy" : "Scenario 2: Intelligent Systems Architecture",
      questionText,
      userAnswer: ans,
      status: "OFF_TOPIC",
      focusBadge: "⚠️ Concept Mismatch (Off-Topic)",
      badgeStyle: "bg-amber-950/60 border-amber-500/40 text-amber-300",
      thoughtCorrectly: `⚠️ Concept mismatch (Low score awarded): Your answer "${ans}" does not address the core constraints and objectives of this technical scenario.`,
      betterWay: `💡 Reframing into an engineering solution: Focus on the bottleneck (e.g. queue delays or resource shortages) and propose a clear, step-by-step logic, mobile tool, or sensor mechanism.`
    };
  }

  // 3. LEGITIMATE ATTEMPT EVALUATION (Tailored to real-life technical thinking)
  if (questionNumber === 1) {
    let focusBadge = "Algorithmic & Queuing Logic";
    let thoughtCorrectly = "";
    let betterWay = "";

    if (lowerAns.includes("token") || lowerAns.includes("queue") || lowerAns.includes("slot") || lowerAns.includes("fifo") || lowerAns.includes("priority") || lowerAns.includes("pre-order") || lowerAns.includes("qr")) {
      focusBadge = "Queuing Theory & Load Balancing";
      thoughtCorrectly = `You correctly identified the bottleneck as a concurrency / load problem and applied queuing or pre-ordering principles to distribute peak demand.`;
      betterWay = `To elevate this to production grade: Implement a dynamic priority queue (e.g. prioritizing students with imminent classes) and separate pickup lines for hot food vs cold beverages to optimize throughput.`;
    } else if (lowerAns.includes("app") || lowerAns.includes("qr code") || lowerAns.includes("website") || lowerAns.includes("portal") || lowerAns.includes("kiosk") || lowerAns.includes("notify") || lowerAns.includes("alert")) {
      focusBadge = "Digital Systems Workflow";
      thoughtCorrectly = `You recognized that manual handling is the main bottleneck and proposed digitizing order capture and status notifications.`;
      betterWay = `Consider adding real-time push notifications when an order is 2 minutes away from completion, preventing counter overcrowding.`;
    } else if (lowerAns.includes("route") || lowerAns.includes("shuttle") || lowerAns.includes("schedule") || lowerAns.includes("track") || lowerAns.includes("bus") || lowerAns.includes("gps")) {
      focusBadge = "Transit Optimization & Routing";
      thoughtCorrectly = `You analyzed transit delays as a resource allocation problem and focused on optimizing route frequency and student arrival timings.`;
      betterWay = `Introduce live GPS telemetry and dynamic stop skipping during peak hours to prioritize high-congestion hubs like L-Block and Central Library.`;
    } else if (lowerAns.includes("match") || lowerAns.includes("skill") || lowerAns.includes("filter") || lowerAns.includes("tag") || lowerAns.includes("mentor") || lowerAns.includes("database")) {
      focusBadge = "Algorithmic Matchmaking";
      thoughtCorrectly = `You structured team and mentor scheduling as a constraint satisfaction problem, matching complementary skill tags.`;
      betterWay = `Incorporate an automated bipartite matching algorithm with time-slot intervals to guarantee zero double-booking for mentors.`;
    } else {
      focusBadge = "Pragmatic Problem Solving";
      thoughtCorrectly = `You proposed "${ans}", taking direct aim at simplifying operational friction.`;
      betterWay = `To refine this: Break your solution into 3 structured layers: Input ingestion (how data is captured), Processing logic (how priority/queues are handled), and Output dispatch (how users receive the result).`;
    }

    return {
      questionTitle: "Scenario 1: Optimization & Workflow Strategy",
      questionText,
      userAnswer: ans,
      status: "VALID",
      focusBadge,
      badgeStyle: "bg-blue-900/40 border-blue-500/30 text-blue-300",
      thoughtCorrectly,
      betterWay
    };
  } else {
    // SCENARIO 2
    let focusBadge = "Smart Systems Architecture";
    let thoughtCorrectly = "";
    let betterWay = "";

    if (lowerAns.includes("ai") || lowerAns.includes("ocr") || lowerAns.includes("summarize") || lowerAns.includes("notes") || lowerAns.includes("slides") || lowerAns.includes("pyq") || lowerAns.includes("rag") || lowerAns.includes("bot") || lowerAns.includes("search")) {
      focusBadge = "NLP & Knowledge Intelligence";
      thoughtCorrectly = `You leveraged AI document processing and semantic search to convert unstructured academic materials into actionable study summaries.`;
      betterWay = `To build a high-performance system: Use a RAG (Retrieval-Augmented Generation) pipeline with vector embeddings and an automated flashcard generator for rapid exam revision.`;
    } else if (lowerAns.includes("sensor") || lowerAns.includes("camera") || lowerAns.includes("vision") || lowerAns.includes("seat") || lowerAns.includes("library") || lowerAns.includes("occupancy") || lowerAns.includes("iot") || lowerAns.includes("detect")) {
      focusBadge = "Computer Vision & IoT Telemetry";
      thoughtCorrectly = `You tackled the space availability challenge using automated presence detection without relying on tedious manual check-ins.`;
      betterWay = `To protect privacy and minimize server costs: Run lightweight edge-AI object detection (like YOLO on Raspberry Pi/microcontroller) that sends only anonymized seat count numbers rather than raw video feeds.`;
    } else if (lowerAns.includes("food") || lowerAns.includes("freshness") || lowerAns.includes("mess") || lowerAns.includes("quality") || lowerAns.includes("waste") || lowerAns.includes("feedback") || lowerAns.includes("rating")) {
      focusBadge = "Automated Quality Assurance";
      thoughtCorrectly = `You designed an automated feedback and monitoring pipeline to bring transparency to hostel operations and reduce waste.`;
      betterWay = `Combine daily meal consumption forecasting using historical attendance data with an automated image-based food quality audit log.`;
    } else if (lowerAns.includes("power") || lowerAns.includes("energy") || lowerAns.includes("light") || lowerAns.includes("ac") || lowerAns.includes("pir") || lowerAns.includes("schedule") || lowerAns.includes("timer")) {
      focusBadge = "Smart Automation & Energy IoT";
      thoughtCorrectly = `You recognized energy waste as an automation challenge and proposed sensor/schedule-driven power control.`;
      betterWay = `Integrate an override safety switch for specialized lab equipment and use ambient light + motion multi-sensor triggers before toggling main power relays.`;
    } else {
      focusBadge = "Applied Systems Engineering";
      thoughtCorrectly = `You proposed "${ans}", identifying a practical automation need in campus systems.`;
      betterWay = `Structure your solution with clear decoupled components: a lightweight frontend interface, a resilient API service, and a data persistence store with low latency.`;
    }

    return {
      questionTitle: "Scenario 2: Intelligent Systems Architecture",
      questionText,
      userAnswer: ans,
      status: "VALID",
      focusBadge,
      badgeStyle: "bg-purple-900/40 border-purple-500/30 text-purple-300",
      thoughtCorrectly,
      betterWay
    };
  }
}

/**
 * Main Persona Calculator with Strict 0-Score Enforcement for Gibberish/IDK
 */
export function calculatePersona({ name, branch, answer1, answer2, scenario1, scenario2 }) {
  const text1 = (answer1 || "").trim();
  const text2 = (answer2 || "").trim();
  const lower1 = text1.toLowerCase();
  const lower2 = text2.toLowerCase();
  const combined = lower1 + " " + lower2;

  const g1 = detectGibberishOrLowEffort(text1);
  const g2 = detectGibberishOrLowEffort(text2);
  const o1 = detectOffTopic(scenario1, text1);
  const o2 = detectOffTopic(scenario2, text2);

  // Both gibberish/idk -> ABSOLUTE 0 MARKS
  if (g1.isGibberish && g2.isGibberish) {
    const feedbackQ1 = generateQuestionFeedback(scenario1, text1, 1, "ACM-Dev");
    const feedbackQ2 = generateQuestionFeedback(scenario2, text2, 2, "ACM-Dev");
    const titleObj = getDeterministicTitle("ACM-Dev", 0, true, false);

    return {
      name: name || "PEC Student",
      branch: branch || "PEC Chandigarh",
      personaTitle: titleObj.title,
      recommendedWing: "ACM-Dev",
      wingDescription: titleObj.description,
      cpScore: 0,
      aiScore: 0,
      devScore: 0,
      hostelSurvival: 0,
      chaosIq: 0,
      lockComment: "No valid problem-solving logic was entered for Scenario 1.",
      robotComment: "No valid problem-solving logic was entered for Scenario 2.",
      feedbackQ1,
      feedbackQ2,
      superpower: "Needs technical re-evaluation with concrete problem-solving input.",
      timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
  }

  // Keywords for domain vector matching
  const cpKeywords = [
    "algorithm", "logic", "queue", "priority", "fifo", "optimal", "optimize", "fast",
    "efficiency", "sorting", "binary", "tree", "matrix", "bottleneck", "edge case", "latency",
    "speed", "shortcut", "step-by-step", "allocation", "schedule", "concurrency"
  ];

  const aiKeywords = [
    "ai", "ml", "machine learning", "model", "smart", "neural", "sensor", "detect",
    "vision", "camera", "predict", "nlp", "ocr", "summarize", "flashcard", "rag",
    "data", "intelligence", "automated", "analytics", "classification", "yolo"
  ];

  const devKeywords = [
    "app", "web", "website", "portal", "system", "build", "frontend", "backend",
    "api", "database", "dashboard", "kiosk", "qr", "qr code", "iot", "hardware",
    "microservice", "notification", "interface", "server", "architecture", "tool"
  ];

  let cpScore = g1.isGibberish ? 0 : 45;
  let aiScore = g2.isGibberish ? 0 : 45;
  let devScore = (g1.isGibberish && g2.isGibberish) ? 0 : 45;

  if (!g1.isGibberish || !g2.isGibberish) {
    cpKeywords.forEach(k => { if (combined.includes(k)) cpScore += 10; });
    aiKeywords.forEach(k => { if (combined.includes(k)) aiScore += 10; });
    devKeywords.forEach(k => { if (combined.includes(k)) devScore += 10; });

    // Word count / detail bonus for thoughtful freshers
    const wordCount = combined.split(/\s+/).filter(Boolean).length;
    if (wordCount > 25) {
      cpScore += 8; aiScore += 8; devScore += 8;
    }
    if (wordCount > 50) {
      cpScore += 6; aiScore += 6; devScore += 6;
    }

    // Branch aptitude baseline
    const bLower = (branch || "").toLowerCase();
    if (bLower.includes("cse") || bLower.includes("computer")) {
      cpScore += 5; devScore += 5;
    } else if (bLower.includes("ai") || bLower.includes("data")) {
      aiScore += 8;
    } else if (bLower.includes("ece") || bLower.includes("ee") || bLower.includes("mech") || bLower.includes("bdes")) {
      devScore += 8;
    }

    // Penalize individual gibberish / off-topic
    if (g1.isGibberish) {
      cpScore = 0;
      devScore = Math.floor(devScore * 0.5);
    }
    if (g2.isGibberish) {
      aiScore = 0;
      devScore = Math.floor(devScore * 0.5);
    }
    if (o1.isOffTopic) cpScore = Math.floor(cpScore * 0.4);
    if (o2.isOffTopic) aiScore = Math.floor(aiScore * 0.4);

    cpScore = Math.min(98, Math.max(0, cpScore));
    aiScore = Math.min(98, Math.max(0, aiScore));
    devScore = Math.min(98, Math.max(0, devScore));
  }

  // Determine Dominant Wing
  let recommendedWing = "ACM-Dev";
  let maxScore = devScore;

  if (cpScore >= aiScore && cpScore >= devScore) {
    recommendedWing = "ACM-CP";
    maxScore = cpScore;
  } else if (aiScore >= cpScore && aiScore >= devScore) {
    recommendedWing = "ACM-AI";
    maxScore = aiScore;
  } else {
    recommendedWing = "ACM-Dev";
    maxScore = devScore;
  }

  const titleObj = getDeterministicTitle(recommendedWing, maxScore, false, combined);

  // Generate detailed question-by-question feedback
  const feedbackQ1 = generateQuestionFeedback(scenario1, text1, 1, recommendedWing);
  const feedbackQ2 = generateQuestionFeedback(scenario2, text2, 2, recommendedWing);

  // Quotes
  let lockComment = `Scenario 1 logic: "${text1.substring(0, 50)}..."`;
  let robotComment = `Scenario 2 architecture: "${text2.substring(0, 50)}..."`;

  if (g1.isGibberish) lockComment = `Non-responsive input for Scenario 1 (0 marks awarded).`;
  if (g2.isGibberish) robotComment = `Non-responsive input for Scenario 2 (0 marks awarded).`;

  return {
    name: name || "PEC Student",
    branch: branch || "PEC Chandigarh",
    personaTitle: titleObj.title,
    recommendedWing,
    wingDescription: titleObj.description,
    cpScore,
    aiScore,
    devScore,
    hostelSurvival: Math.min(99, Math.max(0, Math.floor((cpScore + devScore) / 2))),
    chaosIq: Math.min(99, Math.max(0, Math.floor((aiScore + cpScore) / 2))),
    lockComment,
    robotComment,
    feedbackQ1,
    feedbackQ2,
    superpower: `Aptitude evaluated across Algorithmic Logic, Machine Intelligence & System Building.`,
    timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  };
}

