
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cabServices, buses, trains } from "@/lib/mock-data";
import { CheckCircle, Loader2, Phone, XCircle } from "lucide-react";
import { Combobox } from "@/components/ui/combobox";
import { states } from "@/lib/locations";
import { bookTransport } from "@/ai/flows/book-transport";
import { useToast } from "@/hooks/use-toast";

type BookingState = {
  isLoading: boolean;
  serviceId: string | null;
};


export default function LocalTransportPage() {
    const [selectedState, setSelectedState] = useState<string | undefined>();
    const { toast } = useToast();
    const [bookingState, setBookingState] = useState<BookingState>({ isLoading: false, serviceId: null });

    const filteredCabServices = selectedState
    ? cabServices.filter((cab) => cab.location.endsWith(selectedState))
    : cabServices;
    
    const handleBooking = async (service: 'bus' | 'train' | 'cab', details: string, id: string) => {
        setBookingState({ isLoading: true, serviceId: id });
        try {
            // Simulate network delay for a more realistic experience
            await new Promise(resolve => setTimeout(resolve, 1500));
            const response = await bookTransport({ service, details });
            toast({
                title: "Booking Confirmed!",
                description: response.message,
            });
        } catch (error) {
            console.error("Failed to book:", error);
            toast({
                variant: "destructive",
                title: "Booking Failed",
                description: "We couldn't complete your booking at this time. Please try again.",
            });
        } finally {
            setBookingState({ isLoading: false, serviceId: null });
        }
    }


  return (
    <div>
      <h1 className="text-3xl font-bold font-headline mb-4">Local Transport</h1>
      <Tabs defaultValue="cabs" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
          <TabsTrigger value="cabs">Cabs</TabsTrigger>
          <TabsTrigger value="buses">Buses</TabsTrigger>
          <TabsTrigger value="trains">Trains</TabsTrigger>
        </TabsList>
        <TabsContent value="cabs" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="font-headline">Cab Service</CardTitle>
                <CardDescription>
                  Verified cab services in areas without ride-sharing apps.
                </CardDescription>
              </div>
               <div className="w-full md:w-1/4">
                <Combobox
                    options={states.map((s) => ({
                    value: s.name,
                    label: s.name,
                    }))}
                    value={selectedState}
                    onChange={setSelectedState}
                    placeholder="Filter by state"
                />
               </div>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              {filteredCabServices.length > 0 ? (
                filteredCabServices.map((cab) => (
                    <Card key={cab.name}>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                        <span className="font-headline">{cab.name}</span>
                        <Badge variant={cab.isVerified ? "default" : "destructive"} className="bg-opacity-80">
                            {cab.isVerified ? <CheckCircle className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
                            {cab.isVerified ? "Verified" : "Unverified"}
                        </Badge>
                        </CardTitle>
                        <CardDescription>{cab.location}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm font-semibold">{cab.price}</p>
                    </CardContent>
                    <CardFooter>
                        <Button asChild className="w-full">
                            <a href={`tel:${cab.contact}`}>
                                <Phone className="mr-2 h-4 w-4"/>
                                {cab.contact}
                            </a>
                        </Button>
                    </CardFooter>
                    </Card>
                ))
              ) : (
                <p className="text-muted-foreground col-span-full text-center">
                  No cab services found for the selected state.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="buses" className="mt-6">
           <Card>
            <CardHeader>
              <CardTitle className="font-headline">Bus Services</CardTitle>
              <CardDescription>
                Book inter-city and inter-state buses.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {buses.map((bus, index) => {
                const busId = `bus-${index}`;
                const isBooking = bookingState.isLoading && bookingState.serviceId === busId;
                return (
                <Card key={busId} className="flex flex-col md:flex-row justify-between md:items-center p-4">
                    <div>
                        <p className="font-semibold">{bus.from} to {bus.to}</p>
                        <p className="text-sm text-muted-foreground">{bus.operator} - {bus.type}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-2 md:mt-0">
                        <p className="font-semibold text-lg">{bus.price}</p>
                        <Button disabled={bookingState.isLoading} onClick={() => handleBooking('bus', `${bus.operator}: ${bus.from} to ${bus.to}`, busId)}>
                         {isBooking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                         {isBooking ? 'Booking...' : 'Book Now'}
                        </Button>
                    </div>
                </Card>
              )})}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="trains" className="mt-6">
           <Card>
            <CardHeader>
              <CardTitle className="font-headline">Train Booking</CardTitle>
              <CardDescription>
                Reserve seats on trains across India.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {trains.map((train, index) => {
                 const trainId = `train-${index}`;
                 const isBooking = bookingState.isLoading && bookingState.serviceId === trainId;
                 return (
                <Card key={trainId} className="flex flex-col md:flex-row justify-between md:items-center p-4">
                    <div>
                        <p className="font-semibold">{train.from} to {train.to}</p>
                        <p className="text-sm text-muted-foreground">{train.name} - {train.class}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-2 md:mt-0">
                        <p className="font-semibold text-lg">{train.price}</p>
                        <Button disabled={bookingState.isLoading} onClick={() => handleBooking('train', `${train.name}: ${train.from} to ${train.to}`, trainId)}>
                           {isBooking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                           {isBooking ? 'Booking...' : 'Book Now'}
                        </Button>
                    </div>
                </Card>
              )})}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
