import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarInset,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { Plane } from 'lucide-react';
import { MainNav } from '@/components/main-nav';
import { Header } from '@/components/header';
import { Chatbot } from '@/components/chatbot';

export const metadata: Metadata = {
  title: 'Travel Buddy India',
  description: 'Your ultimate travel companion for exploring India.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <SidebarProvider>
          <Sidebar collapsible="icon">
            <SidebarHeader>
              <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
                <Plane className="h-6 w-6 text-primary" />
                <span className="font-headline text-lg">Travel Buddy</span>
              </Link>
            </SidebarHeader>
            <SidebarContent>
              <MainNav />
            </SidebarContent>
          </Sidebar>
          <SidebarInset>
            <Header />
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
        <Chatbot />
        <Toaster />
      </body>
    </html>
  );
}
