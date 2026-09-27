"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, CheckCircleIcon, LoaderCircle } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { authApi, dashboardForRole } from "../api";
import { useAuthStore } from "../store";
import type { PendingRegistration } from "../types/session";

export function RegistrationReview({ role }: { role: "athlete" | "guardian" }) {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [registration, setRegistration] = useState<PendingRegistration | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    authApi.currentRegistration().then((value) => {
      if (!value.is_verified || value.role !== role) router.replace(`/account/signup/${role}/name`);
      else setRegistration(value);
    }).catch(() => router.replace(`/account/signup/${role}/name`));
  }, [role, router]);

  const complete = async () => {
    setIsSubmitting(true);
    try {
      const session = await authApi.completeRegistration();
      setSession(session.user);
      toast.success("Your SafeSport account is ready");
      router.replace(dashboardForRole(session.user.role));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create your account");
      setIsSubmitting(false);
    }
  };

  if (!registration) return <LoaderCircle className="mx-auto size-6 animate-spin text-primary" />;
  const profile = registration.profile_data;
  return (
    <div className="w-full max-w-md space-y-8">
      <Button onClick={() => router.push(`/account/signup/${role}/verify`)} variant="ghost" size="sm"><ArrowLeftIcon className="mr-2 size-4" /> Back</Button>
      <div className="space-y-2"><div className="flex justify-between text-sm text-muted-foreground"><span>Step 6 of 6</span><span>100%</span></div><Progress value={100} /></div>
      <div className="space-y-6">
        <div className="space-y-2"><h1 className="text-3xl font-bold">Review your information</h1><p className="text-muted-foreground">Make sure everything looks correct</p></div>
        <Card className="space-y-4 p-6">
          <div><p className="text-sm text-muted-foreground">Full Name</p><p className="font-medium">{registration.first_name} {registration.last_name}</p></div>
          {role === "athlete" ? <>
            <div><p className="text-sm text-muted-foreground">Date of Birth</p><p className="font-medium">{new Date(profile.date_of_birth).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p></div>
            <div><p className="text-sm text-muted-foreground">Institution</p><p className="font-medium">{profile.organization_name}</p></div>
            <div><p className="text-sm text-muted-foreground">Sport</p><p className="font-medium">{profile.sport_name}</p></div>
          </> : <>
            <div><p className="text-sm text-muted-foreground">Relationship</p><p className="font-medium">{profile.relationship.replaceAll("_", " ")}</p></div>
            <div><p className="text-sm text-muted-foreground">Athlete ID</p><p className="font-medium">{profile.athlete_id}</p></div>
          </>}
          <div><p className="text-sm text-muted-foreground">Email</p><p className="font-medium">{registration.email}</p></div>
        </Card>
        <div className="flex justify-center pt-4"><Button onClick={complete} disabled={isSubmitting} size="lg">{isSubmitting ? "Creating account…" : "Create Account"}<CheckCircleIcon className="ml-2 size-4" /></Button></div>
      </div>
    </div>
  );
}
