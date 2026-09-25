"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2Icon, EditIcon, AlertCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import type { AthleteOnboardingData } from "../../../types/onboarding";

interface ProfileReviewStepProps {
  data: AthleteOnboardingData;
  onUpdate: (data: AthleteOnboardingData) => void;
  onNext: () => void;
  onBack: () => void;
  sections: Array<{ id: string; title: string; status: string }>;
  onEdit: (index: number) => void;
}

export function ProfileReviewStep({ data, sections, onEdit, onUpdate }: ProfileReviewStepProps) {
  const router = useRouter();
  
  const allComplete = sections.every((s) => {
    // Skip review section itself
    if (s.id === "review") return true;
    return s.status === "complete" || s.status === "not_applicable";
  });

  const handleComplete = () => {
    // Update onboarding state to ready_for_ppe
    onUpdate({
      ...data,
      state: "ready_for_ppe",
      progress: {
        ...data.progress,
        isComplete: true,
      },
      readyForPPEAt: new Date().toISOString(),
    });

    // Redirect to dashboard
    router.push("/safesport/athlete");
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Review your SafeSport profile</h2>
            <p className="text-sm text-muted-foreground">
              Please review all sections before completing your profile. You can edit any section by clicking the edit button.
            </p>
          </div>

          {!allComplete && (
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-4">
              <div className="flex gap-3">
                <AlertCircleIcon className="size-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-500 dark:text-amber-400">
                    Some sections are incomplete
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Please complete all required sections before finalizing your profile.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {sections.map((section, index) => {
              if (section.id === "review") return null;
              
              const isComplete = section.status === "complete" || section.status === "not_applicable";
              const isNotApplicable = section.status === "not_applicable";

              return (
                <Card key={section.id} className={`p-4 ${isComplete ? "border-primary/20" : "border-amber-500/20"}`}>
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {isComplete ? (
                          <CheckCircle2Icon className="size-5 text-primary" />
                        ) : (
                          <AlertCircleIcon className="size-5 text-amber-500" />
                        )}
                        <p className="font-medium">{section.title}</p>
                        {isNotApplicable && (
                          <Badge variant="outline" className="text-xs">Not applicable</Badge>
                        )}
                      </div>
                      
                      {/* Show key information from each section */}
                      <div className="text-sm text-muted-foreground ml-7">
                        {section.id === "profile" && data.profile.firstName && (
                          <p>{data.profile.firstName} {data.profile.lastName} • {data.profile.sex || "Not specified"} • Age {data.profile.age}</p>
                        )}
                        {section.id === "participation" && (
                          <p>{data.participation.institutionName} • {data.participation.sportName} • {data.participation.teamName}</p>
                        )}
                        {section.id === "emergency_contact" && data.emergencyContact && (
                          <p>{data.emergencyContact.name} • {data.emergencyContact.phone} • {data.emergencyContact.relationship}</p>
                        )}
                        {section.id === "guardian" && data.guardian?.isLinked && (
                          <p>{data.guardian.guardianName || "Guardian"} • {data.guardian.relationship}</p>
                        )}
                        {section.id === "guardian" && isNotApplicable && (
                          <p>Not required (age 18+)</p>
                        )}
                        {section.id === "questionnaire" && data.questionnaire && (
                          <p>Health questionnaire completed • {data.questionnaire.reviewFlags.length} review flags</p>
                        )}
                        {section.id === "consent" && data.consent && (
                          <p>
                            Clinical consent: {data.consent.clinicalProvided ? "✓" : "Required"} • 
                            Video: {data.consent.videoProvided ? "✓" : "—"} • 
                            Research: {data.consent.researchOptIn ? "✓" : "—"}
                          </p>
                        )}
                      </div>
                    </div>

                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onEdit(index)}
                      className="gap-2"
                    >
                      <EditIcon className="size-4" />
                      {isComplete ? "Edit" : "Complete"}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {allComplete && (
            <div className="rounded-lg bg-primary/10 border border-primary/20 p-4">
              <div className="flex gap-3">
                <CheckCircle2Icon className="size-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-primary">
                    All sections complete
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your profile is ready. Click &quot;Complete profile&quot; below to finish.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">What happens after you complete your profile?</p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>Your information will be ready for clinical review</li>
                  <li>A clinician will be assigned to complete your physical assessment</li>
                  <li>You&apos;ll receive a notification when your assessment is scheduled</li>
                  <li>Your participation eligibility will be determined after the clinical assessment</li>
                </ul>
              </div>

              {allComplete && (
                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={handleComplete}
                >
                  <CheckCircle2Icon className="size-5 mr-2" />
                  Complete profile
                </Button>
              )}

              {!allComplete && (
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full"
                  disabled
                >
                  Complete all sections first
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
