"use client";

import { KeyboardEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { authApi } from "../api";

export function RegistrationVerify({ role }: { role: "athlete" | "guardian" }) {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const handleChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 3) inputRefs[index + 1].current?.focus();
  };
  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) inputRefs[index - 1].current?.focus();
  };
  const handlePaste = (event: React.ClipboardEvent) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").slice(0, 4);
    if (!/^\d+$/.test(pasted)) return;
    const next = [...otp];
    pasted.split("").forEach((character, index) => { if (index < 4) next[index] = character; });
    setOtp(next);
    inputRefs[Math.min(pasted.length, 3)].current?.focus();
  };
  const verify = async () => {
    setIsSubmitting(true);
    try {
      await authApi.verifyRegistration(otp.join(""));
      toast.success("Email verified");
      router.push(`/account/signup/${role}/review`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Verification failed");
    } finally {
      setIsSubmitting(false);
    }
  };
  const resend = async () => {
    try {
      await authApi.resendRegistrationOtp();
      toast.success("A new verification code was sent");
      setOtp(["", "", "", ""]);
      inputRefs[0].current?.focus();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to resend the code");
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <Button onClick={() => router.push(`/account/signup/${role}/account`)} variant="ghost" size="sm">
        <ArrowLeftIcon className="mr-2 size-4" /> Back
      </Button>
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground"><span>Step 5 of 6</span><span>83%</span></div>
        <Progress value={83} />
      </div>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Verify your email</h1>
          <p className="text-muted-foreground">We&apos;ve sent a 4-digit code to your email.</p>
        </div>
        <div className="flex justify-center gap-3 py-4">
          {otp.map((digit, index) => (
            <Input key={index} ref={inputRefs[index]} type="text" inputMode="numeric" maxLength={1} value={digit}
              onChange={(event) => handleChange(index, event.target.value)} onKeyDown={(event) => handleKeyDown(index, event)}
              onPaste={handlePaste} className="h-14 w-14 text-center text-2xl font-semibold" autoFocus={index === 0} />
          ))}
        </div>
        <div className="flex justify-center pt-4">
          <Button onClick={verify} disabled={otp.some((digit) => !digit) || isSubmitting} size="lg">
            {isSubmitting ? "Verifying…" : "Verify Email"}
          </Button>
        </div>
        <div className="text-center"><button type="button" onClick={resend} className="text-sm text-primary hover:underline">Didn&apos;t receive the code? Resend</button></div>
      </div>
    </div>
  );
}

