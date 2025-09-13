"use client"

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

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Login</CardTitle>
          <CardDescription>
            Login with mobile OTP or email and password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
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
