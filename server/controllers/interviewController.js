import supabase from "../config/supabase.js";
import { askArrayWithFallback, askObjectWithFallback } from "../utils/aiProviders.js";

function buildQuestionPrompt(context) {
  return `You are an expert interviewer covering EVERY professional field, not
just software engineering. ${context}

CRITICAL RULE: Map each question to a real problem/topic commonly evaluated
by organizations that ACTUALLY hire for THIS SPECIFIC domain. Use
Google/Microsoft/Amazon/Meta/Netflix/Apple ONLY if the domain/role is
genuinely software/CS-related. For other fields (mechanical, aerospace,
electrical, civil, biotech, business, etc), pick real organizations that
actually fit that field instead — do NOT default to big tech company tags
for non-software domains. Assign the precise, most fitting company tag and
write a 1-sentence real-world interview execution context explaining why it
fits.

Reply with ONLY a valid JSON array, no markdown fences, no commentary:
[{"question": "...", "companyTag": "...", "realWorldContext": "..."}]`;
}

export const generateQuestions = async (req, res) => {
  try {
    const { resumeId } = req.body;
    if (!resumeId) return res.status(400).json({ success: false, message: "Missing parameter: resumeId is required." });

    const parsedResumeId = parseInt(resumeId, 10);
    if (isNaN(parsedResumeId)) {
      return res.status(400).json({ success: false, message: "Invalid resumeId structure provided." });
    }

    const { data: resumeData, error } = await supabase.from("resumes").select("*").eq("id", parsedResumeId).single();
    if (error || !resumeData) return res.status(404).json({ success: false, message: "Resume record not found." });

    const resumeText = resumeData.parsed_text;
    const prompt = buildQuestionPrompt(
      `Analyze the candidate's resume below and generate exactly 10 relevant, short technical interview questions matching role: ${resumeData.role || "Software Engineer"} and difficulty: ${resumeData.difficulty || "Intermediate"}.

Context:
${resumeText}`
    );

    const { result: questionsData, providerUsed } = await askArrayWithFallback("groq", prompt);

    const rows = questionsData.map((q) => ({
      resume_id: parsedResumeId,
      question: q.question,
      company_tag: q.companyTag,
      real_world_context: q.realWorldContext,
      source: providerUsed
    }));

    await supabase.from("questions").delete().eq("resume_id", parsedResumeId);

    const { error: insertError } = await supabase.from("questions").insert(rows);
    if (insertError) throw new Error(`Supabase DB Write Error: ${insertError.message}`);

    return res.status(200).json({ success: true, questions: rows, providerUsed });
  } catch (err) {
    console.error("Exception (all providers failed):", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const generateTopicQuestions = async (req, res) => {
  try {
    const { domain, difficulty, duration, questionCount } = req.body;

    if (!domain || !difficulty) {
      return res.status(400).json({ success: false, message: "Missing required selection metrics: domain and difficulty." });
    }

    const totalCount = Number.isInteger(questionCount) && questionCount > 0 ? questionCount : 10;

    const prompt = buildQuestionPrompt(
      `Generate exactly ${totalCount} highly professional, relevant technical interview questions for the following domain: "${domain}".
Target difficulty level configuration: "${difficulty}". Estimated interview execution window: ${duration || "15 Min"}.`
    );

    const { result: questionsData, providerUsed } = await askArrayWithFallback("groq", prompt);

    await supabase.from("questions").delete().eq("topic", domain).is("resume_id", null);

    const rows = questionsData.map((q) => ({
      topic: domain,
      question: q.question,
      company_tag: q.companyTag,
      real_world_context: q.realWorldContext,
      source: providerUsed,
      user_answer: null
    }));

    const { error: insertError } = await supabase.from("questions").insert(rows);
    if (insertError) throw new Error(`Supabase DB Write Error: ${insertError.message}`);

    return res.status(200).json({ success: true, questions: rows, providerUsed });
  } catch (err) {
    console.error("Topic generation exception (all providers failed):", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const evaluateInterview = async (req, res) => {
  try {
    const { resumeId, topic, interviewAnswers } = req.body;

    if (!interviewAnswers || !Array.isArray(interviewAnswers)) {
      return res.status(400).json({ success: false, message: "Missing required properties: interviewAnswers array." });
    }

    // 🔑 Identify the signed-in user (if any) from their Supabase access
    // token, the same way analyticsController.js does, so the saved
    // session can be attributed to them. Guests simply get user_id: null.
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    let userId = null;
    if (token) {
      const { data: userData, error: userError } = await supabase.auth.getUser(token);
      if (userError) {
        console.warn("evaluateInterview: invalid/expired token, saving as guest:", userError.message);
      } else if (userData?.user) {
        userId = userData.user.id;
      }
    }

    // 🔑 Nothing to evaluate — don't hand an empty transcript to the AI.
    // With no answers to reason about, it tends to still generate a
    // plausible-looking score/summary instead of admitting there's
    // nothing there. Short-circuit with an honest response and skip
    // saving a session for it entirely.
    if (interviewAnswers.length === 0) {
      return res.status(200).json({
        success: true,
        score: 0,
        summary: "No answers were submitted during this session, so there's nothing to evaluate.",
        strongPoints: [],
        improvements: [],
        providerUsed: null
      });
    }

    const parsedResumeId = resumeId ? parseInt(resumeId, 10) : null;

    for (const item of interviewAnswers) {
      const optimizedEmotionPayload = item.emotionBreakdown
        ? JSON.stringify(item.emotionBreakdown)
        : (item.emotionTrack || "Focused 😐");

      let query = supabase
        .from("questions")
        .update({
          user_answer: item.answerText,
          emotion_tag: optimizedEmotionPayload
        })
        .eq("question", item.questionText);

      if (parsedResumeId && !isNaN(parsedResumeId)) {
        query = query.eq("resume_id", parsedResumeId);
      } else if (topic) {
        query = query.eq("topic", topic).is("resume_id", null);
      }

      await query;
    }

    let transcriptBlock = "";
    interviewAnswers.forEach((item, index) => {
      transcriptBlock += `\nQuestion ${index + 1}: ${item.questionText}\nCandidate Answer: ${item.answerText || "[No Answer Supplied]"}\n`;
    });

    const evaluationPrompt = `
You are an expert engineering manager evaluating a technical interview candidate transcript.
Analyze the performance logs provided below:

${transcriptBlock}

Provide your evaluation strictly adhering to this JSON schema. Reply with
ONLY valid JSON, no markdown fences, no commentary:
{
  "score": integer from 0 to 100,
  "summary": "A brief 2-3 sentence introductory overview performance statement",
  "strongPoints": ["array of strings highlighting where the candidate showed great technical precision"],
  "improvements": ["array of strings showing where they can deepen their knowledge or fix conceptual errors"]
}`;

    const { result: feedbackResult, providerUsed } = await askObjectWithFallback("groq", evaluationPrompt);

    // 🔑 This is now the ONLY place an interview_sessions row gets
    // written — the frontend no longer inserts its own copy. That's what
    // was causing every completed interview to be saved twice.
    const sessionData = {
      overall_score: feedbackResult.score,
      feedback: JSON.stringify(feedbackResult),
      user_id: userId
    };

    if (parsedResumeId && !isNaN(parsedResumeId)) sessionData.resume_id = parsedResumeId;
    if (topic) sessionData.topic = topic;

    const { error: sessionErr } = await supabase
      .from("interview_sessions")
      .insert([sessionData]);

    if (sessionErr) throw new Error(`Session Insert Error: ${sessionErr.message}`);

    return res.status(200).json({
      success: true,
      score: feedbackResult.score,
      summary: feedbackResult.summary,
      strongPoints: feedbackResult.strongPoints,
      improvements: feedbackResult.improvements,
      providerUsed
    });

  } catch (err) {
    console.error("Evaluation pipeline crashed (all providers failed):", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
