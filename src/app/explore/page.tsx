// src/app/explore/page.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { searchPlaces, type SearchPlacesOutput } from "@/ai/flows/search-places";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Star, Globe, Phone } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type Place = SearchPlacesOutput['local_results'][0];

export default function ExplorePage() {
  const [query, setQuery] = useState("temples in Haridwar");
  const [results, setResults] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await searchPlaces({ query });
      setResults(response.local_results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto mb-8">
        <h1 className="text-4xl font-bold font-headline text-center">Explore Places</h1>
        <p className="text-muted-foreground text-center mt-2">
          Discover new points of interest, from hidden gems to popular landmarks.
        </p>
        <form onSubmit={handleSearch} className="flex gap-2 mt-6">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., 'cafes in Jaipur' or 'forts near Mumbai'"
            className="text-base"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : <Search />}
            <span className="ml-2 hidden md:inline">Search</span>
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
         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
                <Card key={i} className="flex flex-col overflow-hidden">
                    <div className="relative h-48 w-full bg-muted animate-pulse" />
                    <CardHeader>
                        <div className="h-6 w-3/4 bg-muted rounded animate-pulse" />
                        <div className="h-4 w-1/2 bg-muted rounded animate-pulse mt-2" />
                    </CardHeader>
                    <CardContent className="flex-grow space-y-3">
                         <div className="h-4 w-1/4 bg-muted rounded animate-pulse" />
                         <div className="h-4 w-full bg-muted rounded animate-pulse" />
                    </CardContent>
                    <CardFooter>
                         <div className="h-10 w-full bg-muted rounded animate-pulse" />
                    </CardFooter>
                </Card>
            ))}
         </div>
      )}

      {!isLoading && !error && results.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {results.map((place) => (
            <Card key={place.position} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="relative h-48 w-full">
                <Image
                  src={place.thumbnail || "https://picsum.photos/400/300"}
                  alt={place.title || "Place image"}
                  fill
                  className="object-cover"
                  data-ai-hint="place photo"
                />
              </div>
              <CardHeader>
                <CardTitle className="font-headline text-xl">{place.title}</CardTitle>
                {place.address && <CardDescription>{place.address}</CardDescription>}
              </CardHeader>
              <CardContent className="flex-grow space-y-3 text-sm">
                {place.type && <Badge variant="secondary">{place.type}</Badge>}
                {place.rating && (
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-accent fill-accent" />
                    <span className="font-semibold">{place.rating}</span>
                    <span className="text-muted-foreground">({place.reviews} reviews)</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="grid grid-cols-2 gap-2">
                 {place.website && (
                    <Button asChild variant="outline" className="w-full">
                        <a href={place.website} target="_blank" rel="noopener noreferrer">
                            <Globe className="mr-2"/> Website
                        </a>
                    </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {!isLoading && !error && results.length === 0 && (
         <div className="text-center text-muted-foreground py-16">
            <Search className="mx-auto h-12 w-12 mb-4"/>
            <p>Your search results will appear here. Try searching for something!</p>
        </div>
      )}
    </div>
  );
}
