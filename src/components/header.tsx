import { UserNav } from "@/components/user-nav";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Link from "next/link";
import { Plane } from "lucide-react";

export function Header() {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background/90 px-4 backdrop-blur-sm lg:h-[60px] lg:px-6 sticky top-0 z-30">
      <SidebarTrigger />
      <div className="w-full flex-1 flex items-center justify-end gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
            <Plane className="h-6 w-6 text-primary" />
            <span className="font-headline text-lg hidden sm:inline-block">Travel Buddy</span>
        </Link>
        <UserNav />
      </div>
    </header>
  );
}
