// src/ai/flows/search-places.ts
'use server';

/**
 * @fileOverview Searches for places using the SearchAPI.io service.
 *
 * - searchPlaces - A function that searches for places.
 * - SearchPlacesInput - The input type for the searchPlaces function.
 * - SearchPlacesOutput - The return type for the searchPlaces function.
 */

import { z } from 'zod';

// Note: We are not using Genkit for this flow as it's a direct API call.

const SearchPlacesInputSchema = z.object({
  query: z.string().describe('The search query for places, e.g., "cafes in New Delhi"'),
});
export type SearchPlacesInput = z.infer<typeof SearchPlacesInputSchema>;

const PlaceSchema = z.object({
    position: z.number().optional(),
    title: z.string().optional(),
    address: z.string().optional(),
    rating: z.number().optional().nullable(),
    reviews: z.number().optional().nullable(),
    type: z.string().optional(),
    thumbnail: z.string().url().optional(),
    website: z.string().url().optional().nullable(),
});

const SearchPlacesOutputSchema = z.object({
  local_results: z.array(PlaceSchema),
});
export type SearchPlacesOutput = z.infer<typeof SearchPlacesOutputSchema>;


export async function searchPlaces(
  input: SearchPlacesInput
): Promise<SearchPlacesOutput> {
  const apiKey = process.env.NEXT_PUBLIC_SEARCHAPI_IO_API_KEY;
  if (!apiKey) {
    throw new Error('SearchAPI.io API key is not configured.');
  }

  const params = new URLSearchParams({
    engine: 'google_maps',
    q: input.query,
    api_key: apiKey,
    hl: 'en',
  });

  const url = `https://www.searchapi.io/api/v1/search?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }
    const data = await response.json();
    
    // Validate the structure of the returned data, especially local_results
    const validatedData = SearchPlacesOutputSchema.safeParse(data);
    if (!validatedData.success) {
        console.error("Invalid data structure received from SearchAPI.io:", validatedData.error);
        return { local_results: [] };
    }

    return validatedData.data;
  } catch (error) {
    console.error('Error fetching data from SearchAPI.io:', error);
    throw new Error('Failed to fetch search results.');
  }
}
