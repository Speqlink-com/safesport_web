"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ArrowLeftIcon } from "lucide-react"

export default function InstitutionDetailsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const type = searchParams.get("type") || ""
  const [name, setName] = useState(searchParams.get("name") || "")
  const [city, setCity] = useState(searchParams.get("city") || "")
  const [country, setCountry] = useState(searchParams.get("country") || "")

  useEffect(() => {
    if (!type) {
      router.push("/account/request-demo/type")
    }
  }, [type, router])

  const canProceed = name.trim().length > 0 && city.trim().length > 0 && country.trim().length > 0

  const handleNext = () => {
    if (canProceed) {
      router.push(`/account/request-demo/contact?type=${encodeURIComponent(type)}&name=${encodeURIComponent(name)}&city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`)
    }
  }

  const handleBack = () => {
    router.push(`/account/request-demo/type?type=${encodeURIComponent(type)}`)
  }

  const typeLabels: Record<string, string> = {
    school: "School",
    club: "Sports Club",
    academy: "Sports Academy"
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
          <span>Step 2 of 4</span>
          <span>50%</span>
        </div>
        <Progress value={50} />
      </div>

      {/* Form */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Institution details</h1>
          <p className="text-muted-foreground">Tell us about your {typeLabels[type]?.toLowerCase()}</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Institution Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Green Valley Academy"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && canProceed && handleNext()}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Nairobi"
              onKeyDown={(e) => e.key === "Enter" && canProceed && handleNext()}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Kenya"
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
      </div>
    </div>
  )
}
