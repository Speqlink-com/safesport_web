"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AthleteSignupRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace("/account/signup/athlete/name")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Redirecting...</p>
    </div>
  )
}
