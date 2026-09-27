"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircleIcon, SchoolIcon, UsersIcon, TrophyIcon } from "lucide-react"

export default function InstitutionTypePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [type, setType] = useState(searchParams.get("type") || "")

  const types = [
    { value: "school", label: "School", icon: SchoolIcon, description: "Primary, secondary, or high school" },
    { value: "club", label: "Sports Club", icon: TrophyIcon, description: "Community or professional sports club" },
    { value: "academy", label: "Sports Academy", icon: UsersIcon, description: "Specialized training academy" },
  ]

  const canProceed = type.length > 0

  const handleNext = () => {
    if (canProceed) {
      router.push(`/account/request-demo/details?type=${encodeURIComponent(type)}`)
    }
  }

  return (
    <div className="w-full max-w-2xl space-y-8">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step 1 of 4</span>
          <span>25%</span>
        </div>
        <Progress value={25} />
      </div>

      {/* Form */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Request a Demo</h1>
          <p className="text-muted-foreground">What type of institution are you?</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {types.map((item) => {
            const Icon = item.icon
            return (
              <Card
                key={item.value}
                className={`p-6 cursor-pointer transition-all hover:border-primary ${
                  type === item.value ? "border-primary bg-primary/5" : ""
                }`}
                onClick={() => setType(item.value)}
              >
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="size-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{item.label}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.description}
                    </p>
                  </div>
                  {type === item.value && (
                    <CheckCircleIcon className="size-5 text-primary" />
                  )}
                </div>
              </Card>
            )
          })}
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
