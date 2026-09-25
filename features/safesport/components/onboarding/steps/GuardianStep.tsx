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
import { Badge } from "@/components/ui/badge";
import { CheckCircle2Icon, InfoIcon } from "lucide-react";
import type { AthleteOnboardingData } from "../../../types/onboarding";

interface GuardianStepProps {
  data: AthleteOnboardingData;
  onUpdate: (data: AthleteOnboardingData) => void;
  onNext: () => void;
  onBack: () => void;
}

export function GuardianStep({ data, onUpdate }: GuardianStepProps) {
  const isMinor = data.profile.isMinor;

  const handleChange = (field: string, value: string | boolean) => {
    onUpdate({
      ...data,
      guardian: {
        ...(data.guardian || { relationship: "parent", isLinked: false }),
        [field]: value,
      },
    });
  };

  // If not a minor, show skip message
  if (!isMinor) {
    return (
      <div className="space-y-6">
        <Card className="p-6 border-primary/20 bg-primary/5">
          <div className="flex items-start gap-4">
            <CheckCircle2Icon className="size-6 text-primary shrink-0 mt-1" />
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Guardian information not required</h2>
              <p className="text-sm text-muted-foreground">
                Since you are {data.profile.age || "over 18"} years old, you don&apos;t need to provide guardian information.
              </p>
              <Badge variant="outline" className="mt-2">
                Not applicable
              </Badge>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Guardian already linked
  if (data.guardian?.isLinked) {
    return (
      <div className="space-y-6">
        <Card className="p-6 border-primary/20 bg-primary/5">
          <div className="flex items-start gap-4">
            <CheckCircle2Icon className="size-6 text-primary shrink-0 mt-1" />
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Guardian connected</h2>
              <p className="text-sm text-muted-foreground">
                Your guardian account is already linked to your profile.
              </p>
              {data.guardian.guardianName && (
                <div className="mt-4 space-y-1">
                  <p className="text-sm font-medium">{data.guardian.guardianName}</p>
                  {data.guardian.guardianEmail && (
                    <p className="text-sm text-muted-foreground">{data.guardian.guardianEmail}</p>
                  )}
                  <Badge variant="outline" className="mt-2">
                    {data.guardian.relationship}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Need guardian information
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Who should we contact for you?</h2>
            <p className="text-sm text-muted-foreground">
              Since you are under 18, we need guardian information for consent and important communications.
            </p>
          </div>

          <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4">
            <div className="flex gap-3">
              <InfoIcon className="size-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-500 dark:text-blue-400">
                  Guardian consent required
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your guardian will be able to review and provide consent for your clinical assessments.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="guardianName">Guardian Full Name *</Label>
            <Input
              id="guardianName"
              placeholder="Jane Otieno"
              value={data.guardian?.guardianName || ""}
              onChange={(e) => handleChange("guardianName", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="guardianPhone">Guardian Phone *</Label>
            <Input
              id="guardianPhone"
              type="tel"
              placeholder="+254 712 345 678"
              value={data.guardian?.guardianPhone || ""}
              onChange={(e) => handleChange("guardianPhone", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="guardianEmail">Guardian Email *</Label>
            <Input
              id="guardianEmail"
              type="email"
              placeholder="jane.otieno@email.com"
              value={data.guardian?.guardianEmail || ""}
              onChange={(e) => handleChange("guardianEmail", e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Your guardian will receive an invitation to create a SafeSport account
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="guardianRelationship">Relationship *</Label>
            <Select
              value={data.guardian?.relationship || "parent"}
              onValueChange={(value) => value && handleChange("relationship", value)}
            >
              <SelectTrigger id="guardianRelationship">
                <SelectValue placeholder="Select relationship..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="parent">Parent</SelectItem>
                <SelectItem value="legal_guardian">Legal Guardian</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>
    </div>
  );
}
