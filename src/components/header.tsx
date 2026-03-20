
// src/components/header.tsx
'use client';

import * as React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Globe, Search, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserNav } from '@/components/user-nav';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { ThemeToggle } from './theme-toggle';
import { Separator } from './ui/separator';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { languages, useLanguage } from './language-provider';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from './ui/scroll-area';


const navLinks = [
  { to: '/', labelKey: 'dashboard' },
  { to: '/support', labelKey: 'support' },
];

export function Header() {
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { language, setLanguage, t } = useLanguage();
  const [langPopoverOpen, setLangPopoverOpen] = useState(false);

  const headerActionButtonClass =
    "h-11 w-11 rounded-2xl border border-emerald-200/80 bg-emerald-50 text-emerald-700 shadow-sm transition-all duration-300 hover:bg-emerald-100 hover:text-emerald-800 dark:border-violet-300/20 dark:bg-violet-200/10 dark:text-violet-100 dark:shadow-[0_8px_30px_rgba(167,139,250,0.18)] dark:hover:bg-violet-200/20 dark:hover:text-violet-50";

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
        to="/"
        className="flex items-center gap-2 font-semibold text-foreground"
      >
        <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-md">
          <svg
            viewBox="0 0 64 64"
            className="h-8 w-8 drop-shadow-[0_2px_8px_rgba(19,136,8,0.18)]"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="indiaTricolor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF9933" />
                <stop offset="34%" stopColor="#FF9933" />
                <stop offset="34%" stopColor="#FFFFFF" />
                <stop offset="66%" stopColor="#FFFFFF" />
                <stop offset="66%" stopColor="#138808" />
                <stop offset="100%" stopColor="#138808" />
              </linearGradient>
            </defs>
            <path
              d="M27 4l6 2 4 5 5 2 2 6-1 6 2 5-1 4 2 5-3 6-1 5-4 4-3 5-2 7-4 5-2-2-2-8-3-6-5-5-3-7-1-7-4-4 1-6 4-4 3-6 4-4 3-8z"
              fill="url(#indiaTricolor)"
              stroke="currentColor"
              strokeWidth="2.2"
              className="text-slate-900 dark:text-slate-50"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <path
              d="M46 22l6 1 4 3-1 4-5 2-4-2-1-4z"
              fill="url(#indiaTricolor)"
              stroke="currentColor"
              strokeWidth="1.8"
              className="text-slate-900 dark:text-slate-50"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <circle cx="31" cy="29.5" r="4.2" fill="none" stroke="#1A2B6D" strokeWidth="1.8" />
            <circle cx="31" cy="29.5" r="1.1" fill="#1A2B6D" />
          </svg>
        </span>
        <span className="font-headline text-xl text-transparent bg-[linear-gradient(180deg,#FF9933_0%,#FF9933_32%,#0F172A_32%,#0F172A_68%,#138808_68%,#138808_100%)] bg-clip-text dark:bg-[linear-gradient(180deg,#FF9933_0%,#FF9933_32%,#F8FAFC_32%,#F8FAFC_68%,#138808_68%,#138808_100%)]">
          Travel Buddy
        </span>
      </Link>
      <nav className="hidden md:flex items-center gap-2 mx-auto">
        {navLinks.map((link, index) => (
            <React.Fragment key={link.to}>
              <Button
                asChild
                variant="ghost"
                className="text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-105 hover:drop-shadow-lg"
              >
                <Link to={link.to}>
                {t(`nav.${link.labelKey}`)}</Link>
              </Button>
              {index < navLinks.length - 1 && <Separator orientation="vertical" className="h-6" />}
            </React.Fragment>
        ))}
      </nav>
      <div className="flex items-center justify-end gap-2 ml-auto">
        <ThemeToggle />
        <Popover open={langPopoverOpen} onOpenChange={setLangPopoverOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className={headerActionButtonClass}>
                <Globe className="h-5 w-5" />
                <span className="sr-only">{t('selectLanguage')}</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-1 w-48" align="end">
                <ScrollArea className="h-64">
                {Object.entries(languages).map(([code, name]) => (
                    <Button
                        key={code}
                        variant="ghost"
                        className={cn("w-full justify-start", language === code && "font-bold")}
                        onClick={() => {
                            setLanguage(code);
                            setLangPopoverOpen(false);
                        }}
                    >
                       <Check className={cn("mr-2 h-4 w-4", language === code ? "opacity-100" : "opacity-0")} />
                       {name}
                    </Button>
                ))}
                </ScrollArea>
            </PopoverContent>
        </Popover>
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className={headerActionButtonClass}>
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pt-12">
              <nav className="grid gap-4 text-lg">
                {navLinks.map(link => (
                  <SheetClose asChild key={link.to}>
                    <Link
                      to={link.to}
                      className="flex w-full items-center py-2 text-lg font-semibold"
                    >
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
