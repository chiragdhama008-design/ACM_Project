// Intelligent AI Persona Analysis & Deterministic Scoring Engine for PEC ACM Student Chapter

/**
 * Deterministic Backend Title Registry (Rule-based, NEVER AI Hallucinated)
 * Strictly assigned from the curated list:
 * - CP: The TLE Slayer, O(1) Brainiac, Codeforces Warlord, Binary Search Sorcerer, The Brute-Force Boss, Nested-Loop Legend, The Edge-Case Anarchist
 * - ML: The Overfitting Whisperer, Neural Network Alchemist, Prompt Engineering Monarch, The Gradient Descendant, Dataset Architect, Epoch Enthusiast, Hallucination Handler
 * - Dev: Full-Stack Phantom, The Production Crasher, Git Merge Mastermind, Terminal Overlord, UI/UX Visionary, Scripting Ninja, The Coffee-to-Code Converter
 * - CyberSec: The Firewall Phantom, SQL Injection Sensei, Bug Bounty Baron, The Ethical Hacker, Packet Sniffer Pro, CTF Gladiator, Script Kiddie Reborn
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
  } else if (wingKey === "ACM-ML" && (lowerText.includes("hallucinat") || lowerText.includes("creative") || lowerText.includes("generative") || lowerText.includes("wild"))) {
    if (score < 85) {
      return { title: "Hallucination Handler", description: "Turns AI chaotic energy into working features." };
    }
  } else if (wingKey === "ACM-Dev" && (lowerText.includes("coffee") || lowerText.includes("night") || lowerText.includes("hack") || lowerText.includes("fast"))) {
    if (score < 85 && score >= 50) {
      return { title: "The Coffee-to-Code Converter", description: "Fuels high-output development cycles with pure caffeine and ambition." };
    }
  } else if (wingKey === "ACM-CyberSec" && (lowerText.includes("script") || lowerText.includes("beginner") || lowerText.includes("learn") || lowerText.includes("start"))) {
    if (score < 85 && score >= 40) {
      return { title: "Script Kiddie Reborn", description: "Started with scripts, now they write exploits from scratch." };
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
    !lowerAns.includes("app") && !lowerAns.includes("system") && !lowerAns.includes("queue") && !lowerAns.includes("data") && !lowerAns.includes("build");

  if (isCompletelyUnrelated) {
    return {
      isOffTopic: true,
      issue: "The response discusses unrelated topics instead of proposing a systematic solution."
    };
  }

  return { isOffTopic: false };
}

/**
 * Intelligent Question-by-Question Feedback Generator for Fun Fresher Scenarios
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
      idealDemo = "A practical approach: Think about the problem step-by-step — what's the bottleneck? Then propose a simple solution like an app, a system, or just a clever life-hack. Even 'I'd make a WhatsApp group to coordinate' shows problem-solving!";
    } else {
      idealDemo = "A creative idea: Think about what bugs you about campus life, then imagine a cool tool or app that fixes it. For example: 'An app that shows live mess menu ratings' or 'A bot that reminds you about deadlines' — simple ideas count!";
    }

    return {
      questionTitle: questionNumber === 1 ? "Question 1: Problem Solving" : "Question 2: Creative Thinking",
      questionText,
      userAnswer: ans || "(No answer provided)",
      status: "GIBBERISH",
      focusBadge: "⚠️ No Score (0%): No Real Answer",
      badgeStyle: "bg-red-950/60 border-red-500/40 text-red-300",
      thoughtCorrectly: `❌ No score awarded: You entered "${ans || 'blank text'}", which doesn't show any problem-solving attempt. Even a simple idea like "I'd use an app" would earn you points!`,
      betterWay: `💡 Here's what would've worked: ${idealDemo}`
    };
  }

  // 2. OFF-TOPIC CONCEPT DETECTION
  const offTopicCheck = detectOffTopic(questionText, ans);
  if (offTopicCheck.isOffTopic) {
    return {
      questionTitle: questionNumber === 1 ? "Question 1: Problem Solving" : "Question 2: Creative Thinking",
      questionText,
      userAnswer: ans,
      status: "OFF_TOPIC",
      focusBadge: "⚠️ Off-Topic Answer",
      badgeStyle: "bg-amber-950/60 border-amber-500/40 text-amber-300",
      thoughtCorrectly: `⚠️ Your answer "${ans}" is creative but doesn't quite address the question. No worries — it still shows personality!`,
      betterWay: `💡 Try connecting your answer to the problem: What's the main issue? How would you fix it, even with a simple idea?`
    };
  }

  // 3. LEGITIMATE ATTEMPT EVALUATION (Fresher-friendly, generous scoring)
  if (questionNumber === 1) {
    let focusBadge = "Practical Thinker";
    let thoughtCorrectly = "";
    let betterWay = "";

    if (lowerAns.includes("app") || lowerAns.includes("website") || lowerAns.includes("portal") || lowerAns.includes("build") || lowerAns.includes("code") || lowerAns.includes("system")) {
      focusBadge = "Builder Mindset 🛠️";
      thoughtCorrectly = `Nice! You immediately thought about building something to solve the problem — that's a Dev mindset. You see problems as opportunities to create tools.`;
      betterWay = `To make it even cooler: Think about what data you'd need, who'd use it, and how it would look. Even a rough sketch of an idea shows strong thinking!`;
    } else if (lowerAns.includes("plan") || lowerAns.includes("step") || lowerAns.includes("first") || lowerAns.includes("then") || lowerAns.includes("priority") || lowerAns.includes("order") || lowerAns.includes("queue") || lowerAns.includes("schedule")) {
      focusBadge = "Strategic Planner 📋";
      thoughtCorrectly = `Great structured thinking! You broke down the problem into steps or priorities — that's exactly how competitive programmers approach challenges.`;
      betterWay = `Level up: Think about edge cases — what if your plan fails? Having a backup plan shows the kind of thinking that wins coding contests!`;
    } else if (lowerAns.includes("hack") || lowerAns.includes("trick") || lowerAns.includes("shortcut") || lowerAns.includes("jugaad") || lowerAns.includes("cheat") || lowerAns.includes("bypass")) {
      focusBadge = "Creative Hacker 🔓";
      thoughtCorrectly = `Love the out-of-the-box thinking! Finding clever shortcuts and unconventional solutions is pure CyberSec energy.`;
      betterWay = `Channel that energy: Think about whether your shortcut is ethical and sustainable. The best hackers find clever solutions that also follow the rules!`;
    } else if (lowerAns.includes("data") || lowerAns.includes("pattern") || lowerAns.includes("predict") || lowerAns.includes("analyze") || lowerAns.includes("smart") || lowerAns.includes("ai") || lowerAns.includes("automat")) {
      focusBadge = "Data Thinker 📊";
      thoughtCorrectly = `You're thinking about data and patterns — that's the ML mindset! You see problems as data puzzles waiting to be solved.`;
      betterWay = `Take it further: What kind of data would you collect? How would you use it to make predictions? Even simple ideas like 'track what works' show ML thinking!`;
    } else if (lowerAns.includes("security") || lowerAns.includes("password") || lowerAns.includes("lock") || lowerAns.includes("protect") || lowerAns.includes("safe") || lowerAns.includes("encrypt") || lowerAns.includes("camera") || lowerAns.includes("catch")) {
      focusBadge = "Security Mindset 🔐";
      thoughtCorrectly = `You naturally think about security and protection — that's CyberSec DNA! Spotting vulnerabilities is a superpower.`;
      betterWay = `Go deeper: Think about how someone might try to get around your solution. The best security comes from thinking like both the defender AND the attacker!`;
    } else {
      focusBadge = "Creative Thinker 💡";
      thoughtCorrectly = `You came up with your own approach: "${ans.substring(0, 60)}..." — and that's what matters! Every good solution starts with a creative idea.`;
      betterWay = `To strengthen your answer: Try explaining WHY your solution would work and what makes it better than just doing nothing. Structure = bonus points!`;
    }

    return {
      questionTitle: "Question 1: Problem Solving",
      questionText,
      userAnswer: ans,
      status: "VALID",
      focusBadge,
      badgeStyle: "bg-blue-900/40 border-blue-500/30 text-blue-300",
      thoughtCorrectly,
      betterWay
    };
  } else {
    // QUESTION 2
    let focusBadge = "Creative Mind";
    let thoughtCorrectly = "";
    let betterWay = "";

    if (lowerAns.includes("app") || lowerAns.includes("website") || lowerAns.includes("build") || lowerAns.includes("tool") || lowerAns.includes("platform") || lowerAns.includes("code")) {
      focusBadge = "App Builder 📱";
      thoughtCorrectly = `You're a natural builder! Your instinct is to create something useful — apps, tools, platforms. That's pure Dev energy right there.`;
      betterWay = `Make it real: What would the main screen look like? What's the ONE feature that makes people go 'woah'? Focus on that killer feature!`;
    } else if (lowerAns.includes("ai") || lowerAns.includes("ml") || lowerAns.includes("model") || lowerAns.includes("predict") || lowerAns.includes("data") || lowerAns.includes("train") || lowerAns.includes("smart") || lowerAns.includes("bot") || lowerAns.includes("automat")) {
      focusBadge = "ML Enthusiast 🧠";
      thoughtCorrectly = `You're thinking in terms of intelligence and automation — that's Machine Learning at its core! Making machines smarter is literally what ML is about.`;
      betterWay = `Think bigger: What data would you feed your model? How would it learn and improve over time? Even simple automation ideas show strong ML instincts!`;
    } else if (lowerAns.includes("hack") || lowerAns.includes("security") || lowerAns.includes("encrypt") || lowerAns.includes("virus") || lowerAns.includes("password") || lowerAns.includes("firewall") || lowerAns.includes("protect") || lowerAns.includes("safe") || lowerAns.includes("usb") || lowerAns.includes("scan")) {
      focusBadge = "Cyber Guardian 🛡️";
      thoughtCorrectly = `Your security-first thinking is impressive! You naturally consider threats, protection, and digital safety — classic CyberSec mindset.`;
      betterWay = `Go further: Think about how you'd DETECT problems, not just prevent them. The best security pros build systems that alert you before things go wrong!`;
    } else if (lowerAns.includes("algorithm") || lowerAns.includes("logic") || lowerAns.includes("optimize") || lowerAns.includes("efficient") || lowerAns.includes("faster") || lowerAns.includes("sort") || lowerAns.includes("solve")) {
      focusBadge = "Logic Master ⚡";
      thoughtCorrectly = `You think in terms of efficiency and optimization — that's competitive programming DNA! Breaking down problems into logical steps is a superpower.`;
      betterWay = `Challenge yourself: Can you make your solution even faster or handle more edge cases? That's what separates good coders from great ones!`;
    } else if (lowerAns.includes("robot") || lowerAns.includes("hardware") || lowerAns.includes("sensor") || lowerAns.includes("iot") || lowerAns.includes("device") || lowerAns.includes("machine")) {
      focusBadge = "Hardware Tinkerer 🤖";
      thoughtCorrectly = `You're thinking beyond software — into the physical world! Building real devices and robots is incredibly cool and shows Dev + ML crossover thinking.`;
      betterWay = `Level up: Think about how your device would communicate with a phone or dashboard. The magic happens when hardware meets software!`;
    } else {
      focusBadge = "Original Thinker 🌟";
      thoughtCorrectly = `Your unique perspective: "${ans.substring(0, 60)}..." shows independent thinking. You don't follow templates — you create your own solutions!`;
      betterWay = `To make it stronger: Connect your idea to a real problem on campus. The best ideas solve something that genuinely bugs people!`;
    }

    return {
      questionTitle: "Question 2: Creative Thinking",
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
 * Main Persona Calculator with 4 Wings: CP, ML, Dev, CyberSec
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
      mlScore: 0,
      devScore: 0,
      cyberScore: 0,
      hostelSurvival: 0,
      chaosIq: 0,
      lockComment: "No valid problem-solving logic was entered for Question 1.",
      robotComment: "No valid problem-solving logic was entered for Question 2.",
      feedbackQ1,
      feedbackQ2,
      superpower: "Needs re-evaluation with a real answer — even a short one counts!",
      timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
  }

  // Keywords for domain vector matching
  const cpKeywords = [
    "algorithm", "logic", "queue", "priority", "fifo", "optimal", "optimize", "fast",
    "efficiency", "sorting", "binary", "tree", "matrix", "bottleneck", "edge case", "latency",
    "speed", "shortcut", "step-by-step", "allocation", "schedule", "concurrency",
    "plan", "order", "first", "then", "strategy", "rank"
  ];

  const mlKeywords = [
    "ai", "ml", "machine learning", "model", "smart", "neural", "sensor", "detect",
    "vision", "camera", "predict", "nlp", "ocr", "summarize", "flashcard", "rag",
    "data", "intelligence", "automated", "analytics", "classification", "yolo",
    "bot", "recommend", "pattern", "train", "learn"
  ];

  const devKeywords = [
    "app", "web", "website", "portal", "system", "build", "frontend", "backend",
    "api", "database", "dashboard", "kiosk", "qr", "qr code", "iot", "hardware",
    "microservice", "notification", "interface", "server", "architecture", "tool",
    "code", "platform", "feature", "design", "ui", "ux", "mobile"
  ];

  const cyberKeywords = [
    "security", "hack", "hacker", "encrypt", "decrypt", "password", "firewall",
    "virus", "malware", "phishing", "vulnerability", "exploit", "ctf", "penetration",
    "safe", "protect", "lock", "unlock", "privacy", "scan", "usb", "suspicious",
    "catch", "spy", "trace", "forensic", "vpn", "proxy", "anonymous"
  ];

  let cpScore = g1.isGibberish ? 0 : 45;
  let mlScore = g2.isGibberish ? 0 : 45;
  let devScore = (g1.isGibberish && g2.isGibberish) ? 0 : 45;
  let cyberScore = (g1.isGibberish && g2.isGibberish) ? 0 : 40;

  if (!g1.isGibberish || !g2.isGibberish) {
    cpKeywords.forEach(k => { if (combined.includes(k)) cpScore += 10; });
    mlKeywords.forEach(k => { if (combined.includes(k)) mlScore += 10; });
    devKeywords.forEach(k => { if (combined.includes(k)) devScore += 10; });
    cyberKeywords.forEach(k => { if (combined.includes(k)) cyberScore += 10; });

    // Word count / detail bonus for thoughtful freshers
    const wordCount = combined.split(/\s+/).filter(Boolean).length;
    if (wordCount > 15) {
      cpScore += 8; mlScore += 8; devScore += 8; cyberScore += 6;
    }
    if (wordCount > 35) {
      cpScore += 6; mlScore += 6; devScore += 6; cyberScore += 5;
    }

    // Branch aptitude baseline
    const bLower = (branch || "").toLowerCase();
    if (bLower.includes("cse") || bLower.includes("computer")) {
      cpScore += 5; devScore += 5;
    } else if (bLower.includes("ai") || bLower.includes("data")) {
      mlScore += 8;
    } else if (bLower.includes("ece") || bLower.includes("ee") || bLower.includes("mech") || bLower.includes("bdes")) {
      devScore += 8;
    }

    // Penalize individual gibberish / off-topic
    if (g1.isGibberish) {
      cpScore = 0;
      devScore = Math.floor(devScore * 0.5);
      cyberScore = Math.floor(cyberScore * 0.5);
    }
    if (g2.isGibberish) {
      mlScore = 0;
      devScore = Math.floor(devScore * 0.5);
      cyberScore = Math.floor(cyberScore * 0.5);
    }
    if (o1.isOffTopic) cpScore = Math.floor(cpScore * 0.4);
    if (o2.isOffTopic) mlScore = Math.floor(mlScore * 0.4);

    cpScore = Math.min(98, Math.max(0, cpScore));
    mlScore = Math.min(98, Math.max(0, mlScore));
    devScore = Math.min(98, Math.max(0, devScore));
    cyberScore = Math.min(98, Math.max(0, cyberScore));
  }

  // Determine Dominant Wing (4-way comparison)
  let recommendedWing = "ACM-Dev";
  let maxScore = devScore;

  if (cpScore >= mlScore && cpScore >= devScore && cpScore >= cyberScore) {
    recommendedWing = "ACM-CP";
    maxScore = cpScore;
  } else if (mlScore >= cpScore && mlScore >= devScore && mlScore >= cyberScore) {
    recommendedWing = "ACM-ML";
    maxScore = mlScore;
  } else if (cyberScore >= cpScore && cyberScore >= mlScore && cyberScore >= devScore) {
    recommendedWing = "ACM-CyberSec";
    maxScore = cyberScore;
  } else {
    recommendedWing = "ACM-Dev";
    maxScore = devScore;
  }

  const titleObj = getDeterministicTitle(recommendedWing, maxScore, false, combined);

  // Generate detailed question-by-question feedback
  const feedbackQ1 = generateQuestionFeedback(scenario1, text1, 1, recommendedWing);
  const feedbackQ2 = generateQuestionFeedback(scenario2, text2, 2, recommendedWing);

  // Quotes
  let lockComment = `Q1 vibe: "${text1.substring(0, 50)}..."`;
  let robotComment = `Q2 vibe: "${text2.substring(0, 50)}..."`;

  if (g1.isGibberish) lockComment = `No real answer for Question 1 — try again with even a short idea!`;
  if (g2.isGibberish) robotComment = `No real answer for Question 2 — even one sentence counts!`;

  return {
    name: name || "PEC Student",
    branch: branch || "PEC Chandigarh",
    personaTitle: titleObj.title,
    recommendedWing,
    wingDescription: titleObj.description,
    cpScore,
    mlScore,
    devScore,
    cyberScore,
    hostelSurvival: Math.min(99, Math.max(0, Math.floor((cpScore + devScore) / 2))),
    chaosIq: Math.min(99, Math.max(0, Math.floor((mlScore + cyberScore) / 2))),
    lockComment,
    robotComment,
    feedbackQ1,
    feedbackQ2,
    superpower: `Your vibe has been analyzed across Logic, ML, Dev, and CyberSec!`,
    timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  };
}
