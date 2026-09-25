"use client";
/**
 * clinician-referrals.tsx
 * Redesigned Referrals list and detail for the Clinician workspace.
 * Preserves all referral logic. Uses clinician-ui design system.
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
ArrowRightLeft,
CheckCircle2,
ChevronRight,
Clock,
Plus,
TriangleAlert
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { href,human,identities } from "./catalog";
import {
EmptyState,
HeroBanner,
InfoGrid,
PageHeader,
SectionCard,
StatCard,
StatusChip,
TabStrip
} from "./clinician-ui";
import { scopedRecords } from "./records";
import {
fullName,
newId,
today,
useWorkspace,
visibleAthletes,
type RecordItem,
} from "./store";
import { Choice,Field,Notes } from "./ui";

// ── Referrals surface ─────────────────────────────────────────────────────────

export function ClinicianReferrals({ id, view }: { id?: string; view?: string }) {
  const { state } = useWorkspace();
  const role = "clinician" as const;
  const athletes = visibleAthletes(state, role);
  const allReferrals = scopedRecords(state, role, "referrals");

  if (id && id !== "new") {
    const detail = allReferrals.find((r) => r.id === id);
    if (!detail)
      return (
        <div className="space-y-6">
          <PageHeader title="Referral unavailable" back={{ label: "Back to referrals", href: href(role, "referrals") }} />
          <EmptyState icon={ArrowRightLeft} title="Referral not found" description="This referral is not in your permitted demo workspace." />
        </div>
      );
    return <ReferralDetail referral={detail} athletes={athletes} />;
  }

  return <ReferralsList referrals={allReferrals} athletes={athletes} view={view} />;
}

// ── Referrals list ────────────────────────────────────────────────────────────

const LIST_TABS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "in_progress", label: "In progress" },
  { id: "overdue", label: "Overdue" },
  { id: "completed", label: "Completed" },
];

function ReferralsList({
  referrals,
  athletes,
}: {
  referrals: RecordItem[];
  athletes: ReturnType<typeof visibleAthletes>;
  view?: string;
}) {
  const role = "clinician" as const;
  const [activeTab, setActiveTab] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);

  const open = referrals.filter((r) => r.status !== "completed").length;
  const overdue = referrals.filter((r) => r.status === "overdue" || (r.status !== "completed" && r.date < today)).length;
  const completed = referrals.filter((r) => r.status === "completed").length;

  const filtered = referrals.filter((r) => {
    if (activeTab === "all") return true;
    if (activeTab === "in_progress") return r.status === "in_progress" || r.status === "assigned";
    if (activeTab === "overdue") return r.status === "overdue" || (r.status !== "completed" && r.date < today);
    return r.status === activeTab;
  });

  const tabs = LIST_TABS.map((t) => ({
    ...t,
    count: t.id === "all" ? referrals.length :
           t.id === "pending" ? referrals.filter((r) => r.status === "pending").length :
           t.id === "in_progress" ? referrals.filter((r) => ["in_progress", "assigned"].includes(r.status)).length :
           t.id === "overdue" ? overdue :
           t.id === "completed" ? completed : 0,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Clinical"
        title="Referrals"
        description="Closed-loop referral tracking. Completion requires a recorded outcome and closure note."
      >
        <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1.5">
          <Plus className="size-3.5" aria-hidden="true" />
          Create referral
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total referrals" value={referrals.length} icon={ArrowRightLeft} accent="neutral" />
        <StatCard label="Open" value={open} icon={Clock} accent={open > 0 ? "amber" : "neutral"} />
        <StatCard label="Overdue" value={overdue} icon={TriangleAlert} accent={overdue > 0 ? "red" : "neutral"} />
        <StatCard label="Completed" value={completed} icon={CheckCircle2} accent="green" />
      </div>

      {/* Tabs + table */}
      <SectionCard label="Tracking" title="Referral register">
        <div className="mb-4">
          <TabStrip tabs={tabs} active={activeTab} onChange={setActiveTab} />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={ArrowRightLeft}
            title={activeTab === "all" ? "No referrals yet" : `No ${activeTab.replaceAll("_", " ")} referrals`}
            description={activeTab === "all" ? "Referrals are created during PPE or from this page." : "Adjust the filter to see other referrals."}
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Athlete</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Type</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Urgency</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Status</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Date</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Assigned to</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.map((r) => {
                  const athlete = athletes.find((a) => a.id === r.athleteId);
                  const isOverdue = r.status !== "completed" && r.date < today;
                  return (
                    <tr key={r.id} className={`group transition-colors hover:bg-muted/40 ${isOverdue ? "bg-red-500/3" : ""}`}>
                      <td className="px-4 py-3">
                        <Link href={href(role, `referrals/${r.id}`)} className="outline-none focus-visible:underline">
                          <p className="font-semibold">{fullName(athlete)}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{r.id}</p>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm">{human(r.kind)}</td>
                      <td className="px-4 py-3">{r.urgency ? <StatusChip value={r.urgency} /> : "—"}</td>
                      <td className="px-4 py-3"><StatusChip value={r.status} /></td>
                      <td className="px-4 py-3 text-muted-foreground text-sm">{r.date?.slice(0, 10) ?? "—"}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{r.assigned || "Unassigned"}</td>
                      <td className="px-4 py-3 text-right">
                        <Link href={href(role, `referrals/${r.id}`)}>
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

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Create referral</DialogTitle>
            <DialogDescription>
              Referrals require a documented clinical reason and closed-loop follow-up.
            </DialogDescription>
          </DialogHeader>
          {createOpen && (
            <ReferralForm
              athletes={athletes}
              onClose={() => setCreateOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Create referral form ──────────────────────────────────────────────────────

const REFERRAL_TYPES = [
  "sports_physician", "physiotherapy", "orthopaedics", "cardiology",
  "neurology", "respiratory", "mental_health", "nutrition", "ophthalmology", "other",
];

function ReferralForm({
  athletes,
  initial,
  onClose,
}: {
  athletes: ReturnType<typeof visibleAthletes>;
  initial?: RecordItem;
  onClose: () => void;
}) {
  const { update } = useWorkspace();
  const role = "clinician" as const;
  const [form, setForm] = useState<RecordItem>(
    initial ?? {
      id: "",
      athleteId: athletes[0]?.id ?? "",
      title: human(REFERRAL_TYPES[0]),
      kind: REFERRAL_TYPES[0],
      status: "pending",
      date: today,
      notes: "",
      assigned: identities.physiotherapist.name,
      urgency: "routine",
      outcome: "",
    },
  );
  const [closure, setClosure] = useState("");
  const patch = (v: Partial<RecordItem>) => setForm({ ...form, ...v });

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (form.status === "completed" && !form.outcome?.trim()) {
          toast.error("An outcome is required to complete a referral.");
          return;
        }
        if (["assigned", "in_progress"].includes(form.status) && !form.assigned.trim()) {
          toast.error("Choose an assigned provider.");
          return;
        }
        const saved = {
          ...form,
          id: form.id || newId("ref"),
          notes: closure ? `${form.notes}\nClosure: ${closure}` : form.notes,
        };
        update(
          (s) => ({
            ...s,
            records: {
              ...s.records,
              referrals: [saved, ...s.records.referrals.filter((r) => r.id !== saved.id)],
            },
          }),
          `Referral ${initial ? "updated" : "created"}`,
          role,
          `referrals/${saved.id}`,
          ["clinician", "operations"],
        );
        toast.success("Referral saved in demo");
        onClose();
      }}
    >
      {!initial && (
        <Choice
          label="Athlete"
          value={form.athleteId || ""}
          onChange={(v) => patch({ athleteId: v })}
          options={athletes.map((a) => ({ value: a.id, label: fullName(a) }))}
        />
      )}
      <Choice
        label="Referral type"
        value={form.kind}
        onChange={(v) => patch({
          kind: v,
          title: human(v),
          assigned: v === "physiotherapy" ? identities.physiotherapist.name : "External specialist",
        })}
        options={REFERRAL_TYPES}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Choice
          label="Status"
          value={form.status}
          onChange={(v) => patch({ status: v })}
          options={["pending", "assigned", "in_progress", "overdue", "completed"]}
        />
        <Field label="Appointment date" type="date" value={form.date} onChange={(v) => patch({ date: v })} required />
      </div>
      <Choice
        label="Urgency"
        value={form.urgency || "routine"}
        onChange={(v) => patch({ urgency: v })}
        options={["routine", "priority", "urgent", "emergency"]}
      />
      <Choice
        label="Assigned provider"
        value={form.assigned}
        onChange={(v) => patch({ assigned: v })}
        options={[
          { value: "", label: "Unassigned" },
          ...Object.values(identities).map((u) => ({ value: u.name, label: u.name })),
          { value: "External specialist", label: "External specialist" },
        ]}
      />
      {form.status === "completed" && (
        <Choice
          label="Outcome"
          value={form.outcome || "pending"}
          onChange={(v) => patch({ outcome: v === "pending" ? "" : v })}
          options={["pending", "completed", "further_referral", "cleared", "restricted"]}
        />
      )}
      <Notes
        label="Clinical reason"
        value={form.notes}
        onChange={(v) => patch({ notes: v })}
        required
      />
      <Notes
        label="Closure note (required when completing)"
        value={closure}
        onChange={setClosure}
      />
      <div className="flex justify-end gap-2 border-t pt-4">
        <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
        <Button type="submit">{initial ? "Update" : "Create"} referral</Button>
      </div>
    </form>
  );
}

// ── Referral detail ───────────────────────────────────────────────────────────

const PIPELINE_STEPS = ["Pending", "Assigned", "In progress", "Completed"];

function stepIndex(status: string): number {
  if (status === "pending") return 0;
  if (status === "assigned") return 1;
  if (status === "in_progress") return 2;
  if (status === "completed") return 3;
  return 0;
}

function ReferralDetail({
  referral: r,
  athletes,
}: {
  referral: RecordItem;
  athletes: ReturnType<typeof visibleAthletes>;
}) {
  const athlete = athletes.find((a) => a.id === r.athleteId);
  const [editOpen, setEditOpen] = useState(false);
  const currentStep = stepIndex(r.status);

  return (
    <div className="space-y-6">
      <HeroBanner
        eyebrow="Referral"
        title={human(r.kind)}
        description={`${fullName(athlete)} · ${r.id} · Created ${r.date?.slice(0, 10) ?? "—"}`}
        footer={
          <div className="flex flex-wrap items-center gap-2">
            {r.urgency && <StatusChip value={r.urgency} />}
            <StatusChip value={r.status} />
          </div>
        }
      >
        <Link href={href("clinician", "referrals")}>
          <Button variant="outline" size="sm">← All referrals</Button>
        </Link>
        {r.status !== "completed" && (
          <Button size="sm" onClick={() => setEditOpen(true)}>Update referral</Button>
        )}
      </HeroBanner>

      {/* Closed-loop pipeline visualization */}
      <SectionCard label="Workflow" title="Closed-loop pipeline">
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-4 right-4 top-5 h-px bg-border sm:left-[calc(12.5%)] sm:right-[calc(12.5%)]" aria-hidden="true" />
          <ol className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
            {PIPELINE_STEPS.map((label, i) => {
              const done = i < currentStep;
              const current = i === currentStep;
              return (
                <li key={label} className="flex flex-col items-center gap-2 text-center">
                  <div
                    className={[
                      "relative z-10 flex size-10 items-center justify-center rounded-full border-2 text-sm font-bold",
                      done ? "border-emerald-500 bg-emerald-500 text-white" :
                      current ? "border-primary bg-primary text-primary-foreground" :
                      "border-border bg-card text-muted-foreground",
                    ].join(" ")}
                    aria-current={current ? "step" : undefined}
                  >
                    {done ? <CheckCircle2 className="size-5" aria-hidden="true" /> : i + 1}
                  </div>
                  <p className={`text-xs font-semibold ${current ? "text-foreground" : done ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
                    {label}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
        {r.status === "completed" ? (
          <p className="mt-4 text-sm text-muted-foreground">An outcome and closure note have been recorded for this referral.</p>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">Coordinate the appointment and record the specialist outcome before closing.</p>
        )}
      </SectionCard>

      {/* Referral details */}
      <SectionCard label="Details" title="Referral information">
        <InfoGrid items={[
          { label: "Athlete", value: fullName(athlete) },
          { label: "Referral type", value: human(r.kind) },
          { label: "Urgency", value: r.urgency ? <StatusChip value={r.urgency} /> : "—" },
          { label: "Status", value: <StatusChip value={r.status} /> },
          { label: "Assigned to", value: r.assigned || "Unassigned" },
          { label: "Appointment date", value: r.date?.slice(0, 10) ?? "Not scheduled" },
          { label: "Outcome", value: r.outcome ? human(r.outcome) : "Pending" },
          { label: "Referral ID", value: r.id },
        ]} />
        {r.notes && (
          <div className="mt-4 space-y-1.5 border-t pt-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Clinical reason</p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{r.notes}</p>
          </div>
        )}
      </SectionCard>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        {athlete && (
          <Link href={href("clinician", `athletes/${athlete.id}`)}>
            <Button variant="outline" size="sm">Athlete record</Button>
          </Link>
        )}
        {r.kind === "physiotherapy" && (
          <Link href={href("clinician", "reassessments")}>
            <Button variant="outline" size="sm">Rehabilitation workspace</Button>
          </Link>
        )}
      </div>

      {/* Update dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Update referral</DialogTitle>
            <DialogDescription>Update status, assignment and outcome.</DialogDescription>
          </DialogHeader>
          {editOpen && (
            <ReferralForm athletes={athletes} initial={r} onClose={() => setEditOpen(false)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
