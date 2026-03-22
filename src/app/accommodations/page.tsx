"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Star, MapPin } from "lucide-react";
import { Combobox } from "@/components/ui/combobox";
import { getLocalizedCityOptions } from "@/lib/locations";
import { fetchAccommodations } from "@/lib/api/travel-buddy";
import type { Accommodation } from "@/lib/api/types";
import { useLanguage } from "@/components/language-provider";

export default function AccommodationsPage() {
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [hotels, setHotels] = useState<Accommodation[]>([]);
  const [dharamshalas, setDharamshalas] = useState<Accommodation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { language } = useLanguage();

  const locationOptions = useMemo(() => {
    const options = getLocalizedCityOptions(language);
    return [{ value: "all", label: "All Locations" }, ...options];
  }, [language]);

  useEffect(() => {
    let active = true;

    async function load() {
      setIsLoading(true);
      try {
        const [hotelData, dharamshalaData] = await Promise.all([
          fetchAccommodations("hotel", selectedLocation),
          fetchAccommodations("dharamshala", selectedLocation),
        ]);

        if (!active) return;
        setHotels(hotelData);
        setDharamshalas(dharamshalaData);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [selectedLocation]);

  const NoResults = () => (
    <div className="text-center text-muted-foreground py-16">
      <MapPin className="mx-auto h-12 w-12 mb-4"/>
      <p>No accommodations found for this location.</p>
    </div>
  );

  const LoadingState = ({ label }: { label: string }) => (
    <div className="flex items-center justify-center py-16 text-muted-foreground">
      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      {label}
    </div>
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold font-headline">Accommodations</h1>
        <div className="w-full md:w-auto md:min-w-[250px]">
          <Combobox
            options={locationOptions}
            value={selectedLocation}
            onChange={setSelectedLocation}
            placeholder="Filter by location"
            searchPlaceholder="Search location..."
          />
        </div>
      </div>
      <Tabs defaultValue="hotels" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[300px]">
          <TabsTrigger value="hotels">Hotels</TabsTrigger>
          <TabsTrigger value="dharamshalas">Dharamshalas</TabsTrigger>
        </TabsList>

        <TabsContent value="hotels" className="mt-6">
          {isLoading ? (
            <LoadingState label="Loading hotels..." />
          ) : hotels.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {hotels.map((hotel) => (
                <Card key={hotel.id} className="flex flex-col overflow-hidden">
                  <div className="relative h-48 w-full">
                    <img
                      src={hotel.imageUrl}
                      alt={hotel.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="font-headline">{hotel.name}</CardTitle>
                    <CardDescription>{hotel.location}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < Math.round(hotel.rating) ? 'text-accent fill-accent' : 'text-muted-foreground'}`} />
                        ))}
                        <span className="ml-2 text-xs text-muted-foreground">{hotel.rating}</span>
                      </div>
                      <p className="font-semibold text-primary">{hotel.price}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {hotel.amenities.map(amenity => <Badge variant="secondary" key={amenity}>{amenity}</Badge>)}
                    </div>
                  </CardContent>
                  <CardFooter>
                    {hotel.bookingUrl ? (
                      <Button asChild className="w-full">
                        <a href={hotel.bookingUrl} target="_blank" rel="noreferrer">Book Now</a>
                      </Button>
                    ) : (
                      <Button className="w-full" disabled>Book Now</Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <NoResults />
          )}
        </TabsContent>

        <TabsContent value="dharamshalas" className="mt-6">
          {isLoading ? (
            <LoadingState label="Loading dharamshalas..." />
          ) : dharamshalas.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {dharamshalas.map((item) => (
                <Card key={item.id} className="flex flex-col overflow-hidden">
                  <div className="relative h-48 w-full">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="font-headline">{item.name}</CardTitle>
                    <CardDescription>{item.location}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < Math.round(item.rating) ? 'text-accent fill-accent' : 'text-muted-foreground'}`} />
                        ))}
                        <span className="ml-2 text-xs text-muted-foreground">{item.rating}</span>
                      </div>
                      <p className="font-semibold text-primary">{item.price}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {item.amenities.map(amenity => <Badge variant="secondary" key={amenity}>{amenity}</Badge>)}
                    </div>
                  </CardContent>
                  <CardFooter>
                    {item.bookingUrl ? (
                      <Button asChild className="w-full">
                        <a href={item.bookingUrl} target="_blank" rel="noreferrer">Enquire</a>
                      </Button>
                    ) : (
                      <Button className="w-full" disabled>Enquire</Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <NoResults />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
