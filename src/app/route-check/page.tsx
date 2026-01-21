// src/app/route-check/page.tsx
'use client';

import {
  useJsApiLoader,
  GoogleMap,
  DirectionsRenderer,
  Autocomplete,
} from '@react-google-maps/api';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Map, Loader2, Route, Pin, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

const center = { lat: 20.5937, lng: 78.9629 }; // Center of India

export default function RouteCheckPage() {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ['places'],
  });

  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const originRef = useRef<HTMLInputElement>(null);
  const destinationRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  async function calculateRoute() {
    if (!originRef.current?.value || !destinationRef.current?.value) {
      toast({
        variant: 'destructive',
        title: 'Input Missing',
        description: 'Please enter both an origin and a destination.',
      });
      return;
    }
    
    setIsLoading(true);
    setDirectionsResponse(null); // Clear previous route
    setDistance('');
    setDuration('');

    const directionsService = new google.maps.DirectionsService();
    try {
      const results = await directionsService.route({
        origin: originRef.current.value,
        destination: destinationRef.current.value,
        travelMode: google.maps.TravelMode.DRIVING,
      });
      setDirectionsResponse(results);
      if (results.routes[0] && results.routes[0].legs[0]) {
        setDistance(results.routes[0].legs[0].distance?.text || '');
        setDuration(results.routes[0].legs[0].duration?.text || '');
      }
    } catch (error) {
      console.error('Directions request failed:', error);
      toast({
        variant: 'destructive',
        title: 'Route Not Found',
        description: "We couldn't find a route for the locations you entered. Please check them and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function clearRoute() {
    setDirectionsResponse(null);
    setDistance('');
    setDuration('');
    if (originRef.current) originRef.current.value = '';
    if (destinationRef.current) destinationRef.current.value = '';
  }

  if (loadError) {
    return <div className="text-center p-8 text-destructive">Error loading maps. Please check your API key and network connection.</div>;
  }
  
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading Map...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-120px)] md:h-[calc(100vh-144px)]">
      <Card className="w-full md:w-[400px] flex flex-col">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Map className="h-6 w-6 text-primary" />
            Route Planner
          </CardTitle>
          <CardDescription>
            Find the best driving route between two points in India.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 flex-grow">
          <div className="space-y-2">
            <Label htmlFor='origin'>Origin</Label>
            <Autocomplete>
              <Input type="text" placeholder="Enter starting location" ref={originRef} id="origin" />
            </Autocomplete>
          </div>
          <div className="space-y-2">
            <Label htmlFor='destination'>Destination</Label>
            <Autocomplete>
              <Input type="text" placeholder="Enter destination" ref={destinationRef} id="destination" />
            </Autocomplete>
          </div>
          <div className="flex gap-2">
            <Button onClick={calculateRoute} disabled={isLoading} className="w-full">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Route className="mr-2 h-4 w-4" />
              )}
              Calculate Route
            </Button>
            <Button variant="outline" onClick={clearRoute} disabled={isLoading} title="Clear Route">
              <X className="h-4 w-4"/>
            </Button>
          </div>
          {distance && duration && (
            <Card className="bg-muted/50">
              <CardContent className="p-4 space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <p className="font-semibold">Distance:</p>
                  <p>{distance}</p>
                </div>
                 <div className="flex justify-between items-center">
                  <p className="font-semibold">Duration:</p>
                  <p>{duration}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
        <div className="p-4 text-xs text-muted-foreground border-t">
          <Pin className="inline h-3 w-3 mr-1" />
          Pro-tip: Use the autocomplete suggestions for more accurate results.
        </div>
      </Card>
      <div className="flex-grow h-full rounded-lg overflow-hidden shadow-md border">
        <GoogleMap
          center={center}
          zoom={5}
          mapContainerStyle={{ width: '100%', height: '100%' }}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
        >
          {directionsResponse && <DirectionsRenderer directions={directionsResponse} />}
        </GoogleMap>
      </div>
    </div>
  );
}
