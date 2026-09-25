"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2Icon,
  ShieldCheckIcon,
  UserIcon,
  UsersIcon,
  AlertCircleIcon,
  ClockIcon,
} from "lucide-react";
import type { Athlete } from "@/features/safesport/types";
import type { AthleteOnboardingData } from "@/features/safesport/types/onboarding";

interface ProfileOverviewTabProps {
  athlete: Athlete;
  onboardingData: AthleteOnboardingData | null;
}

export function ProfileOverviewTab({
  athlete,
  onboardingData,
}: ProfileOverviewTabProps) {
  const router = useRouter();
  const profileComplete = onboardingData?.progress.isComplete ?? true;
  const profileCompletion = onboardingData?.progress.overall ?? 100;

  // Next review calculation
  const nextReviewDate = athlete.nextReview
    ? new Date(athlete.nextReview)
    : null;
  const daysUntilReview = nextReviewDate
    ? Math.ceil(
        (nextReviewDate.getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : null;

  return (
    <div className="space-y-6">
      {/* Athlete Identity Card */}
      <Card className="p-6">
        <div className="flex items-start gap-6">
          <Avatar className="size-24 border-2 border-primary/20">
            <AvatarFallback className="text-2xl bg-primary/10">
              {athlete.firstName[0]}
              {athlete.lastName[0]}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-2xl font-semibold">
                {athlete.firstName} {athlete.lastName}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="font-mono">
                  {athlete.id}
                </Badge>
                <Separator orientation="vertical" className="h-4" />
                <span className="text-sm text-muted-foreground">
                  {athlete.age} years
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <UserIcon className="size-4 text-muted-foreground" />
                <div className="text-sm">
                  <p className="text-muted-foreground">Institution</p>
                  <p className="font-medium">
                    {athlete.currentOrganization?.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <UsersIcon className="size-4 text-muted-foreground" />
                <div className="text-sm">
                  <p className="text-muted-foreground">Team</p>
                  <p className="font-medium">
                    {athlete.currentTeam?.name} • {athlete.currentSport?.name}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Status Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Profile Completion */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium mb-1">
                Profile
              </p>
              <div className="flex items-center gap-2">
                {profileComplete ? (
                  <>
                    <CheckCircle2Icon className="size-5 text-primary" />
                    <span className="font-semibold">Complete</span>
                  </>
                ) : (
                  <>
                    <AlertCircleIcon className="size-5 text-amber-500" />
                    <span className="font-semibold">
                      {profileCompletion}% Complete
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {!profileComplete && (
            <div className="space-y-2">
              <Separator />
              <p className="text-sm text-muted-foreground pt-2">
                {
                  Object.values(onboardingData?.progress.sections || {}).filter(
                    (s) => s !== "complete" && s !== "not_applicable",
                  ).length
                }{" "}
                sections remaining
              </p>
              <Button
                size="sm"
                className="w-full"
                onClick={() =>
                  router.push("/safesport/athlete/profile?tab=health")
                }
              >
                Continue setup
              </Button>
            </div>
          )}
        </Card>

        {/* Clinical Assessment Status */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium mb-1">
                Clinical Assessment
              </p>
              <div className="flex items-center gap-2">
                {athlete.ppeAssessments.length > 0 ? (
                  <>
                    <CheckCircle2Icon className="size-5 text-primary" />
                    <span className="font-semibold">Complete</span>
                  </>
                ) : (
                  <>
                    <ClockIcon className="size-5 text-muted-foreground" />
                    <span className="font-semibold">Awaiting clinician</span>
                  </>
                )}
              </div>
            </div>
            <ShieldCheckIcon className="size-6 text-muted-foreground opacity-50" />
          </div>

          {athlete.ppeAssessments.length > 0 && (
            <div className="space-y-2">
              <Separator />
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-muted-foreground">
                  Last assessment
                </span>
                <span className="text-sm font-medium">
                  {new Date(
                    athlete.ppeAssessments[0].assessmentDate,
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          )}
        </Card>

        {/* Eligibility Status */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium mb-1">
                Eligibility
              </p>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    athlete.eligibilityStatus === "cleared"
                      ? "default"
                      : "outline"
                  }
                  className="text-sm"
                >
                  {athlete.eligibilityStatus === "cleared"
                    ? "✓ CLEARED"
                    : athlete.eligibilityStatus
                        .replace(/_/g, " ")
                        .toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>

          {nextReviewDate && (
            <div className="space-y-2">
              <Separator />
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-muted-foreground">
                  Next review
                </span>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {nextReviewDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  {daysUntilReview !== null && (
                    <p className="text-xs text-muted-foreground">
                      {daysUntilReview} days
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Guardian/Account Verification (if minor) */}
        {athlete.guardians && athlete.guardians.length > 0 && (
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium mb-1">
                  Guardian
                </p>
                <div className="flex items-center gap-2">
                  <CheckCircle2Icon className="size-5 text-primary" />
                  <span className="font-semibold">Connected</span>
                </div>
              </div>
              <UsersIcon className="size-6 text-muted-foreground opacity-50" />
            </div>

            <div className="space-y-2">
              <Separator />
              <div className="pt-2">
                <p className="text-sm font-medium">
                  {athlete.guardians[0].firstName}{" "}
                  {athlete.guardians[0].lastName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {athlete.guardians[0].relationship.replace(/_/g, " ")}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Next Actions */}
      {!profileComplete && (
        <Card className="p-6 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-3">
            <AlertCircleIcon className="size-5 text-primary shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Next action required</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Complete your SafeSport profile to proceed with clinical
                assessment
              </p>
              <Button
                onClick={() =>
                  router.push("/safesport/athlete/profile?tab=health")
                }
              >
                Complete profile
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Recent Activity Summary */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Recent account activity</h3>
        <div className="space-y-3">
          {athlete.screenings.length > 0 && (
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="text-sm font-medium">
                  Movement screening completed
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(athlete.screenings[0].createdAt).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric", year: "numeric" },
                  )}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  router.push("/safesport/athlete/screenings")
                }
              >
                View
              </Button>
            </div>
          )}

          {athlete.ppeAssessments.length > 0 && (
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="text-sm font-medium">PPE assessment completed</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(
                    athlete.ppeAssessments[0].assessmentDate,
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  router.push("/safesport/athlete/health")
                }
              >
                View
              </Button>
            </div>
          )}

          {onboardingData && (
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">
                  Profile information updated
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(athlete.updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          )}

          {athlete.screenings.length === 0 &&
            athlete.ppeAssessments.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent activity
              </p>
            )}
        </div>
      </Card>
    </div>
  );
}
