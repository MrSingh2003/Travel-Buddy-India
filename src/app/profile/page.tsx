'use client';

import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchProfile, generateAvatar, updateProfile } from '@/lib/api/travel-buddy';
import type { UserProfile } from '@/lib/api/types';
import { auth } from '@/lib/firebase';
import { saveProfileSession } from '@/lib/profile-session';
import {
  Loader2,
  MapPin,
  PencilLine,
  Phone,
  Save,
  Shield,
  User as UserIcon,
  Wand2,
} from 'lucide-react';

const emptyProfile: UserProfile = {
  id: 'demo-user',
  fullName: 'Your Name',
  email: 'yourname@example.com',
  phoneNumber: '+91-9876543210',
  location: 'Your area, your city, your state',
  city: 'Your City',
  stateName: 'Your State',
  postalCode: '000000',
  emergencyContactName: 'Emergency Contact',
  emergencyContactPhone: '+91-9876543211',
  photoUrl: '',
};

function normalizeProfile(profile: UserProfile, fallback: UserProfile) {
  const looksLikeLegacyDemo =
    /aarav sharma/i.test(profile.fullName || '') ||
    /aarav\.sharma@example\.com/i.test(profile.email || '');

  if (!looksLikeLegacyDemo) {
    return {
      ...fallback,
      ...profile,
    };
  }

  return {
    ...fallback,
    ...profile,
    fullName: fallback.fullName,
    email: fallback.email,
    phoneNumber: profile.phoneNumber || fallback.phoneNumber,
    location: profile.location || fallback.location,
    city: profile.city || fallback.city,
    stateName: profile.stateName || fallback.stateName,
    postalCode: profile.postalCode || fallback.postalCode,
    emergencyContactName: profile.emergencyContactName || fallback.emergencyContactName,
    emergencyContactPhone: profile.emergencyContactPhone || fallback.emergencyContactPhone,
  };
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [saveMode, setSaveMode] = useState<'connected' | 'offline'>('connected');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [avatarPrompt, setAvatarPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAvatar, setGeneratedAvatar] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [baseProfile, setBaseProfile] = useState<UserProfile>(emptyProfile);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setBaseProfile(emptyProfile);
        return;
      }

      const displayName = user.displayName?.trim() || emptyProfile.fullName;
      const email = user.email?.trim() || emptyProfile.email;
      setBaseProfile((current) => ({
        ...current,
        fullName: displayName,
        email,
        photoUrl: user.photoURL || current.photoUrl,
      }));
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let active = true;

    fetchProfile()
      .then((data) => {
        if (!active) return;
        const normalized = normalizeProfile(data, baseProfile);
        setProfile(normalized);
        saveProfileSession(normalized);
        setSaveMode('connected');
      })
      .catch(() => {
        if (!active) return;
        setProfile((current) => {
          const normalized = normalizeProfile(current, baseProfile);
          saveProfileSession(normalized);
          return normalized;
        });
        setSaveMode('offline');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [baseProfile]);

  const initials = useMemo(() => {
    const value = profile.fullName?.trim();
    if (!value) return 'TB';
    return value
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }, [profile.fullName]);

  const handleFieldChange = (field: keyof UserProfile) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const saveProfile = async (nextPhotoUrl?: string) => {
    setIsUpdating(true);
    const draftProfile = {
      ...profile,
      photoUrl: nextPhotoUrl ?? profile.photoUrl,
    };
    try {
      const updated = await updateProfile({
        fullName: draftProfile.fullName,
        email: draftProfile.email,
        phoneNumber: draftProfile.phoneNumber,
        location: draftProfile.location,
        city: draftProfile.city,
        stateName: draftProfile.stateName,
        postalCode: draftProfile.postalCode,
        emergencyContactName: draftProfile.emergencyContactName,
        emergencyContactPhone: draftProfile.emergencyContactPhone,
        photoUrl: draftProfile.photoUrl,
      });
      const normalized = normalizeProfile(updated, baseProfile);
      setProfile({
        ...normalized,
      });
      saveProfileSession(normalized);
      setSaveMode('connected');
    } catch {
      setProfile(draftProfile);
      saveProfileSession(draftProfile);
      setSaveMode('offline');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleGenerateAvatar = async () => {
    if (!avatarPrompt.trim()) {
      return;
    }

    setIsGenerating(true);
    setGeneratedAvatar(null);
    try {
      const { imageUrl } = await generateAvatar(avatarPrompt);
      setGeneratedAvatar(imageUrl);
    } catch {
      setGeneratedAvatar(`https://picsum.photos/seed/${encodeURIComponent(avatarPrompt)}/512/512`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadPhoto = async () => {
    if (!selectedFile || !filePreview) return;
    setIsUploading(true);
    try {
      await saveProfile(filePreview);
      setDialogOpen(false);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUseGeneratedAvatar = async () => {
    if (!generatedAvatar) return;
    await saveProfile(generatedAvatar);
    setDialogOpen(false);
  };

  const resetDialogState = () => {
    setAvatarPrompt('');
    setGeneratedAvatar(null);
    setSelectedFile(null);
    setFilePreview(null);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl py-8">
        <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
          <Card>
            <CardHeader className="items-center text-center">
              <Skeleton className="h-28 w-28 rounded-full" />
              <Skeleton className="mt-4 h-8 w-48" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl py-8">
      <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <Card className="h-fit border-primary/20 bg-card/95">
          <CardHeader className="items-center text-center">
            <Avatar className="mb-4 h-28 w-28 border-2 border-primary text-3xl">
              <AvatarImage src={profile.photoUrl || ''} alt={profile.fullName || 'Travel Buddy user'} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-3xl font-headline">
              {profile.fullName || 'Set up your profile'}
            </CardTitle>
            <CardDescription>{profile.email || 'Add an email address for travel updates'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4 text-sm">
              <p className="font-medium">
                {saveMode === 'connected' ? 'Profile sync active' : 'Offline profile mode'}
              </p>
              <p className="mt-1 text-muted-foreground">
                {saveMode === 'connected'
                  ? 'Changes are connected to the Java backend and can be stored centrally.'
                  : 'The backend is not reachable right now, so changes stay visible locally until the server reconnects.'}
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4 text-sm">
              <p className="font-medium">Traveler Snapshot</p>
              <p className="mt-1 text-muted-foreground">
                Keep your phone number, address, and emergency contact updated for bookings and route assistance.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Traveler Name</p>
                  <p className="font-medium">{profile.fullName || 'Not provided yet'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Primary Phone</p>
                  <p className="font-medium">{profile.phoneNumber || 'Add your number'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Home Location</p>
                  <p className="font-medium">{profile.location || 'Add your location'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Emergency Contact</p>
                  <p className="font-medium">
                    {profile.emergencyContactName || 'Not set'}
                    {profile.emergencyContactPhone ? ` | ${profile.emergencyContactPhone}` : ''}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Dialog
              open={dialogOpen}
              onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) resetDialogState();
              }}
            >
              <DialogTrigger asChild>
                <Button className="w-full">
                  <PencilLine className="mr-2 h-4 w-4" />
                  Change Avatar
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Update Profile Picture</DialogTitle>
                  <DialogDescription>
                    Upload a new image or generate a polished AI avatar for your travel identity.
                  </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="upload" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload">Upload Photo</TabsTrigger>
                    <TabsTrigger value="generate">Generate Avatar</TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload" className="py-4">
                    <div className="space-y-4">
                      <Input id="picture" type="file" accept="image/*" onChange={handleFileSelect} disabled={isUploading} />
                      {filePreview && (
                        <div className="flex flex-col items-center gap-4">
                          <Avatar className="h-32 w-32">
                            <AvatarImage src={filePreview} />
                            <AvatarFallback>Preview</AvatarFallback>
                          </Avatar>
                          <Button onClick={handleUploadPhoto} disabled={isUploading || !selectedFile}>
                            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Upload and Save
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="generate" className="py-4">
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="e.g. confident traveler portrait in digital painting style"
                          value={avatarPrompt}
                          onChange={(event) => setAvatarPrompt(event.target.value)}
                          disabled={isGenerating || isUpdating}
                        />
                        <Button onClick={handleGenerateAvatar} disabled={isGenerating || isUpdating}>
                          {isGenerating ? <Loader2 className="animate-spin" /> : <Wand2 />}
                        </Button>
                      </div>
                      {isGenerating && (
                        <p className="text-center text-sm text-muted-foreground">Generating your avatar...</p>
                      )}
                      {generatedAvatar && (
                        <div className="flex flex-col items-center gap-4">
                          <Avatar className="h-32 w-32">
                            <AvatarImage src={generatedAvatar} />
                            <AvatarFallback>AI</AvatarFallback>
                          </Avatar>
                          <Button onClick={handleUseGeneratedAvatar} disabled={isUpdating}>
                            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Use This Avatar
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>

        <Card className="border-primary/20 bg-card/95">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="font-headline text-2xl">Profile Details</CardTitle>
              <CardDescription>
                View your saved contact, address, and emergency information here. Use edit whenever you want to update it.
              </CardDescription>
            </div>
            <Button onClick={() => setEditProfileOpen(true)}>
              <PencilLine className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border bg-muted/40 p-4">
                <p className="text-xs text-muted-foreground">Full Name</p>
                <p className="mt-2 text-lg font-medium">{profile.fullName || 'Not provided yet'}</p>
              </div>
              <div className="rounded-lg border bg-muted/40 p-4">
                <p className="text-xs text-muted-foreground">Email Address</p>
                <p className="mt-2 text-lg font-medium">{profile.email || 'Not provided yet'}</p>
              </div>
              <div className="rounded-lg border bg-muted/40 p-4">
                <p className="text-xs text-muted-foreground">Phone Number</p>
                <p className="mt-2 text-lg font-medium">{profile.phoneNumber || 'Not provided yet'}</p>
              </div>
              <div className="rounded-lg border bg-muted/40 p-4">
                <p className="text-xs text-muted-foreground">Full Address</p>
                <p className="mt-2 text-lg font-medium">{profile.location || 'Not provided yet'}</p>
              </div>
              <div className="rounded-lg border bg-muted/40 p-4">
                <p className="text-xs text-muted-foreground">City</p>
                <p className="mt-2 text-lg font-medium">{profile.city || 'Not provided yet'}</p>
              </div>
              <div className="rounded-lg border bg-muted/40 p-4">
                <p className="text-xs text-muted-foreground">State</p>
                <p className="mt-2 text-lg font-medium">{profile.stateName || 'Not provided yet'}</p>
              </div>
              <div className="rounded-lg border bg-muted/40 p-4">
                <p className="text-xs text-muted-foreground">PIN Code</p>
                <p className="mt-2 text-lg font-medium">{profile.postalCode || 'Not provided yet'}</p>
              </div>
              <div className="rounded-lg border bg-muted/40 p-4">
                <p className="text-xs text-muted-foreground">Emergency Contact Name</p>
                <p className="mt-2 text-lg font-medium">{profile.emergencyContactName || 'Not provided yet'}</p>
              </div>
              <div className="rounded-lg border bg-muted/40 p-4 md:col-span-2">
                <p className="text-xs text-muted-foreground">Emergency Contact Phone</p>
                <p className="mt-2 text-lg font-medium">{profile.emergencyContactPhone || 'Not provided yet'}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border bg-muted/40 p-4">
                <p className="mb-1 text-sm font-medium">Booking Safety</p>
                <p className="text-sm text-muted-foreground">
                  Verified transport bookings and itinerary alerts work better when the traveler phone number is current.
                </p>
              </div>
              <div className="rounded-lg border bg-muted/40 p-4">
                <p className="mb-1 text-sm font-medium">Emergency Readiness</p>
                <p className="text-sm text-muted-foreground">
                  Adding a second contact helps if you are traveling in remote hill stations or long intercity routes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Edit Profile Details</DialogTitle>
            <DialogDescription>
              Update the main contact columns for this traveler account, including phone number, address, and emergency details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={profile.fullName}
                  onChange={handleFieldChange('fullName')}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={handleFieldChange('email')}
                  placeholder="Enter your email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={profile.phoneNumber}
                  onChange={handleFieldChange('phoneNumber')}
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Full Address</Label>
                <Input
                  id="location"
                  value={profile.location}
                  onChange={handleFieldChange('location')}
                  placeholder="Street, area, city, state"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={profile.city}
                  onChange={handleFieldChange('city')}
                  placeholder="Enter city"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stateName">State</Label>
                <Input
                  id="stateName"
                  value={profile.stateName}
                  onChange={handleFieldChange('stateName')}
                  placeholder="Enter state"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">PIN Code</Label>
                <Input
                  id="postalCode"
                  value={profile.postalCode}
                  onChange={handleFieldChange('postalCode')}
                  placeholder="Enter postal code"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                <Input
                  id="emergencyContactName"
                  value={profile.emergencyContactName}
                  onChange={handleFieldChange('emergencyContactName')}
                  placeholder="Who should we contact in emergencies?"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                <Input
                  id="emergencyContactPhone"
                  value={profile.emergencyContactPhone}
                  onChange={handleFieldChange('emergencyContactPhone')}
                  placeholder="Emergency contact number"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setEditProfileOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  await saveProfile();
                  setEditProfileOpen(false);
                }}
                disabled={isUpdating}
              >
                {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Profile
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
