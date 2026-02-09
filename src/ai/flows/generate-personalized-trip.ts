// src/ai/flows/generate-personalized-trip.ts
'use server';

/**
 * @fileOverview Generates a personalized travel trip with a focus on decision support.
 *
 * - generatePersonalizedTrip - A function that generates a personalized trip.
 * - PersonalizedTripInput - The input type for the generatePersonalizedTrip function.
 * - PersonalizedTripOutput - The return type for the generatePersonalizedTrip function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedTripInputSchema = z.object({
  currentLocation: z
    .string()
    .describe('The starting location of the user, e.g., New Delhi, India.'),
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

const DayPlanSchema = z.object({
  day: z.number(),
  title: z.string(),
  activities: z.array(z.string()),
});

const BudgetBreakdownSchema = z.object({
  accommodation: z.string(),
  food: z.string(),
  transport: z.string(),
  activities: z.string(),
  total: z.string(),
});

const PersonalizedTripOutputSchema = z.object({
  tripTitle: z.string().describe("A catchy title for the trip."),
  suitabilityScore: z.number().min(0).max(10).describe("A score from 0-10 indicating how suitable the destination is based on budget, interests, and typical weather for the dates."),
  suitabilityReasoning: z.string().describe("A brief explanation for the suitability score."),
  tripSummary: z.string().describe("A brief summary of the trip."),
  dailyItinerary: z.array(DayPlanSchema),
  budgetBreakdown: BudgetBreakdownSchema.describe("A detailed breakdown of the estimated budget."),
  weatherAdvisory: z.string().describe("A brief advisory about the expected weather during the trip dates and what to pack."),
});
export type PersonalizedTripOutput = z.infer<typeof PersonalizedTripOutputSchema>;


export async function generatePersonalizedTrip(
  input: PersonalizedTripInput
): Promise<PersonalizedTripOutput> {
  return generatePersonalizedTripFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedTripPrompt',
  model: 'googleai/gemini-2.5-flash',
  input: {schema: PersonalizedTripInputSchema},
  output: {schema: PersonalizedTripOutputSchema},
  prompt: `You are an expert travel agent specializing in creating personalized, decision-focused travel plans for destinations within India. Your goal is to provide cost transparency and practical advice, not just information.

  **User Preferences:**
  - **Origin:** {{{currentLocation}}}
  - **Destination:** {{{location}}}
  - **Dates:** {{{dates}}}
  - **Budget:** {{{budget}}} INR for {{{numberOfPeople}}} people.
  - **Interests:** {{{interests}}}

  **Your Task:**
  Based on the user's preferences, generate a comprehensive and practical travel plan. Follow this structure precisely:

  1.  **tripTitle**: Create a short, catchy title for this trip plan.
  2.  **suitabilityScore**: Provide a score from 0 to 10. A score of 10 means the destination is a perfect match for the user's budget, interests, and the typical weather during the travel dates. A low score indicates a mismatch (e.g., too expensive, off-season, not aligned with interests).
  3.  **suitabilityReasoning**: Briefly justify the score. For example, "Excellent score due to perfect weather for sightseeing and budget alignment" or "Lower score as it's monsoon season, which may affect beach activities."
  4.  **tripSummary**: Write a compelling one-paragraph summary of the proposed trip.
  5.  **dailyItinerary**: Create a day-by-day plan. For each day, provide a title and a list of 3-4 recommended activities.
  6.  **budgetBreakdown**: Provide a transparent cost breakdown with estimated amounts for 'accommodation', 'food', 'transport' (local travel), and 'activities'. Calculate the 'total' estimated cost. The total should be within the user's specified budget.
  7.  **weatherAdvisory**: Give a short, practical weather forecast for the given dates and location, and suggest what kind of clothing to pack.

  Ensure the entire plan is tailored to the context of travel within India (e.g., mentioning common transport, food costs, etc.).
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
