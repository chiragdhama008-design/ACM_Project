// Creative AI Persona Analysis & Strategic Feedback Engine for PEC ACM Student Chapter

/**
 * Intelligent Question-by-Question Feedback Generator
 * Produces constructive coaching:
 * 1. "What you thought correctly" (strengths & clever thinking)
 * 2. "How to do it better / AI Strategic Recommendation" (alternative optimal approach)
 */
function generateQuestionFeedback(questionText, answerText, questionNumber, wing) {
  const ans = (answerText || "").trim();
  const lowerAns = ans.toLowerCase();
  const lowerQ = (questionText || "").toLowerCase();

  if (questionNumber === 1) {
    // SCENARIO 1: Emergency Commute / Attendance / Jammed Door / Lab Crisis
    let thoughtCorrectly = "";
    let betterWay = "";
    let focusBadge = "Pragmatic Problem Solving";

    if (
      lowerAns.includes("auto") || 
      lowerAns.includes("cab") || 
      lowerAns.includes("scooter") || 
      lowerAns.includes("sprint") || 
      lowerAns.includes("run") || 
      lowerAns.includes("shortcut") ||
      lowerAns.includes("sector 11") ||
      lowerAns.includes("cycle")
    ) {
      focusBadge = "Rapid Transit & Decisive Action";
      thoughtCorrectly = `You correctly prioritized swift physical mobility and decisive time conservation over freezing under pressure. Bypassing the immediate choke point (like Tribune Chowk or Sector 11) is the right initial survival instinct for strict 75% attendance criteria.`;
      betterWay = `Instead of relying solely on last-minute sprinting or spot transport, a more reliable method is setting up automated CTU route telemetry alerts with an O(1) detour protocol (Sector 11/15 green corridors). Additionally, coordinating a pre-agreed peer check-in webhook with your lab partner ensures your attendance is secured before the door is locked.`;
    } else if (
      lowerAns.includes("lock") || 
      lowerAns.includes("door") || 
      lowerAns.includes("window") || 
      lowerAns.includes("balcony") || 
      lowerAns.includes("kick") || 
      lowerAns.includes("hairpin") || 
      lowerAns.includes("card") || 
      lowerAns.includes("screwdriver") ||
      lowerAns.includes("scale")
    ) {
      focusBadge = "Resourceful Physical Hack";
      thoughtCorrectly = `You displayed sharp situational resourcefulness by looking for mechanical leverage and unconventional exit vectors (like balcony hops or latch manipulation) rather than waiting helplessly for assistance.`;
      betterWay = `While physical force or improvised lockpicking works in emergencies, it carries damage risks. An engineer's smarter solution is deploying an emergency BLE/NFC latch actuator override or keeping a hidden dual-key magnetic failsafe outside the door, turning a high-stress 10-minute bottleneck into a 5-second seamless escape.`;
    } else if (
      lowerAns.includes("email") || 
      lowerAns.includes("call") || 
      lowerAns.includes("professor") || 
      lowerAns.includes("cr") || 
      lowerAns.includes("friend") || 
      lowerAns.includes("ta") || 
      lowerAns.includes("inform") ||
      lowerAns.includes("message")
    ) {
      focusBadge = "Diplomatic Communication & Network Leverage";
      thoughtCorrectly = `You rightly recognized the power of proactive communication and leveraging your student network. Informing the professor or Class Representative (CR) early establishes transparency before you are officially marked absent.`;
      betterWay = `While communication is essential, faculty often ignore last-minute individual messages. A superior approach is coupling your alert with verifiable proof (e.g. sharing your live transit timestamp via a trusted peer) and having a classmate immediately request permission for you as you arrive, minimizing academic friction.`;
    } else if (
      lowerAns.includes("calc") || 
      lowerAns.includes("margin") || 
      lowerAns.includes("75") || 
      lowerAns.includes("percentage") || 
      lowerAns.includes("skip") || 
      lowerAns.includes("bunk")
    ) {
      focusBadge = "Analytical Risk Assessment";
      thoughtCorrectly = `You correctly approached the situation with mathematical risk assessment by analyzing whether missing this specific lecture breaches your critical 75% attendance threshold.`;
      betterWay = `Instead of manually evaluating margin under stress, an optimal student engineer uses a predictive attendance calculator API connected to your timetable that automatically determines trade-offs and triggers an automated compensatory lab session request.`;
    } else {
      focusBadge = "Agile Crisis Management";
      thoughtCorrectly = `You demonstrated high adaptability and quick improvisation under tight constraints, focusing on overcoming the obstacle immediately rather than giving up.`;
      betterWay = `To elevate this approach to top-tier engineering standards, combine your intuitive reaction with systematic contingency planning — such as pre-mapped alternative PEC campus entry routes and buddy-system check-in alerts.`;
    }

    return {
      questionTitle: "Scenario 1: Crisis & Attendance Strategy",
      questionText,
      userAnswer: ans || "Action taken under pressure",
      focusBadge,
      thoughtCorrectly,
      betterWay
    };
  } else {
    // SCENARIO 2: Campus Innovation / AI Robot / Automation Tool
    let thoughtCorrectly = "";
    let betterWay = "";
    let focusBadge = "Campus Innovation & Design";

    if (
      lowerAns.includes("food") || 
      lowerAns.includes("mess") || 
      lowerAns.includes("paneer") || 
      lowerAns.includes("canteen") || 
      lowerAns.includes("meal") || 
      lowerAns.includes("taste")
    ) {
      focusBadge = "Quality of Life & Sensory Tech";
      thoughtCorrectly = `You accurately identified one of the most critical day-to-day pain points for PEC students — food quality and hygiene in the mess and canteen. Targeting high-frequency student grievances creates immediate community value.`;
      betterWay = `To make this concept production-ready for an ACM Hackathon, evolve it from basic inspection to an automated computer vision rig (using YOLOv8 on an edge Raspberry Pi) combined with multi-spectral pH/freshness sensors and real-time public dashboard logging, forcing accountability with tamper-proof data.`;
    } else if (
      lowerAns.includes("attendance") || 
      lowerAns.includes("proxy") || 
      lowerAns.includes("8 am") || 
      lowerAns.includes("lecture") || 
      lowerAns.includes("class") || 
      lowerAns.includes("sleep")
    ) {
      focusBadge = "Academic Automation & Workflow Optimization";
      thoughtCorrectly = `You zeroed in on the perennial student struggle with 8 AM morning lectures and strict attendance tracking, seeking automation to reclaim valuable time.`;
      betterWay = `Rather than risky proxy attempts, a world-class engineering solution is an AI lecture summarizer and speech-to-text transcript bot deployed in the hall, coupled with an automated smart calendar dispatcher that syncs lecture audio directly to your revision notes in real time.`;
    } else if (
      lowerAns.includes("bus") || 
      lowerAns.includes("ctu") || 
      lowerAns.includes("seat") || 
      lowerAns.includes("traffic") || 
      lowerAns.includes("commute")
    ) {
      focusBadge = "Smart Transit & Crowd Density Intelligence";
      thoughtCorrectly = `You thoughtfully addressed the severe commuting bottleneck faced by Day Scholars travelling via CTU buses, targeting predictability and seat availability.`;
      betterWay = `Rather than just a static bus tracker, elevate this into a crowd-density estimation network using distributed smartphone Bluetooth beacons and real-time transit telemetry, suggesting optimal boarding sectors and dynamic auto-pooling options for PEC students.`;
    } else if (
      lowerAns.includes("library") || 
      lowerAns.includes("study") || 
      lowerAns.includes("seat") || 
      lowerAns.includes("quiet") || 
      lowerAns.includes("exam")
    ) {
      focusBadge = "Resource Allocation & Space Optimization";
      thoughtCorrectly = `You astutely targeted the severe library seat shortage during mid-sems and end-sems, which directly impacts academic productivity.`;
      betterWay = `Transform this into an automated thermal-sensor seat matrix connected to a lightweight Telegram/WhatsApp bot, allowing students to check live seat availability and reserve 15-minute grace windows without physical seat hoarding.`;
    } else if (
      lowerAns.includes("ai") || 
      lowerAns.includes("vision") || 
      lowerAns.includes("model") || 
      lowerAns.includes("sensor") || 
      lowerAns.includes("hardware") || 
      lowerAns.includes("iot") ||
      lowerAns.includes("robot")
    ) {
      focusBadge = "Deep Tech & Edge Robotics";
      thoughtCorrectly = `You showed impressive technical intuition by designing a multi-disciplinary solution blending software intelligence with real-world physical automation.`;
      betterWay = `To take this project to the ACM national showcase, incorporate edge-computing with quantized local LLMs/vision models, ensuring zero reliance on patchy campus Wi-Fi and sub-50ms response latency.`;
    } else {
      focusBadge = "Creative Tech Innovation";
      thoughtCorrectly = `You demonstrated genuine out-of-the-box thinking and an entrepreneurial mindset aimed at modernizing campus life at PEC Chandigarh.`;
      betterWay = `Focus on modular systems architecture: breaking down the problem into a rapid MVP (Minimum Viable Prototype) using React, WebSockets, and lightweight microcontrollers, making it pitch-ready for ACM hackathon judges.`;
    }

    return {
      questionTitle: "Scenario 2: Innovation & Automation Strategy",
      questionText,
      userAnswer: ans || "Creative campus innovation concept",
      focusBadge,
      thoughtCorrectly,
      betterWay
    };
  }
}

export function calculatePersona({ name, branch, answer1, answer2, scenario1, scenario2 }) {
  const text1 = (answer1 || "").toLowerCase();
  const text2 = (answer2 || "").toLowerCase();
  const combined = text1 + " " + text2;

  // 1. Keyword Vectors for Scoring
  const cpKeywords = [
    "o(1)", "logic", "algorithm", "binary", "shortcut", "optimal", "fast", "brute force", 
    "math", "physics", "calculate", "speed", "path", "efficient", "tree", "matrix", "codeforces",
    "icpc", "dp", "greedy", "graph", "analysis", "time complexity", "time", "quick", "window"
  ];

  const aiKeywords = [
    "ai", "robot", "ml", "neural", "smart", "sensor", "detect", "vision", "camera", 
    "automated", "machine learning", "scan", "quality", "analyze", "gpt", "model", "predict",
    "autonomous", "taste", "paneer", "food", "recognize", "bot", "algorithm"
  ];

  const devKeywords = [
    "build", "hack", "app", "hardware", "iot", "rig", "tool", "lever", "door", "lock",
    "fullstack", "script", "prototype", "system", "design", "mechanic", "diy", "wire", 
    "device", "project", "web", "react", "api", "mobile", "fix", "kick"
  ];

  // Count matches
  let cpScore = 38 + Math.floor(Math.random() * 14);
  let aiScore = 38 + Math.floor(Math.random() * 14);
  let devScore = 38 + Math.floor(Math.random() * 14);

  cpKeywords.forEach(k => { if (combined.includes(k)) cpScore += 12; });
  aiKeywords.forEach(k => { if (combined.includes(k)) aiScore += 12; });
  devKeywords.forEach(k => { if (combined.includes(k)) devScore += 12; });

  // Add branch weights
  const bLower = (branch || "").toLowerCase();
  if (bLower.includes("cse") || bLower.includes("computer")) {
    cpScore += 8; devScore += 8;
  } else if (bLower.includes("ai") || bLower.includes("data")) {
    aiScore += 12;
  } else if (bLower.includes("ece") || bLower.includes("ee") || bLower.includes("electric") || bLower.includes("mech")) {
    devScore += 12;
  }

  // Cap scores between 65 and 99
  cpScore = Math.min(99, Math.max(65, cpScore));
  aiScore = Math.min(99, Math.max(65, aiScore));
  devScore = Math.min(99, Math.max(65, devScore));

  const hostelSurvival = Math.min(99, Math.max(72, Math.floor((cpScore + devScore) / 2) + Math.floor(Math.random() * 8)));
  const chaosIq = Math.min(99, Math.max(70, Math.floor((aiScore + cpScore) / 2) + Math.floor(Math.random() * 8)));

  // 2. Determine Primary Wing & Title
  let recommendedWing = "ACM-Dev";
  let personaTitle = "The Hackathon Builder";
  let wingDescription = "You are a pragmatic problem solver! You like building physical or digital tools that immediately solve real campus pains.";

  if (cpScore >= aiScore && cpScore >= devScore) {
    recommendedWing = "ACM-CP";
    personaTitle = "The Future CP Mastermind";
    wingDescription = "Your mind instantly calculates optimal time complexity! You find shortcuts, analyze constraints, and solve hostel emergencies in O(1) speed.";
  } else if (aiScore >= cpScore && aiScore >= devScore) {
    recommendedWing = "ACM-AI";
    personaTitle = "The AI Pioneer";
    wingDescription = "You think big and envision automated futuristic solutions! Whether it's mess food quality neural scanners or smart hostel bots, AI is your playground.";
  } else {
    recommendedWing = "ACM-Dev";
    personaTitle = "The Hackathon Builder";
    wingDescription = "You turn chaotic ideas into working prototypes! From rigging door locks to building full-stack apps, you are born to build and ship.";
  }

  // Fun Unconventional Title overrides based on distinct response patterns
  if (combined.includes("window") || combined.includes("jump") || combined.includes("balcony")) {
    personaTitle = "The 75% Attendance Ninja";
  } else if (combined.includes("paneer") || combined.includes("mess") || combined.includes("roti") || combined.includes("food")) {
    if (aiScore > devScore) personaTitle = "The Mess Food Alchemist";
  } else if (combined.includes("kick") || combined.includes("break") || combined.includes("lockpick") || combined.includes("hairpin")) {
    personaTitle = "The Hostel Hardware Hacker";
  } else if (combined.includes("ctu") || combined.includes("traffic") || combined.includes("auto")) {
    personaTitle = "The Chandigarh Transit Tactician";
  }

  // 3. AI Generated Commentary Quotes
  const lockComments = [
    `Escaping a locked room in under 10 mins using "${answer1 || 'sheer willpower'}" shows top-tier PEC survival instinct!`,
    `Your move of "${answer1 || 'pure chaos'}" would leave even the hostel warden impressed!`,
    `Calculating the 75% attendance trajectory while handling "${answer1 || 'a crisis'}" is absolute peak engineering behavior!`
  ];

  const robotComments = [
    `Your robot idea to "${answer2 || 'automate hostel life'}" deserves an immediate seed funding grant from ACM!`,
    `A robot that can "${answer2 || 'fix mess food'}" would instantly win the PEC ACM Innovation Trophy!`,
    `Deploying automation for "${answer2 || 'hostel survival'}" proves you were built for PEC's tech ecosystem!`
  ];

  const randomLockComment = lockComments[Math.floor(Math.random() * lockComments.length)];
  const randomRobotComment = robotComments[Math.floor(Math.random() * robotComments.length)];

  // 4. Generate Question-by-Question Constructive AI Feedback
  const feedbackQ1 = generateQuestionFeedback(scenario1, answer1, 1, recommendedWing);
  const feedbackQ2 = generateQuestionFeedback(scenario2, answer2, 2, recommendedWing);

  return {
    name: name || "Fresher Hacker",
    branch: branch || "PEC Chandigarh",
    personaTitle,
    recommendedWing,
    wingDescription,
    cpScore,
    aiScore,
    devScore,
    hostelSurvival,
    chaosIq,
    lockComment: randomLockComment,
    robotComment: randomRobotComment,
    feedbackQ1,
    feedbackQ2,
    superpower: `Can solve jammed door locks in O(1) time and design autonomous mess food quality bots!`,
    timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  };
}
