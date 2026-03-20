'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Search, Phone, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Combobox } from '@/components/ui/combobox';
import { getLocalizedCityOptions } from '@/lib/locations';
import { useToast } from '@/hooks/use-toast';
import { bookTransport, searchCabs } from '@/lib/api/travel-buddy';
import type { TransportOption } from '@/lib/api/types';
import { useLanguage } from '@/components/language-provider';

const searchSchema = z.object({
  location: z.string({ required_error: 'Please select a city.' }),
});

type SearchFormValues = z.infer<typeof searchSchema>;

type BookingState = {
  isLoading: boolean;
  serviceId: string | null;
};

export function CabSearch() {
  const [searchResults, setSearchResults] = useState<TransportOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [bookingState, setBookingState] = useState<BookingState>({
    isLoading: false,
    serviceId: null,
  });
  const { toast } = useToast();
  const { language } = useLanguage();

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
  });

  async function onSearch(values: SearchFormValues) {
    setIsSearching(true);
    setSearchResults([]);
    try {
      const results = await searchCabs(values.location);
      setSearchResults(results);
    } catch (error) {
      console.error('Failed to load cabs:', error);
      toast({
        variant: 'destructive',
        title: 'Search Failed',
        description: 'Could not load cab services from the Java backend.',
      });
    } finally {
      setIsSearching(false);
    }
  }

  const handleBooking = async (
    service: 'cab',
    details: string,
    id: string
  ) => {
    setBookingState({ isLoading: true, serviceId: id });
    try {
      const response = await bookTransport(service, details);
      toast({
        title: 'Booking Confirmed!',
        description: `${response.message} Booking ID: ${response.bookingId}`,
      });
    } catch (error) {
      console.error('Failed to book:', error);
      toast({
        variant: 'destructive',
        title: 'Booking Failed',
        description:
          "We couldn't complete your booking. Please try again later.",
      });
    } finally {
      setBookingState({ isLoading: false, serviceId: null });
    }
  };

  const locationOptions = getLocalizedCityOptions(language);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Find a Local Cab</CardTitle>
          <CardDescription>
            Verified cab services in areas without ride-sharing apps.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSearch)}
              className="flex flex-col md:flex-row gap-4 items-end"
            >
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormLabel>City</FormLabel>
                    <Combobox
                      options={locationOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select a city"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSearching} className="w-full md:w-auto">
                {isSearching ? (
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

      {isSearching && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-5 bg-muted rounded w-1/4"></div>
              </CardContent>
              <CardFooter>
                <div className="h-10 bg-muted rounded w-full"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {!isSearching && searchResults.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {searchResults.map(cab => {
            const isBooking =
              bookingState.isLoading && bookingState.serviceId === cab.id;
            return (
              <Card key={cab.id}>
                <CardHeader>
                  <CardTitle>{cab.name}</CardTitle>
                  <CardDescription>{cab.location}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="font-semibold">{cab.price}</p>
                  <p className="text-sm text-muted-foreground">
                    {cab.verified ? 'Verified local operator' : 'Community-listed operator'}
                  </p>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <Button
                    onClick={() => handleBooking('cab', cab.name, cab.id)}
                    disabled={bookingState.isLoading}
                    className="w-full"
                  >
                    {isBooking ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {isBooking ? 'Booking...' : 'Book Now'}
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <a href={`tel:${cab.contact ?? ''}`}>
                      <Phone className="mr-2 h-4 w-4" />
                      Call Now
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {!isSearching &&
        form.formState.isSubmitted &&
        searchResults.length === 0 && (
          <div className="text-center text-muted-foreground py-16">
            <Car className="mx-auto h-12 w-12 mb-4" />
            <p>No cab services found for the selected city.</p>
            <p className="text-sm">
              Try searching in a different location.
            </p>
          </div>
        )}
    </div>
  );
}
