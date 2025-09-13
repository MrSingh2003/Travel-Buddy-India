
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-3xl">Settings</CardTitle>
                <CardDescription>Manage your account and application preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Account Information</h3>
                    <div className="grid gap-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" defaultValue="John Doe" disabled/>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue="john.doe@example.com" disabled/>
                    </div>
                    <Button variant="outline" disabled>Change Password</Button>
                </div>

                <Separator />

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Notifications</h3>
                    <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                            <Label htmlFor="trip-updates">Trip Updates</Label>
                            <p className="text-xs text-muted-foreground">
                                Receive email notifications about your upcoming trips.
                            </p>
                        </div>
                        <Switch id="trip-updates" defaultChecked disabled/>
                    </div>
                     <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                            <Label htmlFor="promotions">Promotions</Label>
                            <p className="text-xs text-muted-foreground">
                                Receive promotional offers and newsletters.
                            </p>
                        </div>
                        <Switch id="promotions" disabled/>
                    </div>
                </div>

                 <Separator />

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Danger Zone</h3>
                    <div className="flex items-center justify-between rounded-lg border border-destructive/50 p-3">
                        <div className="space-y-0.5">
                            <Label htmlFor="delete-account" className="text-destructive">Delete Account</Label>
                            <p className="text-xs text-muted-foreground">
                                Permanently delete your account and all associated data.
                            </p>
                        </div>
                        <Button variant="destructive" disabled>Delete</Button>
                    </div>
                </div>

            </CardContent>
        </Card>
    </div>
  );
}
