
import { GoogleGenAI, Modality } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";

/**
 * Calls the Gemini API to edit an image based on a text prompt.
 * This function uses the 'gemini-2.5-flash-image-preview' model, which is specialized for image editing tasks.
 * It can accept multiple source images to be merged or used as context.
 *
 * @param images - An array of objects, each containing the base64 encoded string and MIME type of an image.
 * @param prompt - The detailed text prompt describing the desired edits.
 * @returns A promise that resolves to the base64 encoded string of the edited image.
 * @throws An error if the API call fails or if no image is returned.
 */
export async function editImage(images: { data: string; mimeType: string }[], prompt: string): Promise<string> {
  // Ensure the API key is available
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable not set.");
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  try {
    const imageParts = images.map(image => ({
      inlineData: {
        data: image.data,
        mimeType: image.mimeType,
      },
    }));

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          ...imageParts,
          {
            text: prompt,
          },
        ],
      },
      config: {
        // Must include both IMAGE and TEXT modalities for this model
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    // Extract the first image part from the response
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data; // Return the base64 string of the image
      }
    }

    // If no image part is found, throw an error
    throw new Error("AI did not return an image. It might have refused the request.");

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Provide a more user-friendly error message
    throw new Error("Failed to generate image. The AI may be experiencing issues or the request was denied.");
  }
}