"use client"

import { useState, useEffect } from "react";
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
import Link from "next/link";
<<<<<<< HEAD
import EmailPasswordLogin from './EmailPasswordLogin'

import { useState } from 'react'

export default function LoginPage() {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'request' | 'verify'>('request')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function requestOtp() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      if (!res.ok) throw new Error('Failed to request OTP')
      setStep('verify')
    } catch (e) {
      setError('Could not send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function verifyOtp() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      })
      if (!res.ok) throw new Error('Invalid code')
      // success - in a real app set a cookie/session and redirect
      setCode('')
    } catch (e) {
      setError('Invalid or expired code.')
    } finally {
      setLoading(false)
    }
  }
=======
import { auth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
          console.log("reCAPTCHA verified");
        }
      });
    }
  }, []);

  const handleSendOtp = async () => {
    if (phoneNumber.length < 10) {
      toast({
        variant: "destructive",
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number.",
      });
      return;
    }
    setIsLoading(true);
    try {
      const formattedPhoneNumber = `+91${phoneNumber}`;
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
      toast({
        title: "OTP Sent",
        description: `An OTP has been sent to ${formattedPhoneNumber}.`,
      });
    } catch (error) {
      console.error("Error sending OTP: ", error);
      toast({
        variant: "destructive",
        title: "Failed to send OTP",
        description: "Please try again. You may need to refresh the page.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!confirmationResult) return;
    setIsLoading(true);
    try {
      await confirmationResult.confirm(otp);
      toast({
        title: "Login Successful",
        description: "You have been successfully logged in.",
      });
      // Handle successful login, e.g., redirect to dashboard
    } catch (error) {
      console.error("Error verifying OTP: ", error);
      toast({
        variant: "destructive",
        title: "Invalid OTP",
        description: "The OTP you entered is incorrect. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

>>>>>>> 733507f (File changes)

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Login</CardTitle>
          <CardDescription>
<<<<<<< HEAD
            Login with mobile OTP or email and password.
=======
            Enter your mobile number to login to your account
>>>>>>> 733507f (File changes)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
<<<<<<< HEAD
            <div className="grid gap-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input
                id="mobile"
                type="tel"
                placeholder="+91-9876543210"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading || step === 'verify'}
              />
            </div>

            {step === 'verify' && (
              <div className="grid gap-2">
                <Label htmlFor="code">OTP Code</Label>
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  placeholder="123456"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={6}
                  disabled={loading}
                />
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            {step === 'request' ? (
              <Button onClick={requestOtp} className="w-full" disabled={loading || !phone}>
                {loading ? 'Sending...' : 'Send OTP'}
              </Button>
            ) : (
              <Button onClick={verifyOtp} className="w-full" disabled={loading || code.length !== 6}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>
            )}

            <div className="relative my-2 text-center text-sm text-muted-foreground">
              <span>or</span>
            </div>

            {/* Email/Password login */}
            <EmailPasswordLogin />
=======
            {!otpSent ? (
              <div className="grid gap-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="9876543210"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={isLoading}
                />
                 <Button onClick={handleSendOtp} className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Send OTP
                </Button>
              </div>
            ) : (
               <div className="grid gap-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  disabled={isLoading}
                />
                 <Button onClick={handleVerifyOtp} className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Verify OTP
                </Button>
              </div>
            )}
            <div id="recaptcha-container"></div>
            <Button variant="outline" className="w-full" disabled>
              Login with Google
            </Button>
>>>>>>> 733507f (File changes)
          </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
