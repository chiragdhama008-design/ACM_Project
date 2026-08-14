// Creative AI Persona Analysis Engine for PEC ACM Student Chapter

export function calculatePersona({ name, branch, answer1, answer2 }) {
  const text1 = (answer1 || "").toLowerCase();
  const text2 = (answer2 || "").toLowerCase();
  const combined = text1 + " " + text2;

  // 1. Keyword Vectors
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
  let cpScore = 35 + Math.floor(Math.random() * 15);
  let aiScore = 35 + Math.floor(Math.random() * 15);
  let devScore = 35 + Math.floor(Math.random() * 15);

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

  // Cap scores between 60 and 99
  cpScore = Math.min(99, Math.max(60, cpScore));
  aiScore = Math.min(99, Math.max(60, aiScore));
  devScore = Math.min(99, Math.max(60, devScore));

  const hostelSurvival = Math.min(99, Math.max(70, Math.floor((cpScore + devScore) / 2) + Math.floor(Math.random() * 10)));
  const chaosIq = Math.min(99, Math.max(65, Math.floor((aiScore + cpScore) / 2) + Math.floor(Math.random() * 10)));

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

  // Fun Unconventional Title overrides based on funny answers
  if (combined.includes("window") || combined.includes("jump") || combined.includes("balcony")) {
    personaTitle = "The 75% Attendance Ninja";
  } else if (combined.includes("paneer") || combined.includes("mess") || combined.includes("roti") || combined.includes("food")) {
    if (aiScore > devScore) personaTitle = "The Mess Food Alchemist";
  } else if (combined.includes("kick") || combined.includes("break") || combined.includes("lockpick")) {
    personaTitle = "The Hostel Hardware Hacker";
  }

  // 3. AI Generated Commentary Quotes
  const lockComments = [
    `Escaping a locked room in under 10 mins using "${answer1 || 'sheer willpower'}" shows top-tier PEC survival instinct!`,
    `Your move of "${answer1 || 'pure chaos'}" would leave even the hostel warden impressed!`,
    `Calculating the 75% attendance trajectory while locked in "${answer1 || 'a room'}" is absolute peak engineering behavior!`
  ];

  const robotComments = [
    `Your robot idea to "${answer2 || 'automate hostel life'}" deserves an immediate seed funding grant from ACM!`,
    `A robot that can "${answer2 || 'fix mess food'}" would instantly win the PEC ACM Innovation Trophy!`,
    `Deploying automation for "${answer2 || 'hostel survival'}" proves you were built for PEC's tech ecosystem!`
  ];

  const randomLockComment = lockComments[Math.floor(Math.random() * lockComments.length)];
  const randomRobotComment = robotComments[Math.floor(Math.random() * robotComments.length)];

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
    superpower: `Can solve jammed door locks in O(1) time and design autonomous mess food quality bots!`,
    timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  };
}
