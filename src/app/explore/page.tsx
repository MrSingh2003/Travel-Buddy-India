// src/app/explore/page.tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Search } from "lucide-react";

export default function ExplorePage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto mb-8">
        <h1 className="text-4xl font-bold font-headline text-center">Explore Places</h1>
        <p className="text-muted-foreground text-center mt-2">
          Discover new points of interest, from hidden gems to popular landmarks.
        </p>
      </div>

       <Alert variant="destructive" className="max-w-3xl mx-auto">
          <Search className="h-4 w-4" />
          <AlertTitle>Feature Disabled</AlertTitle>
          <AlertDescription>
            The place search feature is currently unavailable. An API key for a search service (like SearchAPI.io) is required. Please provide one to enable this functionality.
          </AlertDescription>
        </Alert>
    </div>
  );
}
