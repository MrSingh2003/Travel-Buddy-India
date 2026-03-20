'use client';

import {
  useState,
  useRef,
  type FormEvent,
} from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Autocomplete,
  DirectionsRenderer,
  Marker,
} from '@react-google-maps/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  Car,
  Route,
  Search,
  Timer,
  AlertCircle,
  Loader2,
  MapPinned,
  LocateFixed,
  Bike,
  Footprints,
  Bus,
  MousePointerClick,
} from 'lucide-react';
import { useLanguage } from '@/components/language-provider';
import { planRoute } from '@/lib/api/travel-buddy';
import type { RoutePlan } from '@/lib/api/types';

const containerStyle = {
  width: '100%',
  height: '600px',
};

const center = {
  lat: 20.5937,
  lng: 78.9629,
};

const libraries: ('places' | 'drawing' | 'geometry' | 'visualization')[] = [
  'places',
];

const modeOptions = [
  { key: 'DRIVING', label: 'Car', icon: Car },
  { key: 'WALKING', label: 'Walking', icon: Footprints },
  { key: 'BICYCLING', label: 'Bike', icon: Bike },
  { key: 'TRANSIT', label: 'Bus', icon: Bus },
] as const;

export default function RoutePlannerPage() {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey:
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
      import.meta.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      '',
    libraries,
  });

  const [directionsResponse, setDirectionsResponse] =
    useState<google.maps.DirectionsResult | null>(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [routeSummary, setRouteSummary] = useState<RoutePlan | null>(null);
  const [travelMode, setTravelMode] = useState<(typeof modeOptions)[number]['key']>('DRIVING');
  const [mapNotice, setMapNotice] = useState<string | null>(null);
  const [pickTarget, setPickTarget] = useState<'origin' | 'destination'>('origin');
  const [originMarker, setOriginMarker] = useState<{ lat: number; lng: number } | null>(null);
  const [destinationMarker, setDestinationMarker] = useState<{ lat: number; lng: number } | null>(null);

  const originRef = useRef<HTMLInputElement>(null);
  const destinationRef = useRef<HTMLInputElement>(null);

  const { t } = useLanguage();
  const selectedModeLabel =
    modeOptions.find((mode) => mode.key === travelMode)?.label ?? 'Route';

  async function fillLocationFromLatLng(
    latLng: { lat: number; lng: number },
    target: 'origin' | 'destination'
  ) {
    const fallbackValue = `${latLng.lat.toFixed(6)}, ${latLng.lng.toFixed(6)}`;

    try {
      if (isLoaded && window.google?.maps) {
        const geocoder = new google.maps.Geocoder();
        const result = await geocoder.geocode({ location: latLng });
        const address = result.results[0]?.formatted_address ?? fallbackValue;

        if (target === 'origin' && originRef.current) {
          originRef.current.value = address;
        }
        if (target === 'destination' && destinationRef.current) {
          destinationRef.current.value = address;
        }
      } else {
        if (target === 'origin' && originRef.current) {
          originRef.current.value = fallbackValue;
        }
        if (target === 'destination' && destinationRef.current) {
          destinationRef.current.value = fallbackValue;
        }
      }
    } catch (geocodeError) {
      console.error(geocodeError);
      if (target === 'origin' && originRef.current) {
        originRef.current.value = fallbackValue;
      }
      if (target === 'destination' && destinationRef.current) {
        destinationRef.current.value = fallbackValue;
      }
    }
  }

  function formatGoogleRouteSummary(result: google.maps.DirectionsResult) {
    const legs = result.routes[0]?.legs ?? [];
    const totalMeters = legs.reduce((sum, leg) => sum + (leg.distance?.value ?? 0), 0);
    const totalSeconds = legs.reduce((sum, leg) => sum + (leg.duration?.value ?? 0), 0);

    const distanceLabel =
      totalMeters >= 1000
        ? `${(totalMeters / 1000).toFixed(totalMeters >= 10000 ? 0 : 1)} km`
        : `${Math.round(totalMeters)} m`;

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.round((totalSeconds % 3600) / 60);
    const durationLabel =
      hours > 0 ? `${hours}h ${minutes}m` : `${Math.max(1, minutes)} min`;

    return {
      distanceLabel,
      durationLabel,
    };
  }

  async function calculateRoute(e: FormEvent) {
    e.preventDefault();
    if (
      !originRef.current ||
      !destinationRef.current ||
      originRef.current.value === '' ||
      destinationRef.current.value === ''
    ) {
      setError(t('routePlanner.error.missingFields'));
      return;
    }

    setIsLoading(true);
    setError(null);
    setMapNotice(null);
    setDirectionsResponse(null);
    setRouteSummary(null);

    try {
      const summary = await planRoute(
        originRef.current.value,
        destinationRef.current.value,
        travelMode
      );

      setRouteSummary(summary);
      setDistance(summary.distance);
      setDuration(summary.duration);

      if (isLoaded) {
        try {
          const results = await new google.maps.DirectionsService().route({
            origin: originRef.current.value,
            destination: destinationRef.current.value,
            travelMode: google.maps.TravelMode[travelMode],
          });

          if (results.routes.length > 0 && results.routes[0].legs.length > 0) {
            setDirectionsResponse(results);
            const { distanceLabel, durationLabel } = formatGoogleRouteSummary(results);
            setDistance(distanceLabel);
            setDuration(durationLabel);
          }
        } catch (mapError) {
          console.error(mapError);
          setMapNotice(
            'The route summary is available, but Google Maps could not draw this route on the map.'
          );
        }
      }
    } catch (err) {
      console.error(err);
      setError(t('routePlanner.error.noRoute'));
    } finally {
      setIsLoading(false);
    }
  }

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported on this device.');
      return;
    }

    setIsLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latLng = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          if (isLoaded && window.google?.maps) {
            const geocoder = new google.maps.Geocoder();
            const result = await geocoder.geocode({ location: latLng });
            if (originRef.current) {
              originRef.current.value =
                result.results[0]?.formatted_address ??
                `${latLng.lat}, ${latLng.lng}`;
            }
            setOriginMarker(latLng);
          } else if (originRef.current) {
            originRef.current.value = `${latLng.lat}, ${latLng.lng}`;
            setOriginMarker(latLng);
          }
        } catch (geocodeError) {
          console.error(geocodeError);
          if (originRef.current) {
            originRef.current.value = `${position.coords.latitude}, ${position.coords.longitude}`;
          }
          setOriginMarker(latLng);
        } finally {
          setIsLocating(false);
        }
      },
      (geoError) => {
        console.error(geoError);
        setError('Could not fetch your current location. Please allow location access and try again.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const clearRoute = () => {
    setDirectionsResponse(null);
    setDistance('');
    setDuration('');
    setError(null);
    setMapNotice(null);
    setRouteSummary(null);
    setOriginMarker(null);
    setDestinationMarker(null);
    if (originRef.current) originRef.current.value = '';
    if (destinationRef.current) destinationRef.current.value = '';
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">
              Plan Your {selectedModeLabel} Route
            </CardTitle>
            <CardDescription>{t('routePlanner.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={calculateRoute}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {modeOptions.map((mode) => {
                    const Icon = mode.icon;
                    return (
                      <Button
                        key={mode.key}
                        type="button"
                        variant={travelMode === mode.key ? 'default' : 'outline'}
                        className="justify-start"
                        onClick={() => setTravelMode(mode.key)}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {mode.label}
                      </Button>
                    );
                  })}
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  {isLoaded ? (
                    <Autocomplete>
                      <Input
                        type="text"
                        placeholder={t('routePlanner.originPlaceholder')}
                        ref={originRef}
                        className="pl-10"
                      />
                    </Autocomplete>
                  ) : (
                    <Input
                      type="text"
                      placeholder={t('routePlanner.originPlaceholder')}
                      ref={originRef}
                      className="pl-10"
                    />
                  )}
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={useMyLocation}
                  disabled={isLocating}
                >
                  {isLocating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <LocateFixed className="mr-2 h-4 w-4" />
                  )}
                  From My Location
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={pickTarget === 'origin' ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => setPickTarget('origin')}
                  >
                    <MousePointerClick className="mr-2 h-4 w-4" />
                    Pick Origin
                  </Button>
                  <Button
                    type="button"
                    variant={pickTarget === 'destination' ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => setPickTarget('destination')}
                  >
                    <MapPinned className="mr-2 h-4 w-4" />
                    Pick Destination
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  {isLoaded ? (
                    <Autocomplete>
                      <Input
                        type="text"
                        placeholder={t('routePlanner.destinationPlaceholder')}
                        ref={destinationRef}
                        className="pl-10"
                      />
                    </Autocomplete>
                  ) : (
                    <Input
                      type="text"
                      placeholder={t('routePlanner.destinationPlaceholder')}
                      ref={destinationRef}
                      className="pl-10"
                    />
                  )}
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Route />
                  )}
                  <span>{t('routePlanner.calculateButton')}</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={clearRoute}
                >
                  {t('routePlanner.clearButton')}
                </Button>
              </div>
            </form>
            {loadError && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t('routePlanner.error.mapLoadTitle')}</AlertTitle>
                <AlertDescription>
                  {t('routePlanner.error.mapLoadDescription')}
                </AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t('routePlanner.error.title')}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {mapNotice && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Map notice</AlertTitle>
                <AlertDescription>{mapNotice}</AlertDescription>
              </Alert>
            )}
            {distance && duration && (
              <Card className="mt-4 bg-muted/50">
                <CardContent className="space-y-4 p-4 text-sm">
                  <div className="flex items-center justify-around">
                    <div className="flex items-center gap-2">
                      <Car className="h-5 w-5 text-primary" />
                      <span>{distance}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Timer className="h-5 w-5 text-primary" />
                      <span>{duration}</span>
                    </div>
                  </div>
                  {routeSummary && (
                    <div>
                      <div className="mb-2 flex items-center gap-2 font-medium">
                        <MapPinned className="h-4 w-4 text-primary" />
                        Suggested {(routeSummary.mode ?? travelMode).toLowerCase()} route waypoints
                      </div>
                      <ul className="space-y-1 text-muted-foreground">
                        {routeSummary.waypoints.map((waypoint) => (
                          <li key={waypoint}>{waypoint}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card className="overflow-hidden">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={5}
              onClick={async (event) => {
                if (!event.latLng) return;
                const latLng = {
                  lat: event.latLng.lat(),
                  lng: event.latLng.lng(),
                };

                if (pickTarget === 'origin') {
                  setOriginMarker(latLng);
                } else {
                  setDestinationMarker(latLng);
                }

                await fillLocationFromLatLng(latLng, pickTarget);
              }}
              options={{
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
              }}
            >
              {originMarker && <Marker position={originMarker} label="A" />}
              {destinationMarker && <Marker position={destinationMarker} label="B" />}
              {directionsResponse && (
                <DirectionsRenderer directions={directionsResponse} />
              )}
            </GoogleMap>
          ) : loadError ? (
            <div className="flex h-[600px] items-center justify-center p-6 text-center text-muted-foreground">
              Map preview is unavailable right now, but route summaries from the Java backend still work.
            </div>
          ) : (
            <Skeleton className="h-[600px] w-full" />
          )}
        </Card>
      </div>
    </div>
  );
}
