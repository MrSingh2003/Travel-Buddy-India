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
    // This is a mock booking flow.
    // In a real application, you would integrate with a real booking API here.
    console.log(`Simulating booking for ${input.service}: ${input.details}`);
    
    const bookingId = `BK-${Date.now()}`;
    const message = `Your booking for "${input.details}" has been successfully confirmed! Your booking ID is ${bookingId}.`;

    return {
      bookingId,
      status: 'confirmed',
      message,
    };
  }
);
