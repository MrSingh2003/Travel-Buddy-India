
// src/components/user-nav.tsx
"use client";

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Settings, User as UserIcon, UserCircle } from "lucide-react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { fetchProfile } from "@/lib/api/travel-buddy";
import type { UserProfile } from "@/lib/api/types";
import {
  clearProfileSession,
  getProfileSessionEventName,
  loadProfileSession,
  saveProfileSession,
} from "@/lib/profile-session";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { useToast } from "@/hooks/use-toast";

export function UserNav() {
  const [user, setUser] = useState<User | null>(null);
  const [profileView, setProfileView] = useState<Partial<UserProfile> | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const triggerClass =
    "relative h-11 w-11 rounded-2xl border border-emerald-200/80 bg-emerald-50 text-emerald-700 shadow-sm transition-all duration-300 hover:bg-emerald-100 hover:text-emerald-800 dark:border-violet-300/20 dark:bg-violet-200/10 dark:text-violet-100 dark:shadow-[0_8px_30px_rgba(167,139,250,0.18)] dark:hover:bg-violet-200/20 dark:hover:text-violet-50";

  useEffect(() => {
    const applySessionProfile = (currentUser: User | null, stored?: Partial<UserProfile> | null) => {
      const sessionProfile = stored ?? loadProfileSession();
      const firebaseName = currentUser?.displayName?.trim() || "User";
      const firebaseEmail = currentUser?.email?.trim() || "";
      const firebasePhoto = currentUser?.photoURL?.trim() || "";
      const sessionName = sessionProfile?.fullName?.trim();
      const sessionEmail = sessionProfile?.email?.trim();
      const sessionPhoto = sessionProfile?.photoUrl?.trim();

      setProfileView({
        fullName: sessionName || firebaseName,
        email: sessionEmail || firebaseEmail,
        photoUrl: sessionPhoto || firebasePhoto,
      });
    };

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      applySessionProfile(currentUser);

      if (!currentUser) {
        setProfileView(null);
        return;
      }

      try {
        const profile = await fetchProfile();
        saveProfileSession(profile);
        applySessionProfile(currentUser, profile);
      } catch {
        applySessionProfile(currentUser);
      }
    });

    const syncFromProfilePage = (event: Event) => {
      const customEvent = event as CustomEvent<Partial<UserProfile> | null>;
      applySessionProfile(auth.currentUser, customEvent.detail);
    };

    window.addEventListener(getProfileSessionEventName(), syncFromProfilePage as EventListener);

    return () => {
      unsubscribe();
      window.removeEventListener(getProfileSessionEventName(), syncFromProfilePage as EventListener);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      clearProfileSession();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      navigate('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "Could not log you out. Please try again.",
      });
    }
  };
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return "";
    const names = name.split(' ');
    return names.map(n => n[0]).join('').toUpperCase();
  }

  if (user) {
    const displayName = profileView?.fullName || user.displayName || "User";
    const displayEmail = profileView?.email || user.email || "";
    const displayPhoto = profileView?.photoUrl || user.photoURL || "";

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className={triggerClass}>
            <Avatar className="h-9 w-9">
               <AvatarImage src={displayPhoto} alt={displayName} />
              <AvatarFallback>
                {displayName ? getInitials(displayName) : <UserCircle className="h-7 w-7" />}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{displayName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                {displayEmail}
                </p>
            </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link to="/profile">
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link to="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
            </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={triggerClass}>
          <Avatar className="h-9 w-9">
            <AvatarFallback>
              <UserCircle className="h-7 w-7" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48" align="end" forceMount>
        <DropdownMenuItem asChild>
          <Link to="/login">Log in</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/signup">Sign up</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
