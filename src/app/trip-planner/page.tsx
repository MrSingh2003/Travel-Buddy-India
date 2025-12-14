
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2, Users, Wand2, Star, IndianRupee, CloudSun, Briefcase } from "lucide-react";
import { generatePersonalizedTrip, type PersonalizedTripOutput } from "@/ai/flows/generate-personalized-trip";
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
import { useLanguage } from "@/components/language-provider";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

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
  const [trip, setTrip] = useState<PersonalizedTripOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      budget: 50000,
      interests: "sightseeing, food, culture",
      numberOfPeople: 1,
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setTrip(null);
    setError(null);
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
      setTrip(response);
    } catch (error) {
      console.error("Failed to generate trip:", error);
      setError(t('tripPlanner.generationError'));
    } finally {
      setIsLoading(false);
    }
  }

  const SuitabilityScore = ({ score, reasoning }: { score: number; reasoning: string }) => (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><Star className="text-primary"/> Trip Suitability Score</h3>
      <div className="flex items-center gap-4">
        <div className="text-3xl font-bold text-primary">{score}/10</div>
        <Progress value={score * 10} className="w-full" />
      </div>
      <p className="text-sm text-muted-foreground mt-2">{reasoning}</p>
    </div>
  );

  const BudgetBreakdown = ({ breakdown }: { breakdown: PersonalizedTripOutput['budgetBreakdown'] }) => (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2"><IndianRupee className="text-primary"/> Budget Breakdown</h3>
       <div className="space-y-2 text-sm">
        {Object.entries(breakdown).map(([key, value]) => (
          <div key={key} className={`flex justify-between ${key === 'total' ? 'font-bold text-base pt-2 border-t' : ''}`}>
            <span className="capitalize">{key}</span>
            <span>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
  
  const WeatherAdvisory = ({ advisory }: { advisory: string }) => (
      <div className="rounded-lg border bg-card p-4">
          <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><CloudSun className="text-primary" /> Weather & Packing Advisory</h3>
          <p className="text-sm text-muted-foreground">{advisory}</p>
      </div>
  );

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">{t('tripPlanner.title')}</CardTitle>
            <CardDescription>
              {t('tripPlanner.description')}
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
                      <FormLabel>{t('tripPlanner.currentLocation')}</FormLabel>
                      <Combobox
                        options={cities.map((c) => ({
                          value: `${c.name}, ${c.state}`,
                          label: `${c.name}, ${c.state}`,
                        }))}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t('tripPlanner.selectCurrentLocation')}
                        searchPlaceholder={t('tripPlanner.searchLocation')}
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
                      <FormLabel>{t('tripPlanner.destination')}</FormLabel>
                      <Combobox
                        options={cities.map((c) => ({
                          value: `${c.name}, ${c.state}`,
                          label: `${c.name}, ${c.state}`,
                        }))}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t('tripPlanner.selectDestination')}
                        searchPlaceholder={t('tripPlanner.searchLocation')}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="dates"
                  render={({ field }) => (
                    <div className="grid grid-cols-2 gap-4">
                      <FormItem className="flex flex-col">
                        <FormLabel>From</FormLabel>
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
                                  format(field.value.from, "LLL dd, y")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              initialFocus
                              mode="single"
                              selected={field.value.from}
                              onSelect={(date) => field.onChange({ ...field.value, from: date })}
                              disabled={(date) =>
                                date < new Date(new Date().setHours(0, 0, 0, 0)) || (!!field.value?.to && date > field.value.to)
                              }
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                      <FormItem className="flex flex-col">
                        <FormLabel>To</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !field.value?.to && "text-muted-foreground"
                                )}
                                disabled={!field.value?.from}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value?.to ? (
                                  format(field.value.to, "LLL dd, y")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              initialFocus
                              mode="single"
                              selected={field.value.to}
                              onSelect={(date) => field.onChange({ ...field.value, to: date })}
                              disabled={(date) =>
                                date < (field.value?.from || new Date(new Date().setHours(0, 0, 0, 0)))
                              }
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    </div>
                  )}
                />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('tripPlanner.budget')}</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="50000" {...field} />
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
                          <FormLabel>{t('tripPlanner.people')}</FormLabel>
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
                      <FormLabel>{t('tripPlanner.interests')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('tripPlanner.interestsPlaceholder')}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {t('tripPlanner.interestsDescription')}
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
                  {t('tripPlanner.generateButton')}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="font-headline">{trip?.tripTitle || t('tripPlanner.yourTrip')}</CardTitle>
            <CardDescription>
              {trip?.tripSummary || t('tripPlanner.yourTripDescription')}
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
             {error && (
              <div className="text-center text-destructive-foreground bg-destructive/80 p-4 rounded-md">
                <p>{error}</p>
              </div>
            )}
            {trip && !isLoading && (
              <div className="space-y-6">
                <SuitabilityScore score={trip.suitabilityScore} reasoning={trip.suitabilityReasoning} />
                <div className="grid md:grid-cols-2 gap-6">
                    <BudgetBreakdown breakdown={trip.budgetBreakdown} />
                    <WeatherAdvisory advisory={trip.weatherAdvisory} />
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2"><Briefcase className="text-primary"/> Daily Itinerary</h3>
                  <div className="space-y-4">
                  {trip.dailyItinerary.map((day) => (
                      <div key={day.day} className="p-4 rounded-md border">
                          <h4 className="font-semibold text-primary">Day {day.day}: {day.title}</h4>
                          <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground text-sm">
                              {day.activities.map((activity, i) => (
                                  <li key={i}>{activity}</li>
                              ))}
                          </ul>
                      </div>
                  ))}
                  </div>
                </div>
              </div>
            )}
            {!isLoading && !trip && !error && (
              <div className="text-center text-muted-foreground py-16">
                <Wand2 className="mx-auto h-12 w-12 mb-4" />
                <p>{t('tripPlanner.generatedTripPlaceholder')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
