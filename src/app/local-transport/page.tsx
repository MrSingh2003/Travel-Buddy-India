// src/app/local-transport/page.tsx
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BusSearch } from "./BusSearch";
import { TrainSearch } from "./TrainSearch";
import { CabSearch } from "./CabSearch";

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
          <CabSearch />
        </TabsContent>
        <TabsContent value="buses" className="mt-6">
          <BusSearch />
        </TabsContent>
        <TabsContent value="trains" className="mt-6">
          <TrainSearch />
        </TabsContent>
      </Tabs>
    </div>
  );
}
