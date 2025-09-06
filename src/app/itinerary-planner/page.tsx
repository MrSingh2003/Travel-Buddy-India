"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2, Wand2 } from "lucide-react";
import { generatePersonalizedItinerary } from "@/ai/flows/generate-personalized-itinerary";

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
  location: z.string().min(2, "Location is required."),
  dates: z.object({
    from: z.date(),
    to: z.date(),
  }),
  budget: z.coerce.number().min(1, "Budget must be a positive number."),
  interests: z.string().min(3, "Please list at least one interest."),
});

type FormValues = z.infer<typeof formSchema>;

export default function ItineraryPlannerPage() {
  const [itinerary, setItinerary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "",
      budget: 1000,
      interests: "sightseeing, food, culture",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setItinerary(null);
    try {
      const response = await generatePersonalizedItinerary({
        location: values.location,
        dates: `${format(values.dates.from, "yyyy-MM-dd")} to ${format(
          values.dates.to,
          "yyyy-MM-dd"
        )}`,
        budget: values.budget,
        interests: values.interests,
      });
      setItinerary(response.itinerary);
    } catch (error) {
      console.error("Failed to generate itinerary:", error);
      setItinerary("Sorry, we couldn't generate your itinerary at this time. Please try again later.");
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
              Fill in your travel details, and our AI will craft a personalized
              itinerary just for you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Goa, India" {...field} />
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
                      <FormLabel>Budget (USD)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="1000" {...field} />
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
                        Separate interests with commas (e.g., hiking, beaches, history).
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
            <CardTitle className="font-headline">Your Personalized Itinerary</CardTitle>
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
            {itinerary && (
              <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                {itinerary}
              </div>
            )}
            {!isLoading && !itinerary && (
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
