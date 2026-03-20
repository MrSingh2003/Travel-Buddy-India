import { apiRequest, buildQuery } from "@/lib/api/client";
import type {
  Accommodation,
  AvatarResponse,
  BookingResponse,
  ChatResponse,
  InspirationalImage,
  PersonalizedTripOutput,
  Place,
  RoutePlan,
  TransportOption,
  UserProfile,
} from "@/lib/api/types";

export function generateTrip(payload: {
  currentLocation: string;
  location: string;
  startDate: string;
  endDate: string;
  budget: number;
  numberOfPeople: number;
  interests: string;
}) {
  return apiRequest<PersonalizedTripOutput>("/decision/trip", {
    method: "POST",
    json: payload,
  });
}

export function answerTravelQuestion(question: string) {
  return apiRequest<ChatResponse>("/decision/chat", {
    method: "POST",
    json: { question },
  });
}

export function searchPlaces(query: string, location: string) {
  return apiRequest<Place[]>(`/explore/places?${buildQuery({ query, location })}`);
}

export function generatePoster(query: string, location: string) {
  return apiRequest<InspirationalImage>(
    `/explore/poster?${buildQuery({ query, location })}`
  );
}

export function searchCabs(location: string) {
  return apiRequest<TransportOption[]>(
    `/transport/cabs?${buildQuery({ location })}`
  );
}

export function searchBuses(from: string, to: string) {
  return apiRequest<TransportOption[]>(
    `/transport/buses?${buildQuery({ from, to })}`
  );
}

export function searchTrains(from: string, to: string) {
  return apiRequest<TransportOption[]>(
    `/transport/trains?${buildQuery({ from, to })}`
  );
}

export function bookTransport(serviceType: string, details: string) {
  return apiRequest<BookingResponse>("/transport/book", {
    method: "POST",
    json: { serviceType, details },
  });
}

export function fetchAccommodations(category: string, location: string) {
  return apiRequest<Accommodation[]>(
    `/accommodations?${buildQuery({ category, location })}`
  );
}

export function planRoute(origin: string, destination: string, mode: string) {
  return apiRequest<RoutePlan>(
    `/routes/plan?${buildQuery({ origin, destination, mode })}`
  );
}

export function fetchProfile() {
  return apiRequest<UserProfile>("/profile");
}

export function updateProfile(payload: {
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
}) {
  return apiRequest<UserProfile>("/profile", {
    method: "PUT",
    json: payload,
  });
}

export function generateAvatar(prompt: string) {
  return apiRequest<AvatarResponse>("/profile/avatar", {
    method: "POST",
    json: { prompt },
  });
}
