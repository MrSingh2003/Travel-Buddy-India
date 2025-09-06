"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Plane, Car, Hotel, Map } from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const navLinks = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  {
    href: "/itinerary-planner",
    label: "Itinerary Planner",
    icon: Plane,
  },
  { href: "/local-transport", label: "Local Transport", icon: Car },
  { href: "/accommodations", label: "Accommodations", icon: Hotel },
  { href: "/offline-maps", label: "Offline Maps", icon: Map },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navLinks.map(({ href, label, icon: Icon }) => (
        <SidebarMenuItem key={href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === href}
            tooltip={label}
          >
            <Link href={href}>
              <Icon />
              <span>{label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
