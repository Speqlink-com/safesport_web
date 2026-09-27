"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeftIcon, CheckCircleIcon, SearchIcon } from "lucide-react"
import { mockAthletes } from "@/features/safesport/data/mock-data"

export default function GuardianFindAthletePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const firstName = searchParams.get("firstName") || ""
  const lastName = searchParams.get("lastName") || ""
  const relationship = searchParams.get("relationship") || ""
  
  const [athleteSearch, setAthleteSearch] = useState("")
  const [searchResults, setSearchResults] = useState<typeof mockAthletes>([])
  const [selectedAthleteId, setSelectedAthleteId] = useState(searchParams.get("athleteId") || "")

  useEffect(() => {
    if (!firstName || !lastName || !relationship) {
      router.push("/account/signup/guardian/name")
    }
  }, [firstName, lastName, relationship, router])

  const handleSearch = () => {
    const results = mockAthletes.filter(a => 
      `${a.firstName} ${a.lastName}`.toLowerCase().includes(athleteSearch.toLowerCase()) ||
      a.id.toLowerCase().includes(athleteSearch.toLowerCase())
    ).slice(0, 2) // Show only 2 athletes at a time
    setSearchResults(results)
  }

  const canProceed = selectedAthleteId.length > 0

  const handleNext = () => {
    if (canProceed) {
      router.push(`/account/signup/guardian/account?firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}&relationship=${encodeURIComponent(relationship)}&athleteId=${encodeURIComponent(selectedAthleteId)}`)
    }
  }

  const handleBack = () => {
    router.push(`/account/signup/guardian/relationship?firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}&relationship=${encodeURIComponent(relationship)}`)
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
          <span>Step 3 of 6</span>
          <span>50%</span>
        </div>
        <Progress value={50} />
      </div>

      {/* Form */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Find your athlete</h1>
          <p className="text-muted-foreground">Search by name or SafeSport ID</p>
        </div>

        <div className="flex gap-2">
          <Input
            value={athleteSearch}
            onChange={(e) => setAthleteSearch(e.target.value)}
            placeholder="Start typing name or ID..."
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} variant="outline" size="icon">
            <SearchIcon className="size-4" />
          </Button>
        </div>

        {searchResults.length > 0 && (
          <div className="space-y-2">
            {searchResults.map((athlete) => (
              <Card
                key={athlete.id}
                className={`p-4 cursor-pointer transition-all hover:border-primary ${
                  selectedAthleteId === athlete.id ? "border-primary bg-primary/5" : ""
                }`}
                onClick={() => setSelectedAthleteId(athlete.id)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="size-12">
                    {athlete.photo ? (
                      <img src={athlete.photo} alt={`${athlete.firstName} ${athlete.lastName}`} className="object-cover" />
                    ) : (
                      <AvatarFallback>
                        {athlete.firstName[0]}{athlete.lastName[0]}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{athlete.firstName} {athlete.lastName}</p>
                    <p className="text-sm text-muted-foreground">{athlete.id}</p>
                    <p className="text-xs text-muted-foreground">{athlete.currentOrganization?.name}</p>
                  </div>
                  {selectedAthleteId === athlete.id && (
                    <CheckCircleIcon className="size-5 text-primary" />
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

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
