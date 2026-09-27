"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function RequestDemoRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace("/account/request-demo/type")
  }, [router])

  return null
}
