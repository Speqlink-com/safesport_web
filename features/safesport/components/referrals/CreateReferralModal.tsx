"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import {
  mockAthletes,
  mockPPEAssessments,
  mockScreenings,
  mockIncidents,
} from "@/features/safesport/data/mock-data";
import type {
  ReferralType,
  ReferralUrgency,
} from "@/features/safesport/types";

interface CreateReferralModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultAthleteId?: string;
  defaultSource?: "ppe" | "screening" | "incident";
  defaultSourceId?: string;
  showTrigger?: boolean;
}

export function CreateReferralModal({
  open,
  onOpenChange,
  defaultAthleteId,
  defaultSource,
  defaultSourceId,
  showTrigger = true,
}: CreateReferralModalProps) {
  const [athleteId, setAthleteId] = useState(defaultAthleteId || "");
  const [type, setType] = useState<ReferralType | "">("");
  const [urgency, setUrgency] = useState<ReferralUrgency | "">("");
  const [reason, setReason] = useState("");
  const [source, setSource] = useState<"ppe" | "screening" | "incident" | "standalone">(
    defaultSource || "standalone"
  );
  const [sourceId, setSourceId] = useState(defaultSourceId || "");
  const [providerFacility, setProviderFacility] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!athleteId || !type || !urgency || !reason) {
      alert("Please fill in all required fields");
      return;
    }

    // Create referral object
    const newReferral = {
      id: `ref-${crypto.randomUUID().slice(0, 8)}`,
      athleteId,
      createdBy: "clin-001",
      createdByName: "Dr. Sarah Ndungu",
      type,
      reason,
      urgency,
      providerFacility: providerFacility || undefined,
      appointmentDate: appointmentDate || undefined,
      createdAt: new Date().toISOString(),
      status: "pending" as const,
      outcome: "pending" as const,
      relatedPPE: source === "ppe" ? sourceId : undefined,
      relatedIncident: source === "incident" ? sourceId : undefined,
    };

    console.log("Creating referral:", newReferral);

    // TODO: In production, this would call an API to create the referral
    // For now, just log and close the modal
    alert(`Referral created successfully: ${newReferral.id}`);

    // Reset form
    resetForm();
    onOpenChange?.(false);
  };

  const resetForm = () => {
    if (!defaultAthleteId) setAthleteId("");
    setType("");
    setUrgency("");
    setReason("");
    if (!defaultSource) setSource("standalone");
    if (!defaultSourceId) setSourceId("");
    setProviderFacility("");
    setAppointmentDate("");
  };

  // Get available sources based on selected athlete
  const availablePPEs = athleteId
    ? mockPPEAssessments.filter((ppe) => ppe.athleteId === athleteId)
    : [];

  const availableScreenings = athleteId
    ? mockScreenings.filter((s) => s.athleteId === athleteId)
    : [];

  const availableIncidents = athleteId
    ? mockIncidents.filter((inc) => inc.athleteId === athleteId)
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {showTrigger && (
        <DialogTrigger>
          <Plus className="mr-2 h-4 w-4" />
          Create Referral
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Referral</DialogTitle>
          <DialogDescription>
            Refer an athlete to a specialist for further evaluation or treatment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Athlete Selection */}
            <div className="space-y-2">
              <Label htmlFor="athlete">
                Athlete <span className="text-red-500">*</span>
              </Label>
              <Select
                value={athleteId}
                onValueChange={(value) => setAthleteId(value || "")}
                disabled={!!defaultAthleteId}
              >
                <SelectTrigger id="athlete">
                  <SelectValue placeholder="Select athlete" />
                </SelectTrigger>
                <SelectContent>
                  {mockAthletes.map((athlete) => (
                    <SelectItem key={athlete.id} value={athlete.id}>
                      {athlete.firstName} {athlete.lastName} ({athlete.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Source Context */}
            <div className="space-y-2">
              <Label htmlFor="source">Related To</Label>
              <Select
                value={source}
                onValueChange={(value) => setSource(value || "standalone")}
                disabled={!!defaultSource}
              >
                <SelectTrigger id="source">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standalone">Standalone Referral</SelectItem>
                  <SelectItem value="ppe">PPE Assessment</SelectItem>
                  <SelectItem value="screening">Movement Screening</SelectItem>
                  <SelectItem value="incident">Incident</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Source ID Selection */}
            {source === "ppe" && (
              <div className="space-y-2">
                <Label htmlFor="sourceId">PPE Assessment</Label>
                <Select value={sourceId} onValueChange={(value) => setSourceId(value || "")}>
                  <SelectTrigger id="sourceId">
                    <SelectValue placeholder="Select PPE assessment" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePPEs.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No PPE assessments found
                      </SelectItem>
                    ) : (
                      availablePPEs.map((ppe) => (
                        <SelectItem key={ppe.id} value={ppe.id}>
                          {ppe.id} - {ppe.status} ({new Date(ppe.assessmentDate).toLocaleDateString()})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {source === "screening" && (
              <div className="space-y-2">
                <Label htmlFor="sourceId">Movement Screening</Label>
                <Select value={sourceId} onValueChange={(value) => setSourceId(value || "")}>
                  <SelectTrigger id="sourceId">
                    <SelectValue placeholder="Select screening" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableScreenings.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No screenings found
                      </SelectItem>
                    ) : (
                      availableScreenings.map((screening) => (
                        <SelectItem key={screening.id} value={screening.id}>
                          {screening.id} - {screening.drill} ({screening.status})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {source === "incident" && (
              <div className="space-y-2">
                <Label htmlFor="sourceId">Incident</Label>
                <Select value={sourceId} onValueChange={(value) => setSourceId(value || "")}>
                  <SelectTrigger id="sourceId">
                    <SelectValue placeholder="Select incident" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableIncidents.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No incidents found
                      </SelectItem>
                    ) : (
                      availableIncidents.map((incident) => (
                        <SelectItem key={incident.id} value={incident.id}>
                          {incident.id} - {incident.type} ({new Date(incident.incidentDate).toLocaleDateString()})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Referral Type */}
            <div className="space-y-2">
              <Label htmlFor="type">
                Destination (Specialist Type) <span className="text-red-500">*</span>
              </Label>
              <Select value={type} onValueChange={(value) => setType(value || "")}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select specialist type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sports_physician">Sports Physician</SelectItem>
                  <SelectItem value="physiotherapy">Physiotherapy</SelectItem>
                  <SelectItem value="orthopaedics">Orthopaedics</SelectItem>
                  <SelectItem value="cardiology">Cardiology</SelectItem>
                  <SelectItem value="neurology">Neurology</SelectItem>
                  <SelectItem value="respiratory">Respiratory</SelectItem>
                  <SelectItem value="mental_health">Mental Health</SelectItem>
                  <SelectItem value="nutrition">Nutrition</SelectItem>
                  <SelectItem value="ophthalmology">Ophthalmology</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Urgency */}
            <div className="space-y-2">
              <Label htmlFor="urgency">
                Urgency <span className="text-red-500">*</span>
              </Label>
              <Select
                value={urgency}
                onValueChange={(value) => setUrgency(value || "")}
              >
                <SelectTrigger id="urgency">
                  <SelectValue placeholder="Select urgency level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">Routine (weeks)</SelectItem>
                  <SelectItem value="priority">Priority (days)</SelectItem>
                  <SelectItem value="urgent">Urgent (24-48 hours)</SelectItem>
                  <SelectItem value="emergency">Emergency (immediate)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">
                Reason for Referral <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reason"
                placeholder="Describe the clinical reason for this referral..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Provider Facility */}
            <div className="space-y-2">
              <Label htmlFor="facility">Provider/Facility (Optional)</Label>
              <Input
                id="facility"
                placeholder="e.g., SafeSport Physiotherapy Center"
                value={providerFacility}
                onChange={(e) => setProviderFacility(e.target.value)}
              />
            </div>

            {/* Appointment Date */}
            <div className="space-y-2">
              <Label htmlFor="appointment">Appointment Date (Optional)</Label>
              <Input
                id="appointment"
                type="datetime-local"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange?.(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Create Referral</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
