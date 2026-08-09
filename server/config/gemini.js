import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || "AIzaSy_placeholder_key";
const ai = new GoogleGenAI({ apiKey });

export default ai;