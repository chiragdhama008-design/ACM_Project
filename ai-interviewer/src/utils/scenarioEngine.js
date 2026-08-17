// PEC Chandigarh Fresher Quiz Scenarios for PEC ACM Student Chapter
// Fun, Relatable & 100% PEC Chandigarh Specific (Clean, No Emojis)

export const SCENARIO_POOL_Q1 = [
  "It's 7:56 AM, your 8 AM lecture is in L-Block / Workshop, and you just woke up in Kurukshetra/Himalaya hostel. How do you beat the 75% attendance rule and reach in 4 minutes flat?",

  "The Nescafe & Student Centre lines during the 15-minute break are 50 students deep. How do you grab your cold coffee and patties before the next prof locks the door?",

  "Your CTU bus gets stuck in Sector 12 traffic and your friend is holding your seat in the Lecture Hall. What's your big-brain rescue plan to save your attendance?",

  "You have an urgent assignment printout due in 10 minutes at the PEC Market stationary shop, but 40 other freshers have the exact same idea. How do you get yours first without chaos?",

  "Someone in your hostel wing keeps borrowing your Maggi and chargers without asking. How do you track them down and protect your midnight snacks with a clever trick?",

  "It's PECFest night, your phone battery is at 3%, and your squad is scattered between Main Ground, Audi, and Nescafe. How do you reunite the squad without getting lost?"
];

export const SCENARIO_POOL_Q2 = [
  "The hostel mess serves Lauki & watery dal for the 4th day in a row. You snap and decide to build a smart student app or tool. What does your invention do for PEC students?",

  "You find a mysterious USB drive on the 2nd floor of PEC Central Library labeled 'TOP SECRET PEC QUIZ LEAKS'. What's your move?",

  "You're given a magical permit to build ANY one tech project or automated gadget for PEC campus. What do you build and where does it go?",

  "The AC in your CC (Computer Centre) lab is either freezing Siberia or off, and the WiFi is acting up. What smart hack or system would you create to fix lab life?",

  "You and your friends want to book the best seats with charging ports in the Central Library during mid-sem week. What's your strategy or tool to claim the spots?",

  "A fellow fresher asks you: 'Bhai, which tech domain should I join in PEC ACM?' You have 30 seconds to hype up your favorite wing. What's your pitch?"
];

export function stripEmojis(str) {
  if (!str) return "";
  return str
    .replace(/[\u{1F300}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F191}-\u{1F251}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function generateRandomScenarios() {
  const rawQ1 = SCENARIO_POOL_Q1[Math.floor(Math.random() * SCENARIO_POOL_Q1.length)];
  const rawQ2 = SCENARIO_POOL_Q2[Math.floor(Math.random() * SCENARIO_POOL_Q2.length)];
  return { 
    q1: stripEmojis(rawQ1), 
    q2: stripEmojis(rawQ2) 
  };
}
