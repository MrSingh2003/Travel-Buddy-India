import { UserNav } from "@/components/user-nav";
import Link from "next/link";
import { Plane, LayoutDashboard, Car, Hotel, Map } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
    {
        href: "/",
        label: "Dashboard",
    },
    {
      href: "/itinerary-planner",
      label: "AI Itinerary Planner",
    },
    { href: "/local-transport", label: "Local Transport" },
    { href: "/accommodations", label: "Accommodations" },
    { href: "/offline-maps", label: "Offline Maps" },
  ];

export function Header() {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background/90 px-4 backdrop-blur-sm lg:h-[60px] lg:px-6 sticky top-0 z-30">
        <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
            <Plane className="h-6 w-6 text-primary" />
            <span className="font-headline text-lg hidden sm:inline-block">Travel Buddy</span>
        </Link>
      <nav className="hidden md:flex items-center gap-2 mx-auto">
        {navLinks.map((link) => (
            <Button asChild variant="ghost" key={link.href}>
                <Link href={link.href}>
                    {link.label}
                </Link>
            </Button>
        ))}
      </nav>
      <div className="flex items-center justify-end gap-4 ml-auto">
        <UserNav />
      </div>
    </header>
  );
}
