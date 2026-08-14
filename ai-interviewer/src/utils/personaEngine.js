// Intelligent AI Persona Analysis & Strategic Feedback Engine for PEC ACM Student Chapter

/**
 * Checks if an input string is gibberish, filler, keyboard mash, or too low-effort.
 */
export function detectGibberishOrLowEffort(text) {
  if (!text || typeof text !== "string") return { isGibberish: true, reason: "empty" };
  const trimmed = text.trim();
  if (trimmed.length < 4) return { isGibberish: true, reason: "too_short" };

  const lower = trimmed.toLowerCase();

  // Known repetitive filler words
  const fillerPatterns = [
    /^([a-z])\1{3,}$/i, // aaaa, zzzz
    /^(blah\s*)+$/i,    // blah, blah blah, blah blah blah
    /^(na\s*)+$/i,      // na na na
    /^(la\s*)+$/i,      // la la la
    /^(ha\s*)+$/i,      // haha haha
    /^(da\s*)+$/i,      // da da da
    /^(yo\s*)+$/i,      // yo yo
    /^(test\s*)+$/i,    // test test
    /^(asdf\s*)+$/i,    // asdf
    /^(qwerty\s*)+$/i,  // qwerty
    /^(xyz\s*)+$/i,     // xyz
    /^(abc\s*)+$/i,     // abc
    /^(idk|dont know|dunno|nothing|none|no|yes|ok|okay|skip|pass)$/i
  ];

  for (const pattern of fillerPatterns) {
    if (pattern.test(lower)) {
      return { isGibberish: true, reason: "filler_pattern" };
    }
  }

  // Check character diversity (e.g. keyboard spam like "asdfghjk" or "qweqweqwe")
  const uniqueChars = new Set(lower.replace(/\s+/g, "").split(""));
  if (trimmed.length >= 8 && uniqueChars.size <= 3) {
    return { isGibberish: true, reason: "low_char_diversity" };
  }

  // Word count check
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length === 1 && trimmed.length < 6) {
    return { isGibberish: true, reason: "single_short_word" };
  }

  return { isGibberish: false, reason: "valid" };
}

/**
 * Detects if an answer is completely mismatched to the question scenario.
 * e.g., answering "sprint 2 km" to a question about "building an AI robot/gadget".
 */
export function detectOffTopic(questionText, answerText, questionNumber) {
  const lowerAns = (answerText || "").toLowerCase();
  const lowerQ = (questionText || "").toLowerCase();

  if (questionNumber === 2) {
    // Question 2 asks to build a robot / AI gadget / automation tool
    const isCommuteOnly = 
      (lowerAns.includes("run") || lowerAns.includes("sprint") || lowerAns.includes("walk") || lowerAns.includes("balcony") || lowerAns.includes("auto")) &&
      !lowerAns.includes("robot") && !lowerAns.includes("ai") && !lowerAns.includes("app") && !lowerAns.includes("bot") && 
      !lowerAns.includes("device") && !lowerAns.includes("tool") && !lowerAns.includes("sensor") && !lowerAns.includes("camera") &&
      !lowerAns.includes("scan") && !lowerAns.includes("automate") && !lowerAns.includes("code");

    if (isCommuteOnly) {
      return {
        isOffTopic: true,
        issue: "You provided a physical escape/sprint action instead of designing an AI tool or robot."
      };
    }
  }

  return { isOffTopic: false };
}

/**
 * Intelligent Question-by-Question Feedback Generator
 * Strictly evaluates:
 * 1. Gibberish / Low-effort (Calls it out & gives proper solution)
 * 2. Off-topic (Corrects the concept into an engineering proposal)
 * 3. Valid Attempt (Identifies specific strengths + provides higher-level engineering optimization)
 */
export function generateQuestionFeedback(questionText, answerText, questionNumber, wing) {
  const ans = (answerText || "").trim();
  const lowerAns = ans.toLowerCase();
  const lowerQ = (questionText || "").toLowerCase();

  // 1. GIBBERISH / FILLER DETECTION
  const gibberishCheck = detectGibberishOrLowEffort(ans);
  if (gibberishCheck.isGibberish) {
    if (questionNumber === 1) {
      let recommendedSolution = "For this crisis, a logical student strategy is: either slipping out quietly when the professor writes on the board, using an improvised mechanical lever (like a card/pin) on a jammed lock, or taking an electric auto detour through Sector 11 to avoid traffic.";
      if (lowerQ.includes("lecture") || lowerQ.includes("hall") || lowerQ.includes("wrong")) {
        recommendedSolution = "To escape a locked 4th-year lecture hall unnoticed: wait for the professor to turn to the blackboard and quietly slip out through the back door, or raise your hand and politely excuse yourself citing a mandatory laboratory clash.";
      } else if (lowerQ.includes("lock") || lowerQ.includes("door")) {
        recommendedSolution = "To escape a jammed door in under 10 minutes: use mechanical leverage with a plastic card or hairpin on the latch, or check if the adjacent balcony partition is accessible.";
      } else if (lowerQ.includes("traffic") || lowerQ.includes("ctu") || lowerQ.includes("scooter")) {
        recommendedSolution = "To reach PEC before the 75% attendance cutoff: disembark the stuck CTU bus immediately, take an electric auto shortcut through the Sector 11/15 interior grid, and message your CR with a live transit timestamp.";
      }

      return {
        questionTitle: "Scenario 1: Crisis & Attendance Strategy",
        questionText,
        userAnswer: ans || "(No coherent answer provided)",
        status: "GIBBERISH",
        focusBadge: "⚠️ Incoherent / Filler Answer",
        badgeStyle: "bg-red-950/60 border-red-500/40 text-red-300",
        thoughtCorrectly: `❌ No engineering logic detected: You entered "${ans || 'empty text'}", which is meaningless filler and does not attempt to solve the crisis. Under real campus constraints, random input results in missed attendance.`,
        betterWay: `💡 What a logical solution looks like: ${recommendedSolution}`
      };
    } else {
      return {
        questionTitle: "Scenario 2: Innovation & Automation Strategy",
        questionText,
        userAnswer: ans || "(No coherent answer provided)",
        status: "GIBBERISH",
        focusBadge: "⚠️ Incoherent / Filler Answer",
        badgeStyle: "bg-red-950/60 border-red-500/40 text-red-300",
        thoughtCorrectly: `❌ No engineering concept detected: You entered "${ans || 'empty text'}". Designing tech solutions requires defining a real problem and proposing a concrete mechanism.`,
        betterWay: `💡 What a strong AI project proposal looks like: Propose a concrete tool such as: an Edge-AI Computer Vision scanner for mess food freshness, a BLE Beacon network predicting CTU bus seat availability, or an automated speech-to-text transcript bot for 8 AM lectures.`
      };
    }
  }

  // 2. OFF-TOPIC CONCEPT DETECTION
  const offTopicCheck = detectOffTopic(questionText, ans, questionNumber);
  if (offTopicCheck.isOffTopic) {
    return {
      questionTitle: "Scenario 2: Innovation & Automation Strategy",
      questionText,
      userAnswer: ans,
      status: "OFF_TOPIC",
      focusBadge: "⚠️ Concept Mismatch (Off-Topic)",
      badgeStyle: "bg-amber-950/60 border-amber-500/40 text-amber-300",
      thoughtCorrectly: `⚠️ Misaligned concept: You suggested "${ans}", which is a manual physical commute action rather than an AI tool or automation gadget for PEC.`,
      betterWay: `💡 How to transform this into an actual AI project: Instead of physically running to L-Block, you could propose an Autonomous Campus Dispatcher Bot or a Real-time Transit Queue App using GPS telemetry to automate student arrivals.`
    };
  }

  // 3. LEGITIMATE ATTEMPT EVALUATION (Tailored to their actual answer)
  if (questionNumber === 1) {
    let focusBadge = "Pragmatic Problem Solving";
    let thoughtCorrectly = "";
    let betterWay = "";

    if (lowerAns.includes("blackboard") || lowerAns.includes("quiet") || lowerAns.includes("slip") || lowerAns.includes("back door") || lowerAns.includes("stealth") || lowerAns.includes("crawl") || lowerAns.includes("hide")) {
      focusBadge = "Stealth & Timing Optimization";
      thoughtCorrectly = `You identified the critical timing window: capitalizing on the professor's divided attention (e.g. when facing the board) to exit with zero disruption.`;
      betterWay = `To execute this cleanly: check if the rear door has an audible latch before moving, and if caught, have a calm pre-planned excuse (e.g. misread timetable room number) to neutralize disciplinary friction.`;
    } else if (lowerAns.includes("excuse") || lowerAns.includes("washroom") || lowerAns.includes("water") || lowerAns.includes("medical") || lowerAns.includes("hand") || lowerAns.includes("sir") || lowerAns.includes("ma'am") || lowerAns.includes("teacher")) {
      focusBadge = "Diplomatic Conflict Resolution";
      thoughtCorrectly = `You chose transparency and diplomatic communication rather than risking a clumsy stealth exit, preserving professional decorum.`;
      betterWay = `To make this smoother: state a specific time-sensitive academic conflict (such as "I have a scheduled lab evaluation in L-Block starting right now") rather than a generic washroom excuse, making faculty permission instantaneous.`;
    } else if (lowerAns.includes("auto") || lowerAns.includes("cab") || lowerAns.includes("scooter") || lowerAns.includes("sprint") || lowerAns.includes("shortcut") || lowerAns.includes("sector 11")) {
      focusBadge = "Rapid Transit & Decisive Action";
      thoughtCorrectly = `You recognized that breaking through traffic bottlenecks requires immediate alternate routing rather than waiting passively in queue.`;
      betterWay = `A superior engineering setup: connect to automated Chandigarh Smart City traffic telemetry feeds via WhatsApp bot to dynamically calculate fastest green corridors before you reach congested roundabouts.`;
    } else if (lowerAns.includes("card") || lowerAns.includes("pin") || lowerAns.includes("scale") || lowerAns.includes("screwdriver") || lowerAns.includes("balcony") || lowerAns.includes("lock")) {
      focusBadge = "Mechanical Resourcefulness";
      thoughtCorrectly = `You showed quick hands-on mechanical intuition by looking for physical leverage on the lock mechanism.`;
      betterWay = `While physical lock bypassing works in emergencies, modern hostel locks are often reinforced. A safer engineering contingency is setting up a smart BLE emergency override module on your room latch.`;
    } else {
      focusBadge = "Adaptive Crisis Action";
      thoughtCorrectly = `You proposed "${ans}", demonstrating intent to take immediate action under time pressure.`;
      betterWay = `To level up this strategy: integrate predictive contingency planning — keeping verified campus contact numbers and alternative entry route maps ready before emergencies arise.`;
    }

    return {
      questionTitle: "Scenario 1: Crisis & Attendance Strategy",
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
    let focusBadge = "Campus Innovation";
    let thoughtCorrectly = "";
    let betterWay = "";

    if (lowerAns.includes("food") || lowerAns.includes("mess") || lowerAns.includes("paneer") || lowerAns.includes("canteen")) {
      focusBadge = "Computer Vision & Quality Assurance";
      thoughtCorrectly = `You accurately targeted one of the highest-impact daily student grievances — food quality and mess monitoring.`;
      betterWay = `To make this hackathon-ready: architect it as an Edge-AI setup with a Raspberry Pi + camera running a fine-tuned YOLOv8 classification model, logging live freshness scores directly to a public student dashboard.`;
    } else if (lowerAns.includes("attendance") || lowerAns.includes("8 am") || lowerAns.includes("lecture") || lowerAns.includes("audio") || lowerAns.includes("notes") || lowerAns.includes("summary")) {
      focusBadge = "Speech-to-Text & Academic Automation";
      thoughtCorrectly = `You focused on reclaiming lost study time caused by morning lecture fatigue and manual note-taking.`;
      betterWay = `Elevate this into an autonomous classroom recorder using Whisper API and local LLMs to generate structured Markdown summaries and revision flashcards immediately after the professor finishes speaking.`;
    } else if (lowerAns.includes("bus") || lowerAns.includes("ctu") || lowerAns.includes("seat") || lowerAns.includes("traffic")) {
      focusBadge = "Crowd Density & Transit Telemetry";
      thoughtCorrectly = `You addressed the major transit predictability bottleneck faced by Day Scholars travelling across the tricity.`;
      betterWay = `Build a crowd-density sensor network utilizing BLE beacon packet sniffing on student smartphones, providing real-time empty seat estimations without installing expensive hardware on buses.`;
    } else if (lowerAns.includes("library") || lowerAns.includes("seat") || lowerAns.includes("study") || lowerAns.includes("table")) {
      focusBadge = "IoT Resource Allocation";
      thoughtCorrectly = `You pinpointed the severe workspace availability constraint students face during examination weeks.`;
      betterWay = `Implement a passive infrared (PIR) / thermal desk sensor grid that syncs with a Telegram bot, enabling 15-minute seat reservations and preventing unfair manual hoarding.`;
    } else {
      focusBadge = "Applied Tech Engineering";
      thoughtCorrectly = `You proposed "${ans}", identifying a real area where automation can streamline campus life.`;
      betterWay = `To make this project viable for an ACM grant: structure it with a clean microservices architecture (FastAPI backend, React frontend, and IoT edge hardware) with clear latency benchmarks.`;
    }

    return {
      questionTitle: "Scenario 2: Innovation & Automation Strategy",
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
 * Main Persona Calculator
 */
export function calculatePersona({ name, branch, answer1, answer2, scenario1, scenario2 }) {
  const text1 = (answer1 || "").trim();
  const text2 = (answer2 || "").trim();
  const lower1 = text1.toLowerCase();
  const lower2 = text2.toLowerCase();
  const combined = lower1 + " " + lower2;

  const g1 = detectGibberishOrLowEffort(text1);
  const g2 = detectGibberishOrLowEffort(text2);
  const o2 = detectOffTopic(scenario2, text2, 2);

  // 1. Keyword Vectors for Scoring
  const cpKeywords = [
    "o(1)", "logic", "algorithm", "binary", "shortcut", "optimal", "fast", "speed", 
    "path", "efficient", "tree", "matrix", "codeforces", "icpc", "dp", "greedy", "stealth", "timing"
  ];

  const aiKeywords = [
    "ai", "robot", "ml", "neural", "smart", "sensor", "detect", "vision", "camera", 
    "automated", "machine learning", "scan", "quality", "analyze", "gpt", "model", "predict", "freshness"
  ];

  const devKeywords = [
    "build", "hack", "app", "hardware", "iot", "rig", "tool", "lever", "door", "lock",
    "fullstack", "script", "prototype", "system", "design", "mechanic", "diy", "wire", "device", "card", "pin"
  ];

  let cpScore = 40;
  let aiScore = 40;
  let devScore = 40;

  // Penalize gibberish strictly!
  if (g1.isGibberish && g2.isGibberish) {
    cpScore = 20 + Math.floor(Math.random() * 8);
    aiScore = 20 + Math.floor(Math.random() * 8);
    devScore = 20 + Math.floor(Math.random() * 8);
  } else {
    if (g1.isGibberish) cpScore -= 15;
    if (g2.isGibberish) aiScore -= 15;
    if (o2.isOffTopic) aiScore -= 10;

    cpKeywords.forEach(k => { if (combined.includes(k)) cpScore += 14; });
    aiKeywords.forEach(k => { if (combined.includes(k)) aiScore += 14; });
    devKeywords.forEach(k => { if (combined.includes(k)) devScore += 14; });

    const bLower = (branch || "").toLowerCase();
    if (bLower.includes("cse") || bLower.includes("computer")) {
      cpScore += 8; devScore += 8;
    } else if (bLower.includes("ai") || bLower.includes("data")) {
      aiScore += 12;
    } else if (bLower.includes("ece") || bLower.includes("ee") || bLower.includes("electric") || bLower.includes("mech")) {
      devScore += 12;
    }

    cpScore = Math.min(98, Math.max(30, cpScore));
    aiScore = Math.min(98, Math.max(30, aiScore));
    devScore = Math.min(98, Math.max(30, devScore));
  }

  // Determine Title
  let recommendedWing = "ACM-Dev";
  let personaTitle = "The Campus Pragmatist";
  let wingDescription = "You focus on building practical tools to tackle real-world campus bottlenecks.";

  if (g1.isGibberish && g2.isGibberish) {
    personaTitle = "The Enigmatic Lurker";
    recommendedWing = "ACM-Dev";
    wingDescription = "You tested the system with minimal input! Provide detailed technical logic to unlock your full ACM profile.";
  } else if (cpScore >= aiScore && cpScore >= devScore) {
    recommendedWing = "ACM-CP";
    personaTitle = "The Algorithmic Strategist";
    wingDescription = "You calculate optimal speed, analyze constraints, and solve emergencies with razor-sharp logic.";
  } else if (aiScore >= cpScore && aiScore >= devScore) {
    recommendedWing = "ACM-AI";
    personaTitle = "The AI Innovator";
    wingDescription = "You think in automated systems and machine learning models to modernize campus workflows.";
  } else {
    recommendedWing = "ACM-Dev";
    personaTitle = "The Systems Architect";
    wingDescription = "You turn ideas into functioning prototypes, bridging software and hands-on execution.";
  }

  // Generate detailed question-by-question feedback
  const feedbackQ1 = generateQuestionFeedback(scenario1, text1, 1, recommendedWing);
  const feedbackQ2 = generateQuestionFeedback(scenario2, text2, 2, recommendedWing);

  // Quotes
  let lockComment = `Evaluated scenario 1 approach for PEC campus survival.`;
  let robotComment = `Evaluated scenario 2 tech proposal for ACM ecosystem.`;

  if (feedbackQ1.status === "GIBBERISH") {
    lockComment = `Entered non-specific filler input for Scenario 1.`;
  } else {
    lockComment = `Addressed Scenario 1 with "${text1.substring(0, 45)}..."`;
  }

  if (feedbackQ2.status === "GIBBERISH") {
    robotComment = `Entered non-specific filler input for Scenario 2.`;
  } else if (feedbackQ2.status === "OFF_TOPIC") {
    robotComment = `Proposed "${text2.substring(0, 45)}..." for Scenario 2.`;
  } else {
    robotComment = `Targeted campus automation with "${text2.substring(0, 45)}..."`;
  }

  return {
    name: name || "PEC Student",
    branch: branch || "PEC Chandigarh",
    personaTitle,
    recommendedWing,
    wingDescription,
    cpScore,
    aiScore,
    devScore,
    hostelSurvival: Math.min(99, Math.max(30, Math.floor((cpScore + devScore) / 2))),
    chaosIq: Math.min(99, Math.max(30, Math.floor((aiScore + cpScore) / 2))),
    lockComment,
    robotComment,
    feedbackQ1,
    feedbackQ2,
    superpower: `Analyzed across CP, AI/ML, and Full-Stack problem vectors.`,
    timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  };
}
