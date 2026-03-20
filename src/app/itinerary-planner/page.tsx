"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2, Wand2 } from "lucide-react";
import { generateTrip } from "@/lib/api/travel-buddy";
import type { PersonalizedTripOutput } from "@/lib/api/types";

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

const formSchema = z.object({
  currentLocation: z.string().min(2, "Current location is required."),
  location: z.string().min(2, "Destination is required."),
  dates: z.object({
    from: z.date(),
    to: z.date(),
  }),
  budget: z.coerce.number().min(1, "Budget must be a positive number."),
  interests: z.string().min(3, "Please list at least one interest."),
  numberOfPeople: z.coerce.number().int().min(1, "At least one traveler is required."),
});

type FormValues = z.infer<typeof formSchema>;

export default function ItineraryPlannerPage() {
  const [trip, setTrip] = useState<PersonalizedTripOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentLocation: "New Delhi, Delhi",
      location: "Goa, Goa",
      budget: 30000,
      interests: "sightseeing, food, culture",
      numberOfPeople: 2,
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setTrip(null);
    try {
      const response = await generateTrip({
        currentLocation: values.currentLocation,
        location: values.location,
        startDate: format(values.dates.from, "yyyy-MM-dd"),
        endDate: format(values.dates.to, "yyyy-MM-dd"),
        budget: values.budget,
        interests: values.interests,
        numberOfPeople: values.numberOfPeople,
      });
      setTrip(response);
    } catch (error) {
      console.error("Failed to generate itinerary:", error);
      setTrip(null);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Create Your Dream Trip</CardTitle>
            <CardDescription>
              Plan a trip through the Java backend and get a structured itinerary with budget guidance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="currentLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., New Delhi, Delhi" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Goa, Goa" {...field} />
                      </FormControl>
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
                                !field.value && "text-muted-foreground"
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
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget (INR)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="30000" {...field} />
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
                      <FormLabel>Travelers</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                        Separate interests with commas, like food, beaches, history, temples.
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
                  Generate Itinerary
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="font-headline">{trip?.tripTitle || "Your Personalized Trip"}</CardTitle>
            <CardDescription>
              {trip?.tripSummary || "Here is the travel plan generated by the Java backend."}
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
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Suitability Score</h3>
                  <p>{trip.suitabilityScore}/10</p>
                  <p className="text-sm text-muted-foreground">{trip.suitabilityReasoning}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Budget Breakdown</h3>
                  <div className="space-y-1 text-sm">
                    <p>Accommodation: {trip.budgetBreakdown.accommodation}</p>
                    <p>Food: {trip.budgetBreakdown.food}</p>
                    <p>Transport: {trip.budgetBreakdown.transport}</p>
                    <p>Activities: {trip.budgetBreakdown.activities}</p>
                    <p className="font-semibold">Total: {trip.budgetBreakdown.total}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Weather Advisory</h3>
                  <p className="text-sm text-muted-foreground">{trip.weatherAdvisory}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Daily Itinerary</h3>
                  <div className="space-y-4">
                    {trip.dailyItinerary.map((day) => (
                      <div key={day.day} className="rounded-md border p-4">
                        <h4 className="font-medium">Day {day.day}: {day.title}</h4>
                        <ul className="mt-2 list-disc list-inside text-sm text-muted-foreground">
                          {day.activities.map((activity, index) => (
                            <li key={index}>{activity}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {!isLoading && !trip && (
              <div className="text-center text-muted-foreground py-16">
                <Wand2 className="mx-auto h-12 w-12 mb-4"/>
                <p>Your generated itinerary will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
