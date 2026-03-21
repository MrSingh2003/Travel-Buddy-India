import { Navigate, Route, Routes } from 'react-router-dom';
import { Header } from '@/components/header';
import { Chatbot } from '@/components/chatbot';
import { Footer } from '@/components/footer';
import { ThemeProvider } from '@/components/theme-provider';
import { LanguageProvider } from '@/components/language-provider';
import { Toaster } from '@/components/ui/toaster';
import DashboardPage from '@/app/page';
import TripPlannerPage from '@/app/trip-planner/page';
import ExplorePage from '@/app/explore/page';
import LocalTransportPage from '@/app/local-transport/page';
import AccommodationsPage from '@/app/accommodations/page';
import RoutePlannerPage from '@/app/route-planner/page';
import ProfilePage from '@/app/profile/page';
import LoginPage from '@/app/login/page';
import SignupPage from '@/app/signup/page';
import SupportPage from '@/app/support/page';
import SettingsPage from '@/app/settings/page';
import ItineraryPlannerPage from '@/app/itinerary-planner/page';
import OfflineMapsPage from '@/app/offline-maps/page';

function NotFoundPage() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-headline">Page not found</h1>
        <p className="mt-3 text-muted-foreground">
          The route you requested does not exist in the React frontend.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
      <LanguageProvider>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex flex-1 flex-col gap-4 bg-background p-4 lg:gap-6 lg:p-6">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/trip-planner" element={<TripPlannerPage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/local-transport" element={<LocalTransportPage />} />
              <Route path="/accommodations" element={<AccommodationsPage />} />
              <Route path="/route-planner" element={<RoutePlannerPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/itinerary-planner" element={<ItineraryPlannerPage />} />
              <Route path="/offline-maps" element={<OfflineMapsPage />} />
              <Route path="*" element={<NotFoundPage />} />
              <Route path="/dashboard" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
        <Chatbot />
        <Toaster />
      </LanguageProvider>
    </ThemeProvider>
  );
}
