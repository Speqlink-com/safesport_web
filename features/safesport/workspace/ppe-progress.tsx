"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Panel, Status, Go } from "./ui";
import { href, personal, type Role } from "./catalog";
import { useWorkspace, visibleAthletes } from "./store";
import { scopedRecords } from "./records";
import { careSnapshot, hasCare } from "./ppe-care";
import { historyErrors } from "./ppe-history";
import { Progress } from "@/components/ui/progress";

/** Derived from saved records: a certificate and completion of follow-up are separate. */
export function PPEProgress({
  role,
  athleteId,
  encounterId,
  compact = false,
}: {
  role: Role;
  athleteId: string;
  encounterId?: string;
  compact?: boolean;
}) {
  const { state } = useWorkspace();
  const [expanded, setExpanded] = useState(!compact);
  if (!visibleAthletes(state, role).some((a) => a.id === athleteId))
    return null;
  const encounters = state.encounters.filter((e) => e.athleteId === athleteId);
  const encounter = encounterId
    ? encounters.find((e) => e.id === encounterId)
    : encounters.find((e) => !e.finalized) || encounters[0];
  const consent = state.consents[athleteId]?.clinical === "obtained";
  const refs = scopedRecords(state, role, "referrals").filter(
    (r) => r.athleteId === athleteId,
  );
  const plans = scopedRecords(state, role, "plans").filter(
    (r) => r.athleteId === athleteId,
  );
  const reviews = scopedRecords(state, role, "reviews").filter(
    (r) => r.athleteId === athleteId && r.status === "reassessment_requested",
  );
  const openRefs = refs.filter(
    (r) => r.status !== "completed" || !r.outcome || r.outcome === "pending",
  );
  const activePlans = plans.filter((p) => p.status !== "completed");
  const historyDone =
    !!encounter &&
    (encounter.finalized ||
      !!encounter.historySubmitted ||
      (encounter.reviewed && !historyErrors(encounter).length));
  const reviewDone = !!encounter?.reviewed;
  const carePending = openRefs.length > 0 || activePlans.length > 0;
  const reassessment = reviews.length;
  const careReviewed =
    !hasCare(state, athleteId) ||
    (!!encounter?.careReview?.note &&
      encounter.careReview.snapshot === careSnapshot(state, athleteId));
  const steps = [
    {
      title: "Consent",
      owner: "Athlete / guardian",
      done: consent,
      detail: consent
        ? "Clinical consent recorded."
        : "Clinical consent is required before submission.",
      path: personal(role)
        ? "consent"
        : role === "clinician" && encounter
          ? `assessments/${encounter.id}`
          : undefined,
    },
    {
      title: "Athlete questionnaire",
      owner: "Athlete / guardian",
      done: historyDone,
      detail: historyDone
        ? "History received for clinical assessment."
        : "Complete each question and the relevant follow-up details.",
      path: personal(role)
        ? "questionnaires"
        : role === "clinician" && encounter
          ? `assessments/${encounter.id}`
          : undefined,
    },
    {
      title: "Clinician assessment",
      owner: "Clinician",
      done: reviewDone && !!encounter?.finalized,
      detail: reviewDone
        ? "History reviewed; examination and eligibility are finalized by the clinician."
        : "History flags, examination and the participation decision need clinical review.",
      path:
        role === "clinician"
          ? encounter
            ? `assessments/${encounter.id}`
            : "assessments"
          : personal(role)
            ? "assessments"
            : undefined,
    },
    {
      title: "Referrals and rehabilitation",
      owner: "Assigned care team",
      done: !carePending && !!encounter?.finalized,
      detail:
        refs.length || plans.length
          ? `${openRefs.length} referral(s) awaiting an outcome or closure · ${activePlans.length} rehabilitation plan(s) ongoing.`
          : "No referral or rehabilitation plan recorded. The clinician decides whether further care is needed.",
      path:
        role === "clinician" || role === "physiotherapist"
          ? "referrals"
          : personal(role)
            ? "health?tab=rehabilitation"
            : undefined,
    },
    {
      title: "Reassessment",
      owner: "Clinician",
      done: !reassessment && careReviewed && !!encounter?.finalized,
      detail: reassessment
        ? `${reassessment} request(s) awaiting a new finalized clinical assessment.`
        : !careReviewed
          ? "Care evidence has not been reviewed with the latest clinician decision. Request or complete a clinical reassessment."
          : "A new review is required when the care team requests reassessment. Rehabilitation alone does not change eligibility.",
      path:
        role === "clinician"
          ? `assessments/new?athleteId=${athleteId}`
          : role === "physiotherapist"
            ? "rehabilitation"
            : "assessments",
    },
    {
      title: "Participation certificate",
      owner: "Clinician → athlete portal",
      done: !!encounter?.finalized,
      detail: encounter?.finalized
        ? "A demo certificate is available with the clinician’s actual decision and any restrictions. Follow-up may still be ongoing."
        : "Available after the clinician finalizes and signs this assessment.",
      path: role === "physiotherapist" ? undefined : "certificates",
    },
  ];
  const complete = steps.every((s) => s.done);
  return (
    <Panel
      title="PPE care journey"
      description={
        encounter
          ? `Assessment ${encounter.id} · Athlete-level care status. Steps may overlap when care continues under restrictions.`
          : "Start with consent and your health questionnaire."
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Status value={complete ? "complete" : "in_progress"} />
        <span className="text-xs text-muted-foreground">
          {steps.filter((s) => s.done).length} of {steps.length} stages complete
        </span>
      </div>
      <Progress
        value={(steps.filter((s) => s.done).length / steps.length) * 100}
      />
      {compact && (
        <Button
          variant="ghost"
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Hide journey steps" : "View journey steps and handoffs"}
        </Button>
      )}
      <div hidden={!expanded}>
        <ol className="divide-y divide-border/50">
          {steps.map((step, i) => (
            <li
              key={step.title}
              className="flex flex-wrap items-start gap-3 py-4"
            >
              <span
                className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold"
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold">{step.title}</h3>
                  <Status value={step.done ? "complete" : "pending"} />
                </div>
                <p className="text-xs font-medium text-muted-foreground">
                  {step.owner}
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  {step.detail}
                </p>
              </div>
              {step.path && (
                <Go to={href(role, step.path)} secondary>
                  Open {step.title.toLowerCase()}
                </Go>
              )}
            </li>
          ))}
        </ol>
        {refs.some((r) => !r.encounterId) ||
        plans.some((p) => !p.encounterId) ? (
          <p className="text-xs text-muted-foreground">
            Earlier care records without an assessment link are shown as
            athlete-level follow-up. Link them to the appropriate PPE when
            coordinating care.
          </p>
        ) : null}
        {complete && (
          <p className="text-sm">
            Recorded stages are complete in this view. Continue to follow the
            clinician’s review date and participation restrictions.
          </p>
        )}
      </div>
    </Panel>
  );
}
