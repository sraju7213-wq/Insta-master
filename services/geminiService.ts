
import { GoogleGenAI, Type } from "@google/genai";
import { Brand, GeneratedContent } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const generateContent = async (
  brand: Brand,
  image: File | null,
  text: string
): Promise<GeneratedContent> => {

  const prompt = `
    You are an expert social media manager specializing in creating viral Instagram content. 
    Your task is to generate compelling captions and relevant hashtags for a specific brand based on the provided context.

    **Brand Identity:**
    - **Account Name:** ${brand.name}
    - **Description:** ${brand.description}
    - **Keywords/Vibe:** ${brand.keywords}
    - **Tone of Voice:** Engage with a tone that is professional yet friendly, inspiring, and tailored to the brand's specific audience (e.g., for furniture, target designers and business owners; for travel, target wanderlust-seekers).

    **Your Task:**
    Based on the brand identity above and the user-provided context below, generate the following:
    1.  **Three (3) unique Instagram captions.** Each caption should be engaging, reflect the brand's tone, and be 2-4 sentences long. Use relevant emojis to enhance appeal.
    2.  **A list of 15-20 relevant hashtags.** The list should be a mix of popular, niche, and brand-specific hashtags. Do not include the '#' symbol in the output strings.

    **User-Provided Context:**
    ${text ? `Textual Context: "${text}"` : 'No textual context provided.'}
    ${image ? `An image is also provided. Analyze its content, style, and mood to inform your output.` : ''}
  `;

  const parts = [{ text: prompt }];

  if (image) {
    const imagePart = await fileToGenerativePart(image);
    parts.push(imagePart as any);
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ parts }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          captions: {
            type: Type.ARRAY,
            description: "An array of 3 unique Instagram captions as strings.",
            items: { type: Type.STRING }
          },
          hashtags: {
            type: Type.ARRAY,
            description: "An array of 15-20 relevant hashtags as strings, without the '#' symbol.",
            items: { type: Type.STRING }
          }
        },
        required: ["captions", "hashtags"],
      }
    }
  });

  try {
    const jsonString = response.text;
    const parsedJson = JSON.parse(jsonString);
    if (parsedJson.captions && parsedJson.hashtags) {
        return parsedJson as GeneratedContent;
    } else {
        throw new Error("Generated JSON is missing required fields.");
    }
  } catch (error) {
    console.error("Failed to parse Gemini response as JSON:", error);
    throw new Error("The AI returned an unexpected response format. Please try again.");
  }
};
