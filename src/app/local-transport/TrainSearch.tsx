// src/app/local-transport/TrainSearch.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import {
  Calendar as CalendarIcon,
  Loader2,
  Search,
  Train,
  Clock,
  IndianRupee,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
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
} from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Combobox } from '@/components/ui/combobox';
import { cn } from '@/lib/utils';
import { cities } from '@/lib/locations';
import { useToast } from '@/hooks/use-toast';
import { bookTransport } from '@/ai/flows/book-transport';
import { trains } from '@/lib/mock-data';

const searchSchema = z.object({
  from: z.string({ required_error: 'Please select a departure city.' }),
  to: z.string({ required_error: 'Please select a destination city.' }),
  date: z.date({ required_error: 'Please select a date.' }),
});

type SearchFormValues = z.infer<typeof searchSchema>;

type BookingState = {
  isLoading: boolean;
  serviceId: string | null;
};

export function TrainSearch() {
  const [searchResults, setSearchResults] = useState<typeof trains>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [bookingState, setBookingState] = useState<BookingState>({
    isLoading: false,
    serviceId: null,
  });
  const { toast } = useToast();

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
  });

  async function onSearch(values: SearchFormValues) {
    setIsSearching(true);
    setSearchResults([]);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    const results = trains.filter(
      train =>
        train.from.split(' ')[0].includes(values.from.split(',')[0]) &&
        train.to.split(' ')[0].includes(values.to.split(',')[0])
    );
    setSearchResults(results);
    setIsSearching(false);
  }

  const handleBooking = async (
    service: 'train',
    details: string,
    id: string
  ) => {
    setBookingState({ isLoading: true, serviceId: id });
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const response = await bookTransport({ service, details });
      toast({
        title: 'Booking Confirmed!',
        description: response.message,
      });
    } catch (error) {
      console.error('Failed to book:', error);
      toast({
        variant: 'destructive',
        title: 'Booking Failed',
        description:
          "We couldn't complete your booking at this time. Please try again.",
      });
    } finally {
      setBookingState({ isLoading: false, serviceId: null });
    }
  };

  const locationOptions = cities.map(c => ({
    value: `${c.name}, ${c.state}`,
    label: `${c.name}, ${c.state}`,
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Search for Trains</CardTitle>
          <CardDescription>
            Find the best train services for your journey.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSearch)}
              className="grid md:grid-cols-3 gap-4 items-end"
            >
              <FormField
                control={form.control}
                name="from"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From</FormLabel>
                    <Combobox
                      options={locationOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Departure city"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To</FormLabel>
                    <Combobox
                      options={locationOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Destination city"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'w-full justify-start text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={date => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isSearching} className="self-end">
                  {isSearching ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="mr-2 h-4 w-4" />
                  )}
                  Search
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isSearching && (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 grid grid-cols-5 gap-4 items-center">
                <div className="col-span-2 space-y-2">
                  <div className="h-5 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
                <div className="h-5 bg-muted rounded w-full"></div>
                <div className="h-5 bg-muted rounded w-full"></div>
                <div className="h-10 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isSearching && searchResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">
            Found {searchResults.length} trains
          </h3>
          {searchResults.map((train, index) => {
            const trainId = `train-${index}`;
            const isBooking =
              bookingState.isLoading && bookingState.serviceId === trainId;
            return (
              <Card key={trainId}>
                <CardContent className="p-4 grid md:grid-cols-4 gap-4 items-center">
                  <div className="md:col-span-2">
                    <p className="font-bold text-lg">{train.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {train.from} <ArrowRight className="inline h-4 w-4" />{' '}
                      {train.to}
                    </p>
                  </div>

                  <div className="text-sm">
                    <p className="font-semibold">{train.class}</p>
                  </div>

                  <div className="flex md:flex-col items-center justify-between md:items-end gap-2">
                    <p className="text-lg font-bold flex items-center">
                      <IndianRupee className="h-5 w-5" />
                      {train.price.replace('₹', '')}
                    </p>
                    <Button
                      onClick={() =>
                        handleBooking(
                          'train',
                          `${train.name}: ${train.from} to ${train.to}`,
                          trainId
                        )
                      }
                      disabled={bookingState.isLoading}
                      className="w-full md:w-auto"
                    >
                      {isBooking ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      {isBooking ? 'Booking...' : 'Book Now'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!isSearching &&
        form.formState.isSubmitted &&
        searchResults.length === 0 && (
          <div className="text-center text-muted-foreground py-16">
            <Train className="mx-auto h-12 w-12 mb-4" />
            <p>No trains found for the selected route and date.</p>
            <p className="text-sm">
              Try modifying your search or selecting a different date.
            </p>
          </div>
        )}
    </div>
  );
}
