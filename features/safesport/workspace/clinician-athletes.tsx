"use client";
/**
 * clinician-athletes.tsx
 * Redesigned Athletes list and Athlete detail for the Clinician workspace.
 * Uses clinician-ui.tsx design system. Preserves all existing data logic.
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
import {
Select,
SelectContent,
SelectItem,
SelectTrigger,
SelectValue,
} from "@/components/ui/select";
import {
Activity,
ArrowRightLeft,
CalendarDays,
ChevronRight,
ClipboardList,
Search,
ShieldCheck,
Stethoscope,
UserPlus,
Users
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { Athlete } from "../types";
import { href,human } from "./catalog";
import { ConsentScreen } from "./clinical";
import {
EmptyState,
HeroBanner,
InfoGrid,
InfoNote,
PageHeader,
ProgressBar,
SectionCard,
StatCard,
StatusChip,
TabStrip
} from "./clinician-ui";
import {
fullName,
newId,
today,
useWorkspace,
visibleAthletes,
} from "./store";
import { Choice,Field } from "./ui";

// ── Athletes list ─────────────────────────────────────────────────────────────

export function ClinicianAthletes({ id }: { id?: string }) {
  const { state } = useWorkspace();
  const athletes = visibleAthletes(state, "clinician");

  if (id) {
    const athlete = athletes.find((a) => a.id === id);
    if (!athlete)
      return (
        <div className="space-y-6">
          <PageHeader
            title="Athlete unavailable"
            back={{ label: "Back to athletes", href: href("clinician", "athletes") }}
          />
          <EmptyState
            icon={Users}
            title="Athlete not in scope"
            description="This athlete is not within your current demo workspace."
            action={
              <Link href={href("clinician", "athletes")}>
                <Button variant="outline" size="sm">Back to athletes</Button>
              </Link>
            }
          />
        </div>
      );
    return <AthleteDetail athlete={athlete} />;
  }

  return <AthletesList athletes={athletes} />;
}

// ── Athletes list view ────────────────────────────────────────────────────────

function AthletesList({ athletes }: { athletes: Athlete[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [registerOpen, setRegisterOpen] = useState(false);

  const cleared = athletes.filter((a) => a.eligibilityStatus === "cleared").length;
  const monitoring = athletes.filter((a) =>
    ["cleared_with_monitoring", "sport_specific_restriction"].includes(a.eligibilityStatus)
  ).length;
  const pending = athletes.filter((a) =>
    ["pending_evaluation", "temporarily_not_cleared", "not_cleared"].includes(a.eligibilityStatus)
  ).length;

  const filtered = athletes.filter((a) => {
    const nameMatch = fullName(a).toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase());
    const statusMatch = statusFilter === "all" || a.eligibilityStatus === statusFilter;
    return nameMatch && statusMatch;
  });

  const statusOptions = [
    { value: "all", label: "All statuses" },
    { value: "cleared", label: "Cleared" },
    { value: "cleared_with_monitoring", label: "Monitoring" },
    { value: "sport_specific_restriction", label: "Restricted" },
    { value: "pending_evaluation", label: "Pending" },
    { value: "temporarily_not_cleared", label: "Temp. not cleared" },
    { value: "not_cleared", label: "Not cleared" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Clinician workspace"
        title="Athletes"
        description="One SafeSport ID connects each athlete's participation, care and follow-up across organisations."
      >
        <Button size="sm" onClick={() => setRegisterOpen(true)} className="gap-1.5">
          <UserPlus className="size-3.5" aria-hidden="true" />
          Register athlete
        </Button>
      </PageHeader>

      {/* Stat strip */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Athletes in scope" value={athletes.length} icon={Users} accent="neutral" />
        <StatCard label="Cleared" value={cleared} sub={athletes.length ? `${Math.round((cleared / athletes.length) * 100)}%` : undefined} icon={ShieldCheck} accent="green" />
        <StatCard label="Monitoring / restricted" value={monitoring} icon={Activity} accent="amber" />
        <StatCard label="Pending / not cleared" value={pending} icon={ClipboardList} accent={pending > 0 ? "red" : "neutral"} />
      </div>

      {/* Table */}
      <SectionCard
        label="Directory"
        title="Athlete register"
        description="All athletes within your current role scope."
      >
        {/* Filters */}
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div className="relative min-w-48 flex-1">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" aria-hidden="true" />
            <Input
              className="pl-9 text-sm"
              placeholder="Search name or ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search athletes"
            />
          </div>
          <Select value={statusFilter} onValueChange={(value) => value !== null && setStatusFilter(value)} items={statusOptions}>
            <SelectTrigger className="w-44 text-sm" aria-label="Filter by status">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title={search || statusFilter !== "all" ? "No matching athletes" : "No athletes registered"}
            description={
              search || statusFilter !== "all"
                ? "Try adjusting your search or filter."
                : "Register the first athlete to get started."
            }
            action={
              search || statusFilter !== "all" ? (
                <Button variant="outline" size="sm" onClick={() => { setSearch(""); setStatusFilter("all"); }}>
                  Clear filters
                </Button>
              ) : (
                <Button size="sm" onClick={() => setRegisterOpen(true)}>Register athlete</Button>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Athlete</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Team / Sport</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Eligibility</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Next review</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.map((a) => (
                  <tr key={a.id} className="group transition-colors hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <Link href={href("clinician", `athletes/${a.id}`)} className="outline-none focus-visible:underline">
                        <p className="font-semibold text-foreground">{fullName(a)}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{a.id} · {a.age} yrs</p>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm">{a.currentTeam?.name ?? "—"}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{a.currentSport?.name ?? "—"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusChip value={a.eligibilityStatus} />
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {a.nextReview?.slice(0, 10) ?? "Not scheduled"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={href("clinician", `athletes/${a.id}`)}>
                        <Button variant="outline" size="sm" className="gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100">
                          Open
                          <ChevronRight className="size-3" aria-hidden="true" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-2 text-xs text-muted-foreground">{filtered.length} of {athletes.length} athletes</p>
      </SectionCard>

      {/* Register dialog */}
      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Register athlete</DialogTitle>
            <DialogDescription>
              Create a draft record. Consent and clinical eligibility are not inferred from registration.
            </DialogDescription>
          </DialogHeader>
          {registerOpen && (
            <RegistrationForm onClose={() => setRegisterOpen(false)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Registration form ─────────────────────────────────────────────────────────

function RegistrationForm({ onClose }: { onClose: () => void }) {
  const { state, update } = useWorkspace();
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "other",
    team: state.teams[0]?.id || "",
    contact: "",
    phone: "",
    guardian: "",
  });
  const patch = (key: string, value: string) => setForm({ ...form, [key]: value });

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const id = newId("ATH");
        const team = state.teams.find((t) => t.id === form.team);
        const organization = state.organizations.find((o) => o.id === team?.organizationId);
        const age = 2026 - Number(form.dob.slice(0, 4)) - (form.dob.slice(5) > "09-24" ? 1 : 0);
        if (age < 18 && !form.guardian.trim()) {
          toast.error("A guardian is required for a minor.");
          return;
        }
        const athlete: Athlete = {
          id,
          firstName: form.firstName,
          lastName: form.lastName,
          dateOfBirth: form.dob,
          age,
          gender: form.gender as Athlete["gender"],
          currentTeam: team,
          currentSport: team?.sport,
          currentOrganization: organization,
          eligibilityStatus: "pending_evaluation",
          readiness: "under_review",
          organizations: organization ? [{ organizationId: organization.id, organization, joinedAt: today, status: "active" }] : [],
          teams: team ? [{ teamId: team.id, team, sport: team.sport, joinedAt: today, status: "active" }] : [],
          ppeAssessments: [],
          incidents: [],
          screenings: [],
          referrals: [],
          eligibilityHistory: [],
          createdAt: today,
          updatedAt: today,
        };
        update(
          (s) => ({
            ...s,
            athletes: [athlete, ...s.athletes],
            registration: {
              ...s.registration,
              [`${id}-emergency`]: `${form.contact} · ${form.phone}`,
              [`${id}-guardian`]: form.guardian,
            },
          }),
          "Athlete draft registered",
          "clinician",
          `athletes/${id}`,
        );
        onClose();
        router.push(href("clinician", `athletes/${id}`));
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name" value={form.firstName} onChange={(v) => patch("firstName", v)} required />
        <Field label="Last name" value={form.lastName} onChange={(v) => patch("lastName", v)} required />
        <Field label="Date of birth" type="date" min="1920-01-01" max={today} value={form.dob} onChange={(v) => patch("dob", v)} required />
        <Choice label="Sex" value={form.gender} onChange={(v) => patch("gender", v)} options={["male", "female", "other"]} />
      </div>
      <Choice
        label="Institution / team"
        value={form.team}
        onChange={(v) => patch("team", v)}
        options={state.teams.map((t) => ({
          value: t.id,
          label: `${state.organizations.find((o) => o.id === t.organizationId)?.name} · ${t.name}`,
        }))}
      />
      <Field label="Parent / guardian (required for minors)" value={form.guardian} onChange={(v) => patch("guardian", v)} />
      <Field label="Emergency contact name" value={form.contact} onChange={(v) => patch("contact", v)} required />
      <Field label="Emergency contact phone" type="tel" value={form.phone} onChange={(v) => patch("phone", v)} required />
      <div className="flex justify-end gap-2 border-t pt-4">
        <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
        <Button type="submit">Create record</Button>
      </div>
    </form>
  );
}

// ── Athlete detail ────────────────────────────────────────────────────────────

const DETAIL_TABS = [
  { id: "overview", label: "Overview" },
  { id: "assessments", label: "Assessments" },
  { id: "referrals", label: "Referrals" },
  { id: "rehabilitation", label: "Rehab" },
  { id: "timeline", label: "Timeline" },
  { id: "consent", label: "Consent" },
];

function AthleteDetail({ athlete: a }: { athlete: Athlete }) {
  const { state } = useWorkspace();
  const [activeTab, setActiveTab] = useState("overview");

  const encounters = state.encounters.filter((e) => e.athleteId === a.id);
  const referrals = state.records.referrals.filter((r) => r.athleteId === a.id);
  const screenings = state.records.screenings.filter((s) => s.athleteId === a.id);
  const plans = state.records.plans.filter((p) => p.athleteId === a.id);
  const finalized = encounters.find((e) => e.finalized);
  const consent = state.consents[a.id];

  const tabs = DETAIL_TABS.map((t) => ({
    ...t,
    count:
      t.id === "assessments" ? encounters.length :
      t.id === "referrals" ? referrals.length :
      t.id === "rehabilitation" ? plans.length :
      undefined,
  }));

  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <HeroBanner
        eyebrow="Athlete record"
        title={fullName(a)}
        description={`${a.id} · ${a.age} years · ${a.currentSport?.name ?? "Sport not assigned"} · ${a.currentOrganization?.name ?? "No organisation"}`}
        footer={
          <div className="flex flex-wrap items-center gap-3">
            <StatusChip value={a.eligibilityStatus} />
            {consent && (
              <StatusChip value={consent.clinical === "obtained" ? "obtained" : consent.clinical} />
            )}
            {a.nextReview && (
              <span className="text-xs text-muted-foreground">
                Next review: {a.nextReview.slice(0, 10)}
              </span>
            )}
          </div>
        }
      >
        <Link href={href("clinician", "athletes")}>
          <Button variant="outline" size="sm">← All athletes</Button>
        </Link>
        <Link href={href("clinician", `assessments/new?athleteId=${a.id}`)}>
          <Button size="sm" className="gap-1.5">
            <Stethoscope className="size-3.5" aria-hidden="true" />
            Start PPE
          </Button>
        </Link>
      </HeroBanner>

      {/* Tab strip */}
      <TabStrip tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {/* Tab content */}
      {activeTab === "overview" && (
        <div className="space-y-5">
          <SectionCard label="Identity" title="Athlete information">
            <InfoGrid items={[
              { label: "SafeSport ID", value: a.id },
              { label: "Full name", value: fullName(a) },
              { label: "Date of birth", value: a.dateOfBirth },
              { label: "Age", value: `${a.age} years` },
              { label: "Sex", value: a.gender ? human(a.gender) : "—" },
              { label: "Sport", value: a.currentSport?.name ?? "—" },
              { label: "Team", value: a.currentTeam?.name ?? "—" },
              { label: "Organisation", value: a.currentOrganization?.name ?? "—" },
              { label: "Next review", value: a.nextReview?.slice(0, 10) ?? "Not scheduled" },
            ]} />
          </SectionCard>

          {finalized && (
            <SectionCard label="Clinical decision" title="Participation status">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <StatusChip value={finalized.decision} />
                </div>
                <InfoGrid items={[
                  { label: "Decision", value: human(finalized.decision) },
                  { label: "Restrictions", value: finalized.restrictions || "None recorded" },
                  { label: "Monitoring / plan", value: finalized.plan || "None specified" },
                  { label: "Review date", value: finalized.reviewDate },
                  { label: "Signed by", value: finalized.signature },
                  { label: "Assessment date", value: finalized.date },
                ]} />
              </div>
            </SectionCard>
          )}

          {!finalized && (
            <InfoNote variant="warning">
              No finalized PPE assessment for this athlete. Start an assessment to record an eligibility decision.
            </InfoNote>
          )}
        </div>
      )}

      {activeTab === "assessments" && (
        <SectionCard label="Clinical" title="Assessment history" description="PPE encounters for this athlete.">
          {encounters.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No assessments yet"
              description="Start a PPE assessment to begin the clinical record."
              action={
                <Link href={href("clinician", "assessments")}>
                  <Button size="sm">Start assessment</Button>
                </Link>
              }
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Assessment</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Status</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Date</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Decision</th>
                    <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {encounters.map((e) => (
                    <tr key={e.id} className="group transition-colors hover:bg-muted/40">
                      <td className="px-4 py-3">
                        <p className="font-medium">{e.id}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{e.finalized ? "Finalized" : "In progress"}</p>
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      )}

      {activeTab === "referrals" && (
        <SectionCard label="Care" title="Referrals" description="Active and completed referrals for this athlete.">
          {referrals.length === 0 ? (
            <EmptyState
              icon={ArrowRightLeft}
              title="No referrals"
              description="Referrals are created during a PPE assessment or from the Referrals page."
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Type</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Urgency</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Status</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Date</th>
                    <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {referrals.map((r) => (
                    <tr key={r.id} className="group transition-colors hover:bg-muted/40">
                      <td className="px-4 py-3 font-medium">{human(r.kind)}</td>
                      <td className="px-4 py-3">{r.urgency ? <StatusChip value={r.urgency} /> : "—"}</td>
                      <td className="px-4 py-3"><StatusChip value={r.status} /></td>
                      <td className="px-4 py-3 text-muted-foreground">{r.date?.slice(0, 10) ?? "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <Link href={href("clinician", `referrals/${r.id}`)}>
                          <Button variant="outline" size="sm" className="gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100">
                            Open <ChevronRight className="size-3" aria-hidden="true" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      )}

      {activeTab === "rehabilitation" && (
        <SectionCard label="Rehab" title="Rehabilitation plans" description="Active and completed plans for this athlete.">
          {plans.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="No rehabilitation plans"
              description="Plans are created from the Rehabilitation workspace after a referral."
            />
          ) : (
            <div className="space-y-3">
              {plans.map((p) => (
                <div key={p.id} className="rounded-xl border bg-card p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-sm">{p.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{p.id} · {p.date?.slice(0, 10)}</p>
                    </div>
                    <StatusChip value={p.status} />
                  </div>
                  {p.progress !== undefined && (
                    <ProgressBar value={p.progress} label="Progress" />
                  )}
                  <p className="text-xs text-muted-foreground leading-relaxed">{p.notes}</p>
                  <p className="text-xs text-muted-foreground">Assigned: {p.assigned}</p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      )}

      {activeTab === "timeline" && (
        <SectionCard label="History" title="Athlete timeline" description="Chronological record of care events.">
          {(() => {
            const events = [
              ...encounters.map((e) => ({
                id: e.id,
                type: "Assessment",
                title: `PPE · ${e.finalized ? "Finalized" : "In progress"}`,
                status: e.status,
                date: e.date,
                detail: e.finalized ? `Decision: ${human(e.decision)}` : "Awaiting finalization",
                href: href("clinician", `assessments/${e.id}`),
              })),
              ...screenings.map((s) => ({
                id: s.id,
                type: "Screening",
                title: `Movement · ${human(s.kind)}`,
                status: s.status,
                date: s.date,
                detail: s.risk ? `AI risk: ${s.risk}` : "Processing",
                href: href("clinician", `screenings/${s.id}`),
              })),
              ...referrals.map((r) => ({
                id: r.id,
                type: "Referral",
                title: human(r.kind),
                status: r.status,
                date: r.date,
                detail: `Assigned: ${r.assigned || "Unassigned"}`,
                href: href("clinician", `referrals/${r.id}`),
              })),
            ].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

            if (events.length === 0) {
              return <EmptyState icon={CalendarDays} title="No timeline events" description="Events appear as care records are created." />;
            }

            return (
              <div className="space-y-2">
                {events.map((ev) => (
                  <Link
                    key={ev.id}
                    href={ev.href}
                    className="group flex items-start gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className="mt-1.5 size-2 shrink-0 rounded-full bg-primary/60" aria-hidden="true" />
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p className="text-sm font-medium">{ev.title}</p>
                      <p className="text-xs text-muted-foreground">{ev.detail}</p>
                    </div>
                    <div className="shrink-0 text-right space-y-1">
                      <StatusChip value={ev.status} />
                      <p className="text-[10px] text-muted-foreground">{ev.date?.slice(0, 10)}</p>
                    </div>
                    <ChevronRight className="mt-0.5 size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            );
          })()}
        </SectionCard>
      )}

      {activeTab === "consent" && (
        <div className="space-y-5">
          <ConsentScreen role="clinician" athleteId={a.id} />
        </div>
      )}
    </div>
  );
}
