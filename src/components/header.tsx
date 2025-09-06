import { UserNav } from "@/components/user-nav";
import Link from "next/link";
import { Plane, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background/90 px-4 backdrop-blur-sm lg:h-[60px] lg:px-6 sticky top-0 z-30">
      <nav className="flex items-center gap-4">
        <Button asChild variant="ghost">
            <Link href="/" className="flex items-center gap-2">
                <LayoutDashboard />
                <span>Dashboard</span>
            </Link>
        </Button>
      </nav>
      <div className="w-full flex-1 flex items-center justify-end gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-foreground mr-auto">
            <Plane className="h-6 w-6 text-primary" />
            <span className="font-headline text-lg hidden sm:inline-block">Travel Buddy</span>
        </Link>
        <UserNav />
      </div>
    </header>
  );
}
