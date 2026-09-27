"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ArrowLeftIcon } from "lucide-react"
import { authApi } from "@/features/auth/api"
import toast from "react-hot-toast"

export default function AthleteAccountPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const firstName = searchParams.get("firstName") || ""
  const lastName = searchParams.get("lastName") || ""
  const dob = searchParams.get("dob") || ""
  const orgId = searchParams.get("orgId") || ""
  const orgName = searchParams.get("orgName") || ""
  const sportId = searchParams.get("sportId") || ""
  const sportName = searchParams.get("sportName") || ""
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!firstName || !lastName || !dob || !orgId || !sportId) {
      router.push("/account/signup/athlete/name")
    }
  }, [firstName, lastName, dob, orgId, sportId, router])

  const canProceed = 
    email.includes("@") && 
    password.length >= 8 && 
    password === confirmPassword

  const handleNext = async () => {
    if (canProceed) {
      setIsSubmitting(true)
      try {
        await authApi.startRegistration({ role: "athlete", first_name: firstName, last_name: lastName, email, password, date_of_birth: dob, organization_id: orgId, organization_name: orgName, sport_id: sportId })
        toast.success("Verification code sent")
        router.push("/account/signup/athlete/verify")
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to start registration")
        setIsSubmitting(false)
      }
    }
  }

  const handleBack = () => {
    const params = new URLSearchParams({ firstName, lastName, dob, orgId, orgName, sportId, sportName })
    router.push(`/account/signup/athlete/team?${params.toString()}`)
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
          <span>Step 4 of 6</span>
          <span>67%</span>
        </div>
        <Progress value={67} />
      </div>

      {/* Form */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Create your account</h1>
          <p className="text-muted-foreground">Secure your SafeSport™ profile</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-sm text-destructive">Passwords do not match</p>
            )}
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <Button 
            onClick={handleNext} 
            disabled={!canProceed || isSubmitting}
            size="lg"
          >
            {isSubmitting ? "Sending code…" : "Continue"}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          By continuing, you agree to SafeSport&apos;s Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
