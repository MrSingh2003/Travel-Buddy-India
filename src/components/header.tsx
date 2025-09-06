import Link from "next/link";
import { Plane, LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/user-nav";

const navLinks = [
    { href: "/", label: "Dashboard" },
    { href: "/itinerary-planner", label: "AI Itinerary Planner" },
    { href: "/local-transport", label: "Local Transport" },
    { href: "/accommodations", label: "Accommodations" },
    { href: "/offline-maps", label: "Offline Maps" },
    { href: "/support", label: "Support" },
];

export function Header() {
  return (
    <header className="flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm lg:h-20 lg:px-6 sticky top-0 z-30">
        <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
            <Plane className="h-7 w-7 text-primary" />
            <span className="font-headline text-xl hidden sm:inline-block">Travel Buddy</span>
        </Link>
      <nav className="hidden md:flex items-center gap-2 mx-auto">
        {navLinks.map((link) => (
            <Button asChild variant="ghost" key={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
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
