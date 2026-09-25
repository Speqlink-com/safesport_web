"use client";
/**
 * ClinicianHome — redesigned overview for the Clinician workspace.
 *
 * Uses only existing data from the WorkspaceProvider store and Recharts
 * (already installed). No new dependencies, no new routes, no backend changes.
 *
 * Composition:
 *   1. Hero header   — greeting, date/context, quick-action buttons
 *   2. KPI strip     — 4 compact clinical workload indicators
 *   3. Charts row    — Eligibility donut · PPE completion bar · Referral urgency bar
 *   4. Priority queue — items needing clinical attention now
 *   5. Two-column    — Upcoming care events · Recent activity
 */

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  ArrowRight,
  ArrowRightLeft,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  RefreshCw,
  ShieldCheck,
  Stethoscope,
  TriangleAlert,
  Users,
} from "lucide-react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { href, identities } from "./catalog";
import { scopedRecords } from "./records";
import { fullName, today, useWorkspace, visibleAthletes } from "./store";

// ── Tiny design primitives ────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
      {children}
    </p>
  );
}

function Divider() {
  return <div className="h-px bg-border/50" />;
}

/**
 * Eligibility status → { label, color (tailwind bg class), hex for chart }
 */
const ELIGIBILITY_META: Record<
  string,
  { label: string; tw: string; hex: string }
> = {
  cleared: {
    label: "Cleared",
    tw: "bg-emerald-500",
    hex: "var(--color-primary, #72E34D)",
  },
  cleared_with_monitoring: {
    label: "Monitoring",
    tw: "bg-amber-400",
    hex: "#FBBF24",
  },
  sport_specific_restriction: {
    label: "Restricted",
    tw: "bg-orange-500",
    hex: "#F97316",
  },
  pending_evaluation: {
    label: "Pending",
    tw: "bg-sky-400",
    hex: "#38BDF8",
  },
  temporarily_not_cleared: {
    label: "Not cleared",
    tw: "bg-red-500",
    hex: "#EF4444",
  },
  not_cleared: {
    label: "Not cleared",
    tw: "bg-red-700",
    hex: "#B91C1C",
  },
};

function EligibilityDot({ status }: { status: string }) {
  const meta = ELIGIBILITY_META[status];
  if (!meta) return null;
  return (
    <span
      className={`inline-block size-2 rounded-full ${meta.tw} shrink-0`}
      aria-hidden="true"
    />
  );
}

/**
 * Urgency → badge color
 */
function UrgencyBadge({ urgency }: { urgency?: string }) {
  const map: Record<string, string> = {
    emergency: "bg-red-500/15 text-red-600 dark:text-red-400",
    urgent: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
    priority: "bg-amber-500/15 text-amber-600 dark:text-amber-500",
    routine: "bg-muted text-muted-foreground",
  };
  const label = urgency || "routine";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${map[label] ?? map.routine}`}
    >
      {label}
    </span>
  );
}

// ── KPI card ──────────────────────────────────────────────────────────────────

interface KpiProps {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ElementType;
  accent?: "green" | "amber" | "red" | "blue" | "neutral";
  to: string;
}

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = "neutral",
  to,
}: KpiProps) {
  const accentMap = {
    green: "text-emerald-500",
    amber: "text-amber-500",
    red: "text-red-500",
    blue: "text-sky-500",
    neutral: "text-muted-foreground",
  };
  return (
    <Link
      href={to}
      className={[
        "group relative flex flex-col gap-3 rounded-xl border bg-card p-5",
        "transition-all duration-150",
        "hover:border-primary/40 hover:shadow-sm hover:shadow-primary/5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground leading-tight">
          {label}
        </p>
        <Icon
          className={`size-4 shrink-0 transition-colors ${accentMap[accent]} group-hover:opacity-90`}
          aria-hidden="true"
        />
      </div>
      <div className="space-y-0.5">
        <p className="text-3xl font-bold tracking-tight leading-none">
          {value}
        </p>
        {sub && (
          <p className="text-xs text-muted-foreground leading-snug">{sub}</p>
        )}
      </div>
      <ChevronRight
        className="absolute bottom-4 right-4 size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden="true"
      />
    </Link>
  );
}

// ── Priority item ─────────────────────────────────────────────────────────────

interface PriorityItemProps {
  icon: React.ElementType;
  iconColor: string;
  title: string;
  sub: string;
  badge?: React.ReactNode;
  to: string;
}

function PriorityItem({
  icon: Icon,
  iconColor,
  title,
  sub,
  badge,
  to,
}: PriorityItemProps) {
  return (
    <Link
      href={to}
      className={[
        "group flex items-start gap-3.5 rounded-lg px-3 py-3",
        "transition-colors hover:bg-muted/60",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      ].join(" ")}
    >
      <div
        className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg ${iconColor}`}
      >
        <Icon className="size-3.5" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="truncate text-sm font-medium leading-snug">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{sub}</p>
      </div>
      {badge && <div className="shrink-0 self-center">{badge}</div>}
      <ChevronRight
        className="mt-0.5 size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden="true"
      />
    </Link>
  );
}

// ── Event row ─────────────────────────────────────────────────────────────────

function EventRow({
  title,
  detail,
  date,
  to,
}: {
  title: string;
  detail: string;
  date: string;
  to: string;
}) {
  // Format "2026-09-25T09:00" → "25 Sep · 09:00"
  const fmt = (d: string) => {
    try {
      const [datePart, timePart] = d.includes("T") ? d.split("T") : [d, ""];
      const [, m, day] = datePart.split("-");
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const label = `${parseInt(day, 10)} ${months[parseInt(m, 10) - 1]}`;
      return timePart ? `${label} · ${timePart.slice(0, 5)}` : label;
    } catch {
      return d.slice(0, 10);
    }
  };

  return (
    <Link
      href={to}
      className={[
        "group flex items-center gap-3 rounded-lg px-3 py-2.5",
        "transition-colors hover:bg-muted/60",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      ].join(" ")}
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <CalendarDays className="size-3.5 text-primary" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium leading-snug">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{detail}</p>
      </div>
      <p className="shrink-0 text-[11px] font-medium text-muted-foreground whitespace-nowrap">
        {fmt(date)}
      </p>
      <ChevronRight
        className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden="true"
      />
    </Link>
  );
}

// ── Activity row ──────────────────────────────────────────────────────────────

function ActivityRow({
  title,
  actor,
  date,
}: {
  title: string;
  actor: string;
  date: string;
}) {
  return (
    <div className="flex items-start gap-3 px-3 py-2.5">
      <div
        className="mt-1 size-1.5 shrink-0 rounded-full bg-primary/60"
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {actor} · {date.slice(0, 10)}
        </p>
      </div>
    </div>
  );
}

// ── Custom Recharts tooltip ───────────────────────────────────────────────────

function ChartTip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color?: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
      {label && <p className="mb-1 font-medium text-foreground">{label}</p>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span
            className="size-2 rounded-full"
            style={{ background: p.color }}
            aria-hidden="true"
          />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-medium text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────────

export function ClinicianHome() {
  const { state } = useWorkspace();
  const role = "clinician" as const;

  // ── Derive data ─────────────────────────────────────────────────────────────
  const athletes = visibleAthletes(state, role);
  const encounters = state.encounters.filter((e) =>
    athletes.some((a) => a.id === e.athleteId),
  );
  const referrals = scopedRecords(state, role, "referrals");
  const screenings = scopedRecords(state, role, "screenings");
  const incidents = scopedRecords(state, role, "incidents");
  const events = scopedRecords(state, role, "events").filter(
    (e) => e.status === "scheduled",
  );
  const notices = state.notices.filter((n) => n.role === role && !n.read);
  const user = state.accounts[role]?.name || identities[role].name;
  const firstName =
    user.split(" ")[0] === "Dr"
      ? user.split(" ").slice(0, 2).join(" ")
      : user.split(" ")[0];

  // KPI values
  const openReferrals = referrals.filter(
    (r) => r.status !== "completed",
  ).length;
  const aiPending = screenings.filter(
    (s) => s.status === "ready_for_review",
  ).length;
  const incompleteEncounters = encounters.filter((e) => !e.finalized).length;
  const upcomingCount = events.length;
  const totalEncounters = encounters.length;
  const finalizedCount = encounters.filter((e) => e.finalized).length;
  const ppeProgress =
    totalEncounters > 0
      ? Math.round((finalizedCount / totalEncounters) * 100)
      : 0;

  // ── Chart data ──────────────────────────────────────────────────────────────

  // 1. Eligibility distribution donut
  const eligibilityGroups = [
    {
      name: "Cleared",
      value: athletes.filter((a) => a.eligibilityStatus === "cleared").length,
      color: "#72E34D",
    },
    {
      name: "Monitoring",
      value: athletes.filter(
        (a) => a.eligibilityStatus === "cleared_with_monitoring",
      ).length,
      color: "#FBBF24",
    },
    {
      name: "Restricted",
      value: athletes.filter((a) =>
        ["sport_specific_restriction", "temporarily_not_cleared"].includes(
          a.eligibilityStatus,
        ),
      ).length,
      color: "#F97316",
    },
    {
      name: "Pending",
      value: athletes.filter((a) =>
        ["pending_evaluation", "not_cleared"].includes(a.eligibilityStatus),
      ).length,
      color: "#38BDF8",
    },
  ].filter((d) => d.value > 0);

  // 2. PPE completion bar (per assessment stage)
  const ppeStages = [
    {
      stage: "Consent",
      count: encounters.filter(
        (e) => (e.vitals && Object.keys(e.vitals).length > 0) || e.reviewed,
      ).length,
    },
    { stage: "History", count: encounters.filter((e) => e.reviewed).length },
    {
      stage: "Exam",
      count: encounters.filter((e) => Object.keys(e.exam).length > 0).length,
    },
    {
      stage: "Baseline",
      count: encounters.filter((e) => Object.keys(e.baseline).length > 0)
        .length,
    },
    { stage: "Complete", count: encounters.filter((e) => e.finalized).length },
  ];

  // 3. Referral urgency distribution bar
  const urgencyData = [
    {
      urgency: "Routine",
      count: referrals.filter((r) => r.urgency === "routine").length,
      color: "#94A3B8",
    },
    {
      urgency: "Priority",
      count: referrals.filter((r) => r.urgency === "priority").length,
      color: "#FBBF24",
    },
    {
      urgency: "Urgent",
      count: referrals.filter((r) => r.urgency === "urgent").length,
      color: "#F97316",
    },
    {
      urgency: "Emergency",
      count: referrals.filter((r) => r.urgency === "emergency").length,
      color: "#EF4444",
    },
  ].filter((d) => d.count > 0);

  // ── Priority queue items ─────────────────────────────────────────────────────
  type PriorityQueueItem = {
    id: string;
    icon: React.ElementType;
    iconColor: string;
    title: string;
    sub: string;
    badge?: React.ReactNode;
    to: string;
  };

  const priorityItems: PriorityQueueItem[] = [];

  // Unread notices (clinical actions)
  notices.slice(0, 2).forEach((n) => {
    priorityItems.push({
      id: n.id,
      icon: AlertCircle,
      iconColor: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
      title: n.title,
      sub: `Notification · ${n.date.slice(0, 10)}`,
      badge: <UrgencyBadge urgency="priority" />,
      to: href(role, n.path),
    });
  });

  // Blocked encounters (consent issues)
  encounters
    .filter((e) => e.status === "blocked")
    .slice(0, 2)
    .forEach((e) => {
      const athlete = athletes.find((a) => a.id === e.athleteId);
      priorityItems.push({
        id: e.id,
        icon: ShieldCheck,
        iconColor: "bg-red-500/10 text-red-600 dark:text-red-400",
        title: `PPE blocked — ${athlete ? fullName(athlete) : e.athleteId}`,
        sub: "Consent required before clinical assessment can continue",
        badge: <UrgencyBadge urgency="urgent" />,
        to: href(role, `assessments/${e.id}`),
      });
    });

  // AI reviews pending
  if (aiPending > 0) {
    priorityItems.push({
      id: "ai-queue",
      icon: BrainCircuit,
      iconColor: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
      title: `${aiPending} movement screening${aiPending > 1 ? "s" : ""} awaiting clinical review`,
      sub: "AI processing complete — human interpretation required",
      badge: (
        <span className="inline-flex items-center rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-semibold text-sky-600 dark:text-sky-400">
          {aiPending} pending
        </span>
      ),
      to: href(role, "ai-reviews"),
    });
  }

  // Overdue referrals
  referrals
    .filter((r) => r.status === "overdue")
    .slice(0, 2)
    .forEach((r) => {
      const athlete = athletes.find((a) => a.id === r.athleteId);
      priorityItems.push({
        id: r.id,
        icon: ArrowRightLeft,
        iconColor: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
        title: `Overdue referral — ${athlete ? fullName(athlete) : r.athleteId}`,
        sub: `${r.kind?.replaceAll("_", " ") || "Referral"} · ${r.date?.slice(0, 10)}`,
        badge: <UrgencyBadge urgency="urgent" />,
        to: href(role, `referrals/${r.id}`),
      });
    });

  // Incomplete encounters without blocking condition (just in progress)
  encounters
    .filter((e) => !e.finalized && e.status !== "blocked")
    .slice(0, 1)
    .forEach((e) => {
      const athlete = athletes.find((a) => a.id === e.athleteId);
      priorityItems.push({
        id: `in-progress-${e.id}`,
        icon: ClipboardList,
        iconColor: "bg-primary/10 text-primary",
        title: `PPE in progress — ${athlete ? fullName(athlete) : e.athleteId}`,
        sub: `Assessment started ${e.date} · Awaiting finalisation`,
        badge: <UrgencyBadge urgency="routine" />,
        to: href(role, `assessments/${e.id}`),
      });
    });

  // Incidents open
  incidents
    .filter((i) => i.status === "under_review" || i.status === "reported")
    .slice(0, 1)
    .forEach((i) => {
      const athlete = athletes.find((a) => a.id === i.athleteId);
      priorityItems.push({
        id: i.id,
        icon: TriangleAlert,
        iconColor: "bg-red-500/10 text-red-600 dark:text-red-400",
        title: `Incident — ${athlete ? fullName(athlete) : i.athleteId}`,
        sub: `${i.kind?.replaceAll("_", " ") || "Incident"} · ${i.urgency || "moderate"} severity · ${i.date?.slice(0, 10)}`,
        badge: (
          <UrgencyBadge
            urgency={i.urgency === "moderate" ? "priority" : i.urgency}
          />
        ),
        to: href(role, `incidents/${i.id}`),
      });
    });

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      {/* ── 1. HERO HEADER ──────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border bg-card">
        {/* Subtle gradient accent */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.07]"
          style={{
            background:
              "radial-gradient(ellipse 60% 80% at 100% 0%, var(--color-primary) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />

        <div className="relative px-6 py-6 sm:px-8 sm:py-7">
          <div className="flex flex-wrap items-start justify-between gap-5">
            {/* Left: greeting + context */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Clinician workspace · {today}
              </p>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Good morning, {firstName}
              </h1>
              <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
                {notices.length > 0
                  ? `You have ${notices.length} unread notification${notices.length > 1 ? "s" : ""} and ${incompleteEncounters} incomplete PPE assessment${incompleteEncounters !== 1 ? "s" : ""} in your queue.`
                  : `${athletes.length} athlete${athletes.length !== 1 ? "s" : ""} in scope · ${openReferrals} open referral${openReferrals !== 1 ? "s" : ""} · ${upcomingCount} upcoming appointment${upcomingCount !== 1 ? "s" : ""}.`}
              </p>
            </div>

            {/* Right: quick actions */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                nativeButton={false}
                role="link"
                render={<Link href={href(role, "athletes")} />}
              >
                <Users className="size-3.5" aria-hidden="true" />
                Athletes
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                nativeButton={false}
                role="link"
                render={<Link href={href(role, "assessments")} />}
              >
                <Stethoscope className="size-3.5" aria-hidden="true" />
                PPE assessments
              </Button>
              <Button
                size="sm"
                className="gap-1.5 text-xs"
                nativeButton={false}
                role="link"
                render={<Link href={href(role, "assessments")} />}
              >
                Open assessments
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Button>
            </div>
          </div>

          {/* PPE completion progress bar */}
          {totalEncounters > 0 && (
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  PPE completion ·{" "}
                  <span className="font-medium text-foreground">
                    {finalizedCount}/{totalEncounters}
                  </span>{" "}
                  assessments finalised
                </span>
                <span className="font-semibold text-foreground">
                  {ppeProgress}%
                </span>
              </div>
              <Progress value={ppeProgress} className="h-1.5" />
            </div>
          )}
        </div>
      </div>

      {/* ── 2. KPI STRIP ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard
          label="Athletes in scope"
          value={athletes.length}
          sub="Across all organisations"
          icon={Users}
          accent="green"
          to={href(role, "athletes")}
        />
        <KpiCard
          label="Cleared for participation"
          value={
            athletes.filter((a) => a.eligibilityStatus === "cleared").length
          }
          sub={
            athletes.length
              ? `${Math.round(
                  (athletes.filter((a) => a.eligibilityStatus === "cleared")
                    .length /
                    athletes.length) *
                    100,
                )}% of athletes`
              : "No athletes"
          }
          icon={ShieldCheck}
          accent="green"
          to={href(role, "eligibility")}
        />
        <KpiCard
          label="Open referrals"
          value={openReferrals}
          sub={`${referrals.filter((r) => r.status === "overdue").length} overdue`}
          icon={ArrowRightLeft}
          accent={
            referrals.filter((r) => r.status === "overdue").length > 0
              ? "red"
              : "amber"
          }
          to={href(role, "referrals")}
        />
        <KpiCard
          label="AI reviews pending"
          value={aiPending}
          sub="Awaiting clinical interpretation"
          icon={BrainCircuit}
          accent={aiPending > 0 ? "blue" : "neutral"}
          to={href(role, "ai-reviews")}
        />
      </div>

      {/* ── 3. CHARTS ROW ───────────────────────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* 3a. Eligibility distribution donut */}
        <div className="flex min-w-0 flex-col gap-4 rounded-xl border bg-card p-5">
          <div className="space-y-0.5">
            <SectionLabel>Athlete eligibility</SectionLabel>
            <p className="text-sm font-semibold">Status distribution</p>
            <p className="text-xs text-muted-foreground">
              Clinician decisions only — not AI risk signals
            </p>
          </div>

          {eligibilityGroups.length > 0 ? (
            <>
              <div className="h-[180px] w-full">
                <ResponsiveContainer
                  initialDimension={{ width: 320, height: 180 }}
                  width="100%"
                  height="100%"
                >
                  <PieChart>
                    <Pie
                      data={eligibilityGroups}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={72}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {eligibilityGroups.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5">
                {eligibilityGroups.map((g) => (
                  <div
                    key={g.name}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="size-2 rounded-full shrink-0"
                        style={{ background: g.color }}
                        aria-hidden="true"
                      />
                      <span className="text-muted-foreground">{g.name}</span>
                    </div>
                    <span className="font-semibold tabular-nums">
                      {g.value}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No eligibility records yet
            </p>
          )}

          <Link
            href={href(role, "eligibility")}
            className="mt-auto flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 transition-opacity hover:opacity-80"
          >
            View eligibility decisions
            <ChevronRight className="size-3" aria-hidden="true" />
          </Link>
        </div>

        {/* 3b. PPE stages bar */}
        <div className="flex min-w-0 flex-col gap-4 rounded-xl border bg-card p-5">
          <div className="space-y-0.5">
            <SectionLabel>PPE pipeline</SectionLabel>
            <p className="text-sm font-semibold">
              Assessment completion by stage
            </p>
            <p className="text-xs text-muted-foreground">
              Counts across all active encounters
            </p>
          </div>

          {totalEncounters > 0 ? (
            <div className="h-[180px] w-full">
              <ResponsiveContainer
                initialDimension={{ width: 320, height: 180 }}
                width="100%"
                height="100%"
              >
                <BarChart
                  data={ppeStages}
                  margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                  barSize={18}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="currentColor"
                    strokeOpacity={0.07}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="stage"
                    tick={{ fontSize: 10, fill: "currentColor", opacity: 0.5 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 10, fill: "currentColor", opacity: 0.5 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={<ChartTip />}
                    cursor={{ fill: "currentColor", fillOpacity: 0.04 }}
                  />
                  <Bar
                    dataKey="count"
                    name="Athletes"
                    fill="var(--color-primary, #72E34D)"
                    radius={[4, 4, 0, 0]}
                    fillOpacity={0.85}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No assessments in progress
            </p>
          )}

          <Link
            href={href(role, "assessments")}
            className="mt-auto flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 transition-opacity hover:opacity-80"
          >
            Open PPE assessments
            <ChevronRight className="size-3" aria-hidden="true" />
          </Link>
        </div>

        {/* 3c. Referral urgency */}
        <div className="flex min-w-0 flex-col gap-4 rounded-xl border bg-card p-5">
          <div className="space-y-0.5">
            <SectionLabel>Referral urgency</SectionLabel>
            <p className="text-sm font-semibold">Open referrals by priority</p>
            <p className="text-xs text-muted-foreground">
              Active referrals only — completed excluded
            </p>
          </div>

          {urgencyData.length > 0 ? (
            <>
              <div className="h-[180px] w-full">
                <ResponsiveContainer
                  initialDimension={{ width: 320, height: 180 }}
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={urgencyData}
                    margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                    barSize={22}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="currentColor"
                      strokeOpacity={0.07}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="urgency"
                      tick={{
                        fontSize: 10,
                        fill: "currentColor",
                        opacity: 0.5,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{
                        fontSize: 10,
                        fill: "currentColor",
                        opacity: 0.5,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      content={<ChartTip />}
                      cursor={{ fill: "currentColor", fillOpacity: 0.04 }}
                    />
                    <Bar dataKey="count" name="Referrals" radius={[4, 4, 0, 0]}>
                      {urgencyData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          fillOpacity={0.85}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {urgencyData.map((d) => (
                  <div
                    key={d.urgency}
                    className="flex items-center gap-1.5 text-xs"
                  >
                    <span
                      className="size-2 rounded-full shrink-0"
                      style={{ background: d.color }}
                      aria-hidden="true"
                    />
                    <span className="text-muted-foreground">{d.urgency}</span>
                    <span className="ml-auto font-semibold tabular-nums">
                      {d.count}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No open referrals
            </p>
          )}

          <Link
            href={href(role, "referrals")}
            className="mt-auto flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 transition-opacity hover:opacity-80"
          >
            View all referrals
            <ChevronRight className="size-3" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* ── 4. PRIORITY QUEUE ───────────────────────────────────────── */}
      <div className="rounded-xl border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div className="space-y-0.5">
            <SectionLabel>Needs attention</SectionLabel>
            <p className="text-sm font-semibold">Priority actions for today</p>
          </div>
          {priorityItems.length > 0 && (
            <Link
              href={href(role, "notifications")}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              All notifications
              <ChevronRight className="size-3" aria-hidden="true" />
            </Link>
          )}
        </div>
        <Divider />

        {priorityItems.length > 0 ? (
          <div className="divide-y divide-border/50">
            {priorityItems.map((item) => (
              <PriorityItem key={item.id} {...item} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <CheckCircle2
              className="size-8 text-primary/60"
              aria-hidden="true"
            />
            <p className="text-sm font-medium">All clear</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              No priority actions right now. New items appear here as the care
              team updates records.
            </p>
          </div>
        )}
      </div>

      {/* ── 5. UPCOMING CARE + RECENT ACTIVITY ─────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Upcoming care events */}
        <div className="flex min-w-0 flex-col rounded-xl border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div className="space-y-0.5">
              <SectionLabel>Schedule</SectionLabel>
              <p className="text-sm font-semibold">Upcoming care</p>
            </div>
            <Link
              href={href(role, "schedule")}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Full schedule
              <ChevronRight className="size-3" aria-hidden="true" />
            </Link>
          </div>
          <Divider />

          {events.length > 0 ? (
            <div className="divide-y divide-border/50 py-1">
              {events.slice(0, 5).map((e) => {
                const athlete = athletes.find((a) => a.id === e.athleteId);
                return (
                  <EventRow
                    key={e.id}
                    title={e.title}
                    detail={
                      athlete
                        ? `${fullName(athlete)} · ${e.notes || e.kind}`
                        : e.notes || e.kind || ""
                    }
                    date={e.date}
                    to={href(role, `schedule/${e.id}`)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <CalendarDays
                className="size-7 text-muted-foreground/40"
                aria-hidden="true"
              />
              <p className="text-sm text-muted-foreground">
                No upcoming appointments scheduled.
              </p>
            </div>
          )}

          <div className="mt-auto border-t border-border/50 p-4">
            <Link
              href={href(role, "schedule")}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              <CalendarDays className="size-3.5" aria-hidden="true" />
              View full schedule
            </Link>
          </div>
        </div>

        {/* Recent activity */}
        <div className="flex min-w-0 flex-col rounded-xl border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div className="space-y-0.5">
              <SectionLabel>Activity</SectionLabel>
              <p className="text-sm font-semibold">Recent workspace events</p>
            </div>
            <Clock
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
          <Divider />

          {state.audit.length > 0 ? (
            <div className="divide-y divide-border/50 py-1">
              {state.audit.slice(0, 6).map((a) => (
                <ActivityRow
                  key={a.id}
                  title={a.title}
                  actor={a.actor}
                  date={a.date}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <RefreshCw
                className="size-7 text-muted-foreground/40"
                aria-hidden="true"
              />
              <p className="text-sm text-muted-foreground">
                No recent activity recorded yet.
              </p>
            </div>
          )}

          {/* Athlete eligibility quick-reference */}
          {athletes.length > 0 && (
            <>
              <Divider />
              <div className="px-5 py-4">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Athlete eligibility at a glance
                </p>
                <div className="space-y-1.5">
                  {athletes.slice(0, 5).map((a) => (
                    <Link
                      key={a.id}
                      href={href(role, `athletes/${a.id}`)}
                      className="group flex items-center gap-2.5 rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-muted/60"
                    >
                      <EligibilityDot status={a.eligibilityStatus} />
                      <span className="flex-1 truncate font-medium text-foreground group-hover:text-foreground">
                        {fullName(a)}
                      </span>
                      <span className="shrink-0 text-muted-foreground">
                        {ELIGIBILITY_META[a.eligibilityStatus]?.label ??
                          a.eligibilityStatus.replaceAll("_", " ")}
                      </span>
                    </Link>
                  ))}
                </div>
                {athletes.length > 5 && (
                  <Link
                    href={href(role, "athletes")}
                    className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 transition-opacity hover:opacity-80"
                  >
                    + {athletes.length - 5} more athletes
                    <ChevronRight className="size-3" aria-hidden="true" />
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
