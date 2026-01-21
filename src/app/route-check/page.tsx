// src/app/route-check/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, MapPinned } from "lucide-react";
import { useEffect, useState } from "react";

export default function RouteCheckPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
       <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
             <MapPinned className="h-8 w-8 text-primary"/>
             <CardTitle className="font-headline text-3xl">Route Check</CardTitle>
          </div>
          <CardDescription className="pt-2">
            Plan and save your routes. Navigate with confidence even in areas with poor or no internet connectivity.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div>
                <h3 className="font-semibold text-lg mb-2">How to Prepare for Offline Navigation</h3>
                <p className="text-muted-foreground">
                    While our app doesn't have a live map, you can prepare for your trip by saving route information from services like Google Maps beforehand. We strongly recommend this for remote areas.
                </p>
                <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                    <li>Use your browser's "Print to PDF" function to save map images and directions.</li>
                    <li>Take screenshots of your route on Google Maps or a similar service.</li>
                    <li>For text directions, copy and paste them into a note-taking app on your phone.</li>
                </ul>
            </div>
            <div className="border rounded-lg p-4 bg-muted/50">
                <h4 className="font-semibold mb-2">Sample Route: Delhi to Agra</h4>
                <div className="prose prose-sm max-w-none text-muted-foreground">
                    <p>This is an example of text-based directions you can save for offline access.</p>
                    <ol className="space-y-1 pl-4">
                        <li><strong>Start:</strong> Connaught Place, New Delhi.</li>
                        <li>Head south-east on the C-Hexagon towards India Gate.</li>
                        <li>Take NH44 and then merge onto Yamuna Expressway towards Agra.</li>
                        <li>Continue on Yamuna Expressway for approximately 200km.</li>
                        <li>Take the exit towards Taj Mahal / Agra City.</li>
                        <li>Follow local signs to the Taj Mahal East Gate parking area.</li>
                    </ol>
                </div>
                <div className="mt-4 flex gap-2">
                    <Button onClick={handlePrint} variant="outline" disabled={!isClient}>
                        <Printer className="mr-2 h-4 w-4"/>
                        Print / Save as PDF
                    </Button>
                </div>
            </div>
            <div className="text-sm text-muted-foreground">
                <strong>Pro Tip:</strong> Before you leave an area with Wi-Fi, open Google Maps, find your destination area, and type "ok maps" in the search bar to download the map for offline use on your phone.
            </div>
        </CardContent>
       </Card>
    </div>
  );
}
