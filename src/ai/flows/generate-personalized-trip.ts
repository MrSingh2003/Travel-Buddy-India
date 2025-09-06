
// src/ai/flows/generate-personalized-trip.ts
'use server';

/**
 * @fileOverview Generates a personalized travel trip based on user preferences.
 *
 * - generatePersonalizedTrip - A function that generates a personalized trip.
 * - PersonalizedTripInput - The input type for the generatePersonalizedTrip function.
 * - PersonalizedTripOutput - The return type for the generatePersonalizedTrip function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedTripInputSchema = z.object({
  dates: z
    .string()
    .describe("The travel dates, in 'YYYY-MM-DD to YYYY-MM-DD' format."),
  budget: z.number().describe('The budget for the trip in INR.'),
  interests: z
    .string()
    .describe(
      'A comma-separated list of interests, e.g., hiking, museums, food.'
    ),
  location: z
    .string()
    .describe('The desired destination, e.g., New Delhi, India.'),
  numberOfPeople: z.number().describe('The number of people for the trip.'),
});
export type PersonalizedTripInput = z.infer<typeof PersonalizedTripInputSchema>;

const PersonalizedTripOutputSchema = z.object({
  trip: z.string().describe('The generated travel trip in markdown format.'),
});
export type PersonalizedTripOutput = z.infer<typeof PersonalizedTripOutputSchema>;

export async function generatePersonalizedTrip(
  input: PersonalizedTripInput
): Promise<PersonalizedTripOutput> {
  return generatePersonalizedTripFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedTripPrompt',
  input: {schema: PersonalizedTripInputSchema},
  output: {schema: PersonalizedTripOutputSchema},
  prompt: `You are a travel agent specializing in trip generation.

  Based on the user's preferences, generate a personalized travel trip.
  Present the output as a series of sections. Each section should have a title followed by a newline and then a list of bullet points (using '-'). 
  Separate sections with a double newline.
  Start with a "Trip Summary" section.
  Follow with a "Day X: [Day Title]" section for each day of the trip.
  Finally, include a "Budget Breakdown" section.

  Dates: {{{dates}}}
  Budget: {{{budget}}} INR
  Interests: {{{interests}}}
  Location: {{{location}}}
  Number of People: {{{numberOfPeople}}}
  `,
});

const generatePersonalizedTripFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedTripFlow',
    inputSchema: PersonalizedTripInputSchema,
    outputSchema: PersonalizedTripOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

    