"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail } from "lucide-react";
import type { ForgotPasswordFormData } from "../types";
import { authApi } from "../api";
import toast from "react-hot-toast";

export function ForgotPasswordForm() {
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await authApi.forgotPassword(formData.email);
      toast.success("Password reset instructions sent");
      setIsSubmitted(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to request a password reset");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Check Your Email</h1>
          <p className="text-muted-foreground">
            We&apos;ve sent a password reset link to
            <br />
            <span className="font-medium text-foreground">{formData.email}</span>
          </p>
        </div>

        <div className="space-y-4">
          <Link href="/account/signin" className="block">
            <Button className="w-full h-12 text-base">
              Back to Sign In
            </Button>
          </Link>
          
          <button
            onClick={() => setIsSubmitted(false)}
            className="text-sm text-primary hover:underline"
          >
            Didn&apos;t receive the email? Try again
          </button>
        </div>
      </div>
    );
  }

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
        
        <h1 className="text-3xl font-bold">Forgot Password?</h1>
        <p className="text-muted-foreground">
          No worries, we&apos;ll send you reset instructions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
        </div>

        <Button type="submit" className="w-full h-12 text-base" disabled={isSubmitting}>
          {isSubmitting ? "Sending…" : "Send Reset Link"}
        </Button>
      </form>
    </div>
  );
}
