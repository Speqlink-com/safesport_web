"use client";
/**
 * clinician-misc.tsx
 * Redesigned secondary surfaces for the Clinician workspace:
 * Schedule, Tasks, Reports, Notifications, Messages, Profile/Account.
 */

import { Button } from "@/components/ui/button";
import {
Dialog,
DialogContent,
DialogDescription,
DialogHeader,
DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
Activity,
ArrowRightLeft,
CalendarDays,
CheckCheck,
ChevronRight,
Clock,
ListChecks,
MessageSquare,
Paperclip,
Plus,
ScanLine,
Send,
ShieldCheck,
Users,
X
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
Bar,
BarChart,
CartesianGrid,
Cell,
ResponsiveContainer,
Tooltip,
XAxis,
YAxis,
} from "recharts";
import { toast } from "sonner";
import { authApi } from "@/features/auth/api";
import { useAuthStore } from "@/features/auth/store";
import { href,human,identities,roles } from "./catalog";
import {
AllClearState,
EmptyState,
FormCard,
HeroBanner,
InfoGrid,
InfoNote,
PageHeader,
SectionCard,
SectionLabel,
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
type Message,
type RecordItem,
} from "./store";
import { Choice,Export,Field,Notes } from "./ui";

// ── Schedule ──────────────────────────────────────────────────────────────────

export function ClinicianSchedule({
  id,
}: {
  id?: string;
  view?: string;
}) {
  const { state, update } = useWorkspace();
  const role = "clinician" as const;
  const athletes = visibleAthletes(state, role);
  const allEvents = scopedRecords(state, role, "events");
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<RecordItem>({
    id: "",
    athleteId: athletes[0]?.id ?? "",
    title: "",
    kind: "ppe",
    status: "scheduled",
    date: `${today}T09:00`,
    notes: "",
    assigned: identities.clinician.name,
    urgency: undefined,
  });
  const patch = (v: Partial<RecordItem>) => setForm({ ...form, ...v });

  // Detail view
  if (id) {
    const event = allEvents.find((e) => e.id === id);
    if (!event)
      return (
        <div className="space-y-6">
          <PageHeader title="Appointment unavailable" back={{ label: "Back to schedule", href: href(role, "schedule") }} />
          <EmptyState icon={CalendarDays} title="Appointment not found" />
        </div>
      );
    const athlete = athletes.find((a) => a.id === event.athleteId);
    return (
      <div className="space-y-6">
        <HeroBanner
          eyebrow="Appointment"
          title={event.title}
          description={`${fullName(athlete)} · ${event.date?.replace("T", " · ").slice(0, 16)}`}
          footer={<StatusChip value={event.status} />}
        >
          <Link href={href(role, "schedule")}>
            <Button variant="outline" size="sm">← Schedule</Button>
          </Link>
        </HeroBanner>
        <SectionCard title="Appointment details">
          <InfoGrid items={[
            { label: "Title", value: event.title },
            { label: "Athlete", value: fullName(athlete) },
            { label: "Type", value: human(event.kind) },
            { label: "Date & time", value: event.date?.replace("T", " ") ?? "—" },
            { label: "Status", value: <StatusChip value={event.status} /> },
            { label: "Assigned to", value: event.assigned || "—" },
            { label: "Location / notes", value: event.notes || "—" },
          ]} />
        </SectionCard>
      </div>
    );
  }

  const upcoming = allEvents
    .filter((e) => e.status === "scheduled")
    .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Schedule"
        description="Upcoming appointments and care events in your workspace."
      >
        <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1.5">
          <Plus className="size-3.5" aria-hidden="true" />
          New appointment
        </Button>
      </PageHeader>

      {/* Upcoming cards */}
      {upcoming.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.slice(0, 3).map((e) => {
            const athlete = athletes.find((a) => a.id === e.athleteId);
            const [datePart, timePart] = (e.date ?? "").split("T");
            return (
              <Link
                key={e.id}
                href={href(role, `schedule/${e.id}`)}
                className="group rounded-xl border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-sm hover:shadow-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="mb-3 flex size-8 items-center justify-center rounded-lg bg-primary/10">
                  <CalendarDays className="size-4 text-primary" aria-hidden="true" />
                </div>
                <p className="text-xs text-muted-foreground">{datePart} {timePart ? `· ${timePart.slice(0, 5)}` : ""}</p>
                <p className="mt-1 font-semibold text-sm leading-snug">{e.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{fullName(athlete)}</p>
                <p className="mt-1 text-xs text-muted-foreground">{e.notes || human(e.kind)}</p>
                <ChevronRight className="mt-2 size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      )}

      {/* Full list */}
      <SectionCard label="All appointments" title="Schedule register">
        {allEvents.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Nothing scheduled"
            description="Appointments will appear when the coordinator schedules them."
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Title</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Athlete</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Type</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Date</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Status</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {allEvents.map((e) => {
                  const athlete = athletes.find((a) => a.id === e.athleteId);
                  return (
                    <tr key={e.id} className="group transition-colors hover:bg-muted/40">
                      <td className="px-4 py-3 font-medium">{e.title}</td>
                      <td className="px-4 py-3 text-muted-foreground">{fullName(athlete)}</td>
                      <td className="px-4 py-3"><StatusChip value={e.kind} /></td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{e.date?.replace("T", " ").slice(0, 16) ?? "—"}</td>
                      <td className="px-4 py-3"><StatusChip value={e.status} /></td>
                      <td className="px-4 py-3 text-right">
                        <Link href={href(role, `schedule/${e.id}`)}>
                          <Button variant="outline" size="sm" className="gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100">
                            Details <ChevronRight className="size-3" aria-hidden="true" />
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
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>New appointment</DialogTitle>
            <DialogDescription>Add a scheduled event to the demo workspace.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const saved = { ...form, id: newId("evt") };
              update(
                (s) => ({ ...s, records: { ...s.records, events: [saved, ...s.records.events] } }),
                "Appointment created",
                role,
                `schedule/${saved.id}`,
                ["clinician", "operations"],
              );
              toast.success("Appointment added");
              setCreateOpen(false);
            }}
          >
            <Choice label="Athlete" value={form.athleteId || ""} onChange={(v) => patch({ athleteId: v })} options={athletes.map((a) => ({ value: a.id, label: fullName(a) }))} />
            <Field label="Title" value={form.title} onChange={(v) => patch({ title: v })} required />
            <Choice label="Type" value={form.kind} onChange={(v) => patch({ kind: v })} options={["ppe", "screening", "reassessment", "referral", "team_event", "clinic", "coverage"]} />
            <Field label="Date and time" type="datetime-local" value={form.date} onChange={(v) => patch({ date: v })} required />
            <Notes label="Location and notes" value={form.notes} onChange={(v) => patch({ notes: v })} />
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button variant="outline" type="button" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit">Save appointment</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Tasks ─────────────────────────────────────────────────────────────────────

export function ClinicianTasks() {
  const { state, update } = useWorkspace();
  const role = "clinician" as const;
  const athletes = visibleAthletes(state, role);
  const allTasks = scopedRecords(state, role, "tasks");
  const [activeTab, setActiveTab] = useState("all");
  const [editing, setEditing] = useState<RecordItem | null>(null);

  const pending = allTasks.filter((t) => t.status === "pending").length;
  const inProgress = allTasks.filter((t) => t.status === "in_progress").length;
  const completed = allTasks.filter((t) => t.status === "completed").length;

  const filtered = allTasks.filter((t) => {
    if (activeTab === "all") return true;
    if (activeTab === "in_progress") return t.status === "in_progress";
    return t.status === activeTab;
  });

  const tabs = [
    { id: "all", label: "All", count: allTasks.length },
    { id: "pending", label: "Pending", count: pending },
    { id: "in_progress", label: "In progress", count: inProgress },
    { id: "completed", label: "Completed", count: completed },
  ];

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Operations" title="Tasks" description="Coordination tasks in your clinical workspace." />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total tasks" value={allTasks.length} icon={ListChecks} accent="neutral" />
        <StatCard label="Pending" value={pending} icon={Clock} accent={pending > 0 ? "amber" : "neutral"} />
        <StatCard label="In progress" value={inProgress} icon={Activity} accent="blue" />
        <StatCard label="Completed" value={completed} icon={CheckCheck} accent="green" />
      </div>

      <SectionCard label="Board" title="Task register">
        <div className="mb-4"><TabStrip tabs={tabs} active={activeTab} onChange={setActiveTab} /></div>

        {filtered.length === 0 ? (
          <AllClearState title="No tasks" description={activeTab === "all" ? "Tasks appear when clinical actions require coordination." : "No tasks in this category."} />
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Task</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Athlete</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Type</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Status</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Due</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Assigned</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.map((t) => {
                  const athlete = athletes.find((a) => a.id === t.athleteId);
                  return (
                    <tr key={t.id} className="group transition-colors hover:bg-muted/40">
                      <td className="px-4 py-3">
                        <p className="font-medium">{t.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{t.id}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{fullName(athlete) ?? "—"}</td>
                      <td className="px-4 py-3 text-sm">{human(t.kind)}</td>
                      <td className="px-4 py-3"><StatusChip value={t.status} /></td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{t.date?.slice(0, 10) ?? "—"}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{t.assigned || "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                          onClick={() => setEditing(t)}
                        >
                          Update
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update task</DialogTitle>
            <DialogDescription>Update the status and notes for this coordination task.</DialogDescription>
          </DialogHeader>
          {editing && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                update(
                  (s) => ({
                    ...s,
                    records: {
                      ...s.records,
                      tasks: s.records.tasks.map((t) => (t.id === editing.id ? editing : t)),
                    },
                  }),
                  "Task updated",
                  role,
                  "tasks",
                );
                setEditing(null);
                toast.success("Task updated");
              }}
            >
              <Choice
                label="Status"
                value={editing.status}
                onChange={(v) => setEditing({ ...editing, status: v })}
                options={["pending", "in_progress", "completed"]}
              />
              <Notes
                label="Update notes"
                value={editing.notes}
                onChange={(v) => setEditing({ ...editing, notes: v })}
              />
              <div className="flex justify-end gap-2 border-t pt-4">
                <Button variant="outline" type="button" onClick={() => setEditing(null)}>Cancel</Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Reports ───────────────────────────────────────────────────────────────────

export function ClinicianReports() {
  const { state } = useWorkspace();
  const role = "clinician" as const;
  const athletes = visibleAthletes(state, role);
  const referrals = scopedRecords(state, role, "referrals");
  const screenings = scopedRecords(state, role, "screenings");

  const cleared = athletes.filter((a) => a.eligibilityStatus === "cleared").length;
  const finalizedEncounters = state.encounters.filter((e) => e.finalized && athletes.some((a) => a.id === e.athleteId)).length;
  const reviewedScreenings = screenings.filter((s) => s.reviewer).length;
  const openReferrals = referrals.filter((r) => r.status !== "completed").length;
  const consentObtained = athletes.filter((a) => state.consents[a.id]?.clinical === "obtained").length;

  // Eligibility chart data
  const eligibilityData = [
    { label: "Cleared", count: cleared, color: "#72E34D" },
    { label: "Monitoring", count: athletes.filter((a) => a.eligibilityStatus === "cleared_with_monitoring").length, color: "#FBBF24" },
    { label: "Restricted", count: athletes.filter((a) => ["sport_specific_restriction", "temporarily_not_cleared"].includes(a.eligibilityStatus)).length, color: "#F97316" },
    { label: "Pending", count: athletes.filter((a) => ["pending_evaluation", "not_cleared"].includes(a.eligibilityStatus)).length, color: "#38BDF8" },
  ].filter((d) => d.count > 0);

  const content = [
    "SafeSport demo report",
    `Scope: Clinician`,
    `Snapshot: ${today}`,
    `Athletes in scope,${athletes.length}`,
    `Cleared without restrictions,${cleared}`,
    `Finalized PPE assessments,${finalizedEncounters}`,
    `Reviewed movement screenings,${reviewedScreenings}`,
    `Open referrals,${openReferrals}`,
    `Clinical consent obtained,${consentObtained}`,
  ].join("\n");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Records"
        title="Reports & readiness"
        description="Counts derived from your current demo workspace. Unrecorded information is incomplete."
      >
        <Export name="clinician-demo-report.csv" content={content} />
      </PageHeader>

      {/* Stat strip */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Athletes in scope" value={athletes.length} icon={Users} accent="neutral" />
        <StatCard label="Cleared for participation" value={cleared} icon={ShieldCheck} accent="green" />
        <StatCard label="Finalized PPE" value={finalizedEncounters} icon={Activity} accent="green" />
        <StatCard label="Reviewed screenings" value={reviewedScreenings} icon={ScanLine} accent="blue" />
        <StatCard label="Open referrals" value={openReferrals} icon={ArrowRightLeft} accent={openReferrals > 0 ? "amber" : "neutral"} />
        <StatCard label="Consent obtained" value={consentObtained} icon={CheckCheck} accent={consentObtained === athletes.length ? "green" : "amber"} />
      </div>

      {/* Eligibility chart */}
      <SectionCard label="Distribution" title="Athlete eligibility breakdown" description="Clinician decisions only. AI movement risk is not included.">
        {eligibilityData.length > 0 ? (
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eligibilityData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.07} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "currentColor", opacity: 0.6 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} cursor={{ fill: "currentColor", fillOpacity: 0.04 }} />
                <Bar dataKey="count" name="Athletes" radius={[4, 4, 0, 0]}>
                  {eligibilityData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState icon={Activity} title="No eligibility data" description="Eligibility decisions will appear here after assessments are finalized." />
        )}
      </SectionCard>

      {/* Team summary */}
      <SectionCard label="Teams" title="Team summary">
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Team</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Sport</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Athletes</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Cleared</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Pending</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {state.teams
                .filter((t) => athletes.some((a) => a.currentTeam?.id === t.id))
                .map((t) => {
                  const teamAthletes = athletes.filter((a) => a.currentTeam?.id === t.id);
                  const teamCleared = teamAthletes.filter((a) => a.eligibilityStatus === "cleared").length;
                  const teamPending = teamAthletes.filter((a) => ["pending_evaluation", "not_cleared", "temporarily_not_cleared"].includes(a.eligibilityStatus)).length;
                  return (
                    <tr key={t.id} className="transition-colors hover:bg-muted/40">
                      <td className="px-4 py-3 font-medium">{t.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{t.sport.name}</td>
                      <td className="px-4 py-3 font-semibold tabular-nums">{teamAthletes.length}</td>
                      <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">{teamCleared}</td>
                      <td className="px-4 py-3 text-amber-600 dark:text-amber-500 font-semibold tabular-nums">{teamPending}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <InfoNote>
        This report summarizes the currently visible demo records. Counts change as records are created or updated. Snapshot: {today}.
      </InfoNote>
    </div>
  );
}

// ── Notifications ─────────────────────────────────────────────────────────────

export function ClinicianNotifications() {
  const { state, setState } = useWorkspace();
  const role = "clinician" as const;
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const notices = state.notices.filter(
    (n) =>
      n.role === role &&
      (filter !== "unread" || !n.read) &&
      n.title.toLowerCase().includes(search.toLowerCase()),
  );

  const unreadCount = state.notices.filter((n) => n.role === role && !n.read).length;

  const mark = (id?: string) =>
    setState((s) => ({
      ...s,
      notices: s.notices.map((n) =>
        n.role === role && (!id || n.id === id) ? { ...n, read: true } : n,
      ),
    }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Connect"
        title="Notifications"
        description={`Clinician · Updates from your local demo workflows.${unreadCount > 0 ? ` ${unreadCount} unread.` : ""}`}
      >
        <Button
          variant="outline"
          size="sm"
          disabled={unreadCount === 0}
          onClick={() => mark()}
          className="gap-1.5"
        >
          <CheckCheck className="size-3.5" aria-hidden="true" />
          Mark all read
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-48 flex-1">
          <Input
            className="text-sm"
            aria-label="Search notifications"
            placeholder="Search notifications…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-0.5 rounded-xl border bg-muted/40 p-1">
          {["all", "unread"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${filter === f ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Notification list */}
      {notices.length === 0 ? (
        <AllClearState
          title={search ? "No matching notifications" : "You're up to date"}
          description="New updates appear when relevant demo records change."
        />
      ) : (
        <div className="space-y-2">
          {notices.map((n) => (
            <article
              key={n.id}
              className={`group flex flex-wrap items-start justify-between gap-3 rounded-xl border p-4 transition-colors hover:bg-muted/40 ${!n.read ? "border-primary/30 bg-primary/5" : ""}`}
            >
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <StatusChip value={n.read ? "read" : "unread"} />
                  <span className="text-xs text-muted-foreground">{n.date.slice(0, 10)}</span>
                </div>
                <p className="text-sm font-semibold leading-snug">{n.title}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Link href={href(role, n.path)}>
                  <Button variant="outline" size="sm">View</Button>
                </Link>
                {!n.read && (
                  <Button variant="ghost" size="sm" onClick={() => mark(n.id)}>
                    Mark read
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Messages ──────────────────────────────────────────────────────────────────

const CONTACTS: (typeof roles[number])[] = ["athlete", "guardian", "physiotherapist", "operations"];

export function ClinicianMessages() {
  const { state, setState } = useWorkspace();
  const role = "clinician" as const;
  const [recipient, setRecipient] = useState<typeof CONTACTS[number]>(CONTACTS[0]);
  const [search, setSearch] = useState("");
  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState<{ url: string; name: string; type: string } | null>(null);
  const [fileKey, setFileKey] = useState(0);

  const thread = [role, recipient].sort().join(":");
  const messages = state.messages.filter(
    (m) => m.thread === thread && (m.sender === role || m.recipient === role),
  );

  const clearFile = () => {
    if (attachment) URL.revokeObjectURL(attachment.url);
    setAttachment(null);
    setFileKey((k) => k + 1);
  };

  function send() {
    if (!text.trim() && !attachment) return;
    const date = new Date().toISOString();
    const id = newId("msg");
    const message: Message = {
      id,
      thread,
      sender: role,
      recipient,
      text: text.trim(),
      date,
      file: attachment?.url,
      fileName: attachment?.name,
      fileType: attachment?.type,
    };
    setState((s) => ({
      ...s,
      messages: [...s.messages, message],
      notices: s.preferences[`${recipient}-messages`] === false ? s.notices : [
        {
          id: `notice-${id}`,
          role: recipient,
          title: `New message from ${s.accounts[role]?.name || identities[role].name}`,
          path: "messages",
          read: false,
          date,
        },
        ...s.notices,
      ],
    }));
    setText("");
    setAttachment(null);
    setFileKey((k) => k + 1);
    toast.success("Message added to the local conversation");
  }

  const filteredContacts = CONTACTS.filter((r) =>
    `${identities[r].name} ${identities[r].title}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Connect"
        title="Messages"
        description="Private demo conversations with your connected care team. Messages are local to this tab only."
      />

      <div className="grid gap-4 lg:grid-cols-[280px_1fr] min-h-[600px]">
        {/* Contacts */}
        <div className="rounded-xl border bg-card">
          <div className="px-4 py-3 border-b">
            <SectionLabel>Conversations</SectionLabel>
            <div className="mt-2">
              <Input
                className="text-sm"
                aria-label="Search contacts"
                placeholder="Search contacts…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="p-2 space-y-1">
            {filteredContacts.map((r) => {
              const threadId = [role, r].sort().join(":");
              const unread = state.messages.filter((m) => m.thread === threadId && m.recipient === role).length;
              return (
                <button
                  key={r}
                  onClick={() => { setRecipient(r); setText(""); clearFile(); }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${recipient === r ? "bg-primary/10 text-foreground" : "hover:bg-muted/60 text-muted-foreground"}`}
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold uppercase">
                    {identities[r].name.slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{state.accounts[r]?.name ?? identities[r].name}</p>
                    <p className="truncate text-xs text-muted-foreground">{identities[r].title}</p>
                  </div>
                  {unread > 0 && (
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Conversation */}
        <div className="flex flex-col rounded-xl border bg-card">
          <div className="flex items-center gap-3 border-b px-5 py-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-bold uppercase">
              {identities[recipient].name.slice(0, 2)}
            </div>
            <div>
              <p className="text-sm font-semibold">{state.accounts[recipient]?.name ?? identities[recipient].name}</p>
              <p className="text-xs text-muted-foreground">{identities[recipient].title} · Demo conversation</p>
            </div>
          </div>

          {/* Message thread */}
          <div
            className="flex flex-1 flex-col gap-3 overflow-y-auto p-4 min-h-64"
            aria-label="Conversation history"
            aria-live="polite"
          >
            {messages.length === 0 ? (
              <div className="m-auto">
                <EmptyState
                  icon={MessageSquare}
                  title="Start a conversation"
                  description="Send a message or attach a file to this local conversation."
                />
              </div>
            ) : messages.map((m) => (
              <article
                key={m.id}
                className={`max-w-[85%] rounded-xl border p-3 ${m.sender === role ? "self-end bg-primary/10" : "self-start bg-muted/40"}`}
              >
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                  {state.accounts[m.sender]?.name ?? identities[m.sender].name}
                </p>
                {m.text && <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{m.text}</p>}
                {m.file && (
                  <div className="mt-2">
                    {m.fileType?.startsWith("image/") && (
                      <Image src={m.file} width={240} height={180} unoptimized className="max-h-40 w-auto rounded-lg object-contain" alt={m.fileName ?? "Attachment"} />
                    )}
                    <a href={m.file} download={m.fileName} className="mt-1 block break-all text-xs underline">{m.fileName}</a>
                  </div>
                )}
                <p className="mt-2 text-[10px] text-muted-foreground">{m.date.slice(0, 16).replace("T", " · ")}</p>
              </article>
            ))}
          </div>

          {/* Compose */}
          <div className="border-t p-4 space-y-3">
            {attachment && (
              <div className="flex items-center gap-2 rounded-lg border p-2 text-xs">
                <span className="flex-1 truncate">{attachment.name}</span>
                <Button variant="ghost" size="sm" onClick={clearFile} className="h-6 px-2">
                  <X className="size-3" aria-hidden="true" /> Remove
                </Button>
              </div>
            )}
            <form
              className="flex gap-2"
              onSubmit={(e) => { e.preventDefault(); send(); }}
            >
              <Textarea
                id="message-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a message…"
                maxLength={5000}
                className="min-h-12 flex-1 resize-none text-sm"
                rows={2}
              />
              <div className="flex flex-col gap-2">
                <div>
                  <Label htmlFor="msg-file" className="cursor-pointer">
                    <div className="flex size-9 items-center justify-center rounded-lg border bg-muted/40 transition-colors hover:bg-muted">
                      <Paperclip className="size-4 text-muted-foreground" aria-hidden="true" />
                    </div>
                    <span className="sr-only">Attach file</span>
                  </Label>
                  <Input
                    key={fileKey}
                    id="msg-file"
                    type="file"
                    className="sr-only"
                    accept="image/*,video/*,application/pdf,text/plain"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      if (f.size > 10 * 1024 * 1024 || !(/^(image|video)\//.test(f.type) || ["application/pdf", "text/plain"].includes(f.type))) {
                        toast.error("Choose an image, video, PDF or text file up to 10 MB.");
                        return;
                      }
                      if (attachment) URL.revokeObjectURL(attachment.url);
                      setAttachment({ url: URL.createObjectURL(f), name: f.name, type: f.type });
                    }}
                  />
                </div>
                <Button type="submit" size="sm" disabled={!text.trim() && !attachment} className="gap-1">
                  <Send className="size-3.5" aria-hidden="true" />
                  Send
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Profile / Account ─────────────────────────────────────────────────────────

export function ClinicianProfile() {
  const { state } = useWorkspace();
  const role = "clinician" as const;
  const authUser = useAuthStore((auth) => auth.user);
  const setSession = useAuthStore((auth) => auth.setSession);
  const authName = authUser && authUser.role === role ? `${authUser.first_name} ${authUser.last_name}` : "";
  const authEmail = authUser && authUser.role === role ? authUser.email : "";
  const profile = authUser && authUser.role === role ? authUser.profile_data : {};
  const [form, setForm] = useState(
    state.accounts[role] ?? {
      name: authName || identities[role].name,
      email: authEmail || identities[role].email,
      phone: profile.phone || "",
    },
  );

  useEffect(() => {
    if (authName && authEmail) {
      setForm((current) => ({ ...current, name: authName, email: authEmail, phone: profile.phone || current.phone }));
    }
  }, [authEmail, authName, profile.phone]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Account"
        title="My account"
        description={`${identities[role].title} · Personal account details from your SafeSport session.`}
      />

      <FormCard title="Personal details" description="Update your profile details stored on your SafeSport account.">
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const [firstName, ...lastNameParts] = form.name.trim().split(/\s+/);
            try {
              const session = await authApi.updateMe({
                first_name: firstName || form.name.trim(),
                last_name: lastNameParts.join(" ") || authUser?.last_name || "-",
                phone: form.phone,
              });
              setSession(session.user);
              toast.success("Profile updated");
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Unable to update profile");
            }
          }}
        >
          <Field label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <Field label="Email" type="email" value={form.email} onChange={() => undefined} disabled />
          <Field label="Phone" type="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <div className="flex gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={() =>
                setForm(state.accounts[role] ?? {
                  name: authName || identities[role].name,
                  email: authEmail || identities[role].email,
                  phone: profile.phone || "",
                })
              }
            >
              Cancel changes
            </Button>
            <Button type="submit">Save profile</Button>
          </div>
        </form>
      </FormCard>
    </div>
  );
}
