"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircleIcon } from "lucide-react"

export default function InstitutionSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const type = searchParams.get("type") || ""
  const name = searchParams.get("name") || ""
  const city = searchParams.get("city") || ""
  const country = searchParams.get("country") || ""
  const contactName = searchParams.get("contactName") || ""
  const contactEmail = searchParams.get("contactEmail") || ""
  const contactPhone = searchParams.get("contactPhone") || ""

  useEffect(() => {
    if (!type || !name || !contactName || !contactEmail) {
      router.push("/account/request-demo/type")
    } else {
      // Log the demo request
      console.log("Demo request submitted:", {
        type,
        institutionName: name,
        location: `${city}, ${country}`,
        contact: {
          name: contactName,
          email: contactEmail,
          phone: contactPhone
        }
      })
    }
  }, [type, name, city, country, contactName, contactEmail, contactPhone, router])

  const typeLabels: Record<string, string> = {
    school: "School",
    club: "Sports Club",
    academy: "Sports Academy"
  }

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step 4 of 4</span>
          <span>100%</span>
        </div>
        <Progress value={100} />
      </div>

      {/* Success Message */}
      <div className="space-y-6">
        <div className="flex justify-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-primary/10">
            <CheckCircleIcon className="size-10 text-primary" />
          </div>
        </div>

        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Request submitted!</h1>
          <p className="text-muted-foreground">
            We&apos;ve received your demo request for <strong>{name}</strong>
          </p>
        </div>

        <Card className="p-6 space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Institution Type</p>
            <p className="font-medium">{typeLabels[type]}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Institution Name</p>
            <p className="font-medium">{name}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Location</p>
            <p className="font-medium">{city}, {country}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Contact Person</p>
            <p className="font-medium">{contactName}</p>
            <p className="text-sm text-muted-foreground">{contactEmail}</p>
            <p className="text-sm text-muted-foreground">{contactPhone}</p>
          </div>
        </Card>

        <div className="space-y-3 pt-4">
          <div className="rounded-lg bg-muted p-4 text-sm">
            <p className="font-semibold mb-2">What happens next?</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Our team will review your request within 1-2 business days</li>
              <li>• We&apos;ll contact you via email to schedule a personalized demo</li>
              <li>• You&apos;ll receive a demo account to explore SafeSport™</li>
            </ul>
          </div>

          <Button 
            onClick={() => router.push("/account/signin")}
            variant="outline"
            className="w-full"
            size="lg"
          >
            Back to Sign In
          </Button>
        </div>
      </div>
    </div>
  )
}
