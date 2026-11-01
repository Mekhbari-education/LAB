import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { GoogleGenAI } from "@google/genai";
import { defineString } from "firebase-functions/params";

// Define the GEMINI_API_KEY as a parameter that can be provided from .env or Secret Manager
const geminiApiKey = defineString('GEMINI_API_KEY');

const ALLOWED_MODELS = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

export const generateContent = onCall({ cors: true }, async (request) => {
  try {
    // 1. Enforce strict authentication
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated to invoke Gemini assistant.');
    }

    const data = request.data;
    let { model, contents, config } = data;

    if (!contents) {
      throw new HttpsError('invalid-argument', 'Contents are required.');
    }

    // Input size limit to prevent quota exhaustion attacks
    const contentsStr = JSON.stringify(contents);
    if (contentsStr.length > 25000) {
      throw new HttpsError('invalid-argument', 'Payload exceeds maximum allowed length.');
    }

    if (!model || !ALLOWED_MODELS.includes(model)) {
      model = 'gemini-3.8-flash';
    }

    const apiKey = geminiApiKey.value() || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      logger.error('Gemini API key is missing.');
      throw new HttpsError('internal', 'Server configuration error.');
    }

    const ai = new GoogleGenAI({ apiKey });

    // Call the Gemini API
    const response = await ai.models.generateContent({
      model,
      contents,
      config
    });

    return {
      text: response.text
    };

  } catch (error: any) {
    logger.error('Error calling Gemini API:', error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError('internal', 'Failed to generate content', error?.message || '');
  }
});
