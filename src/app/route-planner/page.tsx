
'use client';

import {
  useState,
  useRef,
  useEffect,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Autocomplete,
  DirectionsRenderer,
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
} from 'lucide-react';
import { useLanguage } from '@/components/language-provider';

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

export default function RoutePlannerPage() {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsResponse, setDirectionsResponse] =
    useState<google.maps.DirectionsResult | null>(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const originRef = useRef<HTMLInputElement>(null);
  const destinationRef = useRef<HTMLInputElement>(null);

  const { t } = useLanguage();

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
    setDirectionsResponse(null);

    const directionsService = new google.maps.DirectionsService();
    try {
      const results = await directionsService.route({
        origin: originRef.current.value,
        destination: destinationRef.current.value,
        travelMode: google.maps.TravelMode.DRIVING,
      });

      if (results.routes.length > 0 && results.routes[0].legs.length > 0) {
        setDirectionsResponse(results);
        setDistance(results.routes[0].legs[0].distance?.text || '');
        setDuration(results.routes[0].legs[0].duration?.text || '');
      } else {
         setError(t('routePlanner.error.noRoute'));
      }
    } catch (err) {
      console.error(err);
      setError(t('routePlanner.error.noRoute'));
    } finally {
      setIsLoading(false);
    }
  }

  const clearRoute = () => {
    setDirectionsResponse(null);
    setDistance('');
    setDuration('');
    setError(null);
    if (originRef.current) originRef.current.value = '';
    if (destinationRef.current) destinationRef.current.value = '';
  };

  if (loadError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{t('routePlanner.error.mapLoadTitle')}</AlertTitle>
        <AlertDescription>
          {t('routePlanner.error.mapLoadDescription')}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">{t('routePlanner.title')}</CardTitle>
            <CardDescription>{t('routePlanner.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             {!isLoaded ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ) : (
              <form onSubmit={calculateRoute}>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Autocomplete>
                      <Input
                        type="text"
                        placeholder={t('routePlanner.originPlaceholder')}
                        ref={originRef}
                        className="pl-10"
                      />
                    </Autocomplete>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Autocomplete>
                      <Input
                        type="text"
                        placeholder={t('routePlanner.destinationPlaceholder')}
                        ref={destinationRef}
                        className="pl-10"
                      />
                    </Autocomplete>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Button type="submit" className="w-full" disabled={!isLoaded || isLoading}>
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
                    disabled={!isLoaded}
                  >
                    {t('routePlanner.clearButton')}
                  </Button>
                </div>
              </form>
            )}
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t('routePlanner.error.title')}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {directionsResponse && distance && duration && (
              <Card className="mt-4 bg-muted/50">
                <CardContent className="flex items-center justify-around p-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-primary" />
                    <span>{distance}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Timer className="h-5 w-5 text-primary" />
                    <span>{duration}</span>
                  </div>
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
              onLoad={map => setMap(map)}
              options={{
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
              }}
            >
              {directionsResponse && (
                <DirectionsRenderer directions={directionsResponse} />
              )}
            </GoogleMap>
          ) : (
            <Skeleton className="h-[600px] w-full" />
          )}
        </Card>
      </div>
    </div>
  );
}
