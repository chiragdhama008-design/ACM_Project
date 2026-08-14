import pdfParse from "pdf-parse-fork";
import supabase from "../config/supabase.js";
import { askObjectWithFallback } from "../utils/aiProviders.js";

const SKILL_BANK = {
  software: ["javascript", "react", "node", "express", "mongodb", "python", "java", "cpp", "c++", "sql", "html", "css", "typescript", "aws", "docker", "git"],
  mechanical: ["solidworks", "autocad", "catia", "ansys", "cad", "cam", "thermodynamics", "fluid mechanics", "hvac", "cnc", "manufacturing", "gd&t"],
  aerospace: ["aerodynamics", "propulsion", "avionics", "orbital mechanics", "matlab", "cfd", "flight dynamics", "structural analysis"],
  electrical: ["circuit design", "pcb", "vlsi", "embedded systems", "microcontroller", "power systems", "control systems", "plc"],
  civil: ["structural engineering", "autocad", "revit", "surveying", "geotechnical", "construction management", "staad"],
  biotech: ["molecular biology", "genomics", "pcr", "bioinformatics", "crispr", "clinical trials", "lab techniques"],
  business: ["financial modeling", "excel", "powerpoint", "market research", "stakeholder management", "project management", "six sigma"]
};

const ROLE_BY_FIELD = {
  software: "Software Engineer",
  mechanical: "Mechanical Engineer",
  aerospace: "Aerospace Engineer",
  electrical: "Electrical Engineer",
  civil: "Civil Engineer",
  biotech: "Biotechnology Specialist",
  business: "Business Analyst"
};

function detectFieldFromText(textLower) {
  let bestField = null;
  let bestCount = 0;
  let bestSkills = [];

  for (const [field, skills] of Object.entries(SKILL_BANK)) {
    const found = skills.filter((skill) => textLower.includes(skill));
    if (found.length > bestCount) {
      bestCount = found.length;
      bestField = field;
      bestSkills = found;
    }
  }

  if (bestCount === 0) return null;
  return { field: bestField, skills: bestSkills };
}

export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const pdfData = await pdfParse(req.file.buffer);
    const resumeText = pdfData.text || "";

    if (!resumeText.trim()) {
      return res.status(400).json({
        success: false,
        message: "Could not extract any readable text from this PDF.",
      });
    }

    console.log("========== RESUME TEXT ==========");
    console.log(resumeText.substring(0, 500));
    console.log("=================================");

    let parsedAnalysis = {
      skills: [],
      role: "Professional",
      difficulty: "Intermediate",
    };
    let providerUsed = null;

    try {
      const prompt = `
You are an expert resume analyst covering EVERY professional field, not just
software engineering — the candidate could be in Computer Science,
Mechanical, Aerospace, Electrical, Civil, Biotechnology, Business, or any
other discipline entirely.

Analyze this candidate's resume and identify their ACTUAL field based on
what's really in it. Do not default to a software/tech role unless their
resume genuinely shows software engineering experience or education.

Resume:
${resumeText}

Return:
- skills: up to 8 skills that are ACTUALLY relevant to their field as shown
  in the resume (e.g. "SolidWorks" and "Thermodynamics" for a mechanical
  engineer, not generic software skills).
- role: their most fitting job title/role based on their actual background
  (e.g. "Mechanical Engineer", "Aerospace Engineer", "Data Scientist",
  "Civil Engineer", "Business Analyst" — whatever truly fits).
- difficulty: Beginner, Intermediate, or Advanced, based on their apparent
  years of experience / seniority.

Reply with ONLY valid JSON, no markdown fences:
{"skills": ["...", "..."], "role": "...", "difficulty": "..."}`;

      const { result, providerUsed: usedProvider } = await askObjectWithFallback("groq", prompt);
      parsedAnalysis = result;
      providerUsed = usedProvider;
      console.log(`🚀 Successfully parsed with ${usedProvider}`);
    } catch (aiErr) {
      console.warn(
        "⚠️ All AI providers unavailable. Using regex fallback parser.",
        aiErr.message
      );

      const textLower = resumeText.toLowerCase();
      const detected = detectFieldFromText(textLower);

      if (detected) {
        parsedAnalysis.skills = detected.skills
          .map((skill) => skill.replace(/\b\w/g, (c) => c.toUpperCase()))
          .slice(0, 8);
        parsedAnalysis.role = ROLE_BY_FIELD[detected.field];
      } else {
        parsedAnalysis.role = "Professional";
      }

      if (textLower.includes("senior") || textLower.includes("lead") || textLower.includes("principal")) {
        parsedAnalysis.difficulty = "Advanced";
      } else if (textLower.includes("intern") || textLower.includes("entry level") || textLower.includes("junior")) {
        parsedAnalysis.difficulty = "Beginner";
      } else {
        parsedAnalysis.difficulty = "Intermediate";
      }
    }

    const finalSkills = parsedAnalysis.skills?.length > 0
      ? parsedAnalysis.skills
      : [parsedAnalysis.role || "General Professional Skills"];

    const { data: newResume, error } = await supabase
      .from("resumes")
      .insert([
        {
          parsed_text: resumeText,
          skills: finalSkills,
          role: parsedAnalysis.role,
          difficulty: parsedAnalysis.difficulty,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Supabase Insert Error: ${error.message}`);
    }

    return res.status(200).json({
      success: true,
      id: newResume.id,
      message: "Resume processed successfully",
      resumeText: newResume.parsed_text,
      skills: finalSkills,
      role: newResume.role,
      difficulty: newResume.difficulty,
      providerUsed
    });
  } catch (err) {
    console.error("Resume Controller Failure:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Failed to process resume.",
    });
  }
};
