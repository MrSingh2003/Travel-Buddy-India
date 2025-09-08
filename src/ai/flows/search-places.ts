// src/ai/flows/search-places.ts
'use server';

/**
 * @fileOverview A flow for searching places using the SearchAPI.io service.
 *
 * - searchPlaces - A function that searches for places based on a query.
 * - SearchPlacesInput - The input type for the searchPlaces function.
 * - SearchPlacesOutput - The return type for the searchPlaces function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { cities } from '@/lib/locations';

const SearchPlacesInputSchema = z.object({
  query: z.string().describe('The search query, e.g., "restaurants", "museums".'),
  location: z.string().describe('The location to search in, e.g., "New Delhi, India"'),
});

export type SearchPlacesInput = z.infer<typeof SearchPlacesInputSchema>;

const PlaceSchema = z.object({
  position: z.number().optional(),
  title: z.string().optional(),
  address: z.string().optional(),
  rating: z.number().optional(),
  reviews: z.number().optional(),
  type: z.string().optional(),
  thumbnail: z.string().optional(),
  place_id: z.string().optional(),
  gps_coordinates: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
});

const SearchPlacesOutputSchema = z.object({
  places: z.array(PlaceSchema),
});

export type SearchPlacesOutput = z.infer<typeof SearchPlacesOutputSchema>;

// This is a mock implementation. In a real application, you would call the SearchAPI.io API.
const searchPlacesFlow = ai.defineFlow(
  {
    name: 'searchPlacesFlow',
    inputSchema: SearchPlacesInputSchema,
    outputSchema: SearchPlacesOutputSchema,
  },
  async (input) => {
    const apiKey = process.env.SEARCH_API_KEY;
    if (!apiKey) {
      throw new Error('SEARCH_API_KEY environment variable is not set.');
    }

    const city = cities.find(c => `${c.name}, ${c.state}` === input.location);
    // A real app might use a geocoding API to get coordinates
    const ll = city ? `@0,0,12z` : '@40.7009973,-73.994778,12z';


    const params = new URLSearchParams({
      engine: 'google_maps',
      q: input.query,
      ll: ll,
      api_key: apiKey,
    });

    const url = `https://www.searchapi.io/api/v1/search?${params.toString()}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API call failed with status ${response.status}: ${errorBody}`);
      }
      const data = await response.json();
      return { places: data.local_results || [] };
    } catch (error) {
      console.error('Error fetching data from SearchAPI.io:', error);
      throw new Error('Failed to fetch places.');
    }
  }
);


export async function searchPlaces(
  input: SearchPlacesInput
): Promise<SearchPlacesOutput> {
  return searchPlacesFlow(input);
}