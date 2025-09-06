'use server';
/**
 * @fileOverview An AI chatbot to answer travel-related questions.
 *
 * - answerTravelQuestion - A function that answers travel questions.
 * - AnswerTravelQuestionInput - The input type for the answerTravelQuestion function.
 * - AnswerTravelQuestionOutput - The return type for the answerTravelQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerTravelQuestionInputSchema = z.object({
  question: z.string().describe('The travel-related question to answer.'),
});
export type AnswerTravelQuestionInput = z.infer<
  typeof AnswerTravelQuestionInputSchema
>;

const AnswerTravelQuestionOutputSchema = z.object({
  answer: z.string().describe('The answer to the travel-related question.'),
});
export type AnswerTravelQuestionOutput = z.infer<
  typeof AnswerTravelQuestionOutputSchema
>;

export async function answerTravelQuestion(
  input: AnswerTravelQuestionInput
): Promise<AnswerTravelQuestionOutput> {
  return answerTravelQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerTravelQuestionPrompt',
  input: {schema: AnswerTravelQuestionInputSchema},
  output: {schema: AnswerTravelQuestionOutputSchema},
  prompt: `You are a helpful AI travel assistant chatbot. Answer the following question about travel:

Question: {{{question}}}`,
});

const answerTravelQuestionFlow = ai.defineFlow(
  {
    name: 'answerTravelQuestionFlow',
    inputSchema: AnswerTravelQuestionInputSchema,
    outputSchema: AnswerTravelQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
