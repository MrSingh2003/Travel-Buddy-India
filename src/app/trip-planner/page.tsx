
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2, Users, Wand2, Star, IndianRupee, CloudSun, Briefcase } from "lucide-react";
import { getLocalizedCityOptions } from "@/lib/locations";
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
import { Combobox } from "@/components/ui/combobox";
import { useLanguage } from "@/components/language-provider";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { getDateFnsLocale } from "@/lib/date-locales";

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

function interpolate(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template
  );
}

function buildFallbackTrip(values: FormValues, t: (key: string) => string): PersonalizedTripOutput {
  const destinationCity = values.location.split(",")[0] || "your destination";
  const totalBudget = values.budget;
  const accommodation = Math.round(totalBudget * 0.38);
  const food = Math.round(totalBudget * 0.18);
  const transport = Math.round(totalBudget * 0.2);
  const activities = Math.max(1500, totalBudget - accommodation - food - transport);

  return {
    tripTitle: `${destinationCity} ${t('tripPlanner.result.fallbackTitleSuffix')}`,
    suitabilityScore: totalBudget >= 30000 ? 8 : 7,
    suitabilityReasoning: t('tripPlanner.result.fallbackReasoning'),
    tripSummary: interpolate(t('tripPlanner.result.fallbackSummary'), { city: destinationCity }),
    budgetBreakdown: {
      accommodation: `INR ${accommodation}`,
      food: `INR ${food}`,
      transport: `INR ${transport}`,
      activities: `INR ${activities}`,
      total: `INR ${accommodation + food + transport + activities}`,
    },
    weatherAdvisory:
      "Pack comfortable walking shoes, light layers, sunscreen, and keep one backup travel document copy with you.",
    dailyItinerary: [
      {
        day: 1,
        title: interpolate(t('tripPlanner.result.fallbackDay1'), { city: destinationCity }),
        activities: [
          t("tripPlanner.result.fallbackActivityCheckIn"),
          t("tripPlanner.result.fallbackActivityExplore"),
          t("tripPlanner.result.fallbackActivityBudget"),
        ],
      },
      {
        day: 2,
        title: "Core sightseeing and local food",
        activities: [
          t("tripPlanner.result.fallbackActivitySightseeing"),
          t("tripPlanner.result.fallbackActivityMeal"),
          t("tripPlanner.result.fallbackActivityEvening"),
        ],
      },
      {
        day: 3,
        title: "Flexible exploration and return prep",
        activities: [
          t("tripPlanner.result.fallbackActivityBuffer"),
          t("tripPlanner.result.fallbackActivityOptional"),
          t("tripPlanner.result.fallbackActivityConfirm"),
        ],
      },
    ],
  };
}

function localizeTripContent(
  trip: PersonalizedTripOutput,
  t: (key: string) => string,
  language: string
): PersonalizedTripOutput {
  if (language === "en") {
    return trip;
  }

  const titleMatch = trip.tripTitle.match(/^(.*)\sSmart (Escape|Trip)$/);
  const city = titleMatch?.[1] ?? trip.tripTitle;
  const translatedTitle = titleMatch
    ? `${city} ${titleMatch[2] === "Escape" ? t("tripPlanner.result.smartEscapeSuffix") : t("tripPlanner.result.smartTripSuffix")}`
    : trip.tripTitle;

  const summaryMatch = trip.tripSummary.match(
    /^A decision-focused (\d+)-day plan for (.+) with transparent costs, weather-aware packing advice, and a realistic pace for (\d+) traveler\(s\)\.$/
  );
  const fallbackSummaryMatch = trip.tripSummary.match(
    /^A practical travel plan for (.+) focused on decision support, cost visibility, and an easy day-by-day structure\.$/
  );

  const translatedSummary = summaryMatch
    ? interpolate(t("tripPlanner.result.decisionSummary"), {
        days: summaryMatch[1],
        city: summaryMatch[2],
        travelers: summaryMatch[3],
      })
    : fallbackSummaryMatch
      ? interpolate(t("tripPlanner.result.fallbackSummary"), { city: fallbackSummaryMatch[1] })
      : trip.tripSummary;

  const translatedReasoning =
    trip.suitabilityReasoning === "Moderate fit. The plan works, but your budget or timing may require trade-offs."
      ? t("tripPlanner.result.moderateFit")
      : trip.suitabilityReasoning === "Excellent match for your stated budget, trip length, and interests."
        ? t("tripPlanner.result.excellentFit")
        : trip.suitabilityReasoning === "This fallback trip plan matches your budget and interests and is generated locally while the backend reconnects."
          ? t("tripPlanner.result.fallbackReasoning")
          : trip.suitabilityReasoning;

  const translatedDailyItinerary = trip.dailyItinerary.map((day) => {
    const arrivalMatch = day.title.match(/^Arrival and orientation in (.+)$/);

    const title = arrivalMatch
      ? interpolate(t("tripPlanner.result.arrivalOrientation"), { city: arrivalMatch[1] })
      : day.title === "Signature experiences"
        ? t("tripPlanner.result.signatureExperiences")
        : day.title === "Local depth and relaxed exploration"
          ? t("tripPlanner.result.localDepth")
          : day.title === "Core sightseeing and local food"
            ? t("tripPlanner.result.fallbackDay2")
            : day.title === "Flexible exploration and return prep"
              ? t("tripPlanner.result.fallbackDay3")
              : day.title;

    const activities = day.activities.map((activity) => {
      const breakfastMatch = activity.match(/^Breakfast at a highly rated local spot in (.+)$/);
      const foodTrailMatch = activity.match(
        /^Curated food trail across (.+) with regional specialties and street-food safety tips$/
      );
      const cultureMatch = activity.match(
        /^Guided heritage and culture circuit through key landmarks in (.+)$/
      );
      const natureMatch = activity.match(
        /^Nature-focused excursion near (.+) with sunrise and scenic viewpoints$/
      );
      const flexibleMatch = activity.match(
        /^Flexible discovery day (\d+) built around top-rated attractions in (.+)$/
      );

      if (breakfastMatch) {
        return interpolate(t("tripPlanner.result.activityBreakfast"), { city: breakfastMatch[1] });
      }

      if (foodTrailMatch) {
        return interpolate(t("tripPlanner.result.activityFoodTrail"), { city: foodTrailMatch[1] });
      }

      if (cultureMatch) {
        return interpolate(t("tripPlanner.result.activityCulture"), { city: cultureMatch[1] });
      }

      if (natureMatch) {
        return interpolate(t("tripPlanner.result.activityNature"), { city: natureMatch[1] });
      }

      if (flexibleMatch) {
        return interpolate(t("tripPlanner.result.activityFlexible"), {
          day: flexibleMatch[1],
          city: flexibleMatch[2],
        });
      }

      switch (activity) {
        case "Transparent spend check: compare actual costs vs planned budget":
          return t("tripPlanner.result.activitySpendCheck");
        case "Evening leisure and photo stop in a popular neighborhood":
          return t("tripPlanner.result.activityEvening");
        case "Check in and settle into your stay":
          return t("tripPlanner.result.fallbackActivityCheckIn");
        case "Explore a nearby landmark or market":
          return t("tripPlanner.result.fallbackActivityExplore");
        case "Review your real spend versus the planned budget":
          return t("tripPlanner.result.fallbackActivityBudget");
        case "Visit top-rated attractions matched to your interests":
          return t("tripPlanner.result.fallbackActivitySightseeing");
        case "Plan one good local meal and one low-cost option":
          return t("tripPlanner.result.fallbackActivityMeal");
        case "Use evening time for shopping or a relaxed city walk":
          return t("tripPlanner.result.fallbackActivityEvening");
        case "Keep a buffer for weather or timing changes":
          return t("tripPlanner.result.fallbackActivityBuffer");
        case "Visit one optional stop before departure":
          return t("tripPlanner.result.fallbackActivityOptional");
        case "Confirm transport and next-day travel timing":
          return t("tripPlanner.result.fallbackActivityConfirm");
        default:
          return activity;
      }
    });

    return {
      ...day,
      title,
      activities,
    };
  });

  return {
    ...trip,
    tripTitle: translatedTitle,
    tripSummary: translatedSummary,
    suitabilityReasoning: translatedReasoning,
    dailyItinerary: translatedDailyItinerary,
  };
}

export default function TripPlannerPage() {
  const [trip, setTrip] = useState<PersonalizedTripOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { t, language } = useLanguage();
  const cityOptions = getLocalizedCityOptions(language);
  const dateLocale = getDateFnsLocale(language);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      budget: 50000,
      interests: "sightseeing, food, culture",
      numberOfPeople: 1,
      currentLocation: "",
      location: "",
      dates: {
        from: new Date(Date.now() + 86400000),
        to: new Date(Date.now() + 3 * 86400000),
      },
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setTrip(null);
    setError(null);
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
      console.error("Failed to generate trip:", error);
      setTrip(buildFallbackTrip(values, t));
      setError(t("tripPlanner.result.backendUnavailable"));
    } finally {
      setIsLoading(false);
    }
  }

  const localizedTrip = trip ? localizeTripContent(trip, t, language) : null;

  const SuitabilityScore = ({ score, reasoning }: { score: number; reasoning: string }) => (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><Star className="text-primary"/> {t("tripPlanner.result.suitabilityScore")}</h3>
      <div className="flex items-center gap-4">
        <div className="text-3xl font-bold text-primary">{score}/10</div>
        <Progress value={score * 10} className="w-full" />
      </div>
      <p className="text-sm text-muted-foreground mt-2">{reasoning}</p>
    </div>
  );

  const BudgetBreakdown = ({ breakdown }: { breakdown: PersonalizedTripOutput['budgetBreakdown'] }) => (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2"><IndianRupee className="text-primary"/> {t("tripPlanner.result.budgetBreakdown")}</h3>
       <div className="space-y-2 text-sm">
        {Object.entries(breakdown).map(([key, value]) => (
          <div key={key} className={`flex justify-between ${key === 'total' ? 'font-bold text-base pt-2 border-t' : ''}`}>
            <span className="capitalize">
              {key === "accommodation" ? t("tripPlanner.result.budgetAccommodation")
                : key === "food" ? t("tripPlanner.result.budgetFood")
                : key === "transport" ? t("tripPlanner.result.budgetTransport")
                : key === "activities" ? t("tripPlanner.result.budgetActivities")
                : key === "total" ? t("tripPlanner.result.budgetTotal")
                : key}
            </span>
            <span>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
  
  const WeatherAdvisory = ({ advisory }: { advisory: string }) => (
      <div className="rounded-lg border bg-card p-4">
          <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><CloudSun className="text-primary" /> {t("tripPlanner.result.weatherAdvisory")}</h3>
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
                        options={cityOptions}
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
                        options={cityOptions}
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
                    <FormItem className="flex flex-col">
                      <FormLabel>{t('tripPlanner.travelDates')}</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              id="date"
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
                                    {format(field.value.from, "PP", { locale: dateLocale })} -{" "}
                                    {format(field.value.to, "PP", { locale: dateLocale })}
                                  </>
                                ) : (
                                  format(field.value.from, "PP", { locale: dateLocale })
                                )
                              ) : (
                                <span>{t('tripPlanner.pickDateRange')}</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={field.value?.from}
                            selected={field.value}
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
            <CardTitle className="font-headline">{localizedTrip?.tripTitle || t('tripPlanner.yourTrip')}</CardTitle>
            <CardDescription>
              {localizedTrip?.tripSummary || t('tripPlanner.yourTripDescription')}
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
            {localizedTrip && !isLoading && (
              <div className="space-y-6">
                <SuitabilityScore score={localizedTrip.suitabilityScore} reasoning={localizedTrip.suitabilityReasoning} />
                <div className="grid md:grid-cols-2 gap-6">
                    <BudgetBreakdown breakdown={localizedTrip.budgetBreakdown} />
                    <WeatherAdvisory advisory={localizedTrip.weatherAdvisory} />
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2"><Briefcase className="text-primary"/> {t("tripPlanner.result.dailyItinerary")}</h3>
                  <div className="space-y-4">
                  {localizedTrip.dailyItinerary.map((day) => (
                      <div key={day.day} className="p-4 rounded-md border">
                          <h4 className="font-semibold text-primary">{t("tripPlanner.result.dayPrefix")} {day.day}: {day.title}</h4>
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
