
'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { User as UserIcon, Mail, Phone, Image as ImageIcon, Wand2, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { generateAvatar } from '@/ai/flows/generate-avatar';
import { uploadFile, updateUserProfilePhoto } from '@/lib/services/storage';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Avatar Generation State
  const [avatarPrompt, setAvatarPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAvatar, setGeneratedAvatar] = useState<string | null>(null);

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleGenerateAvatar = async () => {
    if (!avatarPrompt.trim()) {
        toast({ variant: 'destructive', title: 'Prompt is empty', description: 'Please describe the avatar you want.' });
        return;
    }
    setIsGenerating(true);
    setGeneratedAvatar(null);
    try {
        const { dataUri } = await generateAvatar({ prompt: avatarPrompt });
        setGeneratedAvatar(dataUri);
    } catch (error) {
        console.error("Avatar generation failed:", error);
        toast({ variant: 'destructive', title: 'Generation Failed', description: 'Could not create avatar. Please try again.' });
    } finally {
        setIsGenerating(false);
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  }

  const handleUploadPhoto = async () => {
      if (!selectedFile || !user) return;
      setIsUploading(true);
      try {
        const photoURL = await updateUserProfilePhoto(user.uid, selectedFile);
        await updateProfile(user, { photoURL });

        // Force a refresh of the user object to get the new photoURL
        await user.reload();
        setUser(auth.currentUser); 

        toast({ title: 'Success', description: 'Your profile photo has been updated.' });
        setDialogOpen(false);
      } catch (error) {
        console.error("Photo upload failed:", error);
        toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not upload your photo. Please try again.' });
      } finally {
        setIsUploading(false);
      }
  }

  const handleUseGeneratedAvatar = async () => {
      if (!generatedAvatar || !user) return;
      setIsUpdating(true);
      try {
          const blob = await (await fetch(generatedAvatar)).blob();
          const file = new File([blob], "generated-avatar.png", { type: "image/png" });

          const photoURL = await updateUserProfilePhoto(user.uid, file);
          await updateProfile(user, { photoURL });
          
          await user.reload();
          setUser(auth.currentUser);
          
          toast({ title: 'Success', description: 'Your avatar has been updated.' });
          setDialogOpen(false);
      } catch (error) {
          console.error("Avatar update failed:", error);
          toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not set avatar. Please try again.' });
      } finally {
          setIsUpdating(false);
      }
  }

  const resetDialogState = () => {
      setAvatarPrompt('');
      setGeneratedAvatar(null);
      setSelectedFile(null);
      setFilePreview(null);
  }

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
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-32" />
                </CardFooter>
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
        </CardContent>
         <CardFooter>
            <Dialog open={dialogOpen} onOpenChange={(isOpen) => {
                setDialogOpen(isOpen);
                if (!isOpen) resetDialogState();
            }}>
                <DialogTrigger asChild>
                    <Button>Edit Profile</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                    <DialogTitle>Update Profile Picture</DialogTitle>
                    <DialogDescription>
                        Choose to upload your own photo or generate a new avatar with AI.
                    </DialogDescription>
                    </DialogHeader>
                    <Tabs defaultValue="upload" className="w-full">
                        <TabsList className='grid w-full grid-cols-2'>
                            <TabsTrigger value="upload">Upload Photo</TabsTrigger>
                            <TabsTrigger value="generate">Generate Avatar</TabsTrigger>
                        </TabsList>
                        <TabsContent value="upload" className='py-4'>
                            <div className="space-y-4">
                                <Input id="picture" type="file" accept="image/*" onChange={handleFileSelect} disabled={isUploading}/>
                                {filePreview && (
                                    <div className='flex flex-col items-center gap-4'>
                                         <Avatar className="h-32 w-32">
                                            <AvatarImage src={filePreview} />
                                            <AvatarFallback>Preview</AvatarFallback>
                                        </Avatar>
                                        <Button onClick={handleUploadPhoto} disabled={isUploading || !selectedFile}>
                                            {isUploading && <Loader2 className='animate-spin'/>}
                                            Upload and Save
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                        <TabsContent value="generate" className='py-4'>
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <Input 
                                        placeholder="e.g., a smiling astronaut in a comic book style"
                                        value={avatarPrompt}
                                        onChange={(e) => setAvatarPrompt(e.target.value)}
                                        disabled={isGenerating || isUpdating}
                                        />
                                    <Button onClick={handleGenerateAvatar} disabled={isGenerating || isUpdating}>
                                        {isGenerating ? <Loader2 className='animate-spin'/> : <Wand2/>}
                                    </Button>
                                </div>
                                 {isGenerating && <p className='text-sm text-muted-foreground text-center'>Generating your avatar...</p>}
                                 {generatedAvatar && (
                                    <div className='flex flex-col items-center gap-4'>
                                        <Avatar className="h-32 w-32">
                                            <AvatarImage src={generatedAvatar} />
                                            <AvatarFallback>Avatar</AvatarFallback>
                                        </Avatar>
                                        <Button onClick={handleUseGeneratedAvatar} disabled={isUpdating}>
                                            {isUpdating && <Loader2 className='animate-spin'/>}
                                            Use this Avatar
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
    </div>
  );
}
