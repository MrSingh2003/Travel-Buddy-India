
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, MapPin } from "lucide-react";
import Image from "next/image";

export default function NavigationPage() {
  const [start, setStart] = useState("");
  const [destination, setDestination] = useState("Taj Mahal, Agra, Uttar Pradesh");
  const [directions, setDirections] = useState<string[] | null>(null);

  const handleGetDirections = () => {
    // In a real application, you would call a mapping API here.
    // For this prototype, we'll just show some mock directions.
    setDirections([
      "Start from your location.",
      "Head towards the main highway.",
      "Follow signs for Agra/Yamuna Expressway.",
      `Continue on the expressway until you reach ${destination}.`,
      "Follow local signs to your destination."
    ]);
  };

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Navigation</CardTitle>
            <CardDescription>
              Enter your start and destination to get directions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="start">Starting Point</Label>
              <Input 
                id="start" 
                placeholder="e.g., Your current location" 
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <Input 
                id="destination" 
                placeholder="e.g., Taj Mahal, Agra" 
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={handleGetDirections}>
              Get Directions <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            {directions && (
              <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2">Your Route</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    {directions.map((step, index) => <li key={index}>{step}</li>)}
                  </ol>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <Card className="h-full overflow-hidden">
            <div className="relative w-full h-full min-h-[600px]">
                <Image 
                    src="https://picsum.photos/1200/900"
                    alt="Map showing a route between two points"
                    fill
                    className="object-cover"
                    data-ai-hint="road map"
                />
                <div className="absolute top-4 left-4 bg-background/80 p-2 rounded-lg shadow-lg">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
            </div>
        </Card>
      </div>
    </div>
  );
}
