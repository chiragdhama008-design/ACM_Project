// AI Dynamic Scenario Generator Engine for PEC Chandigarh (Day Scholars + Hostellers)

const SCENARIO_POOL_Q1 = [
  // Attendance & Commute Emergencies (Day Scholars + Hostellers)
  "You are stuck in CTU bus traffic at Tribune Chowk with 7 minutes left before a strict 75% attendance lecture. What's your move?",
  "You have 10 minutes before a 75% attendance lecture and your hostel door lock / house main gate is jammed. What's your move?",
  "Your scooter/bike runs out of petrol at Sector 11 lightpoint 5 minutes before an 8 AM lab exam. How do you reach PEC on time?",
  "You accidentally walked into the wrong 4th-year lecture hall and the professor locked the door behind you. How do you escape unnoticed?",
  "You overslept and woke up at 7:55 AM for an 8:00 AM mandatory viva in L-Block. What is your 5-minute emergency strategy?"
];

const SCENARIO_POOL_Q2 = [
  // Campus Life & Robot Automation Ideas (Day Scholars + Hostellers)
  "If you could build a robot or AI tool to solve ONE annoying problem in PEC (like CTU bus rush, mess food, library seat shortage, or 8 AM classes), what would it do?",
  "If you could hack together a gadget to automate ONE campus task (like proxy attendance, lab file writing, or canteen order skipping), how would it work?",
  "If you built an AI robot for PEC campus survival, what secret feature would you install to save students during exam week?",
  "If you could invent a smart device to improve PEC hostel life or day scholar commuting, what crazy problem would it solve?",
  "You have 24 hours at a PEC hackathon to build a robot that fixes campus life. What problem are you targeting and how does it work?"
];

export function generateRandomScenarios() {
  const q1 = SCENARIO_POOL_Q1[Math.floor(Math.random() * SCENARIO_POOL_Q1.length)];
  const q2 = SCENARIO_POOL_Q2[Math.floor(Math.random() * SCENARIO_POOL_Q2.length)];
  return { q1, q2 };
}
