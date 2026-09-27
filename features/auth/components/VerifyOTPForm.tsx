"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { authApi, dashboardForRole } from "../api";
import { useAuthStore } from "../store";
import toast from "react-hot-toast";

export function VerifyOTPForm() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 4);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char, idx) => {
      if (idx < 4) newOtp[idx] = char;
    });
    setOtp(newOtp);
    
    // Focus last filled input or last input
    const lastIndex = Math.min(pastedData.length, 3);
    inputRefs[lastIndex].current?.focus();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const session = await authApi.verifyLogin(otp.join(""));
      setSession(session.user);
      toast.success("Welcome back");
      router.replace(dashboardForRole(session.user.role));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Verification failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    try {
      await authApi.resendLoginOtp();
      toast.success("A new verification code was sent");
      setOtp(["", "", "", ""]);
      inputRefs[0].current?.focus();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to resend the code");
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2">
        <Link
          href="/account/signin"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </Link>
        
        <h1 className="text-3xl font-bold">Verify Code</h1>
        <p className="text-muted-foreground">
          We&apos;ve sent a 4-digit code to your email.
          <br />
          Enter the code below to verify.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-3 justify-center">
          {otp.map((digit, index) => (
            <Input
              key={index}
              ref={inputRefs[index]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-14 h-14 text-center text-2xl font-semibold"
              required
            />
          ))}
        </div>

        <Button
          type="submit"
          className="w-full h-12 text-base"
          disabled={otp.some((digit) => !digit) || isSubmitting}
        >
          {isSubmitting ? "Verifying…" : "Verify Code"}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={handleResend}
            className="text-sm text-primary hover:underline"
          >
            Didn&apos;t receive the code? Resend
          </button>
        </div>
      </form>
    </div>
  );
}
