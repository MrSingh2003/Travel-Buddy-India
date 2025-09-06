"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { useEffect, useState } from "react";

export default function OfflineMapsPage() {
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
          <CardTitle className="font-headline text-3xl">Offline Maps & Routes</CardTitle>
          <CardDescription>
            Navigate with confidence even in areas with poor connectivity.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div>
                <h3 className="font-semibold text-lg mb-2">How to Use Offline Maps</h3>
                <p className="text-muted-foreground">
                    While true offline map downloading is a feature for native mobile apps, you can prepare for your trip by saving route information beforehand. We recommend the following methods:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                    <li>Use your browser's "Print to PDF" function to save map images and directions.</li>
                    <li>Take screenshots of your route on Google Maps or a similar service.</li>
                    <li>Copy and paste text-based directions into a note-taking app on your phone.</li>
                </ul>
            </div>
            <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Sample Route: Delhi to Agra</h4>
                <div className="prose prose-sm max-w-none text-muted-foreground">
                    <p>This is a sample text-based route you can save for offline access.</p>
                    <ol>
                        <li>Start from Connaught Place, New Delhi.</li>
                        <li>Head south-east on the C-Hexagon towards India Gate.</li>
                        <li>Take the NH44 and then merge onto Yamuna Expressway towards Agra.</li>
                        <li>Continue on Yamuna Expressway for approximately 200km.</li>
                        <li>Take the exit towards Taj Mahal/Agra City.</li>
                        <li>Follow the signs to the Taj Mahal East Gate parking.</li>
                    </ol>
                </div>
                <div className="mt-4 flex gap-2">
                    <Button onClick={handlePrint} variant="outline" disabled={!isClient}>
                        <Printer className="mr-2 h-4 w-4"/>
                        Print / Save as PDF
                    </Button>
                </div>
            </div>
        </CardContent>
       </Card>
    </div>
  );
}
