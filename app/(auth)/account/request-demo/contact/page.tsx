"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeftIcon } from "lucide-react";

export default function InstitutionContactPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const type = searchParams.get("type") || "";
  const instName = searchParams.get("name") || "";
  const city = searchParams.get("city") || "";
  const country = searchParams.get("country") || "";

  const [contactName, setContactName] = useState(
    searchParams.get("contactName") || "",
  );
  const [contactEmail, setContactEmail] = useState(
    searchParams.get("contactEmail") || "",
  );
  const [contactPhone, setContactPhone] = useState(
    searchParams.get("contactPhone") || "",
  );

  useEffect(() => {
    if (!type || !instName || !city || !country) {
      router.push("/account/request-demo/type");
    }
  }, [type, instName, city, country, router]);

  const canProceed =
    contactName.trim().length > 0 &&
    contactEmail.includes("@") &&
    contactPhone.trim().length > 0;

  const handleNext = () => {
    if (canProceed) {
      router.push(
        `/account/request-demo/success?type=${encodeURIComponent(type)}&name=${encodeURIComponent(instName)}&city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&contactName=${encodeURIComponent(contactName)}&contactEmail=${encodeURIComponent(contactEmail)}&contactPhone=${encodeURIComponent(contactPhone)}`,
      );
    }
  };

  const handleBack = () => {
    router.push(
      `/account/request-demo/details?type=${encodeURIComponent(type)}&name=${encodeURIComponent(instName)}&city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`,
    );
  };

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Back Button */}
      <div>
        <Button onClick={handleBack} variant="ghost" size="sm">
          <ArrowLeftIcon className="mr-2 size-4" />
          Back
        </Button>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step 3 of 4</span>
          <span>75%</span>
        </div>
        <Progress value={75} />
      </div>

      {/* Form */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Primary contact</h1>
          <p className="text-muted-foreground">
            Who should we contact about the demo?
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contactName">Full Name</Label>
            <Input
              id="contactName"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="John Obuya"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactEmail">Email</Label>
            <Input
              id="contactEmail"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="john@greenvalley.ac.ke"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPhone">Phone Number</Label>
            <Input
              id="contactPhone"
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+254 700 000 000"
            />
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <Button onClick={handleNext} disabled={!canProceed} size="lg">
            Submit Request
          </Button>
        </div>
      </div>
    </div>
  );
}
