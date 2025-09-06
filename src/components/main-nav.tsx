"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plane, Car, Hotel, Map } from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const navLinks = [
  {
    href: "/itinerary-planner",
    label: "AI Itinerary Planner",
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
            size="lg"
            className="justify-start"
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
