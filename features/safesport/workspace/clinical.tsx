"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ShieldCheck, AlertCircle, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { type Role, href, personal, human } from "./catalog";
import {
  useWorkspace,
  visibleAthletes,
  fullName,
  emptyEncounter,
  newId,
  today,
  historyDomains,
  historyPrompts,
  examDomains,
  baselineDomains,
  eligibilityOptions,
  certificateText,
  type Encounter,
  type Consent,
} from "./store";
import {
  PageHeading,
  Panel,
  Field,
  Notes,
  Choice,
  Check,
  Empty,
  Status,
  Go,
  DataList,
  Export,
} from "./ui";
export function ConsentScreen({
  role,
  athleteId,
}: {
  role: Role;
  athleteId?: string;
}) {
  const { state } = useWorkspace();
  const athletes = visibleAthletes(state, role);
  const [selected, setSelected] = useState(athleteId || athletes[0]?.id || "");
  return (
    <div className="space-y-6">
      <PageHeading
        title="Consent & privacy"
        description="Clinical care, movement video and optional research are separate choices. Declining research does not affect access to care."
      />
      {!athleteId && (
        <Choice
          label="Athlete"
          value={selected}
          onChange={setSelected}
          options={athletes.map((a) => ({ value: a.id, label: fullName(a) }))}
        />
      )}
      {athletes.some((a) => a.id === selected) ? (
        <ConsentForm key={selected} role={role} athleteId={selected} />
      ) : (
        <Empty title="No eligible linked athlete" />
      )}
    </div>
  );
}
function ConsentForm({ role, athleteId }: { role: Role; athleteId: string }) {
  const { state, update } = useWorkspace();
  const a = state.athletes.find((x) => x.id === athleteId)!;
  const [form, setForm] = useState<Consent>(
    state.consents[athleteId] ?? {
      clinical: "deferred",
      video: false,
      research: false,
      assent: false,
      signer: "",
      at: "",
      version: "PPE privacy v1.0",
    },
  );
  const [confirm, setConfirm] = useState(false);
  const editable = personal(role) || role === "clinician";
  function save() {
    if (!form.signer.trim()) {
      toast.error("Record the consent provider’s name.");
      return;
    }
    update(
      (s) => ({
        ...s,
        encounters: s.encounters.map((e) =>
          e.athleteId === athleteId && !e.finalized
            ? {
                ...e,
                status:
                  form.clinical === "obtained" ? "in_progress" : "blocked",
              }
            : e,
        ),
        consents: {
          ...s.consents,
          [athleteId]: { ...form, at: new Date().toISOString() },
        },
      }),
      `Consent updated for ${athleteId}`,
      role,
      "consent",
      [role, "clinician"],
    );
    toast.success("Consent saved in this demo");
    setConfirm(false);
  }
  return (
    <Panel
      title={fullName(a)}
      description={`${a.id} • ${a.age < 18 ? "Guardian consent and athlete assent required" : "Adult athlete consent"} • ${form.version}`}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (form.clinical === "obtained" && a.age < 18 && !form.assent) {
            toast.error("Record the minor’s assent before obtaining consent.");
            return;
          }
          if (form.clinical === "withdrawn") setConfirm(true);
          else save();
        }}
        className="space-y-5"
      >
        <div className="rounded-xl bg-muted p-4 text-sm leading-6">
          <ShieldCheck className="mb-2 size-5" />
          The PPE includes a health questionnaire, examination and an athlete
          health record. The care team uses this information to support safe
          participation. Coaches receive participation status and practical
          restrictions only. Sensitive history stays with the clinician.
        </div>
        <Choice
          label="Clinical consent"
          value={form.clinical}
          onChange={(v) => setForm({ ...form, clinical: v })}
          options={["obtained", "declined", "deferred", "withdrawn"]}
          disabled={!editable}
        />
        <Check
          label="I separately consent to movement-screening video for care."
          checked={form.video}
          onChange={(v) => setForm({ ...form, video: v })}
          disabled={!editable}
        />
        <Check
          label="Optional: I consent to research / AI improvement use."
          checked={form.research}
          onChange={(v) => setForm({ ...form, research: v })}
          disabled={!editable}
        />
        {a.age < 18 && (
          <Check
            label="The athlete has received an age-appropriate explanation and provides assent."
            checked={form.assent}
            onChange={(v) => setForm({ ...form, assent: v })}
            disabled={!editable}
          />
        )}
        <Field
          label={
            a.age < 18
              ? "Parent / guardian full name"
              : "Consent provider full name"
          }
          value={form.signer}
          onChange={(v) => setForm({ ...form, signer: v })}
          required
          disabled={!editable}
        />
        <p className="text-sm text-muted-foreground">
          Withdrawing consent blocks further protected assessment and new video
          capture in this demo. Existing records remain visible for care
          continuity. Last recorded: {form.at?.slice(0, 10) || "Not recorded"}.
        </p>
        {editable && <Button type="submit">Save consent</Button>}
      </form>
      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw clinical consent?</DialogTitle>
            <DialogDescription>
              Further clinical assessment will be blocked. This changes the
              local demo record.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={save}>
              Confirm withdrawal
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Panel>
  );
}
export function Questionnaire({
  role,
  athleteId,
}: {
  role: Role;
  athleteId?: string;
}) {
  const { state } = useWorkspace();
  const athletes = visibleAthletes(state, role);
  const [selected, setSelected] = useState(athleteId || athletes[0]?.id || "");
  return (
    <div className="space-y-6">
      <PageHeading
        title="Pre-PPE health questionnaire"
        description="Answer yes, no or unknown. A positive answer requests clinician review; it does not establish a diagnosis. Sensitive concerns can be discussed privately."
      />
      {!athleteId && (
        <Choice
          label="Athlete"
          value={selected}
          onChange={setSelected}
          options={athletes.map((a) => ({ value: a.id, label: fullName(a) }))}
        />
      )}
      {selected && (
        <QuestionnaireForm key={selected} role={role} athleteId={selected} />
      )}
    </div>
  );
}
function QuestionnaireForm({
  role,
  athleteId,
}: {
  role: Role;
  athleteId: string;
}) {
  const { state, update } = useWorkspace();
  const existing = state.encounters.find(
    (e) => e.athleteId === athleteId && !e.finalized,
  );
  const [form, setForm] = useState<Encounter>(() => {
    const initial = existing ?? emptyEncounter("draft", athleteId);
    return role === "guardian"
      ? {
          ...initial,
          history: {
            ...initial.history,
            "Mental health": "private",
            "Female athlete health": "private",
          },
        }
      : initial;
  });
  const count = historyDomains.filter((d) => form.history[d]).length;
  const consent = state.consents[athleteId]?.clinical === "obtained";
  return (
    <Panel
      title="Health history"
      description="All domains require a response. Private answers are reviewed directly with a clinician."
    >
      <Progress value={(count / historyDomains.length) * 100} />
      <p className="text-sm text-muted-foreground">
        {count} of {historyDomains.length} domains answered
      </p>
      {!consent && (
        <p role="status" className="rounded-lg bg-muted p-3">
          Complete clinical consent before submitting this questionnaire.{" "}
          <Go to={href(role, "consent")} secondary>
            Review consent
          </Go>
        </p>
      )}
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!consent) return;
          if (count < historyDomains.length) {
            toast.error(
              "Please answer every history domain, including unknown where appropriate.",
            );
            return;
          }
          const saved = {
            ...form,
            id: form.id === "draft" ? newId("ppe") : form.id,
            status: "needs_review",
            reviewed: false,
          };
          update(
            (s) => ({
              ...s,
              encounters: [
                saved,
                ...s.encounters.filter((e) => e.id !== saved.id),
              ],
            }),
            `Health questionnaire submitted for ${athleteId}`,
            role,
            "questionnaires",
            [role, "clinician"],
          );
          setForm(saved);
          toast.success("Questionnaire submitted for clinician review");
        }}
      >
        {historyDomains.map((d) => (
          <div key={d} className="space-y-3 rounded-xl border p-4">
            <p className="text-sm leading-6 text-muted-foreground">
              {historyPrompts[d]}
            </p>
            <Choice
              label={d}
              disabled={
                role === "guardian" &&
                ["Mental health", "Female athlete health"].includes(d)
              }
              value={
                role === "guardian" &&
                ["Mental health", "Female athlete health"].includes(d)
                  ? "private"
                  : form.history[d] || ""
              }
              onChange={(v) =>
                setForm({ ...form, history: { ...form.history, [d]: v } })
              }
              options={[
                "yes",
                "no",
                "unknown",
                ...(["Mental health", "Female athlete health"].includes(d)
                  ? [
                      {
                        value: "private",
                        label: "Discuss privately with clinician",
                      },
                    ]
                  : []),
              ]}
            />
            {form.history[d] === "yes" &&
              !(
                role === "guardian" &&
                ["Mental health", "Female athlete health"].includes(d)
              ) && (
                <Notes
                  label={`${d}: symptoms, timing, treatment and current limitations`}
                  value={form.followups[d] || ""}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      followups: { ...form.followups, [d]: v },
                    })
                  }
                  required
                />
              )}
            {form.history[d] === "private" && (
              <p className="text-sm text-muted-foreground">
                A confidential review is requested. No sensitive details are
                needed here.
              </p>
            )}
          </div>
        ))}
        <div className="flex gap-2">
          <Button type="submit" disabled={!consent}>
            Submit for review
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const saved = {
                ...form,
                id: form.id === "draft" ? newId("ppe") : form.id,
              };
              update(
                (s) => ({
                  ...s,
                  encounters: [
                    saved,
                    ...s.encounters.filter((e) => e.id !== saved.id),
                  ],
                }),
                `Questionnaire draft saved for ${athleteId}`,
                role,
                "questionnaires",
              );
              setForm(saved);
              toast.success("Draft saved in this tab");
            }}
          >
            Save draft
          </Button>
        </div>
      </form>
    </Panel>
  );
}
export function assessmentBlocks(e: Encounter, consent?: Consent) {
  const errors: string[] = [];
  if (consent?.clinical !== "obtained")
    errors.push("Clinical consent is required.");
  if (historyDomains.some((d) => !e.history[d]))
    errors.push("Complete every history domain.");
  if (!e.reviewed)
    errors.push("A clinician must resolve and review history flags.");
  if (
    historyDomains.some(
      (d) =>
        ["yes", "unknown", "private"].includes(e.history[d]) &&
        !e.followups[d]?.trim(),
    )
  )
    errors.push(
      "Document follow-up for positive, unknown and confidential answers.",
    );
  if (examDomains.some((d) => !e.exam[d] || e.exam[d] === "not_assessed"))
    errors.push("Complete the examination; missing findings are not normal.");
  if (
    baselineDomains.some(
      (d) => !e.baseline[d] || e.baseline[d] === "not_assessed",
    )
  )
    errors.push("Complete the musculoskeletal baseline.");
  if (
    [...examDomains].some(
      (d) =>
        ["abnormal", "not_applicable"].includes(e.exam[d]) &&
        !e.examNotes[d]?.trim(),
    ) ||
    baselineDomains.some(
      (d) =>
        ["abnormal", "not_applicable"].includes(e.baseline[d]) &&
        !e.baselineNotes[d]?.trim(),
    )
  )
    errors.push(
      "Document abnormal findings and reasons for non-applicable findings.",
    );
  if (
    ["Systolic BP", "Diastolic BP", "Pulse"].some(
      (d) =>
        !e.vitals[d] ||
        !Number.isFinite(Number(e.vitals[d])) ||
        Number(e.vitals[d]) <= 0,
    )
  )
    errors.push("Record valid blood pressure and pulse measurements.");
  if (!e.sportNotes.trim()) errors.push("Complete the sport-specific review.");
  if (!e.reviewDate || e.reviewDate < today)
    errors.push("Set a current or future review date.");
  if (e.decision !== "cleared" && !e.plan.trim())
    errors.push("Document monitoring, required evaluation or follow-up.");
  if (
    [
      "sport_specific_restriction",
      "temporarily_not_cleared",
      "not_cleared",
    ].includes(e.decision) &&
    !e.restrictions.trim()
  )
    errors.push("Describe allowed and restricted activities.");
  if (!e.rationale.trim() || !e.signature.trim())
    errors.push("Clinical rationale and clinician signature are required.");
  return errors;
}
export function Assessments({ role, id }: { role: Role; id?: string }) {
  const { state, update } = useWorkspace();
  const router = useRouter();
  const athletes = visibleAthletes(state, role);
  const [open, setOpen] = useState(id === "new");
  const [selected, setSelected] = useState(athletes[0]?.id || "");
  const records = state.encounters.filter((e) =>
    athletes.some((a) => a.id === e.athleteId),
  );
  if (id && id !== "new") {
    const record = records.find((e) => e.id === id);
    if (!record)
      return (
        <Empty
          title="Assessment unavailable"
          description="This assessment is not in your permitted demo records."
        >
          <Go to={href(role, "assessments")}>Back to assessments</Go>
        </Empty>
      );
    return role === "clinician" ? (
      <AssessmentEditor key={id} initial={record} />
    ) : (
      <Panel
        title="Assessment progress"
        description={`${fullName(athletes.find((a) => a.id === record.athleteId))} • ${record.date}`}
      >
        <Status value={record.status} />
        <p>
          {record.finalized
            ? "The clinician has finalized this assessment. Your participation summary is available."
            : "Your care team is completing this assessment. Clinical findings remain in the clinical workspace."}
        </p>
        <Go to={href(role, "eligibility")}>Participation status</Go>
      </Panel>
    );
  }
  return (
    <>
      <PageHeading
        title="PPE assessments"
        description="Track consent, history, examination and the clinician’s participation decision."
      >
        {role === "clinician" && (
          <Button onClick={() => setOpen(true)}>Start assessment</Button>
        )}
      </PageHeading>
      <Panel title="Assessment register">
        <DataList
          label="assessments"
          rows={records.map((e) => ({
            id: e.id,
            name: fullName(athletes.find((a) => a.id === e.athleteId)),
            status: e.status,
            date: e.date,
            detail: e.finalized
              ? "Finalized by clinician"
              : "Clinical review pending",
            to: href(role, `assessments/${e.id}`),
          }))}
        />
      </Panel>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start PPE assessment</DialogTitle>
            <DialogDescription>
              Create a local encounter linked to the athlete’s longitudinal
              record.
            </DialogDescription>
          </DialogHeader>
          <Choice
            label="Athlete"
            value={selected}
            onChange={setSelected}
            options={athletes.map((a) => ({ value: a.id, label: fullName(a) }))}
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!selected}
              onClick={() => {
                const active = state.encounters.find(
                  (e) => e.athleteId === selected && !e.finalized,
                );
                const e = active ?? emptyEncounter(newId("ppe"), selected);
                if (!active)
                  update(
                    (s) => ({ ...s, encounters: [e, ...s.encounters] }),
                    `Assessment started for ${selected}`,
                    role,
                    `assessments/${e.id}`,
                  );
                setOpen(false);
                router.push(href(role, `assessments/${e.id}`));
              }}
            >
              Open assessment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
function AssessmentEditor({ initial }: { initial: Encounter }) {
  const { state, update } = useWorkspace();
  const [form, setForm] = useState(initial);
  const [step, setStep] = useState(0);
  const [confirm, setConfirm] = useState(false);
  const athlete = state.athletes.find((a) => a.id === form.athleteId)!;
  const consent = state.consents[athlete.id];
  const blocks = assessmentBlocks(form, consent);
  const stages = [
    "Consent",
    "History",
    "Vitals",
    "Examination",
    "MSK baseline",
    "Sport review",
    "Eligibility",
  ];
  const patch = (v: Partial<Encounter>) => setForm({ ...form, ...v });
  const save = (finalized = false) => {
    const saved = {
      ...form,
      finalized,
      status: finalized ? "complete" : "in_progress",
    };
    update(
      (s) => ({
        ...s,
        encounters: s.encounters.map((e) => (e.id === saved.id ? saved : e)),
        records:
          finalized && saved.decision !== "cleared"
            ? {
                ...s.records,
                tasks: [
                  {
                    id: `followup-${saved.id}`,
                    athleteId: saved.athleteId,
                    title: "Participation follow-up required",
                    status: "pending",
                    date: saved.reviewDate,
                    notes:
                      "Coordinate the clinician-requested review. Clinical details remain in the authorized assessment.",
                    assigned: "Faith Akinyi",
                    kind: "follow_up",
                  },
                  ...s.records.tasks.filter(
                    (t) => t.id !== `followup-${saved.id}`,
                  ),
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
                      saved.decision === "cleared"
                        ? "ready"
                        : saved.decision === "cleared_with_monitoring" ||
                            saved.decision === "sport_specific_restriction"
                          ? "ready_with_restrictions"
                          : saved.decision === "pending_evaluation"
                            ? "under_review"
                            : "not_ready",
                  }
                : a,
            )
          : s.athletes,
      }),
      finalized
        ? `Eligibility finalized for ${athlete.id}`
        : `Assessment draft saved for ${athlete.id}`,
      "clinician",
      `assessments/${form.id}`,
      finalized
        ? [
            "clinician",
            ...(athlete.id === state.athleteId ? ["athlete" as Role] : []),
            ...(athlete.id === state.guardianId ? ["guardian" as Role] : []),
          ]
        : ["clinician"],
    );
    setForm(saved);
    setConfirm(false);
    toast.success(
      finalized
        ? "Clinical decision finalized in demo"
        : "Assessment draft saved",
    );
  };
  if (form.finalized)
    return (
      <>
        <PageHeading
          title="Assessment finalized"
          description={`${fullName(athlete)} • ${form.id} • ${form.date}`}
        >
          <Go to={href("clinician", "assessments")}>All assessments</Go>
        </PageHeading>
        <Panel title="Clinician decision">
          <Status value={form.decision} />
          <p>{form.restrictions || "No activity restrictions recorded."}</p>
          <p>{form.plan}</p>
          <p className="text-sm text-muted-foreground">
            Signed by {form.signature} · Review {form.reviewDate}
          </p>
          <Export
            name={`${form.id}-certificate.txt`}
            content={certificateText(athlete, form)}
          />
          <Go to={href("clinician", `athletes/${athlete.id}`)} secondary>
            Athlete record
          </Go>
        </Panel>
      </>
    );
  return (
    <>
      <PageHeading
        title={`PPE · ${fullName(athlete)}`}
        description={`${form.id} • ${athlete.currentSport?.name} • ${form.date}`}
      >
        <Button variant="outline" onClick={() => save()}>
          Save draft
        </Button>
        <Go to={href("clinician", `athletes/${athlete.id}`)} secondary>
          Close assessment
        </Go>
      </PageHeading>
      <div className="flex flex-wrap gap-2" aria-label="Assessment steps">
        {stages.map((s, i) => (
          <Button
            key={s}
            variant={step === i ? "default" : "outline"}
            onClick={() => setStep(i)}
            aria-current={step === i ? "step" : undefined}
          >
            {i + 1}. {s}
          </Button>
        ))}
      </div>
      <Progress value={((step + 1) / stages.length) * 100} />
      {step === 0 ? (
        <ConsentForm role="clinician" athleteId={athlete.id} />
      ) : consent?.clinical !== "obtained" ? (
        <Empty
          title="Clinical consent required"
          description="This encounter is blocked until consent and any required minor assent are recorded."
        >
          <Button onClick={() => setStep(0)}>Review consent</Button>
        </Empty>
      ) : (
        <Panel
          title={stages[step]}
          description="Save your work before leaving the assessment."
        >
          {step === 1 && (
            <>
              <p className="rounded-lg bg-muted p-3 text-sm">
                Positive, unknown and private responses require a documented
                clinician follow-up. Confidential notes are excluded from
                operational and guardian views.
              </p>
              {historyDomains.map((d) => (
                <div key={d} className="space-y-3 border-b pb-4">
                  <Choice
                    label={d}
                    value={form.history[d] || ""}
                    onChange={(v) =>
                      patch({
                        history: { ...form.history, [d]: v },
                        reviewed: false,
                      })
                    }
                    options={["yes", "no", "unknown", "private"]}
                  />
                  {["yes", "unknown", "private"].includes(form.history[d]) && (
                    <Notes
                      label={`${d}: clinician follow-up and resolution`}
                      value={form.followups[d] || ""}
                      onChange={(v) =>
                        patch({
                          followups: { ...form.followups, [d]: v },
                          reviewed: false,
                        })
                      }
                    />
                  )}
                </div>
              ))}
              <Check
                label="I have reviewed all history responses and resolved the flags with a documented plan."
                checked={form.reviewed}
                onChange={(v) => patch({ reviewed: v })}
              />
            </>
          )}
          {step === 2 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  "Systolic BP",
                  "Diastolic BP",
                  "Pulse",
                  "Respiratory rate",
                  "SpO2",
                  "Temperature",
                  "Height cm",
                  "Weight kg",
                ].map((v) => (
                  <Field
                    key={v}
                    label={`${v}${v.includes("BP") ? " (mmHg)" : v === "Pulse" ? " (beats/min)" : ""}`}
                    type="number"
                    min="0"
                    max={v === "SpO2" ? 100 : 500}
                    value={form.vitals[v] || ""}
                    onChange={(n) =>
                      patch({ vitals: { ...form.vitals, [v]: n } })
                    }
                    required={["Systolic BP", "Diastolic BP", "Pulse"].includes(
                      v,
                    )}
                  />
                ))}
              </div>
              <Notes
                label="Measurement context / recheck notes"
                value={form.vitals.notes || ""}
                onChange={(v) =>
                  patch({ vitals: { ...form.vitals, notes: v } })
                }
              />
              <p className="text-sm text-muted-foreground">
                Interpret measurements in the athlete’s age and clinical
                context. Unusual readings require recheck; they do not
                automatically determine eligibility.
              </p>
            </>
          )}
          {(step === 3 || step === 4) && (
            <>
              {(step === 3 ? examDomains : baselineDomains).map((d) => {
                const values = step === 3 ? form.exam : form.baseline;
                const notes = step === 3 ? form.examNotes : form.baselineNotes;
                return (
                  <div className="space-y-3 rounded-xl border p-4" key={d}>
                    <Choice
                      label={d}
                      value={values[d] || "not_assessed"}
                      onChange={(v) =>
                        patch(
                          step === 3
                            ? { exam: { ...values, [d]: v } }
                            : { baseline: { ...values, [d]: v } },
                        )
                      }
                      options={[
                        "normal",
                        "abnormal",
                        "not_assessed",
                        "not_applicable",
                      ]}
                    />
                    <Notes
                      label={`${d}: ${step === 4 ? "range of motion, pain, strength, stability and function" : "findings and context"}`}
                      value={notes[d] || ""}
                      onChange={(v) =>
                        patch(
                          step === 3
                            ? { examNotes: { ...notes, [d]: v } }
                            : { baselineNotes: { ...notes, [d]: v } },
                        )
                      }
                    />
                  </div>
                );
              })}
            </>
          )}
          {step === 5 && (
            <>
              <p>
                {athlete.currentSport?.name === "Rugby"
                  ? "Review concussion, cervical spine, shoulder, knee and trauma history."
                  : "Review knee / ankle, concussion, hamstring, landing and cutting demands and injury history."}
              </p>
              <Notes
                label="Sport-specific review"
                value={form.sportNotes}
                onChange={(v) => patch({ sportNotes: v })}
              />
              <Go to={href("clinician", "screenings")} secondary>
                Optional movement screening
              </Go>
              <p className="text-sm text-muted-foreground">
                Movement screening is optional. AI is a movement-risk signal and
                cannot determine medical clearance.
              </p>
            </>
          )}
          {step === 6 && (
            <>
              <Choice
                label="Clinician eligibility decision"
                value={form.decision}
                onChange={(v) =>
                  patch({ decision: v as Encounter["decision"] })
                }
                options={eligibilityOptions.map((v) => ({
                  value: v,
                  label:
                    v === "pending_evaluation"
                      ? "Cleared pending further evaluation"
                      : human(v),
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
              <p className="text-sm text-muted-foreground">
                Only the treating clinician finalizes eligibility. Outstanding
                referrals remain visible and require closed-loop follow-up.
              </p>
              {blocks.length > 0 ? (
                <div
                  className="rounded-xl border border-destructive/30 bg-destructive/5 p-4"
                  role="status"
                >
                  <p className="mb-2 flex items-center gap-2 font-medium">
                    <AlertCircle className="size-4" />
                    Before finalization
                  </p>
                  <ul className="list-disc space-y-1 pl-5 text-sm">
                    {blocks.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="flex gap-2 text-sm">
                  <ClipboardCheck className="size-4" />
                  All required stages are documented.
                </p>
              )}
              <Button
                disabled={blocks.length > 0}
                onClick={() => setConfirm(true)}
              >
                Finalize clinician decision
              </Button>
            </>
          )}
        </Panel>
      )}
      <div className="flex justify-between">
        <Button
          variant="outline"
          disabled={step === 0}
          onClick={() => setStep(step - 1)}
        >
          Previous step
        </Button>
        <Button disabled={step === 6} onClick={() => setStep(step + 1)}>
          Next step
        </Button>
      </div>
      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalize participation decision?</DialogTitle>
            <DialogDescription>
              The demo certificate and participation views will use this signed
              decision. Start a new assessment for a later clinical decision.
            </DialogDescription>
          </DialogHeader>
          <Status value={form.decision} />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setConfirm(false)}>
              Cancel
            </Button>
            <Button onClick={() => save(true)}>Confirm finalization</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
export function Eligibility({
  role,
  certificates = false,
}: {
  role: Role;
  certificates?: boolean;
}) {
  const { state } = useWorkspace();
  const athletes = visibleAthletes(state, role);
  const records = state.encounters.filter(
    (e) => e.finalized && athletes.some((a) => a.id === e.athleteId),
  );
  return (
    <>
      <PageHeading
        title={
          certificates
            ? "Participation certificates"
            : "Eligibility & participation"
        }
        description="Participation status is a clinician decision. Certificates contain only the minimum information needed for sport participation."
      />
      {certificates ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {records.map((e) => {
            const a = athletes.find((a) => a.id === e.athleteId)!;
            return (
              <Panel
                key={e.id}
                title={fullName(a)}
                description={`${a.id} • ${a.currentOrganization?.name} • ${a.currentSport?.name}`}
              >
                <BadgeDemo />
                <Status value={e.decision} />
                <p className="text-sm">
                  {e.restrictions || "No restrictions recorded"}
                </p>
                <p className="text-sm">
                  Monitoring: {e.plan || "None specified"}
                </p>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  <dt>Assessment</dt>
                  <dd>{e.date}</dd>
                  <dt>Review date</dt>
                  <dd>{e.reviewDate}</dd>
                  <dt>Clinician</dt>
                  <dd>{e.signature}</dd>
                  <dt>Verification</dt>
                  <dd>DEMO-{e.id}</dd>
                </dl>
                <Export
                  name={`${a.id}-certificate.txt`}
                  content={certificateText(a, e)}
                />
              </Panel>
            );
          })}
          {records.length === 0 && (
            <Empty
              title="No finalized certificate"
              description="A certificate becomes available after a clinician completes and signs the assessment."
            />
          )}
        </div>
      ) : (
        <Panel title="Current participation status">
          <DataList
            label="athletes"
            rows={athletes.map((a) => {
              const e = records.find((e) => e.athleteId === a.id);
              return {
                id: a.id,
                name: fullName(a),
                status: a.eligibilityStatus,
                date: e?.reviewDate || a.nextReview,
                detail:
                  e?.restrictions ||
                  (a.eligibilityStatus === "cleared"
                    ? "No current restrictions recorded"
                    : "Care team review required; follow the published participation status."),
                to:
                  role === "clinician"
                    ? href(role, `athletes/${a.id}`)
                    : undefined,
              };
            })}
          />
          {role === "clinician" && (
            <Go to={href(role, "assessments")}>Open clinical assessments</Go>
          )}
        </Panel>
      )}
    </>
  );
}
function BadgeDemo() {
  return (
    <p className="rounded-lg bg-muted px-3 py-2 text-xs font-medium">
      DEMO — Not a valid medical certificate
    </p>
  );
}
