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
    let { model, contents, config } = data;

    if (!contents) {
      throw new HttpsError('invalid-argument', 'Contents are required.');
    }

    const deprecatedModels = [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-2.0-flash',
      'gemini-2.0-pro',
      'gemini-2.0-flash-thinking',
      'gemini-pro'
    ];
    if (!model || deprecatedModels.includes(model)) {
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
    // Be careful not to expose sensitive internal errors to the client
    throw new HttpsError('internal', 'Failed to generate content', error?.message || '');
  }
});
