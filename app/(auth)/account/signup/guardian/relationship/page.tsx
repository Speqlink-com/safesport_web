"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeftIcon, CheckCircleIcon } from "lucide-react"

export default function GuardianRelationshipPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const firstName = searchParams.get("firstName") || ""
  const lastName = searchParams.get("lastName") || ""
  const [relationship, setRelationship] = useState(searchParams.get("relationship") || "")

  useEffect(() => {
    if (!firstName || !lastName) {
      router.push("/account/signup/guardian/name")
    }
  }, [firstName, lastName, router])

  const relationships = [
    { value: "parent", label: "Parent" },
    { value: "legal_guardian", label: "Legal Guardian" },
    { value: "other", label: "Other" },
  ]

  const canProceed = relationship.length > 0

  const handleNext = () => {
    if (canProceed) {
      router.push(`/account/signup/guardian/find-athlete?firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}&relationship=${encodeURIComponent(relationship)}`)
    }
  }

  const handleBack = () => {
    router.push(`/account/signup/guardian/name?firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}`)
  }

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Back Button */}
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
          <h1 className="text-3xl font-bold">Your relationship</h1>
          <p className="text-muted-foreground">How are you related to the athlete?</p>
        </div>

        <div className="space-y-3">
          {relationships.map((rel) => (
            <Card
              key={rel.value}
              className={`p-4 cursor-pointer transition-all hover:border-primary ${
                relationship === rel.value ? "border-primary bg-primary/5" : ""
              }`}
              onClick={() => setRelationship(rel.value)}
            >
              <div className="flex items-center justify-between">
                <p className="font-medium">{rel.label}</p>
                {relationship === rel.value && (
                  <CheckCircleIcon className="size-5 text-primary" />
                )}
              </div>
            </Card>
          ))}
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
