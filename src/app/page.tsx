
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Plane, Car, Hotel, Map, Building } from "lucide-react";
import Image from "next/image";

const features = [
  {
    title: "AI Trip Planner",
    description:
      "Let our AI craft the perfect trip for you based on your preferences and budget.",
    href: "/trip-planner",
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
    title: "Hotels",
    description: "Discover and Book hotels across India.",
    href: "/accommodations",
    icon: Hotel,
  },
   {
    title: "Dharamshalas",
    description: "Find simple and affordable stays in dharamshalas.",
    href: "/accommodations",
    icon: Building,
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
    <div className="flex flex-col gap-8 animate-in fade-in-50">
      <Card className="overflow-hidden border-0 shadow-xl">
        <div className="relative h-[500px] w-full">
          <Image
            src="https://picsum.photos/1200/800"
            alt="A vibrant depiction of a travel destination in India"
            fill
            className="object-cover"
            data-ai-hint="India travel vibrant"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/0" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-6">
            <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4 drop-shadow-lg">
              Explore the Wonders of India
            </h1>
            <p className="text-lg md:text-xl max-w-3xl drop-shadow-md">
              Your ultimate travel companion is here. Plan your journey, book transport, and find stays—all in one seamless experience.
            </p>
            <Button asChild className="mt-8 px-8 py-6 text-lg" size="lg">
              <Link href="/trip-planner">
                Start Planning <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </Card>

      <div>
        <h2 className="text-3xl font-bold font-headline text-center mb-8">Features</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="flex flex-col bg-card/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                     <feature.icon className="h-8 w-8 text-primary shrink-0" />
                  </div>
                  <CardTitle className="font-headline text-xl">
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
                    Go <ArrowRight className="ml-auto h-4 w-4" />
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
