import { GoogleGenAI, Type } from "@google/genai";

// Inlined types to make the function self-contained
interface Brand {
  id: string;
  name: string;
  description: string;
  keywords: string;
  website: string;
}

// Netlify Function handler types
interface HandlerEvent {
  httpMethod: string;
  body: string | null;
}
interface HandlerContext {}
interface HandlerResponse {
  statusCode: number;
  body: string;
  headers?: { [header: string]: string | number | boolean; }
}
type Handler = (event: HandlerEvent, context: HandlerContext) => Promise<HandlerResponse>;

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set for Netlify Function.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const handler: Handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
            headers: { 'Content-Type': 'application/json' },
        };
    }

    if (!event.body) {
         return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Request body is missing.' }),
            headers: { 'Content-Type': 'application/json' },
        };
    }

    try {
        const { brand, text, imageBase64, imageMimeType } = JSON.parse(event.body) as {
            brand: Brand,
            text: string,
            imageBase64: string | null,
            imageMimeType: string | null
        };
        
        if (!brand) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Brand information is missing.' }),
                headers: { 'Content-Type': 'application/json' },
            };
        }

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
        ${imageBase64 ? `An image is also provided. Analyze its content, style, and mood to inform your output.` : ''}
      `;

      const parts: any[] = [{ text: prompt }];

      if (imageBase64 && imageMimeType) {
        parts.push({
          inlineData: {
            data: imageBase64,
            mimeType: imageMimeType,
          },
        });
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
      
      const generatedJsonString = response.text;
      JSON.parse(generatedJsonString); // Validate it's parseable JSON before returning

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: generatedJsonString,
      };

    } catch (error) {
        console.error('Error in Netlify function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error instanceof Error ? error.message : 'An internal server error occurred.' }),
            headers: { 'Content-Type': 'application/json' },
        };
    }
};

export { handler };
