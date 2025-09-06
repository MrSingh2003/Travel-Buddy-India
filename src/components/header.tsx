import { UserNav } from "@/components/user-nav";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function Header() {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background/90 px-4 backdrop-blur-sm lg:h-[60px] lg:px-6 sticky top-0 z-30">
      <SidebarTrigger />
      <div className="w-full flex-1">
        {/* Optional: Add breadcrumbs or page title here */}
      </div>
      <UserNav />
    </header>
  );
}
