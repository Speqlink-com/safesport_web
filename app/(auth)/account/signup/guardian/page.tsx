"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function GuardianSignupRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace("/account/signup/guardian/name")
  }, [router])

  return null
}
