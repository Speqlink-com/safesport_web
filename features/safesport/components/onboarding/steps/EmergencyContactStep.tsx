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
import { AlertCircleIcon } from "lucide-react";
import type { AthleteOnboardingData } from "../../../types/onboarding";

interface EmergencyContactStepProps {
  data: AthleteOnboardingData;
  onUpdate: (data: AthleteOnboardingData) => void;
  onNext: () => void;
  onBack: () => void;
}

export function EmergencyContactStep({ data, onUpdate }: EmergencyContactStepProps) {
  const handleChange = (field: string, value: string) => {
    onUpdate({
      ...data,
      emergencyContact: {
        ...(data.emergencyContact || { name: "", phone: "", relationship: "" }),
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Let&apos;s make sure we can reach someone if needed</h2>
            <p className="text-sm text-muted-foreground">
              Who should we contact in case of an emergency during training or competition?
            </p>
          </div>

          <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-4">
            <div className="flex gap-3">
              <AlertCircleIcon className="size-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-500 dark:text-amber-400">
                  Required information
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  An emergency contact is required before you can complete your clinical assessment.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyName">Full Name *</Label>
            <Input
              id="emergencyName"
              placeholder="Jane Otieno"
              value={data.emergencyContact?.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyPhone">Phone Number *</Label>
            <Input
              id="emergencyPhone"
              type="tel"
              placeholder="+254 712 345 678"
              value={data.emergencyContact?.phone || ""}
              onChange={(e) => handleChange("phone", e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Include country code for international numbers
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="relationship">Relationship *</Label>
            <Select
              value={data.emergencyContact?.relationship || ""}
              onValueChange={(value) => value && handleChange("relationship", value)}
            >
              <SelectTrigger id="relationship">
                <SelectValue placeholder="Select relationship..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mother">Mother</SelectItem>
                <SelectItem value="Father">Father</SelectItem>
                <SelectItem value="Parent">Parent</SelectItem>
                <SelectItem value="Guardian">Legal Guardian</SelectItem>
                <SelectItem value="Spouse">Spouse</SelectItem>
                <SelectItem value="Sibling">Sibling</SelectItem>
                <SelectItem value="Other">Other Family Member</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="alternativePhone">Alternative Phone (Optional)</Label>
            <Input
              id="alternativePhone"
              type="tel"
              placeholder="+254 720 123 456"
              value={data.emergencyContact?.alternativePhone || ""}
              onChange={(e) => handleChange("alternativePhone", e.target.value ?? "")}
            />
            <p className="text-xs text-muted-foreground">
              Provide a backup contact number if available
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
