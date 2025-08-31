
import { QuestionnaireData } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";

/**
 * Rewrites the user's questionnaire answers into a detailed prompt for the Gemini image editing model.
 * This function constructs a prompt that is clear, specific, and provides context to the AI.
 *
 * @param data - The data object from the questionnaire form.
 * @param originalFileNames - The names of the user's uploaded files, used for context.
 * @returns A detailed string prompt ready to be sent to the AI.
 */
export function rewritePrompt(data: QuestionnaireData, originalFileNames: string[]): string {
  let prompt = `Act as a professional YouTube thumbnail designer. The primary goal is to create a viral, click-worthy YouTube thumbnail that grabs attention and entices viewers to click. Every decision should serve this goal.
`;

  if (originalFileNames.length > 1) {
    prompt += `\nCRITICAL TASK: You have been given ${originalFileNames.length} images (${originalFileNames.join(', ')}). Your primary goal is to creatively merge them into a single, cohesive image. The first image should be treated as the main subject, and elements from the other images should be incorporated as background, accents, or complementary features. Blend them seamlessly.\n`;
  } else {
    prompt += `\nEdit the provided image named "${originalFileNames[0]}" to create a viral, eye-catching YouTube thumbnail.`;
  }
  
  const selectedAspectRatio = 'aspectRatio' in data ? (data as any).aspectRatio : data.aspectRatios[0];

  prompt += `The video is a "${data.videoType}".\n`;

  // Add specific, detailed style instructions instead of a generic one.
  switch (data.style) {
    case "Bold & Punchy":
        prompt += `
STYLE GUIDELINES: BOLD & PUNCHY
- **Colors:** Use highly saturated, vibrant colors. Think bright reds, electric yellows, and deep blues. Create extreme contrast.
- **Lighting:** Make it dramatic. Use hard light, rim lighting, or strong highlights to make the subject pop from the background.
- **Effects:** Add a thick, hard outline or a strong drop shadow to the main subject to ensure maximum separation from the background. Use subtle zoom blurs or radial blurs on the background to create focus and energy.
- **Overall Mood:** High energy, exciting, unmissable. Like a movie poster for a summer blockbuster. This is about grabbing attention instantly.
`;
        break;
    case "Minimalist & Clean":
        prompt += `
STYLE GUIDELINES: MINIMALIST & CLEAN
- **Composition:** Embrace negative space. The background should be extremely simple, possibly a solid color or a very subtle, clean gradient. Remove all clutter.
- **Colors:** Use a limited and sophisticated color palette (2-3 colors max). Often monochromatic with one single, soft accent color.
- **Lighting:** Soft, even, and clean lighting. Avoid harsh shadows.
- **Subject:** The subject should be the sole focus. Ensure they are perfectly and cleanly isolated from the background.
- **Overall Mood:** Professional, modern, calm, and high-end. Focus on clarity and simplicity.
`;
        break;
    case "Energetic & Dynamic":
        prompt += `
STYLE GUIDELINES: ENERGETIC & DYNAMIC
- **Composition:** Use diagonal lines and tilted angles ("dutch angle") to create a sense of motion and excitement.
- **Colors:** Use bright neon colors, vibrant glows, and energetic gradients. Think cyberpunk or gaming aesthetics.
- **Effects:** Incorporate motion trails, particle effects (sparks, dust), lens flares, and speed lines. The background should feel alive and in motion.
- **Overall Mood:** Action-packed, exciting, fast-paced. Perfect for gaming, tech, or high-energy content.
`;
        break;
    case "Mysterious & Intriguing":
        prompt += `
STYLE GUIDELINES: MYSTERIOUS & INTRIGUING
- **Colors:** Use a heavily desaturated color palette with deep shadows and rich blacks. Introduce one single, symbolic pop of color (e.g., a splash of red or an electric blue).
- **Lighting:** Use low-key lighting (chiaroscuro). Let shadows obscure parts of the scene or subject. Add a strong vignette effect to darken the edges.
- **Atmosphere:** Introduce elements like fog, smoke, atmospheric dust, or faint, cryptic symbols in the background. The background should be dark and perhaps slightly out of focus.
- **Overall Mood:** Suspenseful, dramatic, thought-provoking. Make the viewer ask "what is happening here?".
`;
        break;
    case "Professional & Corporate":
        prompt += `
STYLE GUIDELINES: PROFESSIONAL & CORPORATE
- **Composition:** Clean, balanced, and organized layout. Often uses grids or simple geometric shapes as overlays or framing elements.
- **Colors:** Use a defined, often more muted or brand-aligned color scheme. Avoid overly bright, clashing colors. Think blues, grays, and whites.
- **Lighting:** Bright, clean, even lighting. Mimic a professional photo studio or a well-lit modern office environment.
- **Background:** Should be non-distracting. A clean office space (blurry), a subtle abstract graphic pattern, or a simple, professional gradient.
- **Overall Mood:** Trustworthy, informative, polished, and credible.
`;
        break;
    case "Artistic & Creative":
        prompt += `
STYLE GUIDELINES: ARTISTIC & CREATIVE
- **Composition:** Unconventional framing and unique layouts are encouraged. Break the rules of thirds. Play with scale.
- **Effects:** Blend photography with illustrative or painterly elements. Add textures like paper, canvas, or paint splatters. Consider using double exposure effects or creative collages with geometric shapes.
- **Colors:** Use a unique and deliberate color palette. It could be vintage-toned, pastel, or highly stylized with duotones or tritones.
- **Overall Mood:** Imaginative, unique, and expressive. This style should look like a piece of digital art, not just a thumbnail.
`;
        break;
    default:
        prompt += `The desired visual style is "${data.style}". Enhance colors, contrast, and add elements that fit this style perfectly.\n`;
  }

  prompt += `
CRITICAL REQUIREMENT: The final output image's aspect ratio MUST BE EXACTLY ${selectedAspectRatio}. You must crop, expand the background, or use generative fill to achieve this precise aspect ratio. Do not stretch or distort the main subject.

NON-NEGOTIABLE PLACEMENT: The main subject (the person or key focus) from the first photo MUST be positioned on the "${data.placement}" side of the thumbnail. This is the most important rule. For example, if placement is "Left", the subject must occupy the left third of the frame, leaving the other two-thirds more open.

Make the subject pop from the background using techniques appropriate for the chosen style.
`;

  if (data.customText.trim()) {
    prompt += `TEXT OVERLAY: This is the most critical part of the thumbnail's success. Add the following text: "${data.customText}".
Apply professional graphic design principles to the text. The text is the hero element. It MUST be:
1.  **Extremely Readable:** Use a bold, sans-serif font that is instantly readable, even when the thumbnail is viewed at a very small size on a mobile device. Think fonts like 'Montserrat Bold', 'Impact', or 'Anton'. Avoid thin or script fonts.
2.  **High Contrast & Pops Out:** The text must have maximum contrast with the background. Do not just place text on the image. Use one of these professional techniques:
    - A thick, contrasting outline (e.g., white text with a black outline, or yellow text with a dark blue outline).
    - A solid color block behind the text (e.g., a red rectangle with white text on top).
    - A strong, hard drop shadow to lift the text off the background.
    - A glow effect that makes the text luminous.
3.  **Stylistically Integrated:** The font, colors, and effects must match the overall style and "${data.videoType}" theme, but readability and contrast are the top priority.
4.  **Strategically Placed:** Position the text in the area with the least visual clutter, OPPOSITE the main subject's placement. For example, if the subject is on the left, the text should be on the right. It MUST NOT cover the subject's face or any key focal point of the image.
The text should be the first thing a viewer's eye is drawn to. Make it unmissable.
`;
  } else {
    prompt += `Do NOT add any text overlays.
`;
  }

  if (data.proMode && data.customPrompt.trim()) {
    prompt += `PRO MODE INSTRUCTIONS:
The user has provided a custom creative direction. Follow it closely, while still respecting all the critical requirements above (aspect ratio, placement, text design):
"${data.customPrompt}"
`;
  }

  prompt += `Return only the final, edited image. Do not return text.`;

  return prompt;
}

/**
 * Enhances a user-provided prompt using AI to make it more descriptive, providing 3 context-aware options
 * based on professional prompt templates.
 * @param data - The full questionnaire data to provide context for enhancement.
 * @param numUploadedFiles - The number of files the user has uploaded.
 * @returns A promise that resolves to an array of 3 enhanced prompt strings.
 */
export async function enhancePrompt(data: QuestionnaireData, numUploadedFiles: number): Promise<string[]> {
  if (!data.customPrompt.trim()) {
    return [];
  }
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable not set.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const selectedAspectRatio = 'aspectRatio' in data ? (data as any).aspectRatio : data.aspectRatios[0];

  const instruction = `You are an expert AI prompt engineer specializing in creating instructions for image *editing*. Your task is to take a user's basic idea for a YouTube thumbnail and enhance it into three distinct, professional, and detailed editing prompts.

**CRITICAL RULE: The enhanced prompts MUST be instructions to EDIT the user's provided image, not create a new one from scratch. The main subject from the user's photo (e.g., a person, a product) MUST be kept, enhanced, and integrated into the final thumbnail.** You are adding to and improving the scene, not replacing it.

**Context from User's Form:**
- Video Type: "${data.videoType}"
- Desired Style: "${data.style}"
- Main Subject Placement: "${data.placement}"
- Aspect Ratio: "${selectedAspectRatio}"
- Text Overlay: "${data.customText.trim() || 'None'}"
- Number of source images: ${numUploadedFiles}

**User's Core Idea (this is the starting point to build upon):**
"${data.customPrompt}"

**Your Task:**
1.  Read the user's core idea and the form context.
2.  Brainstorm three unique creative directions that *build upon* the user's idea and *incorporate the subject from their uploaded photo*.
3.  For each direction, write a detailed set of editing instructions. Describe specific visual elements like:
    - **Lighting:** (e.g., "Add dramatic rim lighting to the subject," "Introduce volumetric light rays from the top left.")
    - **Color Grading:** (e.g., "Grade the image with a cinematic teal and orange look," "Boost color saturation for a vibrant feel.")
    - **Background Elements:** (e.g., "Replace the background with a futuristic cityscape at night," "Add subtle, glowing particle effects behind the subject.")
    - **Effects:** (e.g., "Apply a slight motion blur to the background," "Add a clean, white outline to the subject to make them pop.")
4.  Format each of the three creative directions as a list of bullet points using markdown (e.g., "- Detail 1").
5.  Return a JSON array containing exactly three strings. Each string is a complete, enhanced prompt formatted with markdown bullet points, ready to be used to edit the user's photo.

**Example of a good enhancement:**
- User Idea: "make it look cool"
- Good Enhanced Bullet Point Prompt:
  - "- Edit the provided photo to have a cinematic, cyberpunk feel."
  - "- Grade the entire image with a neon color palette, emphasizing blues and magentas."
  - "- Add a subtle, glowing digital grid pattern to the background."
  - "- Enhance the lighting on the person to include a bright neon rim light, making them pop from the dark background."

Do not use templates. Create the prompts based on the user's input and the principles of good thumbnail design. Ensure the output is a JSON array of three strings.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: instruction,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            }
          }
        }
    });
    
    const jsonStr = response.text.trim();
    const suggestions = JSON.parse(jsonStr);

    if (Array.isArray(suggestions) && suggestions.length > 0 && typeof suggestions[0] === 'string') {
       return suggestions.slice(0, 3); // Ensure we only return max 3
    }
    throw new Error("AI returned an invalid format for prompt suggestions.");

  } catch (error) {
    console.error("Error enhancing prompt:", error);
    throw new Error("Failed to enhance prompt. The AI may have returned an unexpected format.");
  }
}
