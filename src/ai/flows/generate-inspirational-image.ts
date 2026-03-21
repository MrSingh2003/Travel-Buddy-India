// src/ai/flows/generate-inspirational-image.ts
'use server';

/**
 * @fileOverview Generates an inspirational image based on a travel query.
 *
 * - generateInspirationalImage - A function that creates an image.
 * - GenerateInspirationalImageInput - The input type for the function.
 * - GenerateInspirationalImageOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateInspirationalImageInputSchema = z.object({
  query: z.string().describe('The user search query, e.g., "temples in Varanasi".'),
  location: z.string().describe('The location of the search, e.g., "Varanasi, Uttar Pradesh".'),
});
export type GenerateInspirationalImageInput = z.infer<typeof GenerateInspirationalImageInputSchema>;

const GenerateInspirationalImageOutputSchema = z.object({
  title: z.string().describe("A short, evocative title for the generated image."),
  dataUri: z
    .string()
    .describe(
      "The generated image as a data URI (e.g., 'data:image/png;base64,...')."
    ),
});
export type GenerateInspirationalImageOutput = z.infer<typeof GenerateInspirationalImageOutputSchema>;

export async function generateInspirationalImage(
  input: GenerateInspirationalImageInput
): Promise<GenerateInspirationalImageOutput> {
  return generateInspirationalImageFlow(input);
}

const prompt = ai.definePrompt({
    name: 'inspirationalImagePrompt',
    input: { schema: GenerateInspirationalImageInputSchema },
    prompt: `Based on the user's travel search, create a prompt for an image generation model. 
    The prompt should evoke a sense of wonder and inspiration for the described location and activity.
    Style should be a beautiful, vibrant, digital painting.

    User Search: {{{query}}} in {{{location}}}.
    
    Image Generation Prompt:`,
});


const generateInspirationalImageFlow = ai.defineFlow(
  {
    name: 'generateInspirationalImageFlow',
    inputSchema: GenerateInspirationalImageInputSchema,
    outputSchema: GenerateInspirationalImageOutputSchema,
  },
  async (input) => {
    
    // Step 1: Generate a creative prompt for the image model
    const { text: imagePrompt } = await ai.generate({
        model: 'googleai/gemini-2.5-flash',
        prompt: `Create a short, artistic, and inspiring phrase for a beautiful travel poster. The poster is for: '${input.query} in ${input.location}'. Do not use quotes in the response.`
    });

    const finalImagePrompt = `${imagePrompt}. Style: beautiful digital painting, vibrant colors, cinematic lighting, ultra-detailed.`

    // Step 2: Generate the image
    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: finalImagePrompt,
    });

    if (!media?.url) {
      throw new Error('Image generation failed to return a data URI.');
    }
    
    // Step 3: Generate a title for the image
     const { text: title } = await ai.generate({
        model: 'googleai/gemini-2.5-flash',
        prompt: `Based on this description: '${imagePrompt}', create a short, evocative title (4-6 words). Do not use quotes.`
    });

    return { title, dataUri: media.url };
  }
);
