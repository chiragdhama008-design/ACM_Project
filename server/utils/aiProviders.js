import ai from "../config/gemini.js";
import Groq from "groq-sdk";
import { Mistral } from "@mistralai/mistralai";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "gsk_placeholder_key" });
const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY || "mistral_placeholder_key" });


function stripFences(rawText) {
  return rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
}

function parseObjectResponse(rawText) {
  return JSON.parse(stripFences(rawText));
}

function parseArrayResponse(rawText) {
  const parsed = JSON.parse(stripFences(rawText));
  if (Array.isArray(parsed)) return parsed;
  const firstArrayValue = Object.values(parsed).find((v) => Array.isArray(v));
  return firstArrayValue || [];
}

// ---- Object-returning calls (check-satisfactory / cross-question / resume analysis) ----

async function askGeminiObject(prompt) {
  const response = await ai.models.generateContent({
    // "gemini-flash-latest" is an auto-updating alias that always points to
    // Google's current stable Flash model, avoiding breakage when Google
    // deprecates a specific dated version (e.g. "gemini-2.5-flash").
    model: "gemini-flash-latest",
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  return parseObjectResponse(response.text);
}

async function askGroqObject(prompt) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  });
  return parseObjectResponse(completion.choices[0].message.content);
}

async function askMistralObject(prompt) {
  const chatResponse = await mistral.chat.complete({
    model: "mistral-small-latest",
    messages: [{ role: "user", content: prompt }],
    responseFormat: { type: "json_object" }
  });
  return parseObjectResponse(chatResponse.choices[0].message.content);
}

// ---- Array-returning calls (question generation) ----

async function askGeminiArray(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-flash-latest",
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  return parseArrayResponse(response.text);
}

async function askGroqArray(prompt) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  });
  return parseArrayResponse(completion.choices[0].message.content);
}

async function askMistralArray(prompt) {
  const chatResponse = await mistral.chat.complete({
    model: "mistral-small-latest",
    messages: [{ role: "user", content: prompt }],
    responseFormat: { type: "json_object" }
  });
  return parseArrayResponse(chatResponse.choices[0].message.content);
}

const OBJECT_PROVIDER_FNS = { gemini: askGeminiObject, groq: askGroqObject, mistral: askMistralObject };
const ARRAY_PROVIDER_FNS = { gemini: askGeminiArray, groq: askGroqArray, mistral: askMistralArray };
const FALLBACK_ORDER = ["gemini", "groq", "mistral"];

async function runWithFallback(providerFns, preferredProvider, prompt) {
  const order = [
    preferredProvider,
    ...FALLBACK_ORDER.filter((p) => p !== preferredProvider)
  ].filter((p) => providerFns[p]);

  let lastError = null;
  for (const provider of order) {
    try {
      const result = await providerFns[provider](prompt);
      return { result, providerUsed: provider };
    } catch (err) {
      console.error(`[AI fallback] Provider "${provider}" failed, trying next:`, err.message || err);
      lastError = err;
    }
  }
  throw lastError || new Error("All AI providers failed");
}

export async function askObjectWithFallback(preferredProvider, prompt) {
  return runWithFallback(OBJECT_PROVIDER_FNS, preferredProvider, prompt);
}

export async function askArrayWithFallback(preferredProvider, prompt) {
  return runWithFallback(ARRAY_PROVIDER_FNS, preferredProvider, prompt);
}
