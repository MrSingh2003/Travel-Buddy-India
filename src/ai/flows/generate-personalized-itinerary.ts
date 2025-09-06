// src/ai/flows/generate-personalized-itinerary.ts
'use server';

/**
 * @fileOverview Generates a personalized travel itinerary based on user preferences.
 *
 * - generatePersonalizedItinerary - A function that generates a personalized itinerary.
 * - PersonalizedItineraryInput - The input type for the generatePersonalizedItinerary function.
 * - PersonalizedItineraryOutput - The return type for the generatePersonalizedItinerary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedItineraryInputSchema = z.object({
  dates: z
    .string()
    .describe("The travel dates, in 'YYYY-MM-DD to YYYY-MM-DD' format."),
  budget: z.number().describe('The budget for the trip in USD.'),
  interests: z
    .string()
    .describe(
      'A comma-separated list of interests, e.g., hiking, museums, food.'
    ),
  location: z
    .string()
    .describe('The desired destination, e.g., New Delhi, Paris.'),
});
export type PersonalizedItineraryInput = z.infer<typeof PersonalizedItineraryInputSchema>;

const PersonalizedItineraryOutputSchema = z.object({
  itinerary: z.string().describe('The generated travel itinerary.'),
});
export type PersonalizedItineraryOutput = z.infer<typeof PersonalizedItineraryOutputSchema>;

export async function generatePersonalizedItinerary(
  input: PersonalizedItineraryInput
): Promise<PersonalizedItineraryOutput> {
  return generatePersonalizedItineraryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedItineraryPrompt',
  input: {schema: PersonalizedItineraryInputSchema},
  output: {schema: PersonalizedItineraryOutputSchema},
  prompt: `You are a travel agent specializing in itinerary generation.

  Based on the user's preferences, generate a personalized travel itinerary.

  Dates: {{{dates}}}
  Budget: {{{budget}}} USD
  Interests: {{{interests}}}
  Location: {{{location}}}

  Itinerary:`,
});

const generatePersonalizedItineraryFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedItineraryFlow',
    inputSchema: PersonalizedItineraryInputSchema,
    outputSchema: PersonalizedItineraryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
