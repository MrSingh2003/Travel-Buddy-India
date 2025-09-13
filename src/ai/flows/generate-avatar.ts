// src/ai/flows/generate-avatar.ts
'use server';

/**
 * @fileOverview Generates a user avatar based on a text prompt.
 *
 * - generateAvatar - A function that creates an avatar image.
 * - GenerateAvatarInput - The input type for the generateAvatar function.
 * - GenerateAvatarOutput - The return type for the generateAvatar function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateAvatarInputSchema = z.object({
  prompt: z.string().describe('A text description of the avatar to generate.'),
});
export type GenerateAvatarInput = z.infer<typeof GenerateAvatarInputSchema>;

const GenerateAvatarOutputSchema = z.object({
  dataUri: z
    .string()
    .describe(
      "The generated avatar image as a data URI (e.g., 'data:image/png;base64,...')."
    ),
});
export type GenerateAvatarOutput = z.infer<typeof GenerateAvatarOutputSchema>;

export async function generateAvatar(
  input: GenerateAvatarInput
): Promise<GenerateAvatarOutput> {
  return generateAvatarFlow(input);
}

const generateAvatarFlow = ai.defineFlow(
  {
    name: 'generateAvatarFlow',
    inputSchema: GenerateAvatarInputSchema,
    outputSchema: GenerateAvatarOutputSchema,
  },
  async ({ prompt }) => {
    const finalPrompt = `A user profile picture, square, vibrant, high-quality. Style: digital painting. Subject: ${prompt}`;

    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: finalPrompt,
    });

    const url = media.url;
    if (!url) {
      throw new Error('Image generation failed to return a data URI.');
    }
    
    return { dataUri: url };
  }
);
