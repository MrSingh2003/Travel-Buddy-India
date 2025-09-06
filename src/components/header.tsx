// src/components/header.tsx
import Link from 'next/link';
import { Plane, Menu, Globe } from 'lucide-react';
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
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from './theme-toggle';
import { Separator } from './ui/separator';


const navLinks = [
  { href: '/', label: 'Dashboard' },
  { href: '/support', label: 'Support' },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm lg:h-20 lg:px-6">
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
         <Button
            asChild
            variant="ghost"
            key={navLinks[0].href}
            className="text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-105 hover:drop-shadow-lg"
          >
            <Link href={navLinks[0].href}>{navLinks[0].label}</Link>
          </Button>
          <Separator orientation="vertical" className="h-6" />
           <Button
            asChild
            variant="ghost"
            key={navLinks[1].href}
            className="text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-105 hover:drop-shadow-lg"
          >
            <Link href={navLinks[1].href}>{navLinks[1].label}</Link>
          </Button>
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
            <DropdownMenuContent align="end">
                <DropdownMenuItem>English</DropdownMenuItem>
                <DropdownMenuItem>Assamese</DropdownMenuItem>
                <DropdownMenuItem>Bengali</DropdownMenuItem>
                <DropdownMenuItem>Bodo</DropdownMenuItem>
                <DropdownMenuItem>Dogri</DropdownMenuItem>
                <DropdownMenuItem>Gujarati</DropdownMenuItem>
                <DropdownMenuItem>Hindi</DropdownMenuItem>
                <DropdownMenuItem>Kannada</DropdownMenuItem>
                <DropdownMenuItem>Kashmiri</DropdownMenuItem>
                <DropdownMenuItem>Konkani</DropdownMenuItem>
                <DropdownMenuItem>Maithili</DropdownMenuItem>
                <DropdownMenuItem>Malayalam</DropdownMenuItem>
                <DropdownMenuItem>Manipuri</DropdownMenuItem>
                <DropdownMenuItem>Marathi</DropdownMenuItem>
                <DropdownMenuItem>Nepali</DropdownMenuItem>
                <DropdownMenuItem>Odia</DropdownMenuItem>
                <DropdownMenuItem>Punjabi</DropdownMenuItem>
                <DropdownMenuItem>Sanskrit</DropdownMenuItem>
                <DropdownMenuItem>Santali</DropdownMenuItem>
                <DropdownMenuItem>Sindhi</DropdownMenuItem>
                <DropdownMenuItem>Tamil</DropdownMenuItem>
                <DropdownMenuItem>Telugu</DropdownMenuItem>
                <DropdownMenuItem>Urdu</DropdownMenuItem>
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
                      {link.label}
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
