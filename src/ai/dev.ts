import { config } from 'dotenv';
config();

import '@/ai/flows/generate-personalized-trip.ts';
import '@/ai/flows/answer-travel-questions-with-chatbot.ts';
import '@/ai/flows/book-transport.ts';
import '@/ai/flows/search-places.ts';
