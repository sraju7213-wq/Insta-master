import { Brand, GeneratedContent } from '../types';

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });

export const generateContent = async (
  brand: Brand,
  image: File | null,
  text: string
): Promise<GeneratedContent> => {

  let imageBase64: string | null = null;
  let imageMimeType: string | null = null;

  if (image) {
    imageBase64 = await fileToBase64(image);
    imageMimeType = image.type;
  }

  const response = await fetch('/.netlify/functions/generate', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      brand,
      text,
      imageBase64,
      imageMimeType,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'An unknown error occurred during the API call.' }));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  const result = await response.json();
  
  if (result.captions && result.hashtags) {
      return result as GeneratedContent;
  } else {
      throw new Error("The AI returned an unexpected response format. Please try again.");
  }
};
