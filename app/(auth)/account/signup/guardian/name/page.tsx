"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"

export default function GuardianNamePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [firstName, setFirstName] = useState(searchParams.get("firstName") || "")
  const [lastName, setLastName] = useState(searchParams.get("lastName") || "")

  const canProceed = firstName.trim().length > 0 && lastName.trim().length > 0

  const handleNext = () => {
    if (canProceed) {
      router.push(`/account/signup/guardian/relationship?firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}`)
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step 1 of 6</span>
          <span>17%</span>
        </div>
        <Progress value={17} />
      </div>

      {/* Form */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Welcome to SafeSport™</h1>
          <p className="text-muted-foreground">What should we call you?</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Mary"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && canProceed && handleNext()}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Otieno"
              onKeyDown={(e) => e.key === "Enter" && canProceed && handleNext()}
            />
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <Button 
            onClick={handleNext} 
            disabled={!canProceed}
            size="lg"
          >
            Continue
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <a href="/account/signin" className="text-primary hover:underline">
            Sign in
          </a>
        </div>
      </div>
    </div>
  )
}
