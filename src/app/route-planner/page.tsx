'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertCircle,
  Bike,
  Bus,
  Car,
  Footprints,
  Loader2,
  LocateFixed,
  MapPinned,
  MousePointerClick,
  Route,
  Search,
  Timer,
} from 'lucide-react';
import { useLanguage } from '@/components/language-provider';
import { planRoute } from '@/lib/api/travel-buddy';
import type { RoutePlan } from '@/lib/api/types';

type TravelMode = 'DRIVING' | 'WALKING' | 'BICYCLING' | 'TRANSIT';
type PickTarget = 'origin' | 'destination';
type LatLng = { lat: number; lng: number };

declare global {
  interface Window {
    L?: any;
    __travelBuddyLeafletPromise?: Promise<void>;
  }
}

const center = {
  lat: 20.5937,
  lng: 78.9629,
};

const modeOptions = [
  { key: 'DRIVING', label: 'Car', icon: Car },
  { key: 'WALKING', label: 'Walking', icon: Footprints },
  { key: 'BICYCLING', label: 'Bike', icon: Bike },
  { key: 'TRANSIT', label: 'Bus', icon: Bus },
] as const;

function loadLeafletAssets() {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  if (window.L) {
    return Promise.resolve();
  }

  if (window.__travelBuddyLeafletPromise) {
    return window.__travelBuddyLeafletPromise;
  }

  window.__travelBuddyLeafletPromise = new Promise<void>((resolve, reject) => {
    const existingCss = document.querySelector(
      'link[data-travel-buddy-leaflet="true"]'
    );
    if (!existingCss) {
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      css.setAttribute('data-travel-buddy-leaflet', 'true');
      document.head.appendChild(css);
    }

    const existingScript = document.querySelector(
      'script[data-travel-buddy-leaflet="true"]'
    ) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener(
        'error',
        () => reject(new Error('Leaflet failed to load.')),
        { once: true }
      );
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.defer = true;
    script.setAttribute('data-travel-buddy-leaflet', 'true');
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Leaflet failed to load.'));
    document.body.appendChild(script);
  });

  return window.__travelBuddyLeafletPromise;
}

function formatDistance(meters: number) {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(meters >= 10000 ? 0 : 1)} km`;
  }
  return `${Math.round(meters)} m`;
}

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${Math.max(1, minutes)} min`;
}

function estimateFallbackDuration(mode: TravelMode, meters: number, seconds: number) {
  if (!meters) {
    return seconds;
  }

  if (mode === 'WALKING') {
    return Math.round(meters / 1.25);
  }

  if (mode === 'BICYCLING') {
    return Math.round(meters / 4.2);
  }

  if (mode === 'TRANSIT') {
    return Math.round(meters / 6.5);
  }

  return seconds > 0 ? seconds : Math.round(meters / 8.5);
}

function formatCoordinateLabel(point: LatLng) {
  return `${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}`;
}

async function reverseGeocode(point: LatLng) {
  const url = new URL('https://nominatim.openstreetmap.org/reverse');
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('lat', String(point.lat));
  url.searchParams.set('lon', String(point.lng));

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Reverse geocoding failed.');
  }

  const data = await response.json();
  return data.display_name || formatCoordinateLabel(point);
}

async function geocodeQuery(query: string) {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', '1');
  url.searchParams.set('q', query);

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Location search failed.');
  }

  const results = (await response.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
  }>;

  if (!results.length) {
    throw new Error('No location match found.');
  }

  return {
    latLng: {
      lat: Number(results[0].lat),
      lng: Number(results[0].lon),
    },
    label: results[0].display_name,
  };
}

function getOsrmProfile(mode: TravelMode) {
  switch (mode) {
    case 'WALKING':
      return 'foot';
    case 'BICYCLING':
      return 'bike';
    case 'TRANSIT':
      return 'driving';
    case 'DRIVING':
    default:
      return 'driving';
  }
}

export default function RoutePlannerPage() {
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [routeSummary, setRouteSummary] = useState<RoutePlan | null>(null);
  const [travelMode, setTravelMode] = useState<TravelMode>('DRIVING');
  const [mapNotice, setMapNotice] = useState<string | null>(
    'OpenStreetMap mode is active for route picking and map clicks.'
  );
  const [pickTarget, setPickTarget] = useState<PickTarget>('origin');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [originMarker, setOriginMarker] = useState<LatLng | null>(null);
  const [destinationMarker, setDestinationMarker] = useState<LatLng | null>(null);
  const [routePath, setRoutePath] = useState<LatLng[]>([]);
  const [leafletReady, setLeafletReady] = useState(false);
  const [leafletError, setLeafletError] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const originMarkerRef = useRef<any>(null);
  const destinationMarkerRef = useRef<any>(null);
  const routeLineRef = useRef<any>(null);

  const { t } = useLanguage();
  const selectedMode =
    modeOptions.find((mode) => mode.key === travelMode) ?? modeOptions[0];
  const selectedModeLabel = selectedMode.label;
  const SelectedModeIcon = selectedMode.icon;

  useEffect(() => {
    if (!distanceMeters) {
      return;
    }

    const adjustedDuration = estimateFallbackDuration(travelMode, distanceMeters, 0);
    setDuration(formatDuration(adjustedDuration));
  }, [travelMode, distanceMeters]);

  useEffect(() => {
    let isMounted = true;

    loadLeafletAssets()
      .then(() => {
        if (!isMounted || !mapContainerRef.current || !window.L || mapRef.current) {
          return;
        }

        const map = window.L.map(mapContainerRef.current, {
          center: [center.lat, center.lng],
          zoom: 5,
          zoomControl: true,
        });

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        map.on('click', async (event: { latlng: { lat: number; lng: number } }) => {
          const point = {
            lat: event.latlng.lat,
            lng: event.latlng.lng,
          };

          if (pickTarget === 'origin') {
            setOriginMarker(point);
          } else {
            setDestinationMarker(point);
          }

          try {
            const label = await reverseGeocode(point);
            if (pickTarget === 'origin') {
              setOrigin(label);
            } else {
              setDestination(label);
            }
          } catch (reverseError) {
            console.error(reverseError);
            const fallbackLabel = formatCoordinateLabel(point);
            if (pickTarget === 'origin') {
              setOrigin(fallbackLabel);
            } else {
              setDestination(fallbackLabel);
            }
          }
        });

        mapRef.current = map;
        setLeafletReady(true);
      })
      .catch((loadLeafletError) => {
        console.error(loadLeafletError);
        if (isMounted) {
          setLeafletError(
            'The fallback map could not load. You can still type locations and calculate a route summary.'
          );
        }
      });

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [pickTarget]);

  useEffect(() => {
    if (!mapRef.current || !window.L) {
      return;
    }

    if (originMarkerRef.current) {
      originMarkerRef.current.remove();
      originMarkerRef.current = null;
    }

    if (originMarker) {
      originMarkerRef.current = window.L.marker([originMarker.lat, originMarker.lng])
        .bindTooltip('A', {
          permanent: true,
          direction: 'top',
          offset: [0, -12],
        })
        .addTo(mapRef.current);
    }
  }, [originMarker]);

  useEffect(() => {
    if (!mapRef.current || !window.L) {
      return;
    }

    if (destinationMarkerRef.current) {
      destinationMarkerRef.current.remove();
      destinationMarkerRef.current = null;
    }

    if (destinationMarker) {
      destinationMarkerRef.current = window.L.marker([
        destinationMarker.lat,
        destinationMarker.lng,
      ])
        .bindTooltip('B', {
          permanent: true,
          direction: 'top',
          offset: [0, -12],
        })
        .addTo(mapRef.current);
    }
  }, [destinationMarker]);

  useEffect(() => {
    if (!mapRef.current || !window.L) {
      return;
    }

    if (routeLineRef.current) {
      routeLineRef.current.remove();
      routeLineRef.current = null;
    }

    if (routePath.length) {
      routeLineRef.current = window.L.polyline(
        routePath.map((point) => [point.lat, point.lng]),
        {
          color: '#16a34a',
          weight: 5,
          opacity: 0.8,
        }
      ).addTo(mapRef.current);

      const bounds = window.L.latLngBounds(
        routePath.map((point) => [point.lat, point.lng])
      );
      mapRef.current.fitBounds(bounds, { padding: [40, 40] });
      return;
    }

    if (originMarker && destinationMarker) {
      const bounds = window.L.latLngBounds([
        [originMarker.lat, originMarker.lng],
        [destinationMarker.lat, destinationMarker.lng],
      ]);
      mapRef.current.fitBounds(bounds, { padding: [40, 40] });
    } else if (originMarker) {
      mapRef.current.setView([originMarker.lat, originMarker.lng], 14);
    } else if (destinationMarker) {
      mapRef.current.setView([destinationMarker.lat, destinationMarker.lng], 14);
    }
  }, [destinationMarker, originMarker, routePath]);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported on this device.');
      return;
    }

    setIsLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const point = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setOriginMarker(point);

        try {
          const label = await reverseGeocode(point);
          setOrigin(label);
        } catch (reverseError) {
          console.error(reverseError);
          setOrigin(formatCoordinateLabel(point));
        } finally {
          setIsLocating(false);
        }
      },
      (geoError) => {
        console.error(geoError);
        setError(
          'Could not fetch your current location. Please allow location access and try again.'
        );
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  async function resolvePoint(label: string, marker: LatLng | null) {
    if (marker) {
      return { latLng: marker, label };
    }

    const trimmed = label.trim();
    if (!trimmed) {
      throw new Error('Missing route point.');
    }

    return geocodeQuery(trimmed);
  }

  async function calculateRoute(event: FormEvent) {
    event.preventDefault();

    if (!origin.trim() || !destination.trim()) {
      setError(t('routePlanner.error.missingFields'));
      return;
    }

    setIsLoading(true);
    setError(null);
    setRouteSummary(null);

    try {
      const [resolvedOrigin, resolvedDestination] = await Promise.all([
        resolvePoint(origin, originMarker),
        resolvePoint(destination, destinationMarker),
      ]);

      setOrigin(resolvedOrigin.label);
      setDestination(resolvedDestination.label);
      setOriginMarker(resolvedOrigin.latLng);
      setDestinationMarker(resolvedDestination.latLng);

      const osrmProfile = getOsrmProfile(travelMode);
      const osrmUrl = new URL(
        `https://router.project-osrm.org/route/v1/${osrmProfile}/${resolvedOrigin.latLng.lng},${resolvedOrigin.latLng.lat};${resolvedDestination.latLng.lng},${resolvedDestination.latLng.lat}`
      );
      osrmUrl.searchParams.set('overview', 'full');
      osrmUrl.searchParams.set('geometries', 'geojson');
      osrmUrl.searchParams.set('steps', 'false');

      const osrmResponse = await fetch(osrmUrl.toString());
      if (!osrmResponse.ok) {
        throw new Error('Route engine unavailable.');
      }

      const osrmData = await osrmResponse.json();
      const bestRoute = osrmData.routes?.[0];

      if (!bestRoute) {
        throw new Error('No route found.');
      }

      const points: LatLng[] = (bestRoute.geometry?.coordinates ?? []).map(
        ([lng, lat]: [number, number]) => ({ lat, lng })
      );

      const routeDistance = bestRoute.distance ?? 0;
      const rawDuration = bestRoute.duration ?? 0;
      const adjustedDuration = estimateFallbackDuration(
        travelMode,
        routeDistance,
        rawDuration
      );

      setRoutePath(points);
      setDistanceMeters(routeDistance);
      setDistance(formatDistance(routeDistance));
      setDuration(formatDuration(adjustedDuration));

      if (travelMode === 'TRANSIT') {
        setMapNotice(
          'Bus mode currently uses a road-travel estimate on the fallback map because live public-transit routing is not available in local mode.'
        );
      } else {
        setMapNotice('OpenStreetMap route preview is active.');
      }

      try {
        const summary = await planRoute(
          resolvedOrigin.label,
          resolvedDestination.label,
          travelMode
        );
        setRouteSummary(summary);
      } catch (backendError) {
        console.error(backendError);
        setRouteSummary(null);
      }
    } catch (routeError) {
      console.error(routeError);

      try {
        const summary = await planRoute(origin, destination, travelMode);
        setRouteSummary(summary);
        setDistanceMeters(null);
        setDistance(summary.distance);
        setDuration(summary.duration);
        setRoutePath([]);
        setMapNotice(
          'Live route drawing is unavailable right now, so the planner is showing the backend route summary only.'
        );
      } catch (backendError) {
        console.error(backendError);
        setError(t('routePlanner.error.noRoute'));
      }
    } finally {
      setIsLoading(false);
    }
  }

  const clearRoute = () => {
    setDistance('');
    setDuration('');
    setDistanceMeters(null);
    setError(null);
    setRouteSummary(null);
    setOrigin('');
    setDestination('');
    setOriginMarker(null);
    setDestinationMarker(null);
    setRoutePath([]);
    setMapNotice('OpenStreetMap mode is active for route picking and map clicks.');
    if (mapRef.current) {
      mapRef.current.setView([center.lat, center.lng], 5);
    }
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
                  <Input
                    type="text"
                    placeholder={t('routePlanner.originPlaceholder')}
                    value={origin}
                    onChange={(event) => setOrigin(event.target.value)}
                    className="pl-10"
                  />
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
                  <Input
                    type="text"
                    placeholder={t('routePlanner.destinationPlaceholder')}
                    value={destination}
                    onChange={(event) => setDestination(event.target.value)}
                    className="pl-10"
                  />
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
            {leafletError && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t('routePlanner.error.mapLoadTitle')}</AlertTitle>
                <AlertDescription>{leafletError}</AlertDescription>
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
                      <SelectedModeIcon className="h-5 w-5 text-primary" />
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
          {leafletError ? (
            <div className="flex h-[600px] flex-col items-center justify-center gap-4 p-6 text-center text-muted-foreground">
              <MapPinned className="h-12 w-12 text-primary" />
              <div className="space-y-2">
                <p className="text-lg font-medium text-foreground">Map preview unavailable</p>
                <p>
                  You can still type locations, use "From My Location", and calculate the route summary.
                </p>
              </div>
            </div>
          ) : (
            <>
              {!leafletReady && <Skeleton className="absolute inset-0 h-[600px] w-full" />}
              <div ref={mapContainerRef} className="h-[600px] w-full" />
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
