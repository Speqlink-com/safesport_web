"use client";
import { useEffect, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Plus, CalendarDays, Video, Bold, Italic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  type Role,
  clinical,
  personal,
  href,
  human,
  identities,
} from "./catalog";
import {
  useWorkspace,
  visibleAthletes,
  fullName,
  newId,
  today,
  type RecordItem,
  type Collection,
  type State,
} from "./store";
import {
  PageHeading,
  Panel,
  Empty,
  Status,
  Go,
  Field,
  Notes,
  Choice,
  DataList,
  Tabbed,
  Export,
} from "./ui";
import { Distribution } from "./distribution";
import { careApi, reportsApi, movementApi, AuthApiError, type ReportAthlete, type TermReportSummary, type MovementScreeningItem } from "@/features/auth/api";
import { useAuthStore } from "@/features/auth/store";
const names: Record<Collection, string> = {
  referrals: "Referrals",
  screenings: "Movement screening",
  incidents: "Incidents",
  plans: "Rehabilitation plans",
  sessions: "Rehabilitation sessions",
  reviews: "Progress reviews",
  events: "Schedule",
  tasks: "Tasks",
  documents: "Documents",
  users: "Users",
  configs: "Configuration",
};
const statusOptions: Partial<Record<Collection, string[]>> = {
  referrals: ["pending", "assigned", "in_progress", "overdue", "completed"],
  incidents: ["reported", "under_review", "follow_up", "closed"],
  plans: ["draft", "active", "paused", "completed"],
  sessions: ["scheduled", "completed", "cancelled"],
  reviews: ["pending", "completed", "reassessment_requested"],
  events: ["scheduled", "in_progress", "completed", "cancelled"],
  tasks: ["pending", "in_progress", "completed"],
  documents: ["available", "returned"],
};
const demoAssigneePattern = /dr\.?\s*sarah|sarah\s+njer|sarah\s+ndungu|dr\.?\s*njeri|dr\.?\s*ndungu/i;
const safeAssignee = (name?: string) => {
  if (!name) return "";
  return demoAssigneePattern.test(name) ? "Care team" : name;
};
const userDisplayName = (user?: { first_name?: string; last_name?: string } | null) =>
  [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim();

const typeOptions: Partial<Record<Collection, string[]>> = {
  referrals: [
    "sports_physician",
    "physiotherapy",
    "orthopaedics",
    "cardiology",
    "neurology",
    "respiratory",
    "mental_health",
    "nutrition",
    "ophthalmology",
    "other",
  ],
  events: [
    "ppe",
    "screening",
    "reassessment",
    "referral",
    "team_event",
    "clinic",
    "coverage",
  ],
  incidents: [
    "acute_injury",
    "concussion",
    "sprain_strain",
    "fracture",
    "overuse",
    "medical_emergency",
    "other",
  ],
  plans: ["rehabilitation"],
  sessions: ["supervised", "home_program", "reassessment"],
  reviews: ["progress_review", "reassessment"],
  tasks: ["consent", "participation", "follow_up", "administration"],
};
export function scopedRecords(
  state: State,
  role: Role,
  collection: Collection,
) {
  const ids = new Set(visibleAthletes(state, role).map((a) => a.id));
  return state.records[collection]
    .filter((r) => !r.athleteId || ids.has(r.athleteId))
    .filter(
      (r) =>
        role !== "coach" ||
        !["tasks", "incidents"].includes(collection) ||
        r.assigned === identities.coach.name,
    )
    .filter(
      (r) =>
        role !== "guardian" ||
        collection !== "referrals" ||
        r.kind !== "mental_health",
    )
    .filter(
      (r) =>
        role !== "physiotherapist" ||
        !["referrals", "plans", "sessions", "reviews", "screenings"].includes(
          collection,
        ) ||
        r.assigned === identities.physiotherapist.name ||
        (collection === "referrals" &&
          r.kind === "physiotherapy" &&
          !r.assigned),
    );
}
export function Records({
  role,
  collection,
  id,
  view,
  embedded = false,
  athleteId,
  introduction,
}: {
  role: Role;
  collection: Collection;
  id?: string;
  view?: string;
  embedded?: boolean;
  athleteId?: string;
  introduction?: ReactNode;
}) {
  const { state } = useWorkspace();
  const [editing, setEditing] = useState<RecordItem | null>(null);
  const [creating, setCreating] = useState(id === "new");
  const operational = role === "operations" || role === "institution";
  const canCreate =
    collection === "documents"
      ? personal(role) || clinical(role)
      : collection === "referrals"
        ? clinical(role)
        : collection === "plans" ||
            collection === "sessions" ||
            collection === "reviews"
          ? clinical(role)
          : collection === "incidents"
            ? clinical(role) || role === "coach"
            : collection === "events"
              ? clinical(role) || operational || role === "coach"
              : collection === "tasks"
                ? !personal(role)
                : false;
  const canEdit =
    collection === "referrals" ? clinical(role) || operational : canCreate;
  let records = scopedRecords(state, role, collection).filter(
    (r) => !athleteId || r.athleteId === athleteId,
  );
  if (view === "completed")
    records = records.filter((r) => r.status === "completed");
  if (view === "pending" || view === "incoming")
    records = records.filter((r) => ["pending", "assigned"].includes(r.status));
  if (view === "overdue")
    records = records.filter((r) => r.status !== "completed" && r.date < today);
  if (view === "mine")
    records = records.filter((r) => r.assigned === identities[role].name);
  if (view === "events")
    records = records.filter((r) => r.kind === "team_event");
  if (view === "coverage")
    records = records.filter((r) => r.kind === "coverage");
  if (view === "screening")
    records = records.filter((r) => r.kind === "screening");
  if (view === "clinics") records = records.filter((r) => r.kind === "clinic");
  const detail =
    id && id !== "new"
      ? scopedRecords(state, role, collection).find((r) => r.id === id)
      : undefined;
  const path =
    collection === "plans" ||
    collection === "sessions" ||
    collection === "reviews"
      ? "rehabilitation"
      : collection === "events"
        ? "schedule"
        : collection;
  if (id && id !== "new" && !detail)
    return (
      <Empty
        title="Record unavailable"
        description="The record is not available in this role’s workspace."
      >
        <Go to={href(role, path)}>Back to {names[collection].toLowerCase()}</Go>
      </Empty>
    );
  const close = () => {
    setCreating(false);
    setEditing(null);
  };
  return (
    <div className="space-y-6">
      {!embedded && (
        <PageHeading
          title={
            detail
              ? operational && collection === "referrals"
                ? "Referral coordination"
                : detail.title
              : names[collection]
          }
          description={
            collection === "referrals"
              ? "Track assignment, appointments and a documented outcome. Completion requires closed-loop follow-up."
              : collection === "incidents"
                ? "Record an incident and coordinate follow-up. Emergency care must not wait for this form."
                : "Coordinate the next step in the athlete’s care."
          }
        >
          {detail ? (
            <Go to={href(role, path)} secondary>
              Back to list
            </Go>
          ) : (
            canCreate && (
              <Button onClick={() => setCreating(true)}>
                <Plus />
                Create{" "}
                {collection === "events"
                  ? "appointment"
                  : collection === "plans"
                    ? "plan"
                    : collection === "reviews"
                      ? "review"
                      : collection === "sessions"
                        ? "session"
                        : collection === "documents"
                          ? "document"
                          : collection.slice(0, -1)}
              </Button>
            )
          )}
        </PageHeading>
      )}
      {introduction}
      {embedded && canCreate && (
        <Button onClick={() => setCreating(true)}>
          <Plus />
          Add {names[collection].toLowerCase()}
        </Button>
      )}
      {detail ? (
        <>
          <Panel title="Record details" description={detail.id}>
            <div className="flex flex-wrap gap-2">
              <Status value={detail.status} />
              {detail.urgency && <Status value={detail.urgency} />}
            </div>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Athlete</dt>
                <dd>
                  {fullName(
                    state.athletes.find((a) => a.id === detail.athleteId),
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Assigned to</dt>
                <dd>{safeAssignee(detail.assigned) || "Awaiting assignment"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Date / follow-up</dt>
                <dd>{detail.date || "Not scheduled"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Type</dt>
                <dd>
                  {operational && collection === "referrals"
                    ? "Specialist referral"
                    : human(detail.kind)}
                </dd>
              </div>
            </dl>
            {!operational && (
              <p className="whitespace-pre-wrap text-sm leading-6">
                {detail.notes || "No additional notes recorded."}
              </p>
            )}
            {operational && detail.coordination && (
              <p className="text-sm">Coordination: {detail.coordination}</p>
            )}
            {detail.outcome && (
              <p className="text-sm">
                Outcome:{" "}
                {operational ? "Outcome recorded by care team" : detail.outcome}
              </p>
            )}
            {detail.progress !== undefined && (
              <>
                <Progress value={detail.progress} />
                <p className="text-sm">Progress: {detail.progress}%</p>
              </>
            )}
            {detail.file && (
              <a
                href={detail.file}
                download={detail.fileName}
                className="text-sm underline"
              >
                Download {detail.fileName}
              </a>
            )}
            {detail.encounterId && (
              <p className="text-sm text-muted-foreground">
                Linked PPE: {detail.encounterId}
              </p>
            )}
            {detail.referralId && (
              <p className="text-sm text-muted-foreground">
                Source referral: {detail.referralId}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {canEdit && (
                <Button onClick={() => setEditing(detail)}>
                  Update {collection === "referrals" ? "referral" : "record"}
                </Button>
              )}
              {detail.athleteId && clinical(role) && (
                <Go to={href(role, `athletes/${detail.athleteId}`)} secondary>
                  Athlete record
                </Go>
              )}
              {collection === "referrals" &&
                clinical(role) &&
                detail.kind === "physiotherapy" && (
                  <Go
                    to={href(
                      role,
                      `rehabilitation?athleteId=${detail.athleteId}&referralId=${detail.id}&encounterId=${detail.encounterId || ""}`,
                    )}
                    secondary
                  >
                    Rehabilitation workspace
                  </Go>
                )}
            </div>
          </Panel>
          {collection === "referrals" && (
            <Panel title="Closed-loop follow-up">
              <ol className="grid gap-3 text-sm sm:grid-cols-4">
                {[
                  "Pending",
                  "Assigned",
                  "In progress",
                  "Completed with outcome",
                ].map((s, i) => (
                  <li key={s} className="rounded-lg bg-muted p-3">
                    <p className="text-xs text-muted-foreground">
                      Step {i + 1}
                    </p>
                    {s}
                  </li>
                ))}
              </ol>
              <p className="text-sm text-muted-foreground">
                {detail.status === "completed"
                  ? "An outcome and closure note have been recorded."
                  : "Coordinate the appointment and record the specialist outcome before closing."}
              </p>
            </Panel>
          )}
        </>
      ) : (
        <Panel title={view ? human(view) : names[collection]}>
          <DataList
            label={collection}
            rows={records.map((r) => ({
              id: r.id,
              name:
                operational && collection === "referrals"
                  ? `Referral · ${fullName(state.athletes.find((a) => a.id === r.athleteId))}`
                  : r.title,
              status: r.status,
              detail: r.athleteId
                ? `${fullName(state.athletes.find((a) => a.id === r.athleteId))} · ${safeAssignee(r.assigned) || "Unassigned"}`
                : safeAssignee(r.assigned) || "Unassigned",
              date: r.date,
              to:
                collection === "plans" ||
                collection === "sessions" ||
                collection === "reviews"
                  ? undefined
                  : href(role, `${path}/${r.id}`),
              action:
                collection === "plans" ||
                collection === "sessions" ||
                collection === "reviews" ? (
                  <Button variant="outline" onClick={() => setEditing(r)}>
                    {canEdit ? "Review / update" : "View plan"}
                  </Button>
                ) : undefined,
            }))}
          />
        </Panel>
      )}
      <Dialog
        open={creating || editing !== null}
        onOpenChange={(v) => !v && close()}
      >
        <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Update" : "Create"} {names[collection].toLowerCase()}
            </DialogTitle>
            <DialogDescription>
              Save updates to the SafeSport care record. {operational && collection === "referrals"
                ? "Clinical reason and notes are restricted to the care team."
                : ""}
            </DialogDescription>
          </DialogHeader>
          {(creating || editing) && (
            <RecordForm
              key={editing?.id || "new"}
              role={role}
              collection={collection}
              initial={editing ?? undefined}
              readOnly={!!editing && !canEdit}
              onClose={close}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
function RecordForm({
  role,
  collection,
  initial,
  onClose,
  readOnly = false,
}: {
  role: Role;
  collection: Collection;
  initial?: RecordItem;
  onClose: () => void;
  readOnly?: boolean;
}) {
  const { state, setState } = useWorkspace();
  const authUser = useAuthStore((auth) => auth.user);
  const currentUserName = userDisplayName(authUser) || identities[role].name;
  const athletes = visibleAthletes(state, role);
  const query = useSearchParams();
  const defaultAthlete =
    athletes.find((a) => a.id === query.get("athleteId"))?.id ||
    athletes[0]?.id;
  const operational =
    (role === "operations" || role === "institution") &&
    collection === "referrals";
  const [form, setForm] = useState<RecordItem>(
    initial ?? {
      id: "",
      athleteId: defaultAthlete,
      parentId: query.get("source") || undefined,
      encounterId: state.encounters.find(
        (e) =>
          e.id === query.get("encounterId") && e.athleteId === defaultAthlete,
      )?.id,
      title: "",
      status: statusOptions[collection]?.[0] || "pending",
      date: today,
      notes: "",
      assigned: currentUserName,
      kind: typeOptions[collection]?.[0] || collection,
      urgency: "routine",
      outcome: "",
      referralId: state.records.referrals.find(
        (r) =>
          r.id === query.get("referralId") && r.athleteId === defaultAthlete,
      )?.id,
      progress: 0,
    },
  );
  const [closure, setClosure] = useState("");
  const patch = (v: Partial<RecordItem>) => setForm({ ...form, ...v });
  async function save() {
    if (
      collection === "referrals" &&
      form.status === "completed" &&
      (!form.outcome?.trim() ||
        form.outcome === "pending" ||
        (initial?.status !== "completed" && !closure.trim()))
    ) {
      toast.error(
        "An outcome and closure note are required to complete a referral.",
      );
      return;
    }
    if (
      collection === "referrals" &&
      form.status === "completed" &&
      operational &&
      !initial?.outcome
    ) {
      toast.error(
        "The care team must record the clinical outcome before coordination can close.",
      );
      return;
    }
    if (
      ["assigned", "in_progress"].includes(form.status) &&
      collection === "referrals" &&
      !form.assigned.trim()
    ) {
      toast.error("Choose an assigned provider.");
      return;
    }
    if (collection === "documents" && !form.file) {
      toast.error("Choose a document to upload.");
      return;
    }
    const payload = {
      ...form,
      encounterId:
        form.encounterId ||
        state.records.plans.find(
          (p) => p.id === form.parentId && p.athleteId === form.athleteId,
        )?.encounterId,
      title: operational ? "Referral coordination" : form.title,
      notes:
        closure && !operational
          ? `${form.notes}\nClosure: ${closure}`
          : form.notes,
      coordination: operational && closure ? closure : form.coordination,
    };
    try {
      const saved = (await careApi.saveRecord(
        collection,
        payload,
        initial?.id,
      )) as RecordItem;
      setState((s) => ({
        ...s,
        records: {
          ...s.records,
          ...(["sessions", "reviews"].includes(collection) &&
          saved.parentId &&
          saved.status === "completed"
            ? {
                plans: s.records.plans.map((p) =>
                  p.id === saved.parentId
                    ? {
                        ...p,
                        progress: saved.progress ?? p.progress,
                        status:
                          saved.progress !== undefined && saved.progress >= 100
                            ? "completed"
                            : p.status,
                      }
                    : p,
                ),
              }
            : {}),
          [collection]: [
            saved,
            ...s.records[collection].filter((r) => r.id !== saved.id),
          ],
        },
        audit: [
          {
            id: newId("event"),
            title: `${names[collection]} record ${initial ? "updated" : "created"}`,
            actor: currentUserName,
            date: new Date().toISOString(),
          },
          ...s.audit,
        ],
      }));
      toast.success("Record saved");
      onClose();
    } catch (error) {
      toast.error(error instanceof AuthApiError ? error.message : "Unable to save record");
    }
  }
  if (readOnly)
    return (
      <div className="space-y-4">
        <Status value={form.status} />
        <h3 className="font-medium">{form.title}</h3>
        <p className="whitespace-pre-wrap text-sm">{form.notes}</p>
        <p className="text-sm">Next review: {form.date}</p>
        <Progress value={form.progress || 0} />
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    );
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      {!initial && (
        <Choice
          label="Athlete"
          value={form.athleteId || ""}
          onChange={(v) =>
            patch({
              athleteId: v,
              parentId: undefined,
              encounterId: undefined,
              referralId: undefined,
            })
          }
          options={athletes.map((a) => ({ value: a.id, label: fullName(a) }))}
        />
      )}
      {["referrals", "plans", "reviews"].includes(collection) &&
        !operational && (
          <Choice
            label="Linked PPE assessment"
            value={form.encounterId || "none"}
            onChange={(v) =>
              patch({ encounterId: v === "none" ? undefined : v })
            }
            options={[
              { value: "none", label: "Athlete-level care (no PPE link)" },
              ...state.encounters
                .filter((e) => e.athleteId === form.athleteId)
                .map((e) => ({ value: e.id, label: `${e.id} · ${e.date}` })),
            ]}
          />
        )}
      {collection === "plans" && (
        <Choice
          label="Source referral"
          value={form.referralId || "none"}
          onChange={(v) => {
            const referral = state.records.referrals.find((r) => r.id === v);
            patch({
              referralId: referral?.id,
              encounterId: referral?.encounterId || form.encounterId,
            });
          }}
          options={[
            { value: "none", label: "No referral link" },
            ...scopedRecords(state, role, "referrals")
              .filter((r) => r.athleteId === form.athleteId)
              .map((r) => ({ value: r.id, label: `${r.id} · ${r.title}` })),
          ]}
        />
      )}
      <Field
        label="Title"
        value={operational ? "Referral coordination" : form.title}
        onChange={(v) => patch({ title: v })}
        required
        disabled={operational}
      />
      {typeOptions[collection] && !operational && (
        <Choice
          label="Type"
          value={form.kind}
          onChange={(v) =>
            patch({
              kind: v,
              ...(collection === "referrals"
                ? {
                    title: human(v),
                    assigned:
                      v === "physiotherapy"
                        ? identities.physiotherapist.name
                        : "External specialist",
                  }
                : {}),
            })
          }
          options={typeOptions[collection]!}
        />
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Choice
          label="Status"
          value={form.status}
          onChange={(v) => patch({ status: v })}
          options={statusOptions[collection] || ["pending", "completed"]}
        />
        <Field
          label={
            collection === "events"
              ? "Date and time"
              : "Follow-up / record date"
          }
          type={collection === "events" ? "datetime-local" : "date"}
          value={form.date}
          onChange={(v) => patch({ date: v })}
          required
        />
      </div>
      {[
        "referrals",
        "events",
        "plans",
        "tasks",
        "sessions",
        "reviews",
      ].includes(collection) && (
        <Choice
          label="Assigned provider / owner"
          value={form.assigned}
          onChange={(v) => patch({ assigned: v })}
          options={[
            { value: "", label: "Unassigned" },
            ...Object.values(identities).map((u) => ({
              value: u.name,
              label: u.name,
            })),
            { value: "External specialist", label: "External specialist" },
          ]}
        />
      )}
      {collection === "referrals" && (
        <>
          <Choice
            label="Urgency"
            value={form.urgency || "routine"}
            onChange={(v) => patch({ urgency: v })}
            options={["routine", "priority", "urgent", "emergency"]}
          />
          {!operational && (
            <Choice
              label="Outcome"
              value={form.outcome || "pending"}
              onChange={(v) => patch({ outcome: v === "pending" ? "" : v })}
              options={[
                "pending",
                "completed",
                "further_referral",
                "cleared",
                "restricted",
              ]}
            />
          )}
          <Notes
            label="Closure / coordination note"
            value={closure}
            onChange={setClosure}
          />
          {operational && (
            <p className="text-sm text-muted-foreground">
              Care-team outcome:{" "}
              {initial?.outcome ? "Recorded" : "Awaiting specialist response"}
            </p>
          )}
        </>
      )}
      {!operational && (
        <Notes
          label={
            collection === "incidents"
              ? "Incident description and immediate action"
              : collection === "referrals"
                ? "Clinical reason"
                : collection === "events"
                  ? "Location and scheduling notes"
                  : "Plan / observations / instructions"
          }
          value={form.notes}
          onChange={(v) => patch({ notes: v })}
          required
        />
      )}
      {["plans", "reviews", "sessions"].includes(collection) && (
        <>
          <Field
            label="Progress (%)"
            type="number"
            min={0}
            max={100}
            value={String(form.progress ?? 0)}
            onChange={(v) => patch({ progress: Number(v) })}
          />
          <Choice
            label="Linked rehabilitation plan"
            value={form.parentId || ""}
            onChange={(v) => patch({ parentId: v })}
            options={[
              { value: "", label: "Not linked" },
              ...scopedRecords(state, role, "plans")
                .filter((p) => p.athleteId === form.athleteId)
                .map((p) => ({ value: p.id, label: p.title })),
            ]}
          />
          <p className="text-xs text-muted-foreground">
            Progress does not change medical eligibility. A clinician must
            reassess participation.
          </p>
        </>
      )}
      {collection === "documents" && (
        <div className="space-y-2">
          <Label htmlFor="document-file">
            Document (PDF or image, up to 10 MB)
          </Label>
          <Input
            id="document-file"
            type="file"
            accept="application/pdf,image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (
                file.size > 10 * 1024 * 1024 ||
                !(
                  file.type === "application/pdf" ||
                  file.type.startsWith("image/")
                )
              ) {
                toast.error("Choose a PDF or image up to 10 MB.");
                return;
              }
              patch({ file: URL.createObjectURL(file), fileName: file.name });
            }}
          />
          {form.fileName && (
            <p className="text-sm">Selected: {form.fileName}</p>
          )}
        </div>
      )}
      <div className="flex justify-end gap-2 border-t pt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Save record</Button>
      </div>
    </form>
  );
}
export function Rehabilitation({ role, view }: { role: Role; view?: string }) {
  return (
    <>
      <PageHeading
        title="Rehabilitation"
        description="Coordinate plans, sessions and progress. Reassessment returns participation decisions to the clinician."
      />
      <Tabbed
        initial={
          view === "progress"
            ? "reviews"
            : view === "reassessments"
              ? "reassessments"
              : undefined
        }
        tabs={[
          {
            id: "plans",
            label: "Active plans",
            content: <Records role={role} collection="plans" embedded />,
          },
          {
            id: "sessions",
            label: "Sessions",
            content: <Records role={role} collection="sessions" embedded />,
          },
          {
            id: "reviews",
            label: "Progress reviews",
            content: <Records role={role} collection="reviews" embedded />,
          },
          {
            id: "reassessments",
            label: "Reassessments",
            content: (
              <Panel title="Return-to-participation review">
                <p className="text-sm text-muted-foreground">
                  Completed rehabilitation is evidence for a new clinical
                  review. It does not automatically clear an athlete.
                </p>
                {clinical(role) ? (
                  <>
                    <Records role={role} collection="reviews" embedded />
                    {role === "clinician" && (
                      <Go to={href(role, "assessments")}>
                        Start clinical reassessment
                      </Go>
                    )}
                  </>
                ) : (
                  <Empty
                    title="Your care team coordinates reassessment"
                    description="Your signed participation decision will appear in your health summary."
                  />
                )}
              </Panel>
            ),
          },
        ]}
      />
    </>
  );
}
export function Screenings({
  role,
  id,
  reviewOnly = false,
}: {
  role: Role;
  id?: string;
  reviewOnly?: boolean;
}) {
  const [screenings, setScreenings] = useState<MovementScreeningItem[]>([]);
  const [open, setOpen] = useState(id === "new");
  const clinicalAccess = role === "clinician" || role === "physiotherapist" || role === "sys-admin";

  const load = () =>
    movementApi.workspace()
      .then((payload) => setScreenings(payload.screenings))
      .catch((error) => toast.error(error instanceof Error ? error.message : "Unable to load AI screenings"));

  useEffect(() => {
    void load();
  }, []);

  const visible = screenings.filter((screening) => {
    if (reviewOnly) return ["AWAITING_CLINICIAN_REVIEW", "REFERRED_TO_PHYSIO"].includes(screening.status);
    if (clinicalAccess) return true;
    return screening.status === "REPORT_READY";
  });
  const detail = id && id !== "new" ? screenings.find((screening) => screening.id === id) : undefined;

  if (id && id !== "new") {
    return detail ? (
      <MovementScreeningDetail role={role} screening={detail} onChanged={(next) => setScreenings((rows) => rows.map((item) => item.id === next.id ? next : item))} />
    ) : (
      <Empty title="Screening unavailable" description="This AI screening is outside your workspace or has not been reported yet.">
        <Go to={href(role, role === "athlete" ? "screening" : "screenings")}>Screening list</Go>
      </Empty>
    );
  }

  return (
    <>
      <PageHeading
        title={reviewOnly ? "AI review queue" : "AI movement screening"}
        description={clinicalAccess ? "Create athlete screening records, upload field videos, run decision-support analysis and publish athlete-safe reports." : "Final clinician-approved AI screening reports from SafeSport field sessions."}
      >
        {clinicalAccess && (
          <Button onClick={() => setOpen(true)}><Video /> New AI screening</Button>
        )}
      </PageHeading>
      <Panel title={reviewOnly ? "Awaiting human review" : "Screening records"}>
        <DataList
          label="AI screenings"
          rows={visible.map((screening) => ({
            id: screening.id,
            name: screening.athlete_name,
            status: screening.status,
            detail: `${screening.athlete_safesport_id} · ${screening.drill.replaceAll("_", " ")} · ${screening.institution_name || "SafeSport"}`,
            date: screening.created_at.slice(0, 10),
            to: href(role, `${role === "athlete" ? "screening" : reviewOnly ? "ai-reviews" : "screenings"}/${screening.id}`),
          }))}
        />
      </Panel>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Create AI screening record</DialogTitle>
            <DialogDescription>Search the athlete by SafeSport ID. The SafeSport field team uploads the video after capture.</DialogDescription>
          </DialogHeader>
          {open && <MovementScreeningCreateForm onCreated={(screening) => { setScreenings((rows) => [screening, ...rows]); setOpen(false); }} />}
        </DialogContent>
      </Dialog>
    </>
  );
}

function MovementScreeningCreateForm({ onCreated }: { onCreated: (screening: MovementScreeningItem) => void }) {
  const [safeSportId, setSafeSportId] = useState("");
  const [drill, setDrill] = useState("JUMP_LANDING");
  const [cameraView, setCameraView] = useState("FRONTAL");
  const [saving, setSaving] = useState(false);
  return (
    <form className="space-y-4" onSubmit={async (event) => {
      event.preventDefault();
      setSaving(true);
      try {
        const screening = await movementApi.createScreening({ athlete_safesport_id: safeSportId.trim().toUpperCase(), drill, camera_view: cameraView });
        toast.success("AI screening record created");
        onCreated(screening);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to create screening");
      } finally {
        setSaving(false);
      }
    }}>
      <Field label="Athlete SafeSport ID" value={safeSportId} onChange={(value) => setSafeSportId(value.toUpperCase())} required />
      <div className="grid gap-3 sm:grid-cols-2">
        <Choice label="Drill" value={drill} onChange={setDrill} options={["JUMP_LANDING", "SINGLE_LEG_SQUAT", "SPRINT_ACCELERATION", "CUTTING", "KICKING"]} />
        <Choice label="Camera view" value={cameraView} onChange={setCameraView} options={["FRONTAL", "SAGITTAL", "REAR", "MULTI_VIEW"]} />
      </div>
      <Button type="submit" disabled={saving}>{saving ? "Creating…" : "Create screening"}</Button>
    </form>
  );
}

function MovementScreeningDetail({ role, screening, onChanged }: { role: Role; screening: MovementScreeningItem; onChanged: (screening: MovementScreeningItem) => void }) {
  const clinicalAccess = role === "clinician" || role === "physiotherapist" || role === "sys-admin";
  const canClinicianReview = role === "clinician" || role === "sys-admin";
  const canPhysioReview = role === "physiotherapist" || role === "clinician" || role === "sys-admin";
  const [video, setVideo] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [interpretation, setInterpretation] = useState("AI output reviewed. Prepare prevention-focused feedback based on observed movement control.");
  const [decision, setDecision] = useState("ACCEPT");
  const [report, setReport] = useState(screening.report_summary || "Compact coach- and athlete-safe movement screening summary. Include what was screened, observed movement risk signal, prevention focus and next steps.");
  const ai = screening.ai_result || {};
  const findings = Array.isArray(ai.findings) ? ai.findings as string[] : [];

  const update = async (action: () => Promise<MovementScreeningItem>, message: string) => {
    setBusy(true);
    try {
      const next = await action();
      onChanged(next);
      toast.success(message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update screening");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeading title={`AI screening · ${screening.athlete_name}`} description={`${screening.athlete_safesport_id} · ${screening.drill.replaceAll("_", " ")} · ${screening.status}`}>
        <Go to={href(role, role === "athlete" ? "screening" : "screenings")} secondary>All screenings</Go>
      </PageHeading>
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Panel title="Screening video and AI package" description="AI movement risk is decision support only. Clinician/physio interpretation remains authoritative.">
          {screening.video_url ? (
            <video className="aspect-video w-full rounded-xl bg-black" controls src={screening.video_url} />
          ) : clinicalAccess ? (
            <div className="space-y-3">
              <Label htmlFor="ai-video">Upload field video</Label>
              <Input id="ai-video" type="file" accept="video/mp4,video/webm,video/quicktime" onChange={(event) => setVideo(event.target.files?.[0] ?? null)} />
              <Button disabled={!video || busy} onClick={() => video && update(async () => { await movementApi.uploadVideo(screening.id, video); return movementApi.analyze(screening.id); }, "Video uploaded and AI analysis generated")}>Upload and analyze</Button>
            </div>
          ) : (
            <Empty title="Report pending" description="SafeSport clinicians will upload and review field videos before publishing the final report." />
          )}
          {Object.keys(ai).length > 0 && (
            <div className="mt-5 space-y-3 rounded-xl border bg-muted/30 p-4">
              <div className="flex flex-wrap gap-2"><Status value={String(ai.risk_signal || "pending")} /><Status value={String((ai.quality as { status?: string } | undefined)?.status || "quality pending")} /></div>
              <p className="text-sm text-muted-foreground">{String(ai.summary || "No AI summary yet.")}</p>
              <ul className="list-disc space-y-1 pl-5 text-sm">{findings.map((finding) => <li key={finding}>{finding}</li>)}</ul>
            </div>
          )}
        </Panel>
        <Panel title={clinicalAccess ? "Human review and report" : "Final report"}>
          {clinicalAccess ? (
            <div className="space-y-4">
              {(canClinicianReview || canPhysioReview) && (
                <>
                  <Choice label="Review decision" value={decision} onChange={setDecision} options={canClinicianReview ? ["ACCEPT", "MODIFY", "REJECT", "REFER_PHYSIO"] : ["PHYSIO_REVIEWED"]} />
                  <Notes label="Clinical / physiotherapy interpretation" value={interpretation} onChange={setInterpretation} />
                  <Button disabled={busy || !interpretation.trim()} onClick={() => update(() => canClinicianReview ? movementApi.clinicianReview(screening.id, { decision, interpretation, action: "PREVENTION", override_reason: decision === "ACCEPT" || decision === "REFER_PHYSIO" ? "" : "Human reviewer adjusted the AI interpretation." }) : movementApi.physioReview(screening.id, { decision: "PHYSIO_REVIEWED", interpretation, action: "PREVENTION" }), "Review saved")}>Save review</Button>
                </>
              )}
              <Notes label="Final coach/athlete-safe report summary" value={report} onChange={setReport} />
              <div className="flex flex-wrap gap-2"><Button disabled={busy || !report.trim()} onClick={() => update(() => movementApi.createReport(screening.id, report), "Report generated")}>Generate final report</Button><Button variant="outline" onClick={() => movementApi.downloadReport(screening.id).catch((error) => toast.error(error instanceof Error ? error.message : "Unable to download report"))}>Download PDF</Button></div>
            </div>
          ) : screening.status === "REPORT_READY" ? (
            <div className="space-y-4"><p className="text-sm leading-6 text-muted-foreground">{screening.report_summary || "Final SafeSport movement screening report is ready."}</p><Button onClick={() => movementApi.downloadReport(screening.id).catch((error) => toast.error(error instanceof Error ? error.message : "Unable to download report"))}>Download PDF report</Button></div>
          ) : (
            <Empty title="Awaiting SafeSport review" description="The report appears here after clinician and physiotherapy review." />
          )}
        </Panel>
      </div>
    </>
  );
}

export function Schedule({
  role,
  id,
  view,
}: {
  role: Role;
  id?: string;
  view?: string;
}) {
  const { state } = useWorkspace();
  const events = scopedRecords(state, role, "events");
  const [sessionOpen, setSessionOpen] = useState(false);
  const [sessions, setSessions] = useState<Awaited<ReturnType<typeof movementApi.workspace>>["sessions"]>([]);

  useEffect(() => {
    let active = true;
    void movementApi.workspace().then((payload) => { if (active) setSessions(payload.sessions); }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  return (
    <>
      <Records
        role={role}
        collection="events"
        id={id}
        view={view}
        introduction={
          !id && (
            <div className="space-y-6">
              {role === "coach" && (
                <Panel title="AI screening session" description="Create and broadcast a formatted SafeSport AI screening session to your institution, clinicians and physiotherapists.">
                  <Button onClick={() => setSessionOpen(true)}><Plus /> New AI screening session</Button>
                </Panel>
              )}
              <Panel title="AI screening sessions" description="Sessions broadcast through institution messaging and schedule notifications.">
                <DataList
                  label="AI screening sessions"
                  rows={sessions.map((session) => ({
                    id: session.id,
                    name: session.title,
                    status: session.status,
                    date: session.scheduled_at || session.created_at.slice(0, 10),
                    detail: `${session.drill.replaceAll("_", " ")} · ${session.location || "Location TBC"}`,
                  }))}
                />
              </Panel>
              <Panel title="Coming up" description="All times are shown as entered in the demo (Africa/Nairobi).">
                <div className="divide-y divide-border/50">
                  {events.filter((e) => e.status === "scheduled").sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3).map((e) => (
                    <div key={e.id} className="flex flex-wrap items-center gap-4 py-4 first:pt-0 last:pb-0">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10"><CalendarDays className="size-5 text-muted-foreground" /></div>
                      <div className="min-w-0 flex-1"><p className="text-xs text-muted-foreground">{e.date.replace("T", " · ")}</p><p className="mt-1 text-sm font-semibold">{e.title}</p></div>
                      <Go to={href(role, `schedule/${e.id}`)} secondary>View appointment</Go>
                    </div>
                  ))}
                </div>
                {!events.some((event) => event.status === "scheduled") && <Empty title="Nothing scheduled" description="Upcoming appointments will appear here when scheduled." />}
              </Panel>
            </div>
          )
        }
      />
      <Dialog open={sessionOpen} onOpenChange={setSessionOpen}>
        <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>New AI screening session</DialogTitle><DialogDescription>Broadcast a formatted session notice to your institution and care team.</DialogDescription></DialogHeader>
          {sessionOpen && <AiSessionForm onSaved={(session) => { setSessions((current) => [session, ...current]); setSessionOpen(false); }} />}
        </DialogContent>
      </Dialog>
    </>
  );
}

function AiSessionForm({ onSaved }: { onSaved: (session: Awaited<ReturnType<typeof movementApi.createSession>>) => void }) {
  const [title, setTitle] = useState("SafeSport AI Screening Session");
  const [scheduledAt, setScheduledAt] = useState("");
  const [location, setLocation] = useState("");
  const [drill, setDrill] = useState("JUMP_LANDING");
  const [cameraView, setCameraView] = useState("FRONTAL");
  const [instructions, setInstructions] = useState("<p><strong>Prepare athletes for standardized movement screening.</strong></p><p>Bring training shoes, ensure adequate lighting, and capture each drill at 1080p / 30fps where possible.</p>");
  const [saving, setSaving] = useState(false);
  const format = (command: "bold" | "italic") => document.execCommand(command);
  return (
    <form className="space-y-4" onSubmit={async (event) => {
      event.preventDefault(); setSaving(true);
      try {
        const session = await movementApi.createSession({ title, scheduled_at: scheduledAt, location, drill, camera_view: cameraView, instructions_html: instructions });
        toast.success("AI screening session broadcast"); onSaved(session);
      } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to create session"); } finally { setSaving(false); }
    }}>
      <Field label="Session title" value={title} onChange={setTitle} required />
      <div className="grid gap-3 sm:grid-cols-2"><Field label="When" type="datetime-local" value={scheduledAt} onChange={setScheduledAt} /><Field label="Location" value={location} onChange={setLocation} /></div>
      <div className="grid gap-3 sm:grid-cols-2"><Choice label="Drill" value={drill} onChange={setDrill} options={["JUMP_LANDING", "SINGLE_LEG_SQUAT", "SPRINT_ACCELERATION", "CUTTING", "KICKING"]} /><Choice label="Camera view" value={cameraView} onChange={setCameraView} options={["FRONTAL", "SAGITTAL", "REAR", "MULTI_VIEW"]} /></div>
      <div className="space-y-2"><Label>Formatted session instructions</Label><div className="flex gap-2"><Button type="button" variant="outline" onClick={() => format("bold")}><Bold className="size-4" /> Bold</Button><Button type="button" variant="outline" onClick={() => format("italic")}><Italic className="size-4" /> Italic</Button></div><div className="min-h-36 rounded-xl border bg-background p-3 text-sm leading-6" contentEditable suppressContentEditableWarning onInput={(event) => setInstructions(event.currentTarget.innerHTML)} dangerouslySetInnerHTML={{ __html: instructions }} /></div>
      <Button type="submit" disabled={saving}>{saving ? "Broadcasting…" : "Create and broadcast"}</Button>
    </form>
  );
}
export function Reports({
  role,
  view = "reports",
}: {
  role: Role;
  view?: string;
}) {
  const { state } = useWorkspace();
  const athletes = visibleAthletes(state, role);
  const [reportAthletes, setReportAthletes] = useState<ReportAthlete[]>([]);
  const [termReports, setTermReports] = useState<TermReportSummary[]>([]);
  const [periodStart, setPeriodStart] = useState(`${new Date().getFullYear()}-01-01`);
  const [periodEnd, setPeriodEnd] = useState(today);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    void Promise.all([reportsApi.athletes(), reportsApi.termly()])
      .then(([loadedAthletes, loadedReports]) => {
        if (!active) return;
        setReportAthletes(loadedAthletes);
        setTermReports(loadedReports);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const scopedAthletes = reportAthletes.length
    ? reportAthletes
    : athletes.map((athlete) => ({
        id: athlete.id,
        name: fullName(athlete),
        institution: athlete.currentOrganization?.name || "",
        sport: athlete.currentSport?.name || "",
      }));
  const referrals = scopedRecords(state, role, "referrals");
  const screenings = scopedRecords(state, role, "screenings");
  const reportKind = view.split("/").at(-1) || "reports";
  const labels: Record<string, string> = {
    injuries: "Injury trends",
    readiness: "Participation readiness",
    ppe: "PPE completion",
    screening: "Screening completion",
    compliance: "Consent compliance",
  };
  const rows = [
    { name: "Athletes in scope", value: scopedAthletes.length },
    { name: "Finalized PPE assessments", value: state.encounters.filter((e) => e.finalized && scopedAthletes.some((a) => a.id === e.athleteId)).length },
    { name: "Open referrals", value: referrals.filter((r) => r.status !== "completed").length },
    { name: "Reviewed movement screenings", value: screenings.filter((s) => s.reviewer).length },
  ];
  const generateTermReports = async () => {
    setBusy(true);
    try {
      const reports = await reportsApi.generateTermly({
        title: "Termly athlete progress report",
        period_start: periodStart,
        period_end: periodEnd,
      });
      setTermReports(reports);
      toast.success("Term reports generated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to generate term reports");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeading
        title={labels[reportKind] || "Reports & readiness"}
        description="Generate SafeSport PDF reports from the athlete records available to your role."
      />
      <div className="grid divide-y overflow-hidden rounded-xl border bg-card sm:grid-cols-2 sm:divide-y-0 xl:grid-cols-4">
        {rows.map((r) => (
          <div key={r.name} className="border-b border-border/50 p-5 sm:border-r">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{r.name}</p>
            <p className="mt-3 text-3xl font-bold tabular-nums">{r.value}</p>
          </div>
        ))}
      </div>
      <Panel title="Full athlete reports" description="Multi-page PDF with basic details, PPE, health records, incidents, rehabilitation and documents known to SafeSport.">
        <DataList
          label="athletes"
          rows={scopedAthletes.map((athlete) => ({
            id: athlete.id,
            name: athlete.name,
            status: athlete.sport || "athlete",
            detail: athlete.institution || "Registered athlete",
            action: (
              <Button variant="outline" onClick={() => reportsApi.downloadFull(athlete.id, `safesport-full-report-${athlete.name.replaceAll(" ", "-").toLowerCase()}.pdf`).catch((error) => toast.error(error instanceof Error ? error.message : "Unable to download report"))}>
                Download full PDF
              </Button>
            ),
          }))}
        />
      </Panel>
      <Panel title="Termly reports" description="Institution-generated one-page progress reports. Once generated, linked athletes and guardians can download their available report.">
        {role === "institution" && (
          <div className="mb-5 grid gap-3 rounded-xl border bg-muted/30 p-4 sm:grid-cols-[1fr_1fr_auto]">
            <Field label="Period start" type="date" value={periodStart} onChange={setPeriodStart} />
            <Field label="Period end" type="date" value={periodEnd} onChange={setPeriodEnd} />
            <Button className="self-end" disabled={busy} onClick={generateTermReports}>Generate reports</Button>
          </div>
        )}
        <DataList
          label="term reports"
          rows={termReports.map((report) => ({
            id: report.id,
            name: report.athlete_name,
            status: report.status,
            date: report.created_at.slice(0, 10),
            detail: `${report.title} · ${report.period_start} to ${report.period_end}`,
            action: (
              <Button variant="outline" onClick={() => reportsApi.downloadTermly(report.id).catch((error) => toast.error(error instanceof Error ? error.message : "Unable to download term report"))}>
                Download term PDF
              </Button>
            ),
          }))}
        />
      </Panel>
      <Panel title="AI screening report template">
        <p className="text-sm text-muted-foreground">
          The AI screening report shell is reserved for the AI phase. Screening PDFs will use this same report area once AI analysis is connected.
        </p>
      </Panel>
    </>
  );
}
