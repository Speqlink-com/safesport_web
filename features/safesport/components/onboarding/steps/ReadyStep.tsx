"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2Icon,
  CalendarIcon,
  UserCheckIcon,
  ClipboardListIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { AthleteOnboardingData } from "../../../types/onboarding";

interface ReadyStepProps {
  data: AthleteOnboardingData;
  onUpdate: (data: AthleteOnboardingData) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ReadyStep({ data }: ReadyStepProps) {
  const router = useRouter();
  const firstName = data.profile.firstName || "Athlete";

  return (
    <div className="space-y-6">
      {/* Success Card */}
      <Card className="border-primary/50 bg-primary/5 p-8">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2Icon className="size-12 text-primary" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">You&apos;re ready, {firstName}!</h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Your profile and pre-assessment information are complete. Your clinician will review your information and complete your physical assessment.
            </p>
          </div>

          <Badge variant="outline" className="text-sm border-primary/50 text-primary">
            Profile 100% complete
          </Badge>
        </div>
      </Card>

      {/* What's Next */}
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">What happens next?</h3>
            <p className="text-sm text-muted-foreground">
              Your athlete onboarding is complete. Here&apos;s what to expect for your clinical assessment:
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4 p-4 rounded-lg border bg-card">
              <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                <CalendarIcon className="size-6 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="font-medium">Scheduling</p>
                <p className="text-sm text-muted-foreground">
                  Your institution will schedule your clinical assessment. You&apos;ll receive a notification with the date and time.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-lg border bg-card">
              <div className="flex size-12 items-center justify-center rounded-lg bg-secondary/10 shrink-0">
                <ClipboardListIcon className="size-6 text-secondary" />
              </div>
              <div className="space-y-1">
                <p className="font-medium">Clinician review</p>
                <p className="text-sm text-muted-foreground">
                  A qualified clinician will review your health questionnaire and prepare for your assessment.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-lg border bg-card">
              <div className="flex size-12 items-center justify-center rounded-lg bg-accent/10 shrink-0">
                <UserCheckIcon className="size-6 text-accent-foreground" />
              </div>
              <div className="space-y-1">
                <p className="font-medium">Physical assessment</p>
                <p className="text-sm text-muted-foreground">
                  Your clinician will perform a physical examination, check vitals, and complete a functional movement baseline.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-lg border bg-card">
              <div className="flex size-12 items-center justify-center rounded-lg bg-green-500/10 shrink-0">
                <ShieldCheckIcon className="size-6 text-green-500" />
              </div>
              <div className="space-y-1">
                <p className="font-medium">Clinical eligibility</p>
                <p className="text-sm text-muted-foreground">
                  Based on the assessment, your clinician will determine your participation eligibility and any recommendations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Current Status */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Your current status</h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Profile completion</p>
              <div className="flex items-center gap-2">
                <CheckCircle2Icon className="size-4 text-primary" />
                <p className="font-medium">100% complete</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Clinical assessment</p>
              <Badge variant="outline">
                Awaiting clinician
              </Badge>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Institution</p>
              <p className="font-medium">{data.participation.institutionName}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Sport</p>
              <p className="font-medium">{data.participation.sportName}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Completed Sections */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Completed sections</h3>
          
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2Icon className="size-4 text-primary" />
              <span>Basic profile</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2Icon className="size-4 text-primary" />
              <span>Emergency contact</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2Icon className="size-4 text-primary" />
              <span>Guardian {data.profile.isMinor ? "information" : "(not applicable)"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2Icon className="size-4 text-primary" />
              <span>Participation details</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2Icon className="size-4 text-primary" />
              <span>Health questionnaire</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2Icon className="size-4 text-primary" />
              <span>Consent & privacy</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-medium">Ready to continue?</p>
            <p className="text-sm text-muted-foreground">Return to your dashboard</p>
          </div>
          <Button 
            size="lg"
            onClick={() => router.push("/safesport/athlete")}
            className="gap-2 w-full sm:w-auto"
          >
            Go to Dashboard
            <ArrowRightIcon className="size-4" />
          </Button>
        </div>
      </Card>

      {/* Help */}
      <div className="rounded-lg bg-muted/50 p-4 text-center">
        <p className="text-sm text-muted-foreground">
          Have questions about your assessment?{" "}
          <Button variant="link" className="h-auto p-0 text-sm">
            Contact support
          </Button>
        </p>
      </div>
    </div>
  );
}
