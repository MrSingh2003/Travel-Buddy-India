// src/app/explore/page.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, MapPin, Search, Star, Building, Utensils } from "lucide-react";
import Image from "next/image";

import { searchPlaces } from "@/ai/flows/search-places";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Combobox } from "@/components/ui/combobox";
import { cities } from "@/lib/locations";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  query: z.string().min(2, "Please enter a search query."),
  location: z.string({ required_error: "Please select a location." }),
});

type FormValues = z.infer<typeof formSchema>;
type Place = Awaited<ReturnType<typeof searchPlaces>>["places"][0];

export default function ExplorePage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: "cafe",
      location: "Bengaluru, Karnataka",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setPlaces([]);
    setError(null);
    try {
      const result = await searchPlaces(values);
      setPlaces(result.places);
    } catch (e) {
      console.error(e);
      setError("Sorry, we couldn't find any places at this time. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }

  const getTypeIcon = (type: string | undefined) => {
    if (!type) return <MapPin className="h-4 w-4" />;
    if (type.toLowerCase().includes('restaurant') || type.toLowerCase().includes('cafe')) {
        return <Utensils className="h-4 w-4" />;
    }
    if (type.toLowerCase().includes('hotel') || type.toLowerCase().includes('lodging')) {
        return <Building className="h-4 w-4" />;
    }
    return <MapPin className="h-4 w-4" />;
  }

  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Explore Places</CardTitle>
          <CardDescription>
            Find top-rated restaurants, attractions, and hidden gems.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col md:flex-row gap-4 items-end"
            >
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormLabel>What are you looking for?</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., temples, restaurants..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem className="w-full md:w-auto md:min-w-[250px]">
                    <FormLabel>Where?</FormLabel>
                    <Combobox
                      options={cities.map((c) => ({
                        value: `${c.name}, ${c.state}`,
                        label: `${c.name}, ${c.state}`,
                      }))}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select location"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                Search
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                    <div className="h-40 w-full bg-muted rounded-t-md"></div>
                    <CardHeader>
                        <div className="h-6 bg-muted rounded w-3/4"></div>
                        <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
                    </CardHeader>
                </Card>
            ))}
         </div>
      )}

      {error && <p className="text-destructive text-center">{error}</p>}

      {!isLoading && places.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {places.map((place, index) => (
            <Card key={`${place.place_id}-${index}`} className="overflow-hidden flex flex-col">
              <CardHeader>
              {place.thumbnail && (
                 <div className="relative h-40 w-full rounded-md overflow-hidden">
                    <Image src={place.thumbnail} alt={place.title || 'Place image'} fill className="object-cover" />
                 </div>
              )}
                <CardTitle className="font-headline pt-2">{place.title}</CardTitle>
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    {getTypeIcon(place.type)}
                    <p>{place.address}</p>
                </div>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-end">
                {place.rating && (
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="flex gap-1 items-center">
                            <Star className="h-4 w-4 text-accent-foreground/80 fill-current" />
                            <span>{place.rating} ({place.reviews} reviews)</span>
                        </Badge>
                    </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && !error && places.length === 0 && !form.formState.isSubmitted && (
         <div className="text-center text-muted-foreground py-16">
            <Search className="mx-auto h-12 w-12 mb-4"/>
            <p>Your search results will appear here.</p>
          </div>
      )}

      {!isLoading && !error && places.length === 0 && form.formState.isSubmitted && (
        <div className="text-center text-muted-foreground py-16">
            <p>No results found for your search.</p>
        </div>
        )}
    </div>
  );
}
