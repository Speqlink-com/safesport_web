"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2Icon, 
  CircleIcon, 
  ArrowRightIcon,
  AlertCircleIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { AthleteOnboardingData } from "../../types/onboarding";

interface OnboardingProgressCardProps {
  data: AthleteOnboardingData;
  athleteName: string;
}

export function OnboardingProgressCard({ data, athleteName }: OnboardingProgressCardProps) {
  const router = useRouter();
  const { progress, state } = data;

  if (progress.isComplete && state === "ready_for_ppe") {
    return (
      <Card className="border-primary/20 bg-primary/5 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2Icon className="size-5 text-primary" />
              <h3 className="text-lg font-semibold">You&apos;re ready for your clinical assessment</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Your profile and pre-assessment information are complete. Your clinician will review your information and complete your physical assessment.
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-primary/50 text-primary">
                Profile 100% complete
              </Badge>
              <Badge variant="outline">
                Awaiting clinician
              </Badge>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/safesport/athlete/profile")}
          >
            View status
          </Button>
        </div>
      </Card>
    );
  }

  if (state === "ppe_scheduled" || state === "ppe_in_progress") {
    return (
      <Card className="border-secondary/20 bg-secondary/5 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Clinical assessment in progress</h3>
            <p className="text-sm text-muted-foreground">
              Your clinician is completing your physical assessment.
            </p>
          </div>
          <Badge variant="default">In progress</Badge>
        </div>
      </Card>
    );
  }

  const firstName = athleteName.split(" ")[0];
  const nextStepText = getNextStepText(progress.nextStep);
  
  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold">Complete your SafeSport profile</h3>
              <Badge variant="outline" className="font-mono">
                {progress.overall}%
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {progress.overall < 50 
                ? `Let's get your SafeSport profile ready, ${firstName}.`
                : `You're making good progress, ${firstName}. A few more details will prepare you for your assessment.`
              }
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <Progress value={progress.overall} className="h-2" />

        {/* Journey Steps */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Your SafeSport journey
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <StepItem 
              label="Account" 
              status="complete" 
            />
            <StepItem 
              label="Institution & sport" 
              status={progress.sections.participation} 
            />
            <StepItem 
              label="Emergency contact" 
              status={progress.sections.emergency} 
            />
            <StepItem 
              label="Guardian" 
              status={progress.sections.guardian} 
            />
            <StepItem 
              label="Health questionnaire" 
              status={progress.sections.questionnaire} 
            />
            <StepItem 
              label="Consent" 
              status={progress.sections.consent} 
            />
          </div>
        </div>

        {/* Action */}
        <div className="flex items-center justify-between pt-2 border-t">
          <p className="text-sm text-muted-foreground">
            {nextStepText}
          </p>
          <Button 
            onClick={() => router.push("/safesport/athlete/profile")}
            className="gap-2"
          >
            Continue setup
            <ArrowRightIcon className="size-4" />
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground">
          You can save and finish later.
        </p>
      </div>
    </Card>
  );
}

interface StepItemProps {
  label: string;
  status: "not_started" | "in_progress" | "complete" | "not_applicable";
}

function StepItem({ label, status }: StepItemProps) {
  const getIcon = () => {
    switch (status) {
      case "complete":
        return <CheckCircle2Icon className="size-4 text-primary" />;
      case "in_progress":
        return <AlertCircleIcon className="size-4 text-amber-500" />;
      case "not_applicable":
        return <CircleIcon className="size-4 text-muted-foreground opacity-30" />;
      default:
        return <CircleIcon className="size-4 text-muted-foreground" />;
    }
  };

  const getTextStyle = () => {
    if (status === "complete") return "text-foreground";
    if (status === "in_progress") return "text-foreground";
    if (status === "not_applicable") return "text-muted-foreground line-through opacity-50";
    return "text-muted-foreground";
  };

  return (
    <div className="flex items-center gap-2">
      {getIcon()}
      <span className={`text-sm ${getTextStyle()}`}>
        {label}
      </span>
    </div>
  );
}

function getNextStepText(nextStep?: string): string {
  switch (nextStep) {
    case "profile":
      return "Complete your basic profile";
    case "emergency_contact":
      return "Add an emergency contact";
    case "guardian":
      return "Add guardian information";
    case "participation":
      return "Confirm your sport details";
    case "questionnaire":
      return "Complete your health questionnaire";
    case "consent":
      return "Review and provide consent";
    default:
      return "Continue where you left off";
  }
}
