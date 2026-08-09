import express from "express";
import { 
  generateQuestions, 
  generateTopicQuestions, 
  evaluateInterview 
} from "../controllers/interviewController.js";
import { getUserAnalyticsData } from "../controllers/analyticsController.js";
import {
  generateTopicQuestionsMultiProvider,
  generateQuestionsMultiProvider
} from "../controllers/multiProviderQuestions.js";

const router = express.Router();

router.get("/global-analytics", getUserAnalyticsData);

router.post("/generate", generateQuestions);
router.post("/generate-topic", generateTopicQuestions);
router.post("/generate-topic-multi", generateTopicQuestionsMultiProvider);
router.post("/generate-multi", generateQuestionsMultiProvider);
router.post("/evaluate", evaluateInterview);

export default router;
