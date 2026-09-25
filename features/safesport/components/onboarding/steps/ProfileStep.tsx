"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2Icon } from "lucide-react";
import type { AthleteOnboardingData } from "../../../types/onboarding";

interface ProfileStepProps {
  data: AthleteOnboardingData;
  onUpdate: (data: AthleteOnboardingData) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ProfileStep({ data, onUpdate }: ProfileStepProps) {
  const handleChange = (field: string, value: string) => {
    onUpdate({
      ...data,
      profile: {
        ...data.profile,
        [field]: value,
      },
    });
  };

  // Check what's already complete from signup
  const hasFirstName = !!data.profile.firstName;
  const hasLastName = !!data.profile.lastName;
  const hasEmail = !!data.profile.email;
  const hasDOB = !!data.profile.dateOfBirth;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Let&apos;s complete your athlete profile</h2>
            <p className="text-sm text-muted-foreground">
              We already have some information from your signup. Let&apos;s fill in a few more details.
            </p>
          </div>

          {/* Name - Already from signup */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <div className="relative">
                <Input
                  id="firstName"
                  value={data.profile.firstName || ""}
                  disabled={hasFirstName}
                  className={hasFirstName ? "bg-muted" : ""}
                />
                {hasFirstName && (
                  <CheckCircle2Icon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-primary" />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <div className="relative">
                <Input
                  id="lastName"
                  value={data.profile.lastName || ""}
                  disabled={hasLastName}
                  className={hasLastName ? "bg-muted" : ""}
                />
                {hasLastName && (
                  <CheckCircle2Icon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-primary" />
                )}
              </div>
            </div>
          </div>

          {/* Email - Already from signup */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                value={data.profile.email || ""}
                disabled={hasEmail}
                className={hasEmail ? "bg-muted" : ""}
              />
              {hasEmail && (
                <CheckCircle2Icon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-primary" />
              )}
            </div>
          </div>

          {/* Date of Birth - Already from signup */}
          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <div className="relative">
              <Input
                id="dob"
                type="date"
                value={data.profile.dateOfBirth || ""}
                disabled={hasDOB}
                className={hasDOB ? "bg-muted" : ""}
              />
              {hasDOB && (
                <CheckCircle2Icon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-primary" />
              )}
            </div>
            {data.profile.age && (
              <p className="text-xs text-muted-foreground">
                Age: {data.profile.age} years
                {data.profile.isMinor && " (Minor - guardian information will be required)"}
              </p>
            )}
          </div>

          {/* Sex - Additional field */}
          <div className="space-y-2">
            <Label htmlFor="sex">Sex</Label>
            <Select
              value={data.profile.sex || ""}
              onValueChange={(value) => value && handleChange("sex", value)}
            >
              <SelectTrigger id="sex">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              <CheckCircle2Icon className="inline size-4 text-primary mr-2" />
              Your basic information is being saved automatically.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
