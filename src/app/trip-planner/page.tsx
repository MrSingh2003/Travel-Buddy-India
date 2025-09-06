
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2, Users, Wand2 } from "lucide-react";
import { generatePersonalizedTrip } from "@/ai/flows/generate-personalized-trip";
import { cities } from "@/lib/locations";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";

const formSchema = z.object({
  currentLocation: z.string({ required_error: "Please select your current location." }),
  location: z.string({ required_error: "Please select a destination." }),
  dates: z.object({
    from: z.date({ required_error: "A 'from' date is required." }),
    to: z.date({ required_error: "A 'to' date is required." }),
  }),
  budget: z.coerce.number().min(1, "Budget must be a positive number."),
  interests: z.string().min(3, "Please list at least one interest."),
  numberOfPeople: z.coerce.number().int().min(1, "At least one person is required."),
});

type FormValues = z.infer<typeof formSchema>;

export default function TripPlannerPage() {
  const [trip, setTrip] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      budget: 1000,
      interests: "sightseeing, food, culture",
      numberOfPeople: 1,
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setTrip(null);
    try {
      const response = await generatePersonalizedTrip({
        currentLocation: values.currentLocation,
        location: values.location,
        dates: `${format(values.dates.from, "yyyy-MM-dd")} to ${format(
          values.dates.to,
          "yyyy-MM-dd"
        )}`,
        budget: values.budget,
        interests: values.interests,
        numberOfPeople: values.numberOfPeople,
      });
      setTrip(response.trip);
    } catch (error) {
      console.error("Failed to generate trip:", error);
      setTrip(
        "Sorry, we couldn't generate your trip at this time. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  }

  const renderTrip = (tripText: string) => {
    const sections = tripText.split(/\n\s*\n/); // Split by double newlines
    return sections.map((section, index) => {
      const lines = section.trim().split('\n');
      const title = lines[0];
      const items = lines.slice(1);
      
      const isDayPlan = /day \d+/i.test(title);

      return (
        <div key={index} className="mb-4">
          <h3 className={`font-semibold text-lg mb-2 ${isDayPlan ? 'text-primary' : ''}`}>{title}</h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            {items.map((item, i) => (
              <li key={i} className="ml-4">{item.replace(/^- /, '')}</li>
            ))}
          </ul>
        </div>
      );
    });
  };

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Create Your Dream Trip</CardTitle>
            <CardDescription>
              Fill in your travel details, and our AI will craft a personalized
              trip just for you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="currentLocation"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Current Location</FormLabel>
                      <Combobox
                        options={cities.map((c) => ({
                          value: `${c.name}, ${c.state}`,
                          label: `${c.name}, ${c.state}`,
                        }))}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select current location"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Destination</FormLabel>
                      <Combobox
                        options={cities.map((c) => ({
                          value: `${c.name}, ${c.state}`,
                          label: `${c.name}, ${c.state}`,
                        }))}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select destination"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="dates"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Travel Dates</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value?.from && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value?.from ? (
                                field.value.to ? (
                                  <>
                                    {format(field.value.from, "LLL dd, y")} -{" "}
                                    {format(field.value.to, "LLL dd, y")}
                                  </>
                                ) : (
                                  format(field.value.from, "LLL dd, y")
                                )
                              ) : (
                                <span>Pick a date range</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={field.value?.from}
                            selected={{ from: field.value?.from, to: field.value?.to }}
                            onSelect={field.onChange}
                            numberOfMonths={2}
                            disabled={(date) =>
                                  date < new Date(new Date().setHours(0, 0, 0, 0))
                                }
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget (INR)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="1000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="numberOfPeople"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>No. of People</FormLabel>
                          <FormControl>
                             <div className="relative">
                              <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                              <Input type="number" placeholder="1" {...field} className="pl-10" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
                <FormField
                  control={form.control}
                  name="interests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interests</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us what you love to do..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Separate interests with commas (e.g., hiking, beaches,
                        history).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                  )}
                  Generate Trip
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="font-headline">Your Personalized Trip</CardTitle>
            <CardDescription>
              Here is the travel plan generated by our AI.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4 animate-pulse"></div>
                  <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                </div>
                <div className="space-y-2 pt-4">
                  <div className="h-4 bg-muted rounded w-1/4 animate-pulse"></div>
                  <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
                  <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                </div>
              </div>
            )}
            {trip && (
              <div className="prose-sm max-w-none">
                {renderTrip(trip)}
              </div>
            )}
            {!isLoading && !trip && (
              <div className="text-center text-muted-foreground py-16">
                <Wand2 className="mx-auto h-12 w-12 mb-4" />
                <p>Your generated trip will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
