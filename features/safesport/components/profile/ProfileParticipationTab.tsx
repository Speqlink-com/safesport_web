"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BuildingIcon, UsersIcon, TrophyIcon, CheckCircle2Icon } from "lucide-react";
import type { Athlete } from "@/features/safesport/types";

interface ProfileParticipationTabProps {
  athlete: Athlete;
}

export function ProfileParticipationTab({
  athlete,
}: ProfileParticipationTabProps) {
  return (
    <div className="space-y-6">
      {/* Current Participation */}
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="font-semibold">Current participation</h3>
          <p className="text-sm text-muted-foreground">
            Your active sports participation
          </p>
        </div>
        <Separator className="mb-4" />

        <div className="space-y-4 flex justify-between items-center">
          {/* Institution */}
          <div className="flex items-start gap-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <BuildingIcon className="size-10 text-primary shrink-0 mt-1" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold">
                  {athlete.currentOrganization?.name}
                </p>
                <Badge variant="default" className="text-xs">
                  Active
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground capitalize">
                {athlete.currentOrganization?.type}
              </p>
              {athlete.organizations && athlete.organizations.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Joined{" "}
                  {new Date(
                    athlete.organizations[0].joinedAt,
                  ).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
          </div>

          {/* Team */}
          {athlete.currentTeam && (
            <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
              <UsersIcon className="size-10 text-muted-foreground shrink-0 mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold">{athlete.currentTeam.name}</p>
                  <Badge variant="outline" className="text-xs">
                    {athlete.currentTeam.ageGroup}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Team</p>
                {athlete.teams && athlete.teams.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Joined{" "}
                    {new Date(athlete.teams[0].joinedAt).toLocaleDateString(
                      "en-US",
                      { month: "long", year: "numeric" },
                    )}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Sport */}
          {athlete.currentSport && (
            <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
              <TrophyIcon className="size-10 text-muted-foreground shrink-0 mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold">{athlete.currentSport.name}</p>
                  {athlete.teams?.[0]?.position && (
                    <Badge variant="outline" className="text-xs">
                      {athlete.teams[0].position}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground capitalize">
                  {athlete.currentSport.category}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Participation History */}
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="font-semibold">Participation history</h3>
          <p className="text-sm text-muted-foreground">
            Your previous organizations and teams
          </p>
        </div>
        <Separator className="mb-4" />

        {athlete.organizations && athlete.organizations.length > 1 ? (
          <div className="space-y-3">
            {athlete.organizations.slice(1).map((org) => (
              <div
                key={org.organizationId}
                className="flex items-start gap-3 p-3 rounded-lg border"
              >
                <BuildingIcon className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{org.organization.name}</p>
                    <Badge variant="outline" className="text-xs">
                      {org.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(org.joinedAt).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              No previous participation history
            </p>
          </div>
        )}
      </Card>

      {/* Teams History */}
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="font-semibold">Teams history</h3>
          <p className="text-sm text-muted-foreground">
            Your team participation over time
          </p>
        </div>
        <Separator className="mb-4" />

        {athlete.teams && athlete.teams.length > 0 ? (
          <div className="space-y-3">
            {athlete.teams.map((team) => (
              <div
                key={team.teamId}
                className="flex items-start gap-3 p-3 rounded-lg border"
              >
                <div
                  className={`flex size-8 items-center justify-center rounded-full shrink-0 ${
                    team.status === "active" ? "bg-primary/10" : "bg-muted"
                  }`}
                >
                  {team.status === "active" ? (
                    <CheckCircle2Icon className="size-4 text-primary" />
                  ) : (
                    <UsersIcon className="size-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{team.team.name}</p>
                    <Badge
                      variant={team.status === "active" ? "default" : "outline"}
                      className="text-xs"
                    >
                      {team.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{team.sport.name}</span>
                    {team.position && (
                      <>
                        <span>•</span>
                        <span>{team.position}</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Joined{" "}
                    {new Date(team.joinedAt).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              No team history available
            </p>
          </div>
        )}
      </Card>

      {/* SafeSport Identity Persistence Notice */}
      <Card className="p-4 bg-muted/50 border-muted">
        <p className="text-xs text-muted-foreground">
          <strong>Note:</strong> Your SafeSport identity and clinical history
          remain with you across organizations, teams, and sports. This ensures
          continuity of care throughout your athletic journey.
        </p>
      </Card>
    </div>
  );
}
