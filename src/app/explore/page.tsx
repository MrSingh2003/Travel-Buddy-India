
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Search, MapPin, Star, Building, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { searchPlaces, type SearchPlacesOutput } from '@/ai/flows/search-places';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function ExplorePage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchPlacesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setSearched(true);

    try {
      const searchResults = await searchPlaces({ query });
      setResults(searchResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const hasApiKey = process.env.NEXT_PUBLIC_SEARCHAPI_IO_API_KEY && process.env.NEXT_PUBLIC_SEARCHAPI_IO_API_key !== "PZVSWdF8w8qpDkm66RTkLVrn";

  if (!hasApiKey) {
    return (
       <div className="container mx-auto py-8">
            <div className="max-w-3xl mx-auto mb-8">
                <h1 className="text-4xl font-bold font-headline text-center">Explore Places</h1>
                <p className="text-muted-foreground text-center mt-2">
                Discover new points of interest, from hidden gems to popular landmarks.
                </p>
            </div>
            <Alert variant="destructive" className="max-w-3xl mx-auto">
                <Search className="h-4 w-4" />
                <AlertTitle>Feature Disabled</AlertTitle>
                <AlertDescription>
                The place search feature is currently unavailable. An API key for SearchAPI.io is required. Please provide one to enable this functionality.
                </AlertDescription>
            </Alert>
       </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto mb-8">
        <h1 className="text-4xl font-bold font-headline text-center">Explore Places</h1>
        <p className="text-muted-foreground text-center mt-2">
          Discover new points of interest, from hidden gems to popular landmarks.
        </p>
        <form onSubmit={handleSearch} className="mt-6 flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., cafes in New Delhi"
            className="flex-grow text-base"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !query.trim()}>
            <Search className="mr-2 h-4 w-4" />
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
        </form>
      </div>

      {error && (
        <Alert variant="destructive" className="max-w-3xl mx-auto">
          <AlertTitle>Search Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading && (
         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
                 <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-5 w-3/4"/>
                        <Skeleton className="h-4 w-1/2"/>
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-32 w-full rounded-md"/>
                    </CardContent>
                    <CardFooter>
                         <Skeleton className="h-8 w-full"/>
                    </CardFooter>
                </Card>
            ))}
         </div>
      )}

      {searched && !isLoading && !results?.local_results?.length && !error && (
        <div className="text-center py-16 text-muted-foreground">
            <Building className="mx-auto h-12 w-12 mb-4"/>
            <h3 className="text-xl font-semibold">No Results Found</h3>
            <p>Try a different search term to find what you're looking for.</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {results?.local_results?.map((place, index) => (
          <Card key={`${place.title}-${index}`} className="flex flex-col">
            <CardHeader>
              <CardTitle className="font-headline text-xl leading-tight">{place.title}</CardTitle>
                {place.type && <Badge variant="secondary" className="w-fit">{place.type}</Badge>}
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
              {place.thumbnail && (
                 <div className="relative h-40 w-full rounded-md overflow-hidden">
                    <Image src={place.thumbnail} alt={place.title || 'Place image'} fill className="object-cover" />
                 </div>
              )}
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0"/>
                <span>{place.address}</span>
              </div>
              {place.rating && (
                <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500"/>
                    <span className="font-semibold">{place.rating}</span>
                    {place.reviews && <span className="text-muted-foreground">({place.reviews} reviews)</span>}
                </div>
              )}
            </CardContent>
            <CardFooter>
                {place.website && (
                    <Button asChild variant="outline" className="w-full">
                        <a href={place.website} target="_blank" rel="noopener noreferrer">
                           <Globe className="mr-2 h-4 w-4" /> Visit Website
                        </a>
                    </Button>
                )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
