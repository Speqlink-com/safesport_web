"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ArrowLeftIcon } from "lucide-react"

export default function AthleteDOBPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const firstName = searchParams.get("firstName") || ""
  const lastName = searchParams.get("lastName") || ""
  const [dateOfBirth, setDateOfBirth] = useState(searchParams.get("dob") || "")

  useEffect(() => {
    if (!firstName || !lastName) {
      router.push("/account/signup/athlete/name")
    }
  }, [firstName, lastName, router])

  const canProceed = dateOfBirth.length > 0

  const handleNext = () => {
    if (canProceed) {
      router.push(`/account/signup/athlete/team?firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}&dob=${encodeURIComponent(dateOfBirth)}`)
    }
  }

  const handleBack = () => {
    router.push(`/account/signup/athlete/name?firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}`)
  }

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Back Button - Top Left of Form */}
      <div>
        <Button 
          onClick={handleBack}
          variant="ghost"
          size="sm"
        >
          <ArrowLeftIcon className="mr-2 size-4" />
          Back
        </Button>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step 2 of 6</span>
          <span>33%</span>
        </div>
        <Progress value={33} />
      </div>

      {/* Form */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Nice to meet you, {firstName}</h1>
          <p className="text-muted-foreground">When were you born?</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dob">Date of Birth</Label>
          <Input
            id="dob"
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            autoFocus
            required
          />
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
      </div>
    </div>
  )
}
