"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  UserIcon,
  UsersIcon,
  ArrowRightIcon,
} from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole === "athlete") {
      router.push("/account/signup/athlete/name");
    } else if (selectedRole === "guardian") {
      router.push("/account/signup/guardian/name");
    }
  };

  return (
    <div className="w-full max-w-2xl space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Request Institutional Access</h1>
        <p className="text-muted-foreground text-lg">
          Access is provided to registered institutions and authorised practitioners. Select your role to continue.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card
          className={`p-6 cursor-pointer transition-all hover:border ${
            selectedRole === "athlete" ? "border bg-primary/5" : ""
          }`}
          onClick={() => handleRoleSelect("athlete")}
        >
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
              <UserIcon className="size-8 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Athlete</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Complete your health assessment and manage your participation records
              </p>
            </div>
          </div>
        </Card>

        <Card
          className={`p-6 cursor-pointer transition-all hover:border ${
            selectedRole === "guardian" ? "border bg-primary/5" : ""
          }`}
          onClick={() => handleRoleSelect("guardian")}
        >
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-secondary/10">
              <UsersIcon className="size-8 text-secondary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Parent / Guardian</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Support your child&apos;s health assessments and participation clearance
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Button
        className="w-full h-12 text-base"
        disabled={!selectedRole}
        onClick={handleContinue}
      >
        Continue
        <ArrowRightIcon className="ml-2 size-4" />
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <a href="/account/signin" className="text-primary hover:underline">
          Sign in
        </a>
      </p>
    </div>
  );
}
