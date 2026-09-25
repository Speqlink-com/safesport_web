"use client";
/**
 * clinician-assessments.tsx
 * Redesigned PPE Assessment list and editor stepper for the Clinician workspace.
 * Preserves ALL clinical logic from clinical.tsx. Wraps in new visual primitives.
 */

import { Button } from "@/components/ui/button";
import {
Dialog,
DialogContent,
DialogDescription,
DialogHeader,
DialogTitle,
} from "@/components/ui/dialog";
import {
AlertCircle,
CheckCircle2,
ChevronRight,
ClipboardCheck,
ClipboardList,
Plus,
ShieldCheck,
Stethoscope
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { href,human } from "./catalog";
import { assessmentBlocks,ConsentScreen } from "./clinical";
import {
EmptyState,
HeroBanner,
InfoGrid,
InfoNote,
PageHeader,
ProgressBar,
SectionCard,
SectionLabel,
StatCard,
StatusChip
} from "./clinician-ui";
import {
baselineDomains,
certificateText,
eligibilityOptions,
emptyEncounter,
examDomains,
fullName,
historyDomains,
historyPrompts,
newId,
today,
useWorkspace,
visibleAthletes,
type Encounter,
} from "./store";
import { Check,Choice,Export,Field,Notes } from "./ui";

// ── Assessment list ───────────────────────────────────────────────────────────

export function ClinicianAssessments({ id }: { id?: string }) {
  const { state, update } = useWorkspace();
  const router = useRouter();
  const athletes = visibleAthletes(state, "clinician");
  const [startOpen, setStartOpen] = useState(false);
  const [selected, setSelected] = useState(athletes[0]?.id || "");

  const encounters = state.encounters.filter((e) =>
    athletes.some((a) => a.id === e.athleteId),
  );

  if (id && id !== "new") {
    const record = encounters.find((e) => e.id === id);
    if (!record)
      return (
        <div className="space-y-6">
          <PageHeader title="Assessment unavailable" back={{ label: "Back to assessments", href: href("clinician", "assessments") }} />
          <EmptyState
            icon={ClipboardList}
            title="Assessment not found"
            description="This assessment is not in your permitted demo records."
          />
        </div>
      );
    return <AssessmentDetail initial={record} />;
  }

  const inProgress = encounters.filter((e) => !e.finalized && e.status !== "blocked").length;
  const finalized = encounters.filter((e) => e.finalized).length;
  const blocked = encounters.filter((e) => e.status === "blocked").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Clinical"
        title="PPE assessments"
        description="Track consent, history, examination, MSK baseline and the clinician's participation decision."
      >
        <Button size="sm" onClick={() => setStartOpen(true)} className="gap-1.5">
          <Plus className="size-3.5" aria-hidden="true" />
          Start assessment
        </Button>
      </PageHeader>

      {/* Stat strip */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total encounters" value={encounters.length} icon={ClipboardList} accent="neutral" />
        <StatCard label="In progress" value={inProgress} icon={Stethoscope} accent="blue" />
        <StatCard label="Finalized" value={finalized} icon={CheckCircle2} accent="green" />
        <StatCard label="Blocked" value={blocked} sub={blocked > 0 ? "Consent required" : undefined} icon={AlertCircle} accent={blocked > 0 ? "red" : "neutral"} />
      </div>

      {/* Table */}
      <SectionCard label="Register" title="Assessment history">
        {encounters.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No assessments started"
            description="Start an assessment to begin tracking the PPE pipeline."
            action={<Button size="sm" onClick={() => setStartOpen(true)}>Start assessment</Button>}
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Athlete</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Status</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Date</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Decision</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {encounters.map((e) => {
                  const athlete = athletes.find((a) => a.id === e.athleteId);
                  return (
                    <tr key={e.id} className="group transition-colors hover:bg-muted/40">
                      <td className="px-4 py-3">
                        <Link href={href("clinician", `assessments/${e.id}`)} className="outline-none focus-visible:underline">
                          <p className="font-semibold">{fullName(athlete)}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{e.id}</p>
                        </Link>
                      </td>
                      <td className="px-4 py-3"><StatusChip value={e.status} /></td>
                      <td className="px-4 py-3 text-muted-foreground">{e.date.slice(0, 10)}</td>
                      <td className="px-4 py-3">
                        {e.finalized ? <StatusChip value={e.decision} /> : <span className="text-xs text-muted-foreground">Pending</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={href("clinician", `assessments/${e.id}`)}>
                          <Button variant="outline" size="sm" className="gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100">
                            Open <ChevronRight className="size-3" aria-hidden="true" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Start assessment dialog */}
      <Dialog open={startOpen} onOpenChange={setStartOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start PPE assessment</DialogTitle>
            <DialogDescription>
              Create a local encounter linked to the athlete’s longitudinal record.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Choice
              label="Athlete"
              value={selected}
              onChange={setSelected}
              options={athletes.map((a) => ({ value: a.id, label: fullName(a) }))}
            />
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button variant="outline" onClick={() => setStartOpen(false)}>Cancel</Button>
              <Button
                disabled={!selected}
                onClick={() => {
                  const active = state.encounters.find((e) => e.athleteId === selected && !e.finalized);
                  const e = active ?? emptyEncounter(newId("ppe"), selected);
                  if (!active)
                    update(
                      (s) => ({ ...s, encounters: [e, ...s.encounters] }),
                      `Assessment started for ${selected}`,
                      "clinician",
                      `assessments/${e.id}`,
                    );
                  setStartOpen(false);
                  router.push(href("clinician", `assessments/${e.id}`));
                }}
              >
                Open assessment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Assessment detail / editor ────────────────────────────────────────────────

const STAGES = ["Consent", "History", "Vitals", "Examination", "MSK baseline", "Sport review", "Eligibility"] as const;

function AssessmentDetail({ initial }: { initial: Encounter }) {
  const { state, update } = useWorkspace();
  const [form, setForm] = useState(initial);
  const [step, setStep] = useState(0);
  const [confirm, setConfirm] = useState(false);
  const athlete = state.athletes.find((a) => a.id === form.athleteId)!;
  const consent = state.consents[athlete?.id];
  const blocks = athlete ? assessmentBlocks(form, consent) : [];
  const patch = (v: Partial<Encounter>) => setForm({ ...form, ...v });

  const save = (finalized = false) => {
    const saved = { ...form, finalized, status: finalized ? "complete" : "in_progress" };
    update(
      (s) => ({
        ...s,
        encounters: s.encounters.map((e) => (e.id === saved.id ? saved : e)),
        records: finalized && saved.decision !== "cleared"
          ? {
              ...s.records,
              tasks: [
                {
                  id: `followup-${saved.id}`,
                  athleteId: saved.athleteId,
                  title: "Participation follow-up required",
                  status: "pending",
                  date: saved.reviewDate,
                  notes: "Coordinate the clinician-requested review.",
                  assigned: "Faith Akinyi",
                  kind: "follow_up",
                },
                ...s.records.tasks.filter((t) => t.id !== `followup-${saved.id}`),
              ],
            }
          : s.records,
        athletes: finalized
          ? s.athletes.map((a) =>
              a.id === saved.athleteId
                ? {
                    ...a,
                    eligibilityStatus: saved.decision,
                    nextReview: saved.reviewDate,
                    readiness:
                      saved.decision === "cleared" ? "ready" :
                      ["cleared_with_monitoring", "sport_specific_restriction"].includes(saved.decision) ? "ready_with_restrictions" :
                      saved.decision === "pending_evaluation" ? "under_review" : "not_ready",
                  }
                : a,
            )
          : s.athletes,
      }),
      finalized ? `Eligibility finalized for ${athlete?.id}` : `Assessment draft saved for ${athlete?.id}`,
      "clinician",
      `assessments/${form.id}`,
      finalized
        ? ["clinician", ...(athlete?.id === state.athleteId ? ["athlete" as const] : []), ...(athlete?.id === state.guardianId ? ["guardian" as const] : [])]
        : ["clinician"],
    );
    setForm(saved);
    setConfirm(false);
    toast.success(finalized ? "Clinical decision finalized" : "Assessment draft saved");
  };

  // Finalized view
  if (form.finalized && athlete) {
    return (
      <div className="space-y-6">
        <HeroBanner
          eyebrow="Assessment finalized"
          title={fullName(athlete)}
          description={`${form.id} · ${athlete.currentSport?.name ?? "—"} · ${form.date}`}
          footer={
            <div className="flex flex-wrap gap-2">
              <StatusChip value={form.decision} />
            </div>
          }
        >
          <Link href={href("clinician", "assessments")}>
            <Button variant="outline" size="sm">← All assessments</Button>
          </Link>
        </HeroBanner>

        <SectionCard label="Clinical decision" title="Clinician record">
          <InfoGrid items={[
            { label: "Decision", value: <StatusChip value={form.decision} /> },
            { label: "Restrictions", value: form.restrictions || "None recorded" },
            { label: "Monitoring / plan", value: form.plan || "None specified" },
            { label: "Review date", value: form.reviewDate },
            { label: "Signed by", value: form.signature },
            { label: "Assessment date", value: form.date },
          ]} />
          <div className="mt-5 flex flex-wrap gap-2 border-t pt-5">
            <Export name={`${form.id}-certificate.txt`} content={certificateText(athlete, form)} />
            <Link href={href("clinician", `athletes/${athlete.id}`)}>
              <Button variant="outline" size="sm">Athlete record</Button>
            </Link>
          </div>
        </SectionCard>
      </div>
    );
  }

  if (!athlete) return <EmptyState title="Athlete not found" />;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1.5">
          <SectionLabel>PPE assessment</SectionLabel>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{fullName(athlete)}</h1>
          <p className="text-sm text-muted-foreground">{form.id} · {athlete.currentSport?.name ?? "—"} · {form.date}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => save()}>Save draft</Button>
          <Link href={href("clinician", `athletes/${athlete.id}`)}>
            <Button variant="outline" size="sm">Close</Button>
          </Link>
        </div>
      </div>

      {/* Visual stepper */}
      <div className="rounded-xl border bg-card p-4">
        <div className="flex flex-wrap items-center gap-2" role="list" aria-label="Assessment steps">
          {STAGES.map((s, i) => {
            const done = i < step;
            const current = i === step;
            return (
              <button
                key={s}
                role="listitem"
                aria-current={current ? "step" : undefined}
                onClick={() => setStep(i)}
                className={[
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                  "outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  current ? "bg-primary text-primary-foreground" :
                  done ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" :
                  "bg-muted text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {done ? <CheckCircle2 className="size-3" aria-hidden="true" /> : <span>{i + 1}</span>}
                <span className="hidden sm:inline">{s}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-3">
          <ProgressBar value={((step + 1) / STAGES.length) * 100} label={`Step ${step + 1} of ${STAGES.length}: ${STAGES[step]}`} />
        </div>
      </div>

      {/* Step content */}
      <SectionCard title={STAGES[step]} description="Save your work before navigating away.">
        {step === 0 && <ConsentScreen role="clinician" athleteId={athlete.id} />}

        {step > 0 && consent?.clinical !== "obtained" && (
          <EmptyState
            icon={ShieldCheck}
            title="Clinical consent required"
            description="This encounter is blocked until consent and any required minor assent are recorded."
            action={<Button onClick={() => setStep(0)}>Review consent</Button>}
          />
        )}

        {step > 0 && consent?.clinical === "obtained" && (
          <>
            {step === 1 && (
              <div className="space-y-4">
                <InfoNote>
                  Positive, unknown and private responses require a documented clinician follow-up. Confidential notes are excluded from operational and guardian views.
                </InfoNote>
                {historyDomains.map((d) => (
                  <div key={d} className="space-y-3 rounded-xl border p-4">
                    <p className="text-sm leading-relaxed text-muted-foreground">{historyPrompts[d]}</p>
                    <Choice
                      label={d}
                      value={form.history[d] || ""}
                      onChange={(v) => patch({ history: { ...form.history, [d]: v }, reviewed: false })}
                      options={["yes", "no", "unknown", "private"]}
                    />
                    {["yes", "unknown", "private"].includes(form.history[d]) && (
                      <Notes
                        label={`${d}: clinician follow-up and resolution`}
                        value={form.followups[d] || ""}
                        onChange={(v) => patch({ followups: { ...form.followups, [d]: v }, reviewed: false })}
                      />
                    )}
                  </div>
                ))}
                <div className="rounded-xl border p-4">
                  <Check
                    label="I have reviewed all history responses and resolved the flags with a documented plan."
                    checked={form.reviewed}
                    onChange={(v) => patch({ reviewed: v })}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {["Systolic BP", "Diastolic BP", "Pulse", "Respiratory rate", "SpO2", "Temperature", "Height cm", "Weight kg"].map((v) => (
                    <Field
                      key={v}
                      label={`${v}${v.includes("BP") ? " (mmHg)" : v === "Pulse" ? " (beats/min)" : ""}`}
                      type="number"
                      min="0"
                      max={v === "SpO2" ? 100 : 500}
                      value={form.vitals[v] || ""}
                      onChange={(n) => patch({ vitals: { ...form.vitals, [v]: n } })}
                      required={["Systolic BP", "Diastolic BP", "Pulse"].includes(v)}
                    />
                  ))}
                </div>
                <Notes
                  label="Measurement context / recheck notes"
                  value={form.vitals.notes || ""}
                  onChange={(v) => patch({ vitals: { ...form.vitals, notes: v } })}
                />
                <InfoNote>
                  Interpret measurements in the athlete’s age and clinical context. Unusual readings require recheck; they do not automatically determine eligibility.
                </InfoNote>
              </div>
            )}

            {(step === 3 || step === 4) && (
              <div className="space-y-4">
                {(step === 3 ? examDomains : baselineDomains).map((d) => {
                  const values = step === 3 ? form.exam : form.baseline;
                  const notes = step === 3 ? form.examNotes : form.baselineNotes;
                  return (
                    <div key={d} className="space-y-3 rounded-xl border p-4">
                      <Choice
                        label={d}
                        value={values[d] || "not_assessed"}
                        onChange={(v) =>
                          patch(step === 3 ? { exam: { ...values, [d]: v } } : { baseline: { ...values, [d]: v } })
                        }
                        options={["normal", "abnormal", "not_assessed", "not_applicable"]}
                      />
                      <Notes
                        label={`${d}: ${step === 4 ? "range of motion, pain, strength, stability and function" : "findings and context"}`}
                        value={notes[d] || ""}
                        onChange={(v) =>
                          patch(step === 3 ? { examNotes: { ...notes, [d]: v } } : { baselineNotes: { ...notes, [d]: v } })
                        }
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {athlete.currentSport?.name === "Rugby"
                    ? "Review concussion, cervical spine, shoulder, knee and trauma history."
                    : "Review knee / ankle, concussion, hamstring, landing and cutting demands and injury history."}
                </p>
                <Notes
                  label="Sport-specific review"
                  value={form.sportNotes}
                  onChange={(v) => patch({ sportNotes: v })}
                />
                <InfoNote>
                  Movement screening is optional. AI is a movement-risk signal and cannot determine medical clearance.
                </InfoNote>
                <Link href={href("clinician", "screenings")}>
                  <Button variant="outline" size="sm">Optional movement screening →</Button>
                </Link>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-4">
                <Choice
                  label="Clinician eligibility decision"
                  value={form.decision}
                  onChange={(v) => patch({ decision: v as Encounter["decision"] })}
                  options={eligibilityOptions.map((v) => ({
                    value: v,
                    label: v === "pending_evaluation" ? "Cleared pending further evaluation" : human(v),
                  }))}
                />
                <Notes
                  label="Allowed and restricted activities (shared with coach)"
                  value={form.restrictions}
                  onChange={(v) => patch({ restrictions: v })}
                />
                <Notes
                  label="Monitoring / required evaluation / follow-up"
                  value={form.plan}
                  onChange={(v) => patch({ plan: v })}
                />
                <Notes
                  label="Clinical rationale (confidential)"
                  value={form.rationale}
                  onChange={(v) => patch({ rationale: v })}
                />
                <Field
                  label="Review / evaluation deadline"
                  type="date"
                  min={today}
                  value={form.reviewDate}
                  onChange={(v) => patch({ reviewDate: v })}
                />
                <Field
                  label="Clinician signature"
                  value={form.signature}
                  onChange={(v) => patch({ signature: v })}
                />
                <InfoNote>
                  Only the treating clinician finalizes eligibility. Outstanding referrals remain visible and require closed-loop follow-up.
                </InfoNote>

                {blocks.length > 0 ? (
                  <InfoNote variant="critical">
                    <p className="mb-2 flex items-center gap-2 font-semibold">
                      <AlertCircle className="size-4" aria-hidden="true" />
                      Before finalization
                    </p>
                    <ul className="list-disc space-y-1 pl-5 text-sm">
                      {blocks.map((b) => <li key={b}>{b}</li>)}
                    </ul>
                  </InfoNote>
                ) : (
                  <InfoNote variant="default">
                    <p className="flex items-center gap-2 text-sm">
                      <ClipboardCheck className="size-4" aria-hidden="true" />
                      All required stages are documented. Ready to finalize.
                    </p>
                  </InfoNote>
                )}

                <Button
                  disabled={blocks.length > 0}
                  onClick={() => setConfirm(true)}
                  className="w-full sm:w-auto"
                >
                  Finalize clinician decision
                </Button>
              </div>
            )}
          </>
        )}
      </SectionCard>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}>
          ← Previous
        </Button>
        <Button disabled={step === STAGES.length - 1} onClick={() => setStep(step + 1)}>
          Next →
        </Button>
      </div>

      {/* Finalization confirmation */}
      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalize participation decision?</DialogTitle>
            <DialogDescription>
              The demo certificate and participation views will use this signed decision.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <StatusChip value={form.decision} />
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button variant="outline" onClick={() => setConfirm(false)}>Cancel</Button>
              <Button onClick={() => save(true)}>Confirm finalization</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
