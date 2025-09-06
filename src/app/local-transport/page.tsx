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
import { CheckCircle, Phone, XCircle } from "lucide-react";

export default function LocalTransportPage() {
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
            <CardHeader>
              <CardTitle className="font-headline">Local Cab Services</CardTitle>
              <CardDescription>
                Verified cab services in areas without ride-sharing apps.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              {cabServices.map((cab) => (
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
              ))}
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
              {buses.map((bus, index) => (
                <Card key={index} className="flex flex-col md:flex-row justify-between md:items-center p-4">
                    <div>
                        <p className="font-semibold">{bus.from} to {bus.to}</p>
                        <p className="text-sm text-muted-foreground">{bus.operator} - {bus.type}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-2 md:mt-0">
                        <p className="font-semibold text-lg">{bus.price}</p>
                        <Button disabled>Book Now</Button>
                    </div>
                </Card>
              ))}
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
              {trains.map((train, index) => (
                <Card key={index} className="flex flex-col md:flex-row justify-between md:items-center p-4">
                    <div>
                        <p className="font-semibold">{train.from} to {train.to}</p>
                        <p className="text-sm text-muted-foreground">{train.name} - {train.class}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-2 md:mt-0">
                        <p className="font-semibold text-lg">{train.price}</p>
                        <Button disabled>Book Now</Button>
                    </div>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
