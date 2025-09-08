// src/app/navigation/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from 'next/navigation'
import {
  GoogleMap,
  useJsApiLoader,
  MarkerF,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, ArrowRight, Search, Navigation as NavigationIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

type LatLngLiteral = google.maps.LatLngLiteral;

export default function NavigationPage() {
    const searchParams = useSearchParams()
    const destLat = searchParams.get('lat')
    const destLng = searchParams.get('lng')
    const destTitle = searchParams.get('title')

    const hasApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY !== "YOUR_API_KEY_HERE";
    // We purposefully don't load the script if billing is not enabled by the user.
    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: '', // Intentionally left blank
        libraries: ['places'],
    });

    const [currentLocation, setCurrentLocation] = useState<LatLngLiteral | null>(null);
    const [destination, setDestination] = useState<LatLngLiteral | null>(null);
    const [destinationAddress, setDestinationAddress] = useState('');
    const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCurrentLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => {
                    console.error("Error getting current location:", error);
                }
            );
        }
    }, []);

    useEffect(() => {
        if (destLat && destLng) {
            const lat = parseFloat(destLat);
            const lng = parseFloat(destLng);
            if (!isNaN(lat) && !isNaN(lng)) {
                setDestination({ lat, lng });
                if(destTitle) {
                    setDestinationAddress(destTitle)
                }
            }
        }
    }, [destLat, destLng, destTitle]);

     const handleGetDirections = async () => {
        if (!currentLocation || !destination || !isLoaded) return;

        setIsCalculating(true);
        const directionsService = new google.maps.DirectionsService();
        directionsService.route(
            {
                origin: currentLocation,
                destination: destination,
                travelMode: google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
                if (status === google.maps.DirectionsStatus.OK) {
                    setDirections(result);
                } else {
                    console.error(`error fetching directions ${result}`);
                }
                setIsCalculating(false);
            }
        );
    };

    const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
        if (place.geometry?.location) {
            const newDestination = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
            };
            setDestination(newDestination);
            setDestinationAddress(place.formatted_address || '');
        }
    }


  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-1 flex flex-col gap-8">
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
                value="Your Current Location" 
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <Input 
                id="destination" 
                placeholder="e.g., Taj Mahal, Agra" 
                value={destinationAddress}
                onChange={(e) => setDestinationAddress(e.target.value)}
                disabled={!isLoaded}
              />
            </div>
            <Button className="w-full" disabled={!currentLocation || !destination || isCalculating} onClick={handleGetDirections}>
              <ArrowRight className="mr-2 h-4 w-4" />
              Get Directions
            </Button>
          </CardContent>
        </Card>
         <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="font-headline">Not sure where to go?</CardTitle>
            <CardDescription>
              Discover new and exciting places around you or at your destination.
            </CardDescription>
          </CardHeader>
          <CardContent>
              <p className="text-sm text-muted-foreground">
                Use the explore feature to find cafes, landmarks, and hidden gems.
              </p>
          </CardContent>
          <CardFooter>
             <Button asChild className="w-full">
                <Link href="/explore">
                    <Search className="mr-2 h-4 w-4"/>
                    Explore Places
                </Link>
             </Button>
          </CardFooter>
        </Card>
      </div>
      <div className="md:col-span-2">
        <Card className="h-full overflow-hidden p-0">
           <CardContent className="p-0 h-full min-h-[600px]">
                 <div className="relative w-full h-full flex items-center justify-center p-4 bg-muted">
                     <Alert variant="destructive" className="max-w-md">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Map Feature Disabled</AlertTitle>
                        <AlertDescription>
                            The navigation feature is currently unavailable. A valid Google Maps API key with billing enabled is required to use this feature.
                        </AlertDescription>
                    </Alert>
                 </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
