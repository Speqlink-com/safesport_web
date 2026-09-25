"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2Icon, CircleIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type { Athlete } from "@/features/safesport/types";
import type { AthleteOnboardingData, OnboardingStepId } from "@/features/safesport/types/onboarding";

// Import step components
// Import step components
import { ProfileStep } from "@/features/safesport/components/onboarding/steps/ProfileStep";
import { EmergencyContactStep } from "@/features/safesport/components/onboarding/steps/EmergencyContactStep";
import { GuardianStep } from "@/features/safesport/components/onboarding/steps/GuardianStep";
import { ParticipationStep } from "@/features/safesport/components/onboarding/steps/ParticipationStep";
import { QuestionnaireStep } from "@/features/safesport/components/onboarding/steps/QuestionnaireStep";
import { ConsentStep } from "@/features/safesport/components/onboarding/steps/ConsentStep";
import { ProfileReviewStep } from "@/features/safesport/components/onboarding/steps/ProfileReviewStep";

interface ProfileHealthTabProps {
  athlete: Athlete;
  onboardingData: AthleteOnboardingData | null;
}

type Section = {
  id: OnboardingStepId | "review";
  title: string;
  description: string;
  status: "complete" | "in_progress" | "not_started" | "not_applicable";
};

export function ProfileHealthTab({
  athlete,
  onboardingData,
}: ProfileHealthTabProps) {
  return onboardingData ? <ProfileHealthContent athlete={athlete} onboardingData={onboardingData} /> : <div role="status">Loading health profile…</div>;
}
function ProfileHealthContent({onboardingData}: {athlete: Athlete; onboardingData: AthleteOnboardingData}) {
  const [formData, setFormData] = useState(onboardingData);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(() => {
    // Find first incomplete section
    const progress = onboardingData.progress;
    if (progress.sections.profile !== "complete") return 0;
    if (progress.sections.participation !== "complete") return 1;
    if (progress.sections.emergency !== "complete") return 2;
    if (
      progress.sections.guardian !== "complete" &&
      onboardingData.profile.isMinor
    )
      return 3;
    if (progress.sections.questionnaire !== "complete") return 4;
    if (progress.sections.consent !== "complete") return 5;
    return 6; // review
  });

  const sections: Section[] = [
    {
      id: "profile",
      title: "Personal Information",
      description: "Your identity and basic details",
      status: formData.progress.sections.profile,
    },
    {
      id: "participation",
      title: "Institution & Participation",
      description: "Your school, team, and sport",
      status: formData.progress.sections.participation,
    },
    {
      id: "emergency_contact",
      title: "Emergency Contact",
      description: "Who to contact if needed",
      status: formData.progress.sections.emergency,
    },
    {
      id: "guardian",
      title: "Guardian / Family",
      description: "Guardian information and consent",
      status: formData.progress.sections.guardian,
    },
    {
      id: "questionnaire",
      title: "Health Questionnaire",
      description: "Pre-assessment health information",
      status: formData.progress.sections.questionnaire,
    },
    {
      id: "consent",
      title: "Consent & Privacy",
      description: "Required and optional consents",
      status: formData.progress.sections.consent,
    },
    {
      id: "review",
      title: "Review & Complete",
      description: "Review your information",
      status: formData.progress.isComplete ? "complete" : "not_started",
    },
  ];

  const currentSection = sections[currentSectionIndex];

  // Calculate progress excluding review step and counting not_applicable as complete
  const dataSections = sections.filter((s) => s.id !== "review");
  const completedDataSections = dataSections.filter(
    (s) => s.status === "complete" || s.status === "not_applicable",
  ).length;
  const progress = Math.round(
    (completedDataSections / dataSections.length) * 100,
  );

  const handleNext = () => {
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSectionClick = (index: number) => {
    setCurrentSectionIndex(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  const renderSection = () => {
    const commonProps = {
      data: formData,
      onUpdate: setFormData,
      onNext: handleNext,
      onBack: handleBack,
    };

    switch (currentSection.id) {
      case "profile":
        return <ProfileStep {...commonProps} />;
      case "participation":
        return <ParticipationStep {...commonProps} />;
      case "emergency_contact":
        return <EmergencyContactStep {...commonProps} />;
      case "guardian":
        return <GuardianStep {...commonProps} />;
      case "questionnaire":
        return <QuestionnaireStep {...commonProps} />;
      case "consent":
        return <ConsentStep {...commonProps} />;
      case "review":
        return (
          <ProfileReviewStep
            {...commonProps}
            sections={sections}
            onEdit={handleSectionClick}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Compact Progress Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-lg font-semibold">SafeSport Profile Setup</h2>
              <Badge variant="outline" className="font-mono">
                {progress}% complete
              </Badge>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          <div className="text-sm text-muted-foreground">
            {dataSections.length - completedDataSections} of{" "}
            {dataSections.length} sections remaining
          </div>
        </div>
      </Card>

      {/* Section Navigation */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          {sections.map((section, index) => (
            <div
              key={section.id || index}
              className="flex justify-center items-center gap-3"
            >
              {" "}
              {/* Added key and gap */}
              <button
                onClick={() => handleSectionClick(index)}
                className={`flex-1 flex items-center gap-1 p-1 rounded-lg text-left transition-colors ${
                  currentSectionIndex === index
                    ? "bg-primary/10 border-2 border-primary"
                    : "hover:bg-muted/50 border-2 border-transparent"
                }`}
              >
                {section.status === "complete" ? (
                  <CheckCircle2Icon className="size-5 text-primary shrink-0" />
                ) : (
                  <CircleIcon className="size-5 text-muted-foreground shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs uppercase truncate">{section.title}</p>
                </div>
                {currentSectionIndex === index && (
                  <Badge variant="default" className="text-xs shrink-0">
                    Current
                  </Badge>
                )}
              </button>
              {/* Only show the arrow if it is NOT the last item */}
              {index < sections.length - 1 && (
                <span className="text-muted-foreground shrink-0">→</span>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Current Section Content */}
      <div className="max-w-3xl">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">{currentSection.title}</h2>
          <p className="text-sm text-muted-foreground">
            {currentSection.description}
          </p>
        </div>
        {renderSection()}
      </div>

      {/* Navigation Footer */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentSectionIndex === 0}
            className="gap-2"
          >
            <ChevronLeftIcon className="size-4" />
            Back
          </Button>

          <p className="text-sm text-muted-foreground">
            Your progress is saved automatically
          </p>

          <Button
            onClick={handleNext}
            disabled={currentSectionIndex === sections.length - 1}
            className="gap-2"
          >
            Continue
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
