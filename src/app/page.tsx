import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Plane, Car, Hotel, Map } from "lucide-react";
import Image from "next/image";

const features = [
  {
    title: "AI Itinerary Planner",
    description:
      "Let our AI craft the perfect trip for you based on your preferences and budget.",
    href: "/itinerary-planner",
    icon: Plane,
  },
  {
    title: "Local Transport",
    description:
      "Find verified local cabs, buses, and trains for your travel needs.",
    href: "/local-transport",
    icon: Car,
  },
  {
    title: "Accommodations",
    description: "Discover and compare hotels and dharamshalas across India.",
    href: "/accommodations",
    icon: Hotel,
  },
  {
    title: "Offline Maps",
    description:
      "Download maps and routes to navigate with confidence, even without internet.",
    href: "/offline-maps",
    icon: Map,
  },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in-50">
      <Card className="overflow-hidden">
        <div className="grid md:grid-cols-2 items-stretch">
          <div className="p-6 sm:p-8 md:p-10 flex flex-col justify-center">
            <h1 className="text-3xl md:text-4xl font-bold font-headline text-primary mb-2">
              Welcome to Travel Buddy India
            </h1>
            <p className="text-muted-foreground text-lg">
              Your ultimate travel companion for exploring the wonders of India.
              Plan your journey, book transport, and find stays all in one
              place.
            </p>
            <Button asChild className="mt-6 w-fit">
              <Link href="/itinerary-planner">
                Start Planning <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="relative h-64 md:h-auto">
            <Image
              src="https://picsum.photos/600/400"
              alt="A vibrant depiction of a travel destination in India"
              fill
              className="object-cover"
              data-ai-hint="India travel"
            />
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <Card
            key={feature.title}
            className="flex flex-col hover:shadow-lg transition-shadow duration-300"
          >
            <CardHeader>
              <div className="flex items-start gap-4">
                <feature.icon className="h-8 w-8 text-primary shrink-0 mt-1" />
                <CardTitle className="font-headline leading-tight">
                  {feature.title}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="secondary" className="w-full">
                <Link href={feature.href}>
                  Go{" "}
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
