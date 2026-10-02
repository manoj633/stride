import { GoogleGenAI } from "@google/genai";
import AiLog from "../models/AiLog.js";
import { sanitizeEmailContent } from "../utils/sanitizer.js";

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || "gemini-3.5-flash-lite";

/**
 * Execute AI prompt with pre-check, sanitization, telemetry, and rate-limit safety.
 */
export async function runSafeAiGeneration({
  userId = null,
  goalId = null,
  prompt,
  systemInstruction = "",
  model = DEFAULT_MODEL,
  responseMimeType = null,
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  const startTime = Date.now();
  const sanitizedPrompt = sanitizeEmailContent(prompt);
  const promptPreview = sanitizedPrompt.slice(0, 250);

  if (!apiKey) {
    await AiLog.create({
      userId,
      goalId,
      model,
      status: "fallback_simulated",
      httpStatusCode: 401,
      latencyMs: Date.now() - startTime,
      promptPreview,
      errorMessage: "GEMINI_API_KEY is not configured",
    });
    return {
      status: "fallback",
      data: null,
      message: "GEMINI_API_KEY is not configured.",
    };
  }

  // 1. Preemptive Quota Guard (Free tier typically allows 250-1000 RPD)
  const quotaAvailable = await AiLog.hasDailyQuotaRemaining(500);
  if (!quotaAvailable) {
    await AiLog.create({
      userId,
      goalId,
      model,
      status: "fallback_simulated",
      httpStatusCode: 429,
      latencyMs: Date.now() - startTime,
      promptPreview,
      errorMessage: "Preemptive skip: Free-tier daily limit reached.",
    });
    return { status: "fallback", data: null, message: "Daily quota exhausted." };
  }

  // 2. Candidate models: Primary model followed by fallback models
  const candidateModels = [model, FALLBACK_MODEL, "gemini-flash-latest"].filter(
    (m, idx, arr) => m && arr.indexOf(m) === idx
  );

  const ai = new GoogleGenAI({ apiKey });
  let lastError = null;

  for (const currentModel of candidateModels) {
    try {
      const config = {};
      if (systemInstruction) config.systemInstruction = systemInstruction;
      if (responseMimeType) config.responseMimeType = responseMimeType;

      const response = await ai.models.generateContent({
        model: currentModel,
        contents: sanitizedPrompt,
        config: Object.keys(config).length > 0 ? config : undefined,
      });

      const latencyMs = Date.now() - startTime;
      const usage = response.usageMetadata || {};
      const rawText = response.text ? response.text.trim() : "";

      await AiLog.create({
        userId,
        goalId,
        model: currentModel,
        status: "success",
        httpStatusCode: 200,
        latencyMs,
        tokens: {
          promptTokens: usage.promptTokenCount || 0,
          candidatesTokens: usage.candidatesTokenCount || 0,
          totalTokens: usage.totalTokenCount || 0,
        },
        responseLength: rawText.length,
        promptPreview,
      });

      let parsedData = rawText;
      if (responseMimeType === "application/json") {
        try {
          parsedData = JSON.parse(rawText);
        } catch {
          parsedData = rawText;
        }
      }

      return {
        status: "success",
        data: parsedData,
        model: currentModel,
      };
    } catch (error) {
      lastError = error;
      const statusCode = error.status || error.code || 500;
      const isRateLimit = statusCode === 429;

      console.warn(`[GeminiService] Error with ${currentModel} (HTTP ${statusCode}):`, error.message || error);

      // If this is the last candidate model, log the error/rate-limit and return
      if (currentModel === candidateModels[candidateModels.length - 1]) {
        const latencyMs = Date.now() - startTime;
        await AiLog.create({
          userId,
          goalId,
          model: currentModel,
          status: isRateLimit ? "rate_limited" : "error",
          httpStatusCode: statusCode,
          latencyMs,
          promptPreview,
          errorMessage: error.message || JSON.stringify(error),
        });

        return {
          status: isRateLimit ? "rate_limited" : "error",
          data: null,
          error: error.message,
        };
      }
      // If not the last model, seamlessly fail over to the next candidate model
    }
  }

  return {
    status: "error",
    data: null,
    error: lastError?.message || "All AI models failed",
  };
}
