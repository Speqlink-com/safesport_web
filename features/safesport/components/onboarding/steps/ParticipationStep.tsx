"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CheckCircle2Icon } from "lucide-react";
import type { AthleteOnboardingData } from "../../../types/onboarding";

interface ParticipationStepProps {
  data: AthleteOnboardingData;
  onUpdate: (data: AthleteOnboardingData) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ParticipationStep({ data, onUpdate }: ParticipationStepProps) {
  const handleChange = (field: string, value: string) => {
    onUpdate({
      ...data,
      participation: {
        ...data.participation,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Confirm your sport details</h2>
            <p className="text-sm text-muted-foreground">
              We have your participation information from signup. Let&apos;s make sure everything is correct.
            </p>
          </div>

          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              <CheckCircle2Icon className="inline size-4 text-primary mr-2" />
              This information was captured during your registration.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="institution">Institution</Label>
            <div className="relative">
              <Input
                id="institution"
                value={data.participation.institutionName}
                disabled
                className="bg-muted"
              />
              <CheckCircle2Icon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">
              Your registered institution
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sport">Sport</Label>
              <div className="relative">
                <Input
                  id="sport"
                  value={data.participation.sportName}
                  disabled
                  className="bg-muted"
                />
                <CheckCircle2Icon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-primary" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="team">Team</Label>
              <div className="relative">
                <Input
                  id="team"
                  value={data.participation.teamName || "N/A"}
                  disabled
                  className="bg-muted"
                />
                {data.participation.teamName && (
                  <CheckCircle2Icon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-primary" />
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Position / Event (Optional)</Label>
            <Input
              id="position"
              placeholder="e.g., Midfielder, Forward, 100m Sprint"
              value={data.participation.position || data.participation.event || ""}
              onChange={(e) => handleChange("position", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Your primary playing position or event specialty
            </p>
          </div>

          <div className="rounded-lg border p-4 bg-card">
            <div className="space-y-2">
              <p className="text-sm font-medium">Need to update your institution or sport?</p>
              <p className="text-sm text-muted-foreground">
                Contact your institution administrator or SafeSport support to make changes to your registered organization or sport.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
