// src/app/navigation/page.tsx
"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, ArrowRight } from "lucide-react";

export default function NavigationPage() {

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
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <Input 
                id="destination" 
                placeholder="e.g., Taj Mahal, Agra" 
                disabled
              />
            </div>
            <Button className="w-full" disabled>
              <ArrowRight className="mr-2 h-4 w-4" />
              Get Directions
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <Card className="h-full overflow-hidden p-0">
           <CardContent className="p-0 h-full">
            <div className="relative w-full h-full flex items-center justify-center p-4 min-h-[600px] bg-muted">
                 <Alert variant="destructive" className="max-w-md">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Map Feature Disabled</AlertTitle>
                    <AlertDescription>
                        The navigation feature is currently unavailable because the Google Maps API key has been removed. To use this feature, please provide a valid Google Maps API key.
                    </AlertDescription>
                </Alert>
            </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
