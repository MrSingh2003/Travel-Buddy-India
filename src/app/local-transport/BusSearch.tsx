// src/app/local-transport/BusSearch.tsx
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
  Bus,
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
  CardFooter,
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
import { Badge } from '@/components/ui/badge';

const searchSchema = z.object({
  from: z.string({ required_error: 'Please select a departure city.' }),
  to: z.string({ required_error: 'Please select a destination city.' }),
  date: z.date({ required_error: 'Please select a date.' }),
});

type SearchFormValues = z.infer<typeof searchSchema>;

const mockBuses = [
  {
    id: 'bus-1',
    operator: 'VRL Travels',
    type: 'Volvo A/C Sleeper (2+1)',
    from: 'Bengaluru',
    to: 'Mumbai',
    departureTime: '18:00',
    arrivalTime: '10:00',
    duration: '16h 0m',
    price: '₹2100',
    rating: 4.5,
    seatsAvailable: 15,
  },
  {
    id: 'bus-2',
    operator: 'Sharma Transports',
    type: 'Scania A/C Seater (2+2)',
    from: 'Bengaluru',
    to: 'Mumbai',
    departureTime: '19:30',
    arrivalTime: '12:30',
    duration: '17h 0m',
    price: '₹1850',
    rating: 4.2,
    seatsAvailable: 25,
  },
  {
    id: 'bus-3',
    operator: 'KSRTC (Airavat Club Class)',
    type: 'Mercedes-Benz Multi-Axle',
    from: 'Bengaluru',
    to: 'Mumbai',
    departureTime: '20:00',
    arrivalTime: '12:00',
    duration: '16h 0m',
    price: '₹2500',
    rating: 4.8,
    seatsAvailable: 8,
  },
];

type BookingState = {
  isLoading: boolean;
  serviceId: string | null;
};

export function BusSearch() {
  const [searchResults, setSearchResults] = useState<typeof mockBuses>([]);
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
    const results = mockBuses.filter(
      bus =>
        bus.from.split(',')[0] === values.from.split(',')[0] &&
        bus.to.split(',')[0] === values.to.split(',')[0]
    );
    setSearchResults(results);
    setIsSearching(false);
  }

  const handleBooking = async (
    service: 'bus',
    details: string,
    id: string
  ) => {
    setBookingState({ isLoading: true, serviceId: id });
    try {
      // Simulate network delay for a more realistic experience
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
          <CardTitle className="font-headline">Search for Buses</CardTitle>
          <CardDescription>
            Find the best bus services for your journey.
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
          {[...Array(3)].map((_, i) => (
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
            Found {searchResults.length} buses
          </h3>
          {searchResults.map(bus => {
            const isBooking =
              bookingState.isLoading && bookingState.serviceId === bus.id;
            return (
              <Card key={bus.id}>
                <CardContent className="p-4 grid md:grid-cols-5 gap-4 items-center">
                  <div className="md:col-span-2">
                    <p className="font-bold text-lg">{bus.operator}</p>
                    <p className="text-sm text-muted-foreground">{bus.type}</p>
                    <Badge variant="outline" className="mt-1">
                      {bus.rating} ★
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between md:justify-center text-sm">
                    <div>
                      <p>{bus.departureTime}</p>
                      <p className="text-muted-foreground">{bus.from}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 mx-2" />
                    <div>
                      <p>{bus.arrivalTime}</p>
                      <p className="text-muted-foreground">{bus.to}</p>
                    </div>
                  </div>

                  <div className="text-center text-sm">
                    <p>{bus.duration}</p>
                  </div>

                  <div className="flex md:flex-col items-center justify-between md:items-end gap-2">
                    <p className="text-lg font-bold flex items-center">
                      <IndianRupee className="h-5 w-5" />
                      {bus.price.replace('₹', '')}
                    </p>
                    <Button
                      onClick={() =>
                        handleBooking(
                          'bus',
                          `${bus.operator}: ${bus.from} to ${bus.to}`,
                          bus.id
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
            <Bus className="mx-auto h-12 w-12 mb-4" />
            <p>No buses found for the selected route and date.</p>
            <p className="text-sm">
              Try modifying your search or selecting a different date.
            </p>
          </div>
        )}
    </div>
  );
}
