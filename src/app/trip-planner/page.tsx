
"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2, Users, Wand2, Star, IndianRupee, CloudSun, Briefcase, Save, XCircle, CheckCircle2 } from "lucide-react";
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
import { saveTrip } from "@/lib/saved-trips";

type LiveWeather = {
  label: string;
  city: string;
  temperature: number;
  windSpeed: number;
  weatherText: string;
  latitude: number;
  longitude: number;
};

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

type CityGuide = {
  arrivalArea: string;
  lunchSpot: string;
  dinnerSpot: string;
  hotelArea: string;
  dayOnePlaces: string[];
  dayTwoPlaces: string[];
  dayThreePlaces: string[];
};

const cityGuides: Record<string, CityGuide> = {
  haridwar: {
    arrivalArea: "Har Ki Pauri",
    lunchSpot: "Mohan Ji Puri Wale / a clean bhojanalaya near Har Ki Pauri",
    dinnerSpot: "Bara Bazaar food lane",
    hotelArea: "Upper Road or Har Ki Pauri side",
    dayOnePlaces: ["Har Ki Pauri", "Bara Bazaar", "Ganga Aarti"],
    dayTwoPlaces: ["Mansa Devi Temple", "Chandi Devi Temple", "Bharat Mata Mandir"],
    dayThreePlaces: ["Daksh Mahadev Temple", "local ashram area", "ganga-side cafe stop"],
  },
  rishikesh: {
    arrivalArea: "Lakshman Jhula area",
    lunchSpot: "Chotiwala or a riverside cafe in Tapovan",
    dinnerSpot: "Tapovan market cafes",
    hotelArea: "Tapovan or Ram Jhula side",
    dayOnePlaces: ["Lakshman Jhula", "Ram Jhula", "Triveni Ghat"],
    dayTwoPlaces: ["Neer Garh Waterfall", "Parmarth Niketan", "Beatles Ashram"],
    dayThreePlaces: ["rafting point area", "yoga cafe belt", "Ganga beach"],
  },
  varanasi: {
    arrivalArea: "Dashashwamedh Ghat",
    lunchSpot: "Kachori Gali / a clean thali place near Godowlia",
    dinnerSpot: "Godowlia market",
    hotelArea: "Godowlia or Assi Ghat side",
    dayOnePlaces: ["Dashashwamedh Ghat", "Godowlia", "evening Ganga Aarti"],
    dayTwoPlaces: ["Kashi Vishwanath Temple", "Assi Ghat", "Banaras Hindu University"],
    dayThreePlaces: ["Sarnath", "local silk market", "morning boat ride"],
  },
  jaipur: {
    arrivalArea: "MI Road / old city edge",
    lunchSpot: "LMB or a local Rajasthani thali restaurant",
    dinnerSpot: "Bapu Bazaar food stretch",
    hotelArea: "MI Road, Bani Park, or old city side",
    dayOnePlaces: ["City Palace area", "Bapu Bazaar", "Hawa Mahal outside view"],
    dayTwoPlaces: ["Amber Fort", "Jal Mahal", "Nahargarh Fort"],
    dayThreePlaces: ["Jantar Mantar", "Albert Hall Museum", "Johari Bazaar"],
  },
};

function parseInr(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  return Number.parseInt(digits || "0", 10);
}

function formatInr(value: number) {
  return `INR ${Math.round(value)}`;
}

function extractRequiredBudget(reasoning: string) {
  const match = reasoning.match(/at least INR\s+(\d+)/i);
  return match ? Number.parseInt(match[1], 10) : null;
}

function getWeatherText(code: number) {
  if (code === 0) return "Clear sky";
  if ([1, 2, 3].includes(code)) return "Partly cloudy";
  if ([45, 48].includes(code)) return "Misty";
  if ([51, 53, 55, 56, 57].includes(code)) return "Light drizzle";
  if ([61, 63, 65, 66, 67].includes(code)) return "Rain showers";
  if ([71, 73, 75, 77].includes(code)) return "Cold / snowfall";
  if ([80, 81, 82].includes(code)) return "Scattered rain";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Weather update available";
}

function getTripDays(from?: Date, to?: Date) {
  if (!from || !to) return 3;
  const diff = Math.round((to.getTime() - from.getTime()) / 86400000) + 1;
  return Math.max(1, diff);
}

function haversineKm(
  aLat: number,
  aLon: number,
  bLat: number,
  bLon: number
) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

function estimateRequiredBudgetDetails(
  people: number,
  interests: string,
  tripDays: number,
  intercityDistanceKm?: number
) {
  const normalizedInterests = interests.toLowerCase();
  const wantsBike = /(rental bike|rent a bike|bike|bicycle|scooty|scooter)/.test(normalizedInterests);
  const wantsAdventure = /(adventure|rafting|trek|hike|ropeway|camp)/.test(normalizedInterests);
  const wantsCulture = /(culture|heritage|history|temple|spiritual|market)/.test(normalizedInterests);
  const wantsFood = /(food|street food|cafe|restaurant|local meal)/.test(normalizedInterests);

  const roomsNeeded = Math.max(1, people >= 4 ? Math.ceil(people / 4) : Math.ceil(people / 2));
  const nights = Math.max(1, tripDays - 1);
  const accommodation = roomsNeeded * 900 * nights;
  const foodPerPersonPerDay = wantsFood ? 380 : 300;
  const food = people * foodPerPersonPerDay * tripDays;
  const intercityTravel = intercityDistanceKm
    ? Math.max(people * 220, Math.round(intercityDistanceKm * 1.6 * people))
    : people * 300;
  const localTransport = wantsBike
    ? Math.max(800, Math.ceil(people / 2) * 700)
    : Math.max(400, people * 120 * tripDays);
  const transport = intercityTravel + localTransport;
  const activitiesPerPerson = wantsAdventure ? 450 : wantsCulture ? 250 : wantsFood ? 220 : 180;
  const activities = Math.max(people * activitiesPerPerson, people * activitiesPerPerson * Math.max(1, tripDays - 1));

  return {
    accommodation,
    food,
    transport,
    activities,
    total: accommodation + food + transport + activities,
    intercityTravel,
    localTransport,
    bikeRentalEstimate: wantsBike ? Math.max(800, Math.ceil(people / 2) * 700) : 0,
  };
}

function optimizeBudgetBreakdown(
  breakdown: PersonalizedTripOutput["budgetBreakdown"],
  budget: number,
  destinationCity: string,
  people: number
) {
  const original = {
    accommodation: parseInr(breakdown.accommodation),
    food: parseInr(breakdown.food),
    transport: parseInr(breakdown.transport),
    activities: parseInr(breakdown.activities),
  };
  const currentTotal = Object.values(original).reduce((sum, value) => sum + value, 0);

  if (currentTotal <= budget) {
    return {
      breakdown: {
        accommodation: formatInr(original.accommodation),
        food: formatInr(original.food),
        transport: formatInr(original.transport),
        activities: formatInr(original.activities),
        total: formatInr(currentTotal),
      },
      underBudget: true,
      savings: budget - currentTotal,
      requiredBudget: currentTotal,
      note: `This ${destinationCity} plan already fits within your budget. You still have about INR ${budget - currentTotal} as a comfort buffer.`,
    };
  }

  const practicalMinimum = estimateRequiredBudgetDetails(people, "", 3);
  const minimumRequiredTotal = practicalMinimum.total;

  if (budget < minimumRequiredTotal) {
    return {
      breakdown: {
        accommodation: formatInr(Math.max(0, Math.round(budget * 0.38))),
        food: formatInr(Math.max(0, Math.round(budget * 0.18))),
        transport: formatInr(Math.max(0, Math.round(budget * 0.22))),
        activities: formatInr(Math.max(0, budget - Math.round(budget * 0.38) - Math.round(budget * 0.18) - Math.round(budget * 0.22))),
        total: formatInr(budget),
      },
      underBudget: false,
      savings: 0,
      requiredBudget: practicalMinimum.total,
      note: `Your selected budget is too low for a workable ${destinationCity} trip for ${people} traveler${people > 1 ? "s" : ""}. To complete this trip with basic stay, meals, local travel, and simple activities, keep at least INR ${minimumRequiredTotal}.`,
    };
  }

  const minimum = {
    accommodation: Math.max(practicalMinimum.accommodation, Math.round(budget * 0.32)),
    food: Math.max(practicalMinimum.food, Math.round(budget * 0.18)),
    transport: Math.max(practicalMinimum.transport, Math.round(budget * 0.16)),
    activities: Math.max(practicalMinimum.activities, Math.round(budget * 0.1)),
  };

  let adjusted = { ...original };

  adjusted.accommodation = Math.min(adjusted.accommodation, Math.max(minimum.accommodation, Math.round(budget * 0.36)));
  adjusted.food = Math.min(adjusted.food, Math.max(minimum.food, Math.round(people * 350 * 3)));
  adjusted.transport = Math.min(adjusted.transport, Math.max(minimum.transport, Math.round(budget * 0.14)));
  adjusted.activities = Math.min(adjusted.activities, Math.max(minimum.activities, Math.round(budget * 0.08)));

  let adjustedTotal = Object.values(adjusted).reduce((sum, value) => sum + value, 0);

  if (adjustedTotal > budget) {
    const overflow = adjustedTotal - budget;
    const reducibleKeys: Array<keyof typeof adjusted> = ["activities", "transport", "food", "accommodation"];
    for (const key of reducibleKeys) {
      const floor = minimum[key];
      const reducible = Math.max(0, adjusted[key] - floor);
      const reduction = Math.min(reducible, adjustedTotal - budget);
      adjusted[key] -= reduction;
      adjustedTotal -= reduction;
      if (adjustedTotal <= budget) break;
    }
  }

  if (adjustedTotal > budget) {
    adjusted.activities = Math.max(0, adjusted.activities - (adjustedTotal - budget));
    adjustedTotal = Object.values(adjusted).reduce((sum, value) => sum + value, 0);
  }

  return {
    breakdown: {
      accommodation: formatInr(adjusted.accommodation),
      food: formatInr(adjusted.food),
      transport: formatInr(adjusted.transport),
      activities: formatInr(adjusted.activities),
      total: formatInr(adjustedTotal),
    },
    underBudget: adjustedTotal <= budget,
    savings: Math.max(0, budget - adjustedTotal),
    requiredBudget: adjustedTotal,
    note:
      adjustedTotal <= budget
        ? `The plan was trimmed to stay practical. A simpler hotel in the ${destinationCity} central area, local meals, and lighter paid activities keep it inside your budget.`
        : `This route is hard to fit fully into the budget, but the plan has already been reduced to the cheapest workable version I could make. To complete this trip comfortably, keep at least INR ${adjustedTotal} as the working budget.`,
  };
}

function pickCityGuide(city: string): CityGuide {
  return (
    cityGuides[city.trim().toLowerCase()] ?? {
      arrivalArea: `central ${city}`,
      lunchSpot: `a clean local restaurant in ${city}`,
      dinnerSpot: `the main market area in ${city}`,
      hotelArea: `the central stay area of ${city}`,
      dayOnePlaces: [`central ${city}`, "main market", "popular evening spot"],
      dayTwoPlaces: ["top-rated attraction 1", "top-rated attraction 2", "best local food lane"],
      dayThreePlaces: ["nearby spiritual/cultural stop", "shopping street", "relaxed cafe stop"],
    }
  );
}

function buildHumanizedItinerary(
  city: string,
  budgetBreakdown: PersonalizedTripOutput["budgetBreakdown"],
  people: number,
  interests: string
): PersonalizedTripOutput["dailyItinerary"] {
  const guide = pickCityGuide(city);
  const normalizedInterests = interests.toLowerCase();
  const wantsBike = /(rental bike|rent a bike|bike|bicycle|scooty|scooter)/.test(normalizedInterests);
  const wantsFood = /(food|street food|cafe|restaurant|local meal)/.test(normalizedInterests);
  const wantsCulture = /(culture|heritage|history|temple|spiritual|market)/.test(normalizedInterests);
  const wantsAdventure = /(adventure|rafting|trek|hike|ropeway|camp)/.test(normalizedInterests);
  const wantsSightseeing = /(sightseeing|spot seeing|attraction|main spot|photo)/.test(normalizedInterests);
  const needsGroupStay = people >= 4;
  const hotelTotal = parseInr(budgetBreakdown.accommodation);
  const foodTotal = parseInr(budgetBreakdown.food);
  const transportTotal = parseInr(budgetBreakdown.transport);
  const activitiesTotal = parseInr(budgetBreakdown.activities);
  const nights = 2;
  const hotelPerNight = Math.max(1200, Math.round(hotelTotal / Math.max(1, nights)));
  const lunchPerMeal = Math.max(180, Math.round(foodTotal / Math.max(4, people * 6)));
  const localTransportPerDay = Math.max(200, Math.round(transportTotal / 3));
  const activityPerDay = Math.max(400, Math.round(activitiesTotal / 3));
  const roomNote = needsGroupStay
    ? `For ${people} people, look for two budget rooms or one family room near ${guide.hotelArea}. A practical stay target is around INR ${hotelPerNight} per night in total.`
    : `Book a clean budget room around ${guide.hotelArea}. A practical stay target is around INR ${hotelPerNight} per night.`;
  const bikeNote = wantsBike
    ? `Because you mentioned rental bike travel, keep time after check-in to arrange a bike or scooty near ${guide.hotelArea}. A simple local rental can sit around INR ${Math.max(400, Math.round(localTransportPerDay + 250))} to INR ${Math.max(700, Math.round(localTransportPerDay + 500))} for the day, depending on model and fuel.`
    : `Use local auto, e-rickshaw, or short cab hops for today. A practical local transport buffer is around INR ${localTransportPerDay}.`;
  const lunchNote = wantsFood
    ? `Plan lunch at ${guide.lunchSpot} and keep around INR ${lunchPerMeal} to INR ${lunchPerMeal + 180} per person so everyone can try local dishes without overspending.`
    : `Plan a simple lunch at ${guide.lunchSpot} and keep around INR ${lunchPerMeal} to INR ${lunchPerMeal + 120} per person.`;
  const dayTwoFocus = wantsAdventure
    ? `Keep the second day for the more active side of ${city}, such as ${guide.dayTwoPlaces[0]} and ${guide.dayTwoPlaces[1]}, with enough time for entry, queues, and a proper break.`
    : wantsCulture
      ? `Keep the second day for deeper cultural coverage through ${guide.dayTwoPlaces[0]}, ${guide.dayTwoPlaces[1]}, and ${guide.dayTwoPlaces[2]}.`
      : `Keep the second day for the main highlights like ${guide.dayTwoPlaces[0]}, ${guide.dayTwoPlaces[1]}, and ${guide.dayTwoPlaces[2]}.`;
  const dayTwoTravel = wantsBike
    ? `Use the rental bike for the main sightseeing loop, but keep the route compact so ${people} traveler${people > 1 ? "s" : ""} can stay together and parking stays easy.`
    : `Use local transport between sightseeing stops and keep the route compact so ${people} traveler${people > 1 ? "s" : ""} can move comfortably.`;
  const dayThreeFocus = wantsSightseeing
    ? `Use the final day for any missed spots, local shopping, and one last easy stop around ${guide.dayThreePlaces[0]} or ${guide.dayThreePlaces[1]} before return.`
    : `Use the final day for a lighter finish with ${guide.dayThreePlaces[0]}, ${guide.dayThreePlaces[1]}, and a calm break at ${guide.dayThreePlaces[2]}.`;

  return [
    {
      day: 1,
      title: `Arrival, hotel check-in, and easy local sightseeing in ${city}`,
      activities: [
        `After reaching ${city}, first head to your stay area and finish hotel check-in before starting sightseeing. ${roomNote}`,
        lunchNote,
        `Start with nearby places like ${guide.dayOnePlaces[0]} and ${guide.dayOnePlaces[1]} so the first day stays relaxed after travel and does not feel rushed for ${people} people.`,
        `In the evening, visit ${guide.dayOnePlaces[2]} and keep about INR ${activityPerDay} for entry tickets, local shopping, or small temple offerings if needed.`,
        bikeNote,
      ],
    },
    {
      day: 2,
      title: wantsBike
        ? `Bike-friendly sightseeing day with main stops across ${city}`
        : `Main sightseeing day with meals, transport, and photo stops in ${city}`,
      activities: [
        `Start early with breakfast near your hotel. Keep INR ${lunchPerMeal} to INR ${lunchPerMeal + 120} per person for breakfast and tea before leaving.`,
        dayTwoFocus,
        dayTwoTravel,
        `Plan lunch near the sightseeing zone and keep about INR ${lunchPerMeal + 100} to INR ${lunchPerMeal + 220} per person for a comfortable meal break for the full group.`,
        `Reserve about INR ${activityPerDay} to INR ${activityPerDay + 300} for tickets, guide charges, ropeway, rentals, or other paid experiences tied to your travel style.`,
        wantsFood
          ? `Keep the evening for a proper food stop at ${guide.dinnerSpot}, so your plan includes the food angle you asked for and not just sightseeing.`
          : `Keep the evening free for photos, snacks, and a market walk so the day does not feel rushed.`,
      ],
    },
    {
      day: 3,
      title: wantsCulture
        ? `Culture, shopping, and return preparation from ${city}`
        : `Nearby exploration, shopping, and return preparation from ${city}`,
      activities: [
        `After breakfast, check out and keep luggage with the hotel if needed before covering lighter nearby places.`,
        dayThreeFocus,
        wantsBike
          ? `If you rented a bike, keep some time to return it properly before the onward journey and avoid last-minute delays.`
          : `Use the late morning or afternoon for souvenir shopping, cafe time, or a final peaceful stop at ${guide.dayThreePlaces[2]}.`,
        `Keep roughly INR ${localTransportPerDay} for local travel and INR ${lunchPerMeal + 100} per person for one final meal before departure.`,
        `Before leaving, confirm return transport timing for all ${people} traveler${people > 1 ? "s" : ""}, pack essentials, and keep one small buffer for water, snacks, and last-minute purchases.`,
      ],
    },
  ];
}

function humanizeTripPlan(
  trip: PersonalizedTripOutput,
  values: FormValues,
  t: (key: string) => string
): PersonalizedTripOutput {
  const destinationCity = values.location.split(",")[0] || "your destination";
  const optimized = optimizeBudgetBreakdown(
    trip.budgetBreakdown,
    values.budget,
    destinationCity,
    values.numberOfPeople
  );
  const total = parseInr(optimized.breakdown.total);
  const realisticBudget = optimized.requiredBudget ?? total;
  const hotelPerNight = Math.max(1200, Math.round((optimized.requiredBudget && optimized.requiredBudget > values.budget
    ? realisticBudget * 0.36
    : parseInr(optimized.breakdown.accommodation)) / 2));
  const mealEstimate = Math.max(180, Math.round((optimized.requiredBudget && optimized.requiredBudget > values.budget
    ? realisticBudget * 0.18
    : parseInr(optimized.breakdown.food)) / Math.max(4, values.numberOfPeople * 6)));
  const interestSummary = values.interests
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3)
    .join(", ");

  return {
    ...trip,
    tripSummary: `This ${destinationCity} plan is arranged for ${values.numberOfPeople} traveler${values.numberOfPeople > 1 ? "s" : ""} and shaped around your style${interestSummary ? `: ${interestSummary}` : ""}. It covers where to stay after arrival, what to do each day, how to plan meals, and how to keep the trip practical under budget.`,
    budgetBreakdown: optimized.breakdown,
    suitabilityReasoning:
      total > values.budget
        ? `This budget is too low for the selected trip. ${optimized.note} The plan still stays focused on ${values.numberOfPeople} traveler${values.numberOfPeople > 1 ? "s" : ""} and your chosen style${interestSummary ? ` (${interestSummary})` : ""}. A more realistic stay target is about INR ${hotelPerNight} per night, with simple meals around INR ${mealEstimate} to INR ${mealEstimate + 150} per person.`
        : `${trip.suitabilityReasoning} ${optimized.note} A workable hotel target is about INR ${hotelPerNight} per night and simple meals can stay around INR ${mealEstimate} to INR ${mealEstimate + 150} per person. The plan is arranged for ${values.numberOfPeople} traveler${values.numberOfPeople > 1 ? "s" : ""}${interestSummary ? ` with focus on ${interestSummary}` : ""}.`,
    dailyItinerary: buildHumanizedItinerary(
      destinationCity,
      optimized.breakdown,
      values.numberOfPeople,
      values.interests
    ),
  };
}

function buildFallbackTrip(values: FormValues, t: (key: string) => string): PersonalizedTripOutput {
  const destinationCity = values.location.split(",")[0] || "your destination";
  const totalBudget = values.budget;
  const accommodation = Math.round(totalBudget * 0.38);
  const food = Math.round(totalBudget * 0.18);
  const transport = Math.round(totalBudget * 0.2);
  const activities = Math.max(1500, totalBudget - accommodation - food - transport);

  const fallbackTrip: PersonalizedTripOutput = {
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
    dailyItinerary: [],
  };

  return humanizeTripPlan(fallbackTrip, values, t);
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
  const [lastSubmittedValues, setLastSubmittedValues] = useState<FormValues | null>(null);
  const [tripSavePromptVisible, setTripSavePromptVisible] = useState(false);
  const [tripSaved, setTripSaved] = useState(false);
  const [liveWeather, setLiveWeather] = useState<LiveWeather[]>([]);
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
    setLastSubmittedValues(values);
    setTripSavePromptVisible(false);
    setTripSaved(false);
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
      setTrip(humanizeTripPlan(response, values, t));
      setTripSavePromptVisible(true);
    } catch (error) {
      console.error("Failed to generate trip:", error);
      setTrip(buildFallbackTrip(values, t));
      setError(t("tripPlanner.result.backendUnavailable"));
      setTripSavePromptVisible(true);
    } finally {
      setIsLoading(false);
    }
  }

  const localizedTrip = trip ? localizeTripContent(trip, t, language) : null;

  const tripDateLabel = useMemo(() => {
    if (!lastSubmittedValues) return "";
    return `${format(lastSubmittedValues.dates.from, "dd MMM yyyy")} - ${format(lastSubmittedValues.dates.to, "dd MMM yyyy")}`;
  }, [lastSubmittedValues]);

  const requiredBudgetDetails = useMemo(() => {
    if (!lastSubmittedValues || !localizedTrip) return null;
    const requiredBudget = extractRequiredBudget(localizedTrip.suitabilityReasoning);
    if (!requiredBudget || requiredBudget <= lastSubmittedValues.budget) return null;

    const startPoint = liveWeather.find((item) => item.label === "Starting city");
    const endPoint = liveWeather.find((item) => item.label === "Destination");
    const intercityDistanceKm =
      startPoint && endPoint
        ? haversineKm(startPoint.latitude, startPoint.longitude, endPoint.latitude, endPoint.longitude)
        : undefined;

    return estimateRequiredBudgetDetails(
      lastSubmittedValues.numberOfPeople,
      lastSubmittedValues.interests,
      getTripDays(lastSubmittedValues.dates.from, lastSubmittedValues.dates.to),
      intercityDistanceKm
    );
  }, [lastSubmittedValues, localizedTrip, liveWeather]);

  useEffect(() => {
    if (!lastSubmittedValues) {
      setLiveWeather([]);
      return;
    }

    let cancelled = false;

    async function fetchWeatherFor(label: string, cityValue: string): Promise<LiveWeather | null> {
      const city = cityValue.split(",")[0]?.trim();
      if (!city) return null;

      try {
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );
        const geoJson = await geoRes.json();
        const result = geoJson?.results?.[0];
        if (!result) return null;

        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${result.latitude}&longitude=${result.longitude}&current=temperature_2m,weather_code,wind_speed_10m`
        );
        const weatherJson = await weatherRes.json();
        const current = weatherJson?.current;
        if (!current) return null;

        return {
          label,
          city,
          temperature: Math.round(current.temperature_2m),
          windSpeed: Math.round(current.wind_speed_10m),
          weatherText: getWeatherText(current.weather_code),
          latitude: result.latitude,
          longitude: result.longitude,
        };
      } catch {
        return null;
      }
    }

    Promise.all([
      fetchWeatherFor("Starting city", lastSubmittedValues.currentLocation),
      fetchWeatherFor("Destination", lastSubmittedValues.location),
    ]).then((results) => {
      if (cancelled) return;
      setLiveWeather(results.filter(Boolean) as LiveWeather[]);
    });

    return () => {
      cancelled = true;
    };
  }, [lastSubmittedValues]);

  const handleSaveTrip = () => {
    if (!trip || !lastSubmittedValues) {
      return;
    }

    saveTrip({
      id: `${Date.now()}-${lastSubmittedValues.location}`,
      createdAt: new Date().toISOString(),
      currentLocation: lastSubmittedValues.currentLocation,
      destination: lastSubmittedValues.location,
      startDate: format(lastSubmittedValues.dates.from, "yyyy-MM-dd"),
      endDate: format(lastSubmittedValues.dates.to, "yyyy-MM-dd"),
      budget: lastSubmittedValues.budget,
      numberOfPeople: lastSubmittedValues.numberOfPeople,
      interests: lastSubmittedValues.interests,
      trip,
    });
    setTripSaved(true);
    setTripSavePromptVisible(false);
  };

  const handleSkipSave = () => {
    setTripSaved(false);
    setTripSavePromptVisible(false);
  };

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

  const BudgetBreakdown = ({
    breakdown,
    requiredBudget,
    requiredDetails,
  }: {
    breakdown: PersonalizedTripOutput['budgetBreakdown'];
    requiredBudget?: number | null;
    requiredDetails?: ReturnType<typeof estimateRequiredBudgetDetails> | null;
  }) => (
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
        {requiredDetails && requiredBudget && requiredBudget > parseInr(breakdown.total) && (
          <div className="mt-3 space-y-2 border-t pt-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Required budget details</p>
            <div className="flex justify-between text-amber-100">
              <span>Accommodation Needed</span>
              <span>{formatInr(requiredDetails.accommodation)}</span>
            </div>
            <div className="flex justify-between text-amber-100">
              <span>Food Needed</span>
              <span>{formatInr(requiredDetails.food)}</span>
            </div>
            <div className="flex justify-between text-amber-100">
              <span>Transport Needed</span>
              <span>{formatInr(requiredDetails.transport)}</span>
            </div>
            <div className="flex justify-between text-amber-100">
              <span>Activities Needed</span>
              <span>{formatInr(requiredDetails.activities)}</span>
            </div>
            <div className="flex justify-between text-amber-100">
              <span>Origin to Destination Travel</span>
              <span>{formatInr(requiredDetails.intercityTravel)}</span>
            </div>
            {requiredDetails.bikeRentalEstimate > 0 && (
              <div className="flex justify-between text-amber-100">
                <span>Bike Rental / Local Ride Style</span>
                <span>{formatInr(requiredDetails.bikeRentalEstimate)}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2 font-semibold text-amber-300">
              <span>Required Budget</span>
              <span>{formatInr(requiredDetails.total)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  
  const WeatherAdvisory = ({ advisory }: { advisory: string }) => (
      <div className="rounded-lg border bg-card p-4">
          <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><CloudSun className="text-primary" /> {t("tripPlanner.result.weatherAdvisory")}</h3>
          {liveWeather.length > 0 && (
            <div className="mb-4 grid gap-3 md:grid-cols-2">
              {liveWeather.map((item) => (
                <div key={item.label} className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{item.label}</p>
                  <p className="mt-1 font-semibold">{item.city}</p>
                  <div className="mt-2 flex items-end gap-3">
                    <span className="text-2xl font-bold text-primary">{item.temperature}°C</span>
                    <span className="text-sm text-muted-foreground">{item.weatherText}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">Wind around {item.windSpeed} km/h</p>
                </div>
              ))}
            </div>
          )}
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
                {lastSubmittedValues && parseInr(localizedTrip.budgetBreakdown.total) > lastSubmittedValues.budget && (
                  <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
                    <p className="text-sm font-semibold text-amber-300">
                      Minimum practical budget needed
                    </p>
                    <p className="mt-1 text-sm text-amber-100/90">
                      Your selected budget is {formatInr(lastSubmittedValues.budget)}, but this trip needs about{" "}
                      <span className="font-semibold">{localizedTrip.budgetBreakdown.total}</span> to be completed comfortably for{" "}
                      {lastSubmittedValues.numberOfPeople} traveler{lastSubmittedValues.numberOfPeople > 1 ? "s" : ""}.
                    </p>
                  </div>
                )}
                {lastSubmittedValues && (
                  <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          {tripSaved
                            ? "This trip is saved in your history."
                            : "Do you want to save this planned trip in your history?"}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {lastSubmittedValues.currentLocation} to {lastSubmittedValues.location}
                          {tripDateLabel ? ` | ${tripDateLabel}` : ""}
                        </p>
                      </div>
                      {tripSavePromptVisible ? (
                        <div className="flex flex-wrap gap-2">
                          <Button type="button" onClick={handleSaveTrip}>
                            <Save className="mr-2 h-4 w-4" />
                            Save this trip
                          </Button>
                          <Button type="button" variant="outline" onClick={handleSkipSave}>
                            <XCircle className="mr-2 h-4 w-4" />
                            Skip for now
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-primary">
                          {tripSaved ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                          <span>{tripSaved ? "Saved" : "Skipped"}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <SuitabilityScore score={localizedTrip.suitabilityScore} reasoning={localizedTrip.suitabilityReasoning} />
                <div className="grid md:grid-cols-2 gap-6">
                    <BudgetBreakdown
                      breakdown={localizedTrip.budgetBreakdown}
                      requiredBudget={extractRequiredBudget(localizedTrip.suitabilityReasoning)}
                      requiredDetails={requiredBudgetDetails}
                    />
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
