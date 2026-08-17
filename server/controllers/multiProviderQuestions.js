import supabase from "../config/supabase.js";
import { askArrayWithFallback } from "../utils/aiProviders.js";

function buildTopicPrompt(domain, difficulty, duration, count) {
  return `You are an expert interviewer covering EVERY professional field, not
just software engineering. The domain given below may be a Computer Science
subject (DSA, Web Dev, DBMS, OS, OOP, CN) OR a subject from any other branch
entirely — the candidate may have typed in something like Thermodynamics,
Circuit Design, Structural Analysis, Aerodynamics, Mechatronics, or
Biotechnology as a custom subject.

Generate exactly ${count} highly professional, relevant interview questions
for the domain: "${domain}".
Target difficulty: "${difficulty}". Estimated interview window: ${duration || "15 Min"}.

CRITICAL RULE: Map each question to a real problem/topic commonly evaluated
by organizations that ACTUALLY hire for THIS SPECIFIC domain. Use
Google/Microsoft/Amazon/Meta/Netflix/Apple ONLY if the domain is genuinely
software/CS-related. For other fields, pick real organizations that fit —
for example ISRO, Boeing, Tesla, or GE for aerospace/mechanical subjects;
Siemens or ABB for electrical/mechatronics; L&T or DLF for civil; Pfizer or
Moderna for biotech. Do NOT default to big tech company tags for non-software
domains. Assign the most fitting real organization as the company tag, with
a 1-sentence real-world context explaining why it fits.
Do NOT include any emojis anywhere in the questions or responses.

Reply with ONLY a valid JSON array, no markdown fences, no commentary:
[{"question": "...", "companyTag": "...", "realWorldContext": "..."}]`;
}

function buildResumeQuestionPrompt(resumeText, role, difficulty, count) {
  return `You are an expert interviewer specializing in the candidate's own field. Analyze the candidate's resume below and generate exactly ${count} relevant, short interview questions matching role: "${role || "the role indicated by their resume"}" and difficulty: "${difficulty || "Intermediate"}".

CRITICAL RULE: Base every question on the candidate's ACTUAL domain as shown
in their resume — this may be Computer Science, Mechanical Engineering,
Aerospace, Electrical, Civil, Biotechnology, Business, or any other field.
Do NOT default to generic software/DSA questions unless their resume is
genuinely software-focused. Map each question to a real problem or concept
commonly evaluated by leading organizations in THAT SPECIFIC field (for
example: ISRO, Boeing, Tesla, or GE for aerospace/mechanical; Pfizer or
Moderna for biotech; Google or Amazon only if the resume is actually
software-focused). Assign the most fitting real organization as the company
tag, with a 1-sentence real-world context explaining why it fits.
Do NOT include any emojis anywhere in the questions or responses.

Resume Context:
${resumeText}

Reply with ONLY a valid JSON array, no markdown fences, no commentary:
[{"question": "...", "companyTag": "...", "realWorldContext": "..."}]`;
}

function splitCount(totalCount) {
  const base = Math.floor(totalCount / 2);
  let remainder = totalCount - base * 2;
  return [base, base].map((c) => {
    if (remainder > 0) { remainder -= 1; return c + 1; }
    return c;
  });
}

async function getQuestionsFromProvider(preferredProvider, prompt, count) {
  if (count <= 0) return { questions: [], providerUsed: null };
  const { result, providerUsed } = await askArrayWithFallback(preferredProvider, prompt);
  return { questions: result, providerUsed };
}

async function runMultiProviderGeneration(promptFor, totalCount) {
  const [groqCount, mistralCount] = splitCount(totalCount);

  const [groqResult, mistralResult] = await Promise.allSettled([
    getQuestionsFromProvider("groq", promptFor(groqCount), groqCount),
    getQuestionsFromProvider("mistral", promptFor(mistralCount), mistralCount)
  ]);

  let combinedQuestions = [];
  for (const settled of [groqResult, mistralResult]) {
    if (settled.status === "fulfilled" && settled.value.questions?.length) {
      combinedQuestions = combinedQuestions.concat(
        settled.value.questions.map((q) => ({ ...q, source: settled.value.providerUsed }))
      );
    } else if (settled.status === "rejected") {
      console.error("A provider slice failed completely:", settled.reason);
    }
  }

  for (let i = combinedQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [combinedQuestions[i], combinedQuestions[j]] = [combinedQuestions[j], combinedQuestions[i]];
  }

  return combinedQuestions;
}

export const generateTopicQuestionsMultiProvider = async (req, res) => {
  try {
    const { domain, difficulty, duration, questionCount } = req.body;

    if (!domain || !difficulty) {
      return res.status(400).json({ success: false, message: "Missing required selection metrics: domain and difficulty." });
    }

    const totalCount = Number.isInteger(questionCount) && questionCount > 0 ? questionCount : 10;

    const combinedQuestions = await runMultiProviderGeneration(
      (count) => buildTopicPrompt(domain, difficulty, duration, count),
      totalCount
    );

    if (combinedQuestions.length === 0) {
      return res.status(502).json({ success: false, message: "All question providers failed. Check API keys / quotas." });
    }

    await supabase.from("questions").delete().eq("topic", domain).is("resume_id", null);

    const rows = combinedQuestions.map((q) => ({
      topic: domain,
      question: q.question,
      company_tag: q.companyTag,
      real_world_context: q.realWorldContext,
      source: q.source,
      user_answer: null
    }));

    const { error: insertError } = await supabase.from("questions").insert(rows);
    if (insertError) throw new Error(`Supabase DB Write Error: ${insertError.message}`);

    return res.status(200).json({ success: true, questions: rows });
  } catch (err) {
    console.error("Multi-provider topic generation exception:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const generateQuestionsMultiProvider = async (req, res) => {
  try {
    const { resumeId, questionCount } = req.body;
    if (!resumeId) return res.status(400).json({ success: false, message: "Missing parameter: resumeId is required." });

    const parsedResumeId = parseInt(resumeId, 10);
    if (isNaN(parsedResumeId)) {
      return res.status(400).json({ success: false, message: "Invalid resumeId structure provided." });
    }

    const { data: resumeData, error } = await supabase.from("resumes").select("*").eq("id", parsedResumeId).single();
    if (error || !resumeData) return res.status(404).json({ success: false, message: "Resume record not found." });

    const resumeText = resumeData.parsed_text;
    const totalCount = Number.isInteger(questionCount) && questionCount > 0 ? questionCount : 10;

    const combinedQuestions = await runMultiProviderGeneration(
      (count) => buildResumeQuestionPrompt(resumeText, resumeData.role, resumeData.difficulty, count),
      totalCount
    );

    if (combinedQuestions.length === 0) {
      return res.status(502).json({ success: false, message: "All question providers failed. Check API keys / quotas." });
    }

    const rows = combinedQuestions.map((q) => ({
      resume_id: parsedResumeId,
      question: q.question,
      company_tag: q.companyTag,
      real_world_context: q.realWorldContext,
      source: q.source
    }));

    await supabase.from("questions").delete().eq("resume_id", parsedResumeId);

    const { error: insertError } = await supabase.from("questions").insert(rows);
    if (insertError) throw new Error(`Supabase DB Write Error: ${insertError.message}`);

    return res.status(200).json({ success: true, questions: rows });
  } catch (err) {
    console.error("Resume multi-provider generation exception:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
