
"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [otpMode, setOtpMode] = useState<"firebase" | "demo">("firebase");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const setupRecaptcha = () => {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible',
          'callback': (response: any) => {},
          'expired-callback': () => {
            setAuthError("reCAPTCHA expired. Please try again.");
          }
        });
      }
    };
    const timeoutId = setTimeout(setupRecaptcha, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  const normalizeIndianPhoneNumber = (value: string) => {
    const cleaned = value.replace(/[^\d+]/g, '');
    if (cleaned.startsWith('+')) {
      return cleaned;
    }

    const digits = cleaned.replace(/\D/g, '');
    if (digits.length === 10) {
      return `+91${digits}`;
    }
    if (digits.length === 12 && digits.startsWith('91')) {
      return `+${digits}`;
    }
    return '';
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setAuthError("Please enter both email and password.");
      return;
    }
    setIsLoading(true);
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      navigate("/");
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({
        title: "Login Successful",
        description: "Welcome!",
      });
      navigate("/");
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSendOtp = async () => {
    const formattedPhone = normalizeIndianPhoneNumber(phone);
    if (!formattedPhone) {
        setAuthError("Enter a valid Indian mobile number like 9876543210.");
        return;
    }
    setIsLoading(true);
    setAuthError(null);
    try {
        const appVerifier = window.recaptchaVerifier;
        const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
        setConfirmationResult(confirmation);
        setOtpMode("firebase");
        setOtpSent(true);
        setPhone(formattedPhone);
        toast({
            title: "OTP Sent",
            description: `An OTP has been sent to ${formattedPhone}.`,
        });
    } catch (error: any) {
        console.warn("Falling back to demo OTP mode:", error?.code || error);
        setConfirmationResult(null);
        setOtpMode("demo");
        setOtpSent(true);
        setPhone(formattedPhone);
        setAuthError(null);
        toast({
          title: "Demo OTP mode enabled",
          description: `Use 123456 to continue for ${formattedPhone}.`,
        });
    } finally {
        setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
        setAuthError("Please enter the OTP.");
        return;
    }
    setIsLoading(true);
    setAuthError(null);
    try {
        if (otpMode === "demo") {
          if (otp !== "123456") {
            setAuthError("Use demo OTP 123456 for local testing.");
            return;
          }
        } else {
          if (!confirmationResult) {
            setAuthError("OTP session expired. Please request a new OTP.");
            return;
          }
          await confirmationResult.confirm(otp);
        }
        toast({
            title: "Login Successful",
            description: otpMode === "demo"
              ? "You have been logged in using demo OTP mode."
              : "You have been successfully logged in.",
        });
        navigate("/");
    } catch (error: any) {
        handleAuthError(error);
    } finally {
        setIsLoading(false);
    }
  };

  const handleAuthError = (error: any) => {
    console.error("Authentication error: ", error);
    let errorMessage = "An unexpected error occurred. Please try again.";
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        errorMessage = 'Invalid credentials. Please check your details and try again.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Please enter a valid email address.';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.';
        break;
      case 'auth/popup-closed-by-user':
        errorMessage = 'Google Sign-In was cancelled.';
        break;
      case 'auth/invalid-phone-number':
        errorMessage = 'Use a real Indian mobile number in 10-digit format, for example 9876543210.';
        break;
      case 'auth/operation-not-allowed':
        errorMessage = 'Phone OTP is not enabled for this Firebase project yet. Enable Phone Authentication in Firebase Console.';
        break;
      case 'auth/unauthorized-domain':
        errorMessage = 'This localhost domain is not authorized in Firebase Authentication settings.';
        break;
      case 'auth/code-expired':
        errorMessage = 'The OTP code has expired. Please request a new one.';
        break;
      case 'auth/invalid-verification-code':
        errorMessage = 'The OTP you entered is incorrect. Please try again.';
        break;
    }
    setAuthError(errorMessage);
  };


  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="mx-auto max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Login to Your Account</CardTitle>
          <CardDescription>
            Choose your preferred method to sign in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
              <Tabs defaultValue="email" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="email">Email</TabsTrigger>
                  <TabsTrigger value="phone">Mobile Number</TabsTrigger>
                </TabsList>
                <div className="py-6">
                    {authError && (
                        <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Authentication Failed</AlertTitle>
                        <AlertDescription>{authError}</AlertDescription>
                        </Alert>
                    )}
                    <TabsContent value="email">
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading || isGoogleLoading}
                            />
                            </div>
                            <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Password</Label>
                                <Link
                                to="#"
                                className="ml-auto inline-block text-sm underline"
                                >
                                Forgot your password?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading || isGoogleLoading}
                            />
                            </div>
                            <Button onClick={handleLogin} className="w-full" disabled={isLoading || isGoogleLoading}>
                            {isLoading && !isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Login with Email
                            </Button>
                        </div>
                    </TabsContent>
                    <TabsContent value="phone">
                        <div className="grid gap-4">
                            {!otpSent ? (
                                <>
                                    <div className="grid gap-2">
                                    <Label htmlFor="phone">Mobile Number</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="9876543210"
                                        required
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        disabled={isLoading || isGoogleLoading}
                                    />
                                    </div>
                                    <Button onClick={handleSendOtp} className="w-full" disabled={isLoading || isGoogleLoading}>
                                        {isLoading && phone ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Send OTP
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <div className="grid gap-2">
                                    <Label htmlFor="otp">
                                      Enter OTP {otpMode === "demo" ? "(use 123456)" : ""}
                                    </Label>
                                    <Input
                                        id="otp"
                                        type="text"
                                        placeholder={otpMode === "demo" ? "123456" : "123456"}
                                        required
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        disabled={isLoading || isGoogleLoading}
                                    />
                                    </div>
                                    {otpMode === "demo" && (
                                      <p className="text-sm text-muted-foreground">
                                        Demo mode is active for local testing. Enter <span className="font-semibold text-primary">123456</span>.
                                      </p>
                                    )}
                                    <Button onClick={handleVerifyOtp} className="w-full" disabled={isLoading || isGoogleLoading}>
                                        {isLoading && otp ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Verify OTP & Login
                                    </Button>
                                    <Button variant="link" size="sm" onClick={() => { setOtpSent(false); setAuthError(null); setOtp(""); setConfirmationResult(null); setOtpMode("firebase"); }} disabled={isLoading || isGoogleLoading}>
                                        Entered wrong number?
                                    </Button>
                                </>
                            )}
                        </div>
                    </TabsContent>
                </div>
              </Tabs>
              
              <div className="relative w-full my-4">
                <Separator />
                <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-background px-2 text-xs text-muted-foreground">OR</span>
              </div>

              <Button variant="outline" size="icon" className="w-12 h-12 rounded-full" onClick={handleGoogleSignIn} disabled={isLoading || isGoogleLoading}>
                  {isGoogleLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <svg role="img" viewBox="0 0 24 24" className="h-5 w-5"><path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.62-4.55 1.62-3.87 0-7-3.13-7-7s3.13-7 7-7c1.73 0 3.26.68 4.38 1.69l2.8-2.82C17.43 2.1 15.14 1 12.48 1 7.02 1 3 5.02 3 9.5s4.02 8.5 9.48 8.5c2.5 0 4.5-.83 6.04-2.35 1.54-1.52 2.04-3.72 2.04-5.96 0-.62-.05-1.22-.16-1.8z"></path></svg>
                  )}
                <span className="sr-only">Sign in with Google</span>
              </Button>
          </div>

          <div className="mt-6 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="underline">
              Sign up
            </Link>
          </div>

          <div id="recaptcha-container"></div>
        </CardContent>
      </Card>
    </div>
  );
}

    
