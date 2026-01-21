
"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
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
import { hotels, dharamshalas } from "@/lib/mock-data";
import { Star, MapPin } from "lucide-react";
import { Combobox } from "@/components/ui/combobox";
import { cities } from "@/lib/locations";

export default function AccommodationsPage() {
  const [selectedLocation, setSelectedLocation] = useState("all");

  const locationOptions = useMemo(() => {
    const options = cities.map((city) => ({
      value: `${city.name}, ${city.state}`,
      label: `${city.name}, ${city.state}`,
    }));
    return [{ value: "all", label: "All Locations" }, ...options];
  }, []);

  const filteredHotels = useMemo(() => {
    if (selectedLocation === "all") {
      return hotels;
    }
    const city = selectedLocation.split(',')[0];
    return hotels.filter((hotel) => hotel.location.includes(city));
  }, [selectedLocation]);

  const filteredDharamshalas = useMemo(() => {
    if (selectedLocation === "all") {
      return dharamshalas;
    }
    const city = selectedLocation.split(',')[0];
    return dharamshalas.filter((item) => item.location.includes(city));
  }, [selectedLocation]);

  const NoResults = () => (
    <div className="text-center text-muted-foreground py-16">
      <MapPin className="mx-auto h-12 w-12 mb-4"/>
      <p>No accommodations found for this location.</p>
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
          {filteredHotels.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredHotels.map((hotel) => (
                <Card key={hotel.name} className="flex flex-col overflow-hidden">
                  <div className="relative h-48 w-full">
                    <Image
                      src={hotel.img}
                      alt={hotel.name}
                      fill
                      className="object-cover"
                      data-ai-hint={hotel.imgHint}
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
                                  <Star key={i} className={`h-4 w-4 ${i < hotel.rating ? 'text-accent fill-accent' : 'text-muted-foreground'}`} />
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
                      <Button className="w-full" disabled>Book Now</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <NoResults />
          )}
        </TabsContent>

        <TabsContent value="dharamshalas" className="mt-6">
          {filteredDharamshalas.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredDharamshalas.map((item) => (
                <Card key={item.name} className="flex flex-col overflow-hidden">
                  <div className="relative h-48 w-full">
                    <Image
                      src={item.img}
                      alt={item.name}
                      fill
                      className="object-cover"
                      data-ai-hint={item.imgHint}
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
                                  <Star key={i} className={`h-4 w-4 ${i < item.rating ? 'text-accent fill-accent' : 'text-muted-foreground'}`} />
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
                      <Button className="w-full" disabled>Enquire</Button>
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
