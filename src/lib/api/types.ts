export type BudgetBreakdown = {
  accommodation: string;
  food: string;
  transport: string;
  activities: string;
  total: string;
};

export type ItineraryDay = {
  day: number;
  title: string;
  activities: string[];
};

export type PersonalizedTripOutput = {
  tripTitle: string;
  suitabilityScore: number;
  suitabilityReasoning: string;
  tripSummary: string;
  budgetBreakdown: BudgetBreakdown;
  weatherAdvisory: string;
  dailyItinerary: ItineraryDay[];
};

export type Place = {
  position: number;
  title: string;
  address: string;
  rating: number;
  reviews: number;
  type: string;
  thumbnail: string;
};

export type InspirationalImage = {
  title: string;
  imageUrl: string;
};

export type TransportOption = {
  id: string;
  name: string;
  location: string;
  serviceType: string;
  price: string;
  contact?: string | null;
  verified: boolean;
  vehicleClass?: string | null;
  from?: string | null;
  to?: string | null;
  departureTime?: string | null;
  arrivalTime?: string | null;
  duration?: string | null;
  rating?: number | null;
  bookingUrl?: string | null;
  notes?: string | null;
};

export type BookingResponse = {
  bookingId: string;
  message: string;
};

export type Accommodation = {
  id: string;
  name: string;
  location: string;
  rating: number;
  amenities: string[];
  price: string;
  imageUrl: string;
  category: string;
  bookingUrl?: string | null;
};

export type FlightWebhookResponse = {
  status: string;
  message: string;
};

export type RoutePlan = {
  origin: string;
  destination: string;
  mode: string;
  distance: string;
  duration: string;
  waypoints: string[];
};

export type ChatResponse = {
  answer: string;
};

export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  location: string;
  city: string;
  stateName: string;
  postalCode: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  photoUrl: string;
};

export type AvatarResponse = {
  imageUrl: string;
};
