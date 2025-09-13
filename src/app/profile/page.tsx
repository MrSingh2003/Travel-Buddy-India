
'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { User as UserIcon, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
        <div className="max-w-2xl mx-auto py-8">
            <Card>
                <CardHeader className="items-center text-center">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <div className="space-y-2 mt-4">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                   <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                   </div>
                   <Skeleton className="h-10 w-32" />
                </CardContent>
            </Card>
        </div>
    );
  }

  if (!user) {
    return null; // or a message indicating user not found
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader className="items-center text-center">
          <Avatar className="h-24 w-24 text-3xl mb-4 border-2 border-primary">
            <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
            <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-3xl font-headline">{user.displayName || 'No Name Provided'}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-muted rounded-md">
                    <UserIcon className="h-5 w-5 text-muted-foreground" />
                    <p><strong>Full Name:</strong> {user.displayName || 'N/A'}</p>
                </div>
                <div className="flex items-center gap-4 p-3 bg-muted rounded-md">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <p><strong>Email:</strong> {user.email || 'N/A'}</p>
                </div>
                 <div className="flex items-center gap-4 p-3 bg-muted rounded-md">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <p><strong>Phone Number:</strong> {user.phoneNumber || 'N/A'}</p>
                </div>
            </div>
            <Button disabled>Edit Profile</Button>
        </CardContent>
      </Card>
    </div>
  );
}
