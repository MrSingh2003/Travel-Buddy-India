// src/components/header.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Plane, Menu, Globe, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserNav } from '@/components/user-nav';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from './theme-toggle';
import { Separator } from './ui/separator';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { languages, useLanguage } from './language-provider';

const navLinks = [
  { href: '/', labelKey: 'dashboard' },
  { href: '/support', labelKey: 'support' },
];

export function Header() {
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // Hide header on scroll down, show on scroll up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm transition-transform duration-300 lg:h-20 lg:px-6',
        isHidden ? '-translate-y-full' : 'translate-y-0'
      )}
    >
      <Link
        href="/"
        className="flex items-center gap-2 font-semibold text-foreground"
      >
        <Plane className="h-7 w-7 text-primary" />
        <span className="font-headline text-xl hidden sm:inline-block">
          Travel Buddy
        </span>
      </Link>
      <nav className="hidden md:flex items-center gap-2 mx-auto">
        {navLinks.map((link, index) => (
            <React.Fragment key={link.href}>
              <Button
                asChild
                variant="ghost"
                className="text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-105 hover:drop-shadow-lg"
              >
                <Link href={link.href}>
                {link.icon && <link.icon className="mr-2 h-4 w-4" />}
                {t(`nav.${link.labelKey}`)}</Link>
              </Button>
              {index < navLinks.length - 1 && <Separator orientation="vertical" className="h-6" />}
            </React.Fragment>
        ))}
      </nav>
      <div className="flex items-center justify-end gap-2 ml-auto">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Globe className="h-5 w-5" />
              <span className="sr-only">Select Language</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="max-h-80 overflow-y-auto"
          >
            <DropdownMenuLabel>{t('selectLanguage')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={language} onValueChange={setLanguage}>
                {Object.entries(languages).map(([code, name]) => (
                    <DropdownMenuRadioItem key={code} value={code}>{name}</DropdownMenuRadioItem>
                ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pt-12">
              <nav className="grid gap-4 text-lg">
                {navLinks.map(link => (
                  <SheetClose asChild key={link.href}>
                    <Link
                      href={link.href}
                      className="flex w-full items-center py-2 text-lg font-semibold"
                    >
                       {link.icon && <link.icon className="mr-3 h-5 w-5" />}
                      {t(`nav.${link.labelKey}`)}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
        <UserNav />
      </div>
    </header>
  );
}
