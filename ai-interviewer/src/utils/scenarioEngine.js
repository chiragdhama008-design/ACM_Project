// AI Dynamic Scenario Generator Engine for PEC ACM Student Chapter
// Real-World Practical Scenarios for Freshers (Testing CP, AI/ML, and Dev Intuition)

export const SCENARIO_POOL_Q1 = [
  // Real-Life Algorithmic Optimization, Queuing & Logistics (Testing CP & Dev Logic)
  "Scenario 1 (Campus Logistics & Queue Optimization): During PEC's annual college fest or a 15-minute lecture break, 400+ students rush to the canteen and printing station simultaneously, causing massive bottlenecks. In your own words (no coding needed!), how would you break down and solve this real-life problem? Describe your step-by-step logic, priority system, or how you would eliminate waiting delays.",
  
  "Scenario 1 (Campus Transit & Route Efficiency): Every morning at 8:45 AM, hundreds of students are trying to reach lecture halls across campus (L-Block, Workshop, Library) with limited electric shuttles/autos. Without writing code, how would you design a smart routing and prioritization strategy to minimize average wait times and get maximum students to class on time?",
  
  "Scenario 1 (Hackathon Resource & Team Allocation): At a 500-student campus hackathon, participants need to quickly form teams with complementary skills, book lab equipment, and schedule mentor slots without timetable clashes. How would you design a fair, step-by-step logic or automated workflow to solve this matching challenge?",
  
  "Scenario 1 (Campus Lost & Found Recovery Workflow): Dozens of items (IDs, earphones, lab records, calculators) get misplaced across PEC campus weekly with no central tracking. How would you design an end-to-end practical solution or smart verification workflow to quickly match lost items to their owners while preventing false claims?"
];

export const SCENARIO_POOL_Q2 = [
  // Real-Life Intelligent Automation, Systems & Data Intelligence (Testing AI/ML & Dev Architecture)
  "Scenario 2 (Smart Study & Exam Intelligence Tool): During mid-semester exams, students struggle with 100s of unstructured lecture slides, messy handwritten notes, and past exam papers. If you were to conceptualize a smart digital tool or intelligent assistant for campus students, how would it work? What intelligent features, data processing, or practical mechanisms would you include?",
  
  "Scenario 2 (Live Space & Resource Availability Monitor): Students often walk across campus to the central library or computer labs only to find zero vacant seats or occupied charging ports. How would you architect a smart automated monitoring solution (using sensors, mobile apps, or smart cameras) to display real-time availability without invading student privacy?",
  
  "Scenario 2 (Mess Food Freshness & Quality Assurance System): Hostel students frequently face inconsistent food quality, shortage of popular items, and food wastage. If you had to conceptualize an automated system or smart tracking tool to monitor daily food preparation, freshness, and student feedback transparently, how would you design it?",
  
  "Scenario 2 (Automated Campus Energy & Facility Manager): Many campus labs, project rooms, and lecture halls leave lights, ACs, and computer workstations powered on overnight. How would you build an automated, intelligent campus energy management system to detect occupancy and optimize power consumption without disrupting active experiments?"
];

export function generateRandomScenarios() {
  const q1 = SCENARIO_POOL_Q1[Math.floor(Math.random() * SCENARIO_POOL_Q1.length)];
  const q2 = SCENARIO_POOL_Q2[Math.floor(Math.random() * SCENARIO_POOL_Q2.length)];
  return { q1, q2 };
}

