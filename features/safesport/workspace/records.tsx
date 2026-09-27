"use client";
import { useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Plus, CalendarDays, Video } from "lucide-react";
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
import { careApi, AuthApiError } from "@/features/auth/api";
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
  const { state } = useWorkspace();
  const [open, setOpen] = useState(id === "new");
  let records = scopedRecords(state, role, "screenings");
  if (personal(role))
    records = records.filter(
      (r) =>
        r.status === "reviewed" || r.status === "included_in_report" || !r.risk,
    );
  if (reviewOnly)
    records = records.filter((r) => r.status === "ready_for_review");
  const detail =
    id && id !== "new"
      ? scopedRecords(state, role, "screenings").find((r) => r.id === id)
      : undefined;
  if (id && id !== "new")
    return detail ? (
      <ScreeningDetail role={role} initial={detail} />
    ) : (
      <Empty title="Screening unavailable">
        <Go to={href(role, role === "athlete" ? "screening" : "screenings")}>
          Screening list
        </Go>
      </Empty>
    );
  return (
    <>
      <PageHeading
        title={reviewOnly ? "AI review queue" : "Movement screening"}
        description="Movement-risk signals support clinical interpretation. They never determine medical eligibility."
      >
        {clinical(role) && (
          <Button onClick={() => setOpen(true)}>
            <Video />
            New screening
          </Button>
        )}
      </PageHeading>
      <Panel title={reviewOnly ? "Awaiting human review" : "Screening history"}>
        <DataList
          label="screenings"
          rows={records.map((r) => ({
            id: r.id,
            name: human(r.kind),
            status: r.status,
            detail: fullName(state.athletes.find((a) => a.id === r.athleteId)),
            date: r.date,
            to: href(
              role,
              `${role === "athlete" ? "screening" : reviewOnly ? "ai-reviews" : "screenings"}/${r.id}`,
            ),
          }))}
        />
      </Panel>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Capture movement screening</DialogTitle>
            <DialogDescription>
              Video preview is local in this prototype. Reviewed screening records remain in the workspace.
            </DialogDescription>
          </DialogHeader>
          {open && (
            <ScreeningCapture role={role} onClose={() => setOpen(false)} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
function ScreeningCapture({
  role,
  onClose,
}: {
  role: Role;
  onClose: () => void;
}) {
  const { state, update } = useWorkspace();
  const authUser = useAuthStore((auth) => auth.user);
  const currentUserName = userDisplayName(authUser) || identities[role].name;
  const athletes = visibleAthletes(state, role);
  const router = useRouter();
  const [athleteId, setAthleteId] = useState(athletes[0]?.id || "");
  const [drill, setDrill] = useState("jump_landing");
  const [file, setFile] = useState<{ name: string; url: string } | null>(null);
  const consent = state.consents[athleteId];
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!file) return;
        const r: RecordItem = {
          id: newId("scr"),
          athleteId,
          title: human(drill),
          kind: drill,
          status: "draft",
          quality: "pending",
          date: today,
          assigned: currentUserName,
          notes: "",
          file: file.url,
          fileName: file.name,
        };
        update(
          (s) => ({
            ...s,
            records: { ...s.records, screenings: [r, ...s.records.screenings] },
          }),
          "Movement screening captured",
          role,
          `screenings/${r.id}`,
        );
        onClose();
        router.push(href(role, `screenings/${r.id}`));
      }}
    >
      <Choice
        label="Athlete"
        value={athleteId}
        onChange={(value) => {
          setAthleteId(value);
          if (file) URL.revokeObjectURL(file.url);
          setFile(null);
        }}
        options={athletes.map((a) => ({ value: a.id, label: fullName(a) }))}
      />
      <Choice
        label="Drill"
        value={drill}
        onChange={setDrill}
        options={[
          "jump_landing",
          "single_leg_squat",
          "sprint_acceleration",
          "cutting_maneuver",
          "kicking_mechanics",
        ]}
      />
      <p className="rounded-lg bg-muted p-3 text-sm">
        Target 1080p, 30 fps, camera 3–5 metres away. Use adequate lighting and
        the configured frontal / sagittal view. Retake if keypoints are occluded
        or the protocol is not followed.
      </p>
      {consent?.clinical !== "obtained" || !consent.video ? (
        <p role="alert" className="text-sm text-destructive">
          Clinical consent and separate video consent are required.
        </p>
      ) : (
        <>
          <Label htmlFor="screening-video">Movement video (up to 100 MB)</Label>
          <Input
            id="screening-video"
            type="file"
            accept="video/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              if (!f.type.startsWith("video/") || f.size > 100 * 1024 * 1024) {
                toast.error("Select a video up to 100 MB.");
                return;
              }
              if (file) URL.revokeObjectURL(file.url);
              setFile({ name: f.name, url: URL.createObjectURL(f) });
            }}
          />
          {file && (
            <video
              className="aspect-video w-full rounded-xl bg-black"
              controls
              src={file.url}
              aria-label="Movement capture preview"
            />
          )}
        </>
      )}
      <div className="flex gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!file || consent?.clinical !== "obtained" || !consent.video}
        >
          Save capture
        </Button>
      </div>
    </form>
  );
}
function ScreeningDetail({
  role,
  initial,
}: {
  role: Role;
  initial: RecordItem;
}) {
  const { state, update } = useWorkspace();
  const [form, setForm] = useState(initial);
  const [processing, setProcessing] = useState(false);
  const [reason, setReason] = useState("");
  const clinicalAccess = clinical(role);
  const save = (record: RecordItem, title: string) => {
    setForm(record);
    update(
      (s) => ({
        ...s,
        records: {
          ...s.records,
          screenings: s.records.screenings.map((r) =>
            r.id === record.id ? record : r,
          ),
        },
      }),
      title,
      role,
      `screenings/${record.id}`,
    );
  };
  const simulate = () => {
    setProcessing(true);
    setTimeout(() => {
      save(
        {
          ...form,
          status: "ready_for_review",
          risk: "moderate",
          model: "DEMO-2.3.1",
          confidence: 0.82,
          metrics: {
            kneeValgusAngle: 15.3,
            trunkLean: 12.1,
            limbSymmetryIndex: 0.89,
            stabilizationTime: 1.8,
          },
        },
        "Demo movement result ready for human review",
      );
      setProcessing(false);
    }, 800);
  };
  return (
    <>
      <PageHeading
        title={human(form.kind)}
        description={`${fullName(state.athletes.find((a) => a.id === form.athleteId))} • ${form.id} • ${form.date}`}
      >
        <Go
          to={href(role, role === "athlete" ? "screening" : "screenings")}
          secondary
        >
          All screenings
        </Go>
      </PageHeading>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Movement capture">
          <Status value={processing ? "processing" : form.status} />
          {form.file ? (
            <video
              controls
              className="aspect-video w-full rounded-xl bg-black"
              src={form.file}
              aria-label="Movement screening video"
            />
          ) : (
            <Empty
              title="No video attached to this seed record"
              description="Create a screening to preview a local video. Seed metrics are demonstration data."
            />
          )}
          <p className="text-sm">
            Video quality: <Status value={form.quality || "pending"} />
          </p>
          {clinicalAccess && (
            <>
              <Choice
                label="Capture quality"
                value={form.quality || "pending"}
                onChange={(v) =>
                  save(
                    {
                      ...form,
                      quality: v,
                      status:
                        v === "fail"
                          ? "quality_failed"
                          : form.status === "quality_failed"
                            ? "draft"
                            : form.status,
                      risk: v === "fail" ? undefined : form.risk,
                      metrics: v === "fail" ? undefined : form.metrics,
                    },
                    "Video quality reviewed",
                  )
                }
                options={[
                  { value: "pending", label: "Not yet assessed" },
                  { value: "pass", label: "Usable" },
                  { value: "fail", label: "Retake required" },
                ]}
              />
              {form.quality === "fail" && (
                <>
                  <Notes
                    label="Retake instructions"
                    value={reason}
                    onChange={setReason}
                  />
                  <Button
                    disabled={!reason.trim()}
                    onClick={() =>
                      save({ ...form, notes: reason }, "Retake requested")
                    }
                  >
                    Save retake instructions
                  </Button>
                </>
              )}
              {!["reviewed", "included_in_report"].includes(form.status) && (
                <Button
                  disabled={form.quality !== "pass" || processing}
                  onClick={simulate}
                >
                  {processing
                    ? "Preparing demo result…"
                    : "Load simulated AI result"}
                </Button>
              )}
              <p className="text-xs text-muted-foreground">
                Simulated metrics are a fixed demo fixture, not an analysis of
                the uploaded video.
              </p>
            </>
          )}
        </Panel>
        <Panel
          title={clinicalAccess ? "Human interpretation" : "Reviewed summary"}
          description="AI risk is a movement signal, not medical clearance."
        >
          {form.risk &&
          form.quality !== "fail" &&
          (clinicalAccess || form.reviewer) ? (
            <>
              <div className="flex gap-2">
                <Status value={`${form.risk}_movement_risk`} />
                <Status
                  value={
                    form.reviewer ? "human_reviewed" : "awaiting_human_review"
                  }
                />
              </div>
              {clinicalAccess && (
                <>
                  <p className="text-sm">
                    Model {form.model || "Not recorded"} · Confidence{" "}
                    {form.confidence === undefined
                      ? "Not measured"
                      : `${Math.round(form.confidence * 100)}%`}
                  </p>
                  <dl className="grid grid-cols-2 gap-3 rounded-xl bg-muted p-4 text-sm">
                    {[
                      {
                        key: "kneeValgusAngle",
                        label: "Knee valgus",
                        unit: "°",
                      },
                      { key: "trunkLean", label: "Trunk lean", unit: "°" },
                      {
                        key: "limbSymmetryIndex",
                        label: "Limb symmetry index",
                        unit: "",
                      },
                      {
                        key: "stabilizationTime",
                        label: "Stabilization",
                        unit: " s",
                      },
                    ].map((m) => (
                      <div key={m.key}>
                        <dt className="text-muted-foreground">{m.label}</dt>
                        <dd className="mt-1 font-medium">
                          {form.metrics?.[m.key] === undefined
                            ? "Not measured"
                            : `${form.metrics[m.key]}${m.unit}`}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <p className="text-xs text-muted-foreground">
                    Drill: {human(form.kind)}. Interpret in protocol and capture
                    context; no universal clinical cut-off is applied.
                  </p>
                </>
              )}
              {clinicalAccess ? (
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    save(
                      {
                        ...form,
                        status: "reviewed",
                        reviewer: identities[role].name,
                      },
                      "Movement interpretation signed",
                    );
                    toast.success("Human review saved");
                  }}
                >
                  <Notes
                    label="Clinical interpretation / correction reason"
                    value={form.interpretation || ""}
                    onChange={(v) => setForm({ ...form, interpretation: v })}
                    required
                  />
                  <Choice
                    label="Reviewer action"
                    value={form.action || ""}
                    onChange={(v) => setForm({ ...form, action: v })}
                    options={[
                      "no_action",
                      "prevention_program",
                      "physiotherapy_referral",
                      "further_assessment",
                      "other",
                    ]}
                  />
                  <Button
                    type="submit"
                    disabled={!form.action || !form.interpretation?.trim()}
                  >
                    Sign human review
                  </Button>
                  {form.action === "physiotherapy_referral" && (
                    <Go
                      to={href(
                        role,
                        `referrals/new?athleteId=${form.athleteId}&source=${form.id}`,
                      )}
                      secondary
                    >
                      Create referral
                    </Go>
                  )}
                </form>
              ) : (
                <p className="text-sm">
                  {form.interpretation ||
                    "Your care team has reviewed this screening. Contact them for your care plan."}
                </p>
              )}
              {form.reviewer && (
                <p className="text-sm text-muted-foreground">
                  Reviewed by {form.reviewer}
                </p>
              )}
            </>
          ) : (
            <Empty
              title={
                form.quality === "fail" ? "Retake required" : "Result pending"
              }
              description={
                form.quality === "fail"
                  ? "No risk result is available for insufficient-quality video."
                  : "A usable capture and human-reviewed result are required."
              }
            />
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
  return (
    <Records
      role={role}
      collection="events"
      id={id}
      view={view}
      introduction={
        !id && (
          <Panel
            title="Coming up"
            description="All times are shown as entered in the demo (Africa/Nairobi)."
          >
            <div className="divide-y divide-border/50">
              {events
                .filter((e) => e.status === "scheduled")
                .sort((a, b) => a.date.localeCompare(b.date))
                .slice(0, 3)
                .map((e) => (
                  <div
                    key={e.id}
                    className="flex flex-wrap items-center gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <CalendarDays className="size-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">
                        {e.date.replace("T", " · ")}
                      </p>
                      <p className="mt-1 text-sm font-semibold">{e.title}</p>
                    </div>
                    <Go to={href(role, `schedule/${e.id}`)} secondary>
                      View appointment
                    </Go>
                  </div>
                ))}
            </div>
            {!events.some((event) => event.status === "scheduled") && (
              <Empty
                title="Nothing scheduled"
                description="Upcoming appointments will appear here when scheduled."
              />
            )}
          </Panel>
        )
      }
    />
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
  const eligible = athletes.filter(
    (a) => a.eligibilityStatus === "cleared",
  ).length;
  const completed = state.encounters.filter(
    (e) => e.finalized && athletes.some((a) => a.id === e.athleteId),
  ).length;
  const referrals = scopedRecords(state, role, "referrals");
  const screenings = scopedRecords(state, role, "screenings");
  const rows = [
    { name: "Athletes in scope", value: athletes.length },
    { name: "Cleared without restrictions", value: eligible },
    { name: "Finalized PPE assessments", value: completed },
    {
      name: "Reviewed movement screenings",
      value: screenings.filter((s) => s.reviewer).length,
    },
    {
      name: "Open referrals",
      value: referrals.filter((r) => r.status !== "completed").length,
    },
    {
      name: "Clinical consent obtained",
      value: athletes.filter(
        (a) => state.consents[a.id]?.clinical === "obtained",
      ).length,
    },
  ];
  const reportKind = view.split("/").at(-1) || "reports";
  const labels: Record<string, string> = {
    injuries: "Injury trends",
    readiness: "Participation readiness",
    ppe: "PPE completion",
    screening: "Screening completion",
    compliance: "Consent compliance",
  };
  const detailRows =
    reportKind === "injuries"
      ? ["minor", "moderate", "severe", "emergency"].map((severity) => ({
          id: severity,
          name: human(severity),
          status: "aggregate",
          detail: `${scopedRecords(state, role, "incidents").filter((r) => r.urgency === severity).length} incidents`,
        }))
      : reportKind === "screening"
        ? ["draft", "processing", "ready_for_review", "reviewed"].map(
            (status) => ({
              id: status,
              name: human(status),
              status,
              detail: `${screenings.filter((r) => r.status === status).length} screenings`,
            }),
          )
        : reportKind === "compliance"
          ? ["obtained", "deferred", "declined", "withdrawn"].map((status) => ({
              id: status,
              name: human(status),
              status,
              detail: `${athletes.filter((a) => (state.consents[a.id]?.clinical || "deferred") === status).length} athletes`,
            }))
          : state.teams
              .filter((t) => athletes.some((a) => a.currentTeam?.id === t.id))
              .map((t) => ({
                id: t.id,
                name: t.name,
                status: "aggregate",
                detail: `${athletes.filter((a) => a.currentTeam?.id === t.id).length} athletes · ${athletes.filter((a) => a.currentTeam?.id === t.id && a.eligibilityStatus === "cleared").length} cleared`,
              }));
  const content = [
    "SafeSport demo report",
    `Scope: ${identities[role].title}`,
    `Snapshot: ${today}`,
    ...rows.map((r) => `${r.name},${r.value}`),
    ...detailRows.map((r) => `${r.name},${r.detail}`),
  ].join("\n");
  return (
    <>
      <PageHeading
        title={labels[reportKind] || "Reports & readiness"}
        description="Counts are derived from the records visible in your role. Unrecorded information remains incomplete."
      >
        <Export name={`${role}-demo-report.csv`} content={content} />
      </PageHeading>
      <div className="grid divide-y overflow-hidden rounded-xl border bg-card sm:grid-cols-2 sm:divide-y-0 xl:grid-cols-3">
        {rows.map((r) => (
          <div
            key={r.name}
            className="border-b border-border/50 p-5 sm:border-r"
          >
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {r.name}
            </p>
            <p className="mt-3 text-3xl font-bold tabular-nums">{r.value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel
          title="Participation distribution"
          description="Current clinician decisions within your permitted scope."
        >
          <Distribution
            label="Participation distribution"
            data={Array.from(
              new Set(athletes.map((a) => a.eligibilityStatus)),
            ).map((status) => ({
              name: human(status),
              value: athletes.filter((a) => a.eligibilityStatus === status)
                .length,
            }))}
          />
        </Panel>
        <Panel
          title="Referral workload"
          description="Current referral stages, including completed follow-up."
        >
          <Distribution
            label="Referral workload"
            data={Array.from(new Set(referrals.map((r) => r.status))).map(
              (status) => ({
                name: human(status),
                value: referrals.filter((r) => r.status === status).length,
              }),
            )}
          />
        </Panel>
      </div>
      <Panel title={labels[reportKind] || "Team summary"}>
        <DataList rows={detailRows} label="aggregate groups" />
      </Panel>
      <Panel title="Report scope">
        <p className="text-sm text-muted-foreground">
          {role === "institution"
            ? "Green Valley Academy aggregate operational data only. No clinical findings, AI metrics or sensitive narratives are included."
            : personal(role)
              ? "Only your permitted athlete records are included."
              : "This report summarizes the currently visible demo records."}
        </p>
        <p className="text-sm">
          Demo snapshot · {today} · Counts change as records are edited.
        </p>
      </Panel>
    </>
  );
}
