import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { GoogleGenAI } from "@google/genai";
import { defineString } from "firebase-functions/params";

// Define the GEMINI_API_KEY as a parameter that can be provided from .env or Secret Manager
const geminiApiKey = defineString('GEMINI_API_KEY');

export const generateContent = onCall({ cors: true }, async (request) => {
  try {
    // 1. Verify authentication (optional but recommended)
    // if (!request.auth) {
    //   throw new HttpsError('unauthenticated', 'User must be authenticated.');
    // }

    const data = request.data;
    const { model, contents, config } = data;

    if (!model || !contents) {
      throw new HttpsError('invalid-argument', 'Model and contents are required.');
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
    // Be careful not to expose sensitive internal errors to the client
    throw new HttpsError('internal', 'Failed to generate content', error?.message || '');
  }
});
