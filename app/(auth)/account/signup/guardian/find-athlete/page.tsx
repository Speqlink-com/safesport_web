"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeftIcon, CheckCircleIcon, SearchIcon } from "lucide-react";
import { authApi, type GuardianAthleteLookup } from "@/features/auth/api";

const UNKNOWN_ID_MESSAGE = "We do not know that SafeSport ID. Confirm the ID shared by the athlete or contact admin.";

export default function GuardianFindAthletePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const firstName = searchParams.get("firstName") || "";
  const lastName = searchParams.get("lastName") || "";
  const relationship = searchParams.get("relationship") || "";

  const [safeSportId, setSafeSportId] = useState("");
  const [athlete, setAthlete] = useState<GuardianAthleteLookup | null>(null);
  const [error, setError] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!firstName || !lastName || !relationship) {
      router.push("/account/signup/guardian/name");
    }
  }, [firstName, lastName, relationship, router]);

  const handleSearch = async () => {
    const value = safeSportId.trim().toUpperCase();
    setAthlete(null);
    setError("");
    if (!value) {
      setError("Enter the athlete's SafeSport ID.");
      return;
    }
    setIsSearching(true);
    try {
      const result = await authApi.lookupGuardianAthlete(value);
      setAthlete(result);
      setSafeSportId(result.safesport_id);
    } catch (lookupError) {
      setError(lookupError instanceof Error ? lookupError.message : UNKNOWN_ID_MESSAGE);
    } finally {
      setIsSearching(false);
    }
  };

  const handleNext = () => {
    if (!athlete) return;
    const params = new URLSearchParams({
      firstName,
      lastName,
      relationship,
      athleteId: athlete.id,
      safeSportId: athlete.safesport_id,
    });
    router.push(`/account/signup/guardian/account?${params.toString()}`);
  };

  const handleBack = () => {
    router.push(
      `/account/signup/guardian/relationship?firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}&relationship=${encodeURIComponent(relationship)}`,
    );
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div>
        <Button onClick={handleBack} variant="ghost" size="sm">
          <ArrowLeftIcon className="mr-2 size-4" />
          Back
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step 3 of 6</span>
          <span>50%</span>
        </div>
        <Progress value={50} />
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Find your athlete</h1>
          <p className="text-muted-foreground">Enter the athlete&apos;s unique SafeSport ID.</p>
        </div>

        <div className="flex gap-2">
          <Input
            value={safeSportId}
            onChange={(event) => {
              setSafeSportId(event.target.value.toUpperCase());
              setAthlete(null);
              setError("");
            }}
            placeholder="SAFE-DEG67H"
            autoFocus
            onKeyDown={(event) => event.key === "Enter" && void handleSearch()}
          />
          <Button onClick={handleSearch} variant="outline" size="icon" disabled={isSearching}>
            <SearchIcon className="size-4" />
          </Button>
        </div>

        {error && <p className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}

        {athlete && (
          <Card className="border-primary bg-primary/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {athlete.first_name[0]}
                {athlete.last_name[0]}
              </div>
              <div className="flex-1">
                <p className="font-medium">
                  {athlete.first_name} {athlete.last_name}
                </p>
                <p className="text-sm text-muted-foreground">{athlete.safesport_id}</p>
                <p className="text-xs text-muted-foreground">
                  {[athlete.organization_name, athlete.sport_name].filter(Boolean).join(" · ")}
                </p>
              </div>
              <CheckCircleIcon className="size-5 text-primary" />
            </div>
          </Card>
        )}

        <div className="flex justify-center pt-4">
          <Button onClick={handleNext} disabled={!athlete} size="lg">
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
