
// src/app/page.tsx
"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Car, Hotel, Plane, Search, Map } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

export default function DashboardPage() {
  const { t } = useLanguage();
  const heroButtonClass =
    "mt-8 rounded-2xl border border-emerald-300/80 bg-emerald-500 px-8 py-6 text-lg text-white shadow-[0_18px_45px_rgba(34,197,94,0.28)] transition-all duration-300 hover:bg-emerald-600 hover:shadow-[0_22px_55px_rgba(34,197,94,0.34)] dark:border-violet-300/25 dark:bg-violet-300/85 dark:text-slate-950 dark:shadow-[0_20px_50px_rgba(196,181,253,0.28)] dark:hover:bg-violet-200";
  const featureIconClass =
    "rounded-2xl border border-emerald-200/80 bg-emerald-50 p-3 dark:border-violet-300/20 dark:bg-violet-200/10";
  const featureIconColorClass =
    "h-8 w-8 shrink-0 text-emerald-600 dark:text-violet-200";
  const featureButtonClass =
    "w-full rounded-2xl border border-emerald-200/80 bg-emerald-50 text-emerald-700 shadow-sm transition-all duration-300 hover:bg-emerald-100 hover:text-emerald-800 dark:border-violet-300/20 dark:bg-violet-200/10 dark:text-violet-100 dark:shadow-[0_10px_30px_rgba(167,139,250,0.16)] dark:hover:bg-violet-200/20 dark:hover:text-violet-50";

  const features = [
    {
      key: "aiTripPlanner",
      href: "/trip-planner",
      icon: Plane,
    },
    {
      key: "explore",
      href: "/explore",
      icon: Search,
    },
    {
      key: "localTransport",
      href: "/local-transport",
      icon: Car,
    },
    {
      key: "accommodations",
      href: "/accommodations",
      icon: Hotel,
    },
    {
      key: "routePlanner",
      href: "/route-planner",
      icon: Map,
    },
  ];

  return (
    <div className="flex flex-col gap-8 animate-in fade-in-50">
      <Card className="overflow-hidden border-0 shadow-xl">
        <div className="relative h-[500px] w-full">
          <img
            src="https://picsum.photos/seed/42/1200/800"
            alt="A vibrant depiction of a travel destination in India"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/0" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-6">
            <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4 drop-shadow-lg">
              {t('heroTitle')}
            </h1>
            <p className="text-lg md:text-xl max-w-3xl drop-shadow-md">
             {t('heroSubtitle')}
            </p>
            <Button asChild size="lg" className={heroButtonClass}>
              <Link to="/trip-planner">
                {t('startPlanning')} <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </Card>

      <div>
        <h2 className="text-3xl font-bold font-headline text-center mb-8">{t('featuresTitle')}</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.key}
              className="flex flex-col bg-card/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={featureIconClass}>
                     <feature.icon className={featureIconColorClass} />
                  </div>
                  <CardTitle className="font-headline text-xl">
                    {t(`features.${feature.key}.title`)}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">
                  {t(`features.${feature.key}.description`)}
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="secondary" className={featureButtonClass}>
                  <Link to={feature.href}>
                    {t('go')} <ArrowRight className="ml-auto h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
