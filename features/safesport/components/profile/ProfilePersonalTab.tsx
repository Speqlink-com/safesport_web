"use client"

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EditIcon, CheckIcon, XIcon } from "lucide-react";
import type { Athlete } from "@/features/safesport/types";
import type { AthleteOnboardingData } from "@/features/safesport/types/onboarding";

interface ProfilePersonalTabProps {
  athlete: Athlete
  onboardingData: AthleteOnboardingData | null
}

export function ProfilePersonalTab({ athlete, onboardingData }: ProfilePersonalTabProps) {
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    firstName: athlete.firstName,
    lastName: athlete.lastName,
    dateOfBirth: athlete.dateOfBirth,
    gender: athlete.gender,
    emergencyName: onboardingData?.emergencyContact?.name || "",
    emergencyPhone: onboardingData?.emergencyContact?.phone || "",
    emergencyRelationship: onboardingData?.emergencyContact?.relationship || "other",
  })

  const handleEdit = (section: string) => {
    setEditingSection(section)
  }

  const handleCancel = () => {
    // Reset form data
    setFormData({
      firstName: athlete.firstName,
      lastName: athlete.lastName,
      dateOfBirth: athlete.dateOfBirth,
      gender: athlete.gender,
      emergencyName: onboardingData?.emergencyContact?.name || "",
      emergencyPhone: onboardingData?.emergencyContact?.phone || "",
      emergencyRelationship: onboardingData?.emergencyContact?.relationship || "",
    })
    setEditingSection(null)
  }

  const handleSave = () => {
    console.log("Saving personal information:", formData)
    // In production: API call to save
    setEditingSection(null)
  }

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Basic information</h3>
              <p className="text-sm text-muted-foreground">Your personal details</p>
            </div>
            {editingSection !== "basic" && (
              <Button variant="ghost" size="sm" onClick={() => handleEdit("basic")} className="gap-2">
                <EditIcon className="size-4" />
                Edit
              </Button>
            )}
          </div>
          <Separator className="mb-4" />

          {editingSection === "basic" ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Sex</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value as "male" | "female" | "other" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave} className="gap-2">
                  <CheckIcon className="size-4" />
                  Save changes
                </Button>
                <Button variant="outline" onClick={handleCancel} className="gap-2">
                  <XIcon className="size-4" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Full name</p>
                <p className="font-medium">{athlete.firstName} {athlete.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date of birth</p>
                <p className="font-medium">
                  {new Date(athlete.dateOfBirth).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Age</p>
                <p className="font-medium">{athlete.age} years</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sex</p>
                <p className="font-medium capitalize">{athlete.gender}</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* SafeSport Identity */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">SafeSport identity</h3>
              <p className="text-sm text-muted-foreground">Your unique SafeSport information</p>
            </div>
          </div>
          <Separator className="mb-4" />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">SafeSport ID</span>
              <Badge variant="outline" className="font-mono">{athlete.id}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Member since</span>
              <span className="text-sm font-medium">
                {new Date(athlete.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Emergency contact</h3>
              <p className="text-sm text-muted-foreground">Who to contact in case of emergency</p>
            </div>
            {editingSection !== "emergency" && (
              <Button variant="ghost" size="sm" onClick={() => handleEdit("emergency")} className="gap-2">
                <EditIcon className="size-4" />
                Edit
              </Button>
            )}
          </div>
          <Separator className="mb-4" />

          {editingSection === "emergency" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyName">Full name</Label>
                <Input
                  id="emergencyName"
                  value={formData.emergencyName}
                  onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                  placeholder="Emergency contact name"
                />
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Phone number</Label>
                  <Input
                    id="emergencyPhone"
                    type="tel"
                    value={formData.emergencyPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                    placeholder="+254 700 000 000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyRelationship">Relationship</Label>
                  <Select
                    value={formData.emergencyRelationship}
                    onValueChange={(value) => setFormData({ ...formData, emergencyRelationship: value || "other" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="guardian">Guardian</SelectItem>
                      <SelectItem value="sibling">Sibling</SelectItem>
                      <SelectItem value="spouse">Spouse</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave} className="gap-2">
                  <CheckIcon className="size-4" />
                  Save changes
                </Button>
                <Button variant="outline" onClick={handleCancel} className="gap-2">
                  <XIcon className="size-4" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              {onboardingData?.emergencyContact ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{onboardingData.emergencyContact.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{onboardingData.emergencyContact.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Relationship</p>
                    <p className="font-medium capitalize">{onboardingData.emergencyContact.relationship}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No emergency contact added</p>
              )}
            </>
          )}
        </div>
      </Card>

      {/* Guardian Information (if minor) */}
      {athlete.guardians && athlete.guardians.length > 0 && (
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Guardian</h3>
                <p className="text-sm text-muted-foreground">Parent or legal guardian information</p>
              </div>
            </div>
            <Separator className="mb-4" />

            <div className="space-y-4">
              {athlete.guardians.map((guardian) => (
                <div key={guardian.id} className="p-4 rounded-lg bg-muted/50">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{guardian.firstName} {guardian.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Relationship</p>
                      <p className="font-medium capitalize">{guardian.relationship.replace(/_/g, " ")}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{guardian.email || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{guardian.phone || "Not provided"}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              <p className="text-xs text-muted-foreground">
                Guardian information is managed by your guardian account
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
