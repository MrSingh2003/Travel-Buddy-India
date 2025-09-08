
"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Loader2 } from "lucide-react";
import { GoogleMap, useJsApiLoader, DirectionsRenderer, Autocomplete } from "@react-google-maps/api";

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '600px',
  borderRadius: '0.5rem',
};

const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629,
};

const LIBRARIES = ["places"] as ("places" | "drawing" | "geometry" | "localContext" | "visualization")[];

export default function NavigationPage() {
  const [start, setStart] = useState("");
  const [destination, setDestination] = useState("Taj Mahal, Agra, Uttar Pradesh");
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [startAutocomplete, setStartAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [destAutocomplete, setDestAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);


  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: LIBRARIES,
  });

  const handleGetDirections = useCallback(async () => {
    if (!start || !destination) {
      return;
    }
    setIsLoading(true);
    setDirections(null);

    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: start,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        setIsLoading(false);
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
        } else {
          console.error(`error fetching directions ${result}`);
          alert(`Could not get directions for the given locations. Please try again. \nStatus: ${status}`);
        }
      }
    );
  }, [start, destination]);

  const onMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);
  
  const onStartAutocompleteLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
      setStartAutocomplete(autocomplete);
  }, []);

  const onDestAutocompleteLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    setDestAutocomplete(autocomplete);
  }, []);

  const onStartPlaceChanged = () => {
    if (startAutocomplete !== null) {
      const place = startAutocomplete.getPlace();
      setStart(place.formatted_address || '');
    } else {
      console.log('Autocomplete is not loaded yet!');
    }
  };

  const onDestPlaceChanged = () => {
    if (destAutocomplete !== null) {
      const place = destAutocomplete.getPlace();
      setDestination(place.formatted_address || '');
    } else {
      console.log('Autocomplete is not loaded yet!');
    }
  };

  const mapOptions = useMemo(() => ({
    disableDefaultUI: true,
    clickableIcons: false,
    scrollwheel: true,
    zoomControl: true,
  }), []);

  if (loadError) {
    return (
        <div className="flex items-center justify-center h-full">
            <p>Error loading map. Please check your API key and try again.</p>
        </div>
    )
  }

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
           {isLoaded && (
            <>
            <div className="space-y-2">
              <Label htmlFor="start">Starting Point</Label>
              <Autocomplete
                onLoad={onStartAutocompleteLoad}
                onPlaceChanged={onStartPlaceChanged}
              >
                <Input 
                  id="start" 
                  placeholder="e.g., Your current location" 
                  defaultValue={start}
                  onChange={(e) => setStart(e.target.value)}
                />
              </Autocomplete>
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
               <Autocomplete
                onLoad={onDestAutocompleteLoad}
                onPlaceChanged={onDestPlaceChanged}
              >
                <Input 
                  id="destination" 
                  placeholder="e.g., Taj Mahal, Agra" 
                  defaultValue={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </Autocomplete>
            </div>
            </>
           )}
            <Button className="w-full" onClick={handleGetDirections} disabled={isLoading || !isLoaded}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
              ): (
                <ArrowRight className="mr-2 h-4 w-4" />
              )}
              Get Directions
            </Button>

            {directions && (
              <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2">Your Route</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    {directions.routes[0].legs[0].steps.map((step, index) => (
                        <li key={index} dangerouslySetInnerHTML={{ __html: step.instructions }}></li>
                    ))}
                  </ol>
                  <div className="mt-2 font-semibold">
                    <p>Total Distance: {directions.routes[0].legs[0].distance?.text}</p>
                    <p>Total Duration: {directions.routes[0].legs[0].duration?.text}</p>
                  </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <Card className="h-full overflow-hidden p-0">
           <CardContent className="p-0 h-full">
            <div className="relative w-full h-full">
              {!isLoaded ? (
                <div className="w-full h-[600px] bg-muted animate-pulse flex items-center justify-center">
                    <p className="text-muted-foreground">Loading Map...</p>
                </div>
              ) : (
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    zoom={5}
                    center={defaultCenter}
                    options={mapOptions}
                    onLoad={onMapLoad}
                >
                   {directions && <DirectionsRenderer directions={directions} />}
                </GoogleMap>
              )}
            </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
