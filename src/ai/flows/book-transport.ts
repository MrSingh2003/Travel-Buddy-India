// src/ai/flows/book-transport.ts
'use server';
/**
 * @fileOverview A mock transport booking agent.
 *
 * - bookTransport - A function that handles the mock transport booking process.
 * - BookTransportInput - The input type for the bookTransport function.
 * - BookTransportOutput - The return type for the bookTransport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {v4 as uuidv4} from 'uuid';

const BookTransportInputSchema = z.object({
  service: z.enum(['cab', 'bus', 'train']),
  details: z.string().describe('Details about the transport to book, e.g., "Himalayan Nomad Cabs" or "RedBus: Delhi to Jaipur".'),
});
export type BookTransportInput = z.infer<typeof BookTransportInputSchema>;

const BookTransportOutputSchema = z.object({
  bookingId: z.string().describe('A unique booking confirmation ID.'),
  status: z.string().describe('The status of the booking.'),
  message: z.string().describe('A confirmation message for the user.'),
});
export type BookTransportOutput = z.infer<typeof BookTransportOutputSchema>;

export async function bookTransport(
  input: BookTransportInput
): Promise<BookTransportOutput> {
  return bookTransportFlow(input);
}

const bookTransportFlow = ai.defineFlow(
  {
    name: 'bookTransportFlow',
    inputSchema: BookTransportInputSchema,
    outputSchema: BookTransportOutputSchema,
  },
  async (input) => {
    // This is a mock booking flow that simulates a real booking process.
    console.log(`Simulating booking for ${input.service}: ${input.details}`);
    
    // Generate a more realistic, unique booking ID.
    const bookingId = `TB-${uuidv4().split('-')[0].toUpperCase()}`;
    const message = `Your booking for "${input.details}" has been successfully confirmed! Your booking confirmation ID is ${bookingId}. We've sent the details to your registered email.`;

    return {
      bookingId,
      status: 'confirmed',
      message,
    };
  }
);
