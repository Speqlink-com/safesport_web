"use client";
/**
 * clinician-ui.tsx
 * Shared design primitives for the Clinician workspace.
 * All clinician pages import from this file to ensure visual consistency
 * with the Overview (clinician-home.tsx).
 */

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
ArrowLeft,
CheckCircle2,
ChevronRight,
Inbox,
} from "lucide-react";
import Link from "next/link";
import { type ReactNode } from "react";

// ── Typography ────────────────────────────────────────────────────────────────

export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("text-[11px] font-semibold uppercase tracking-widest text-muted-foreground", className)}>
      {children}
    </p>
  );
}

export function SectionTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("text-sm font-semibold text-foreground", className)}>
      {children}
    </p>
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px bg-border/50", className)} />;
}

// ── Page Header ───────────────────────────────────────────────────────────────

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  back?: { label: string; href: string };
}

export function PageHeader({ eyebrow, title, description, children, back }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-1.5">
        {back && (
          <Link
            href={back.href}
            className="mb-1 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3" aria-hidden="true" />
            {back.label}
          </Link>
        )}
        {eyebrow && <SectionLabel>{eyebrow}</SectionLabel>}
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {description && (
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex flex-wrap items-center gap-2">{children}</div>
      )}
    </div>
  );
}

// ── Section Card ──────────────────────────────────────────────────────────────

interface SectionCardProps {
  label?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  flush?: boolean; // no padding on content
}

export function SectionCard({ label, title, description, action, children, className, flush }: SectionCardProps) {
  return (
    <div className={cn("rounded-xl border bg-card", className)}>
      <div className="flex items-start justify-between gap-4 px-5 py-4">
        <div className="space-y-0.5">
          {label && <SectionLabel>{label}</SectionLabel>}
          <SectionTitle>{title}</SectionTitle>
          {description && (
            <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <Divider />
      <div className={flush ? "" : "p-5"}>{children}</div>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ElementType;
  accent?: "green" | "amber" | "red" | "blue" | "neutral";
  to?: string;
}

export function StatCard({ label, value, sub, icon: Icon, accent = "neutral", to }: StatCardProps) {
  const accentMap = {
    green: "text-emerald-500",
    amber: "text-amber-500",
    red: "text-red-500",
    blue: "text-sky-500",
    neutral: "text-muted-foreground",
  };

  const inner = (
    <div className="group relative flex flex-col gap-3 rounded-xl border bg-card p-5 transition-all duration-150 hover:border-primary/40 hover:shadow-sm hover:shadow-primary/5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground leading-tight">
          {label}
        </p>
        <Icon className={cn("size-4 shrink-0", accentMap[accent])} aria-hidden="true" />
      </div>
      <div className="space-y-0.5">
        <p className="text-3xl font-bold tracking-tight leading-none">{value}</p>
        {sub && <p className="text-xs text-muted-foreground leading-snug">{sub}</p>}
      </div>
      {to && (
        <ChevronRight
          className="absolute bottom-4 right-4 size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
          aria-hidden="true"
        />
      )}
    </div>
  );

  if (!to) return inner;
  return (
    <Link
      href={to}
      className="outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
    >
      {inner}
    </Link>
  );
}

// ── Status Chip ───────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  // Eligibility
  cleared:                    { label: "Cleared",            className: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 ring-emerald-500/20" },
  cleared_with_monitoring:    { label: "Monitoring",         className: "bg-amber-500/12 text-amber-700 dark:text-amber-400 ring-amber-500/20" },
  sport_specific_restriction: { label: "Restricted",         className: "bg-orange-500/12 text-orange-700 dark:text-orange-400 ring-orange-500/20" },
  pending_evaluation:         { label: "Pending evaluation", className: "bg-sky-500/12 text-sky-700 dark:text-sky-400 ring-sky-500/20" },
  temporarily_not_cleared:    { label: "Temp. not cleared",  className: "bg-red-500/12 text-red-700 dark:text-red-400 ring-red-500/20" },
  not_cleared:                { label: "Not cleared",        className: "bg-red-700/12 text-red-800 dark:text-red-300 ring-red-700/20" },
  // PPE / Assessment
  complete:                   { label: "Complete",           className: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 ring-emerald-500/20" },
  in_progress:                { label: "In progress",        className: "bg-sky-500/12 text-sky-700 dark:text-sky-400 ring-sky-500/20" },
  needs_review:               { label: "Needs review",       className: "bg-amber-500/12 text-amber-700 dark:text-amber-400 ring-amber-500/20" },
  blocked:                    { label: "Blocked",            className: "bg-red-500/12 text-red-700 dark:text-red-400 ring-red-500/20" },
  finalized:                  { label: "Finalized",          className: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 ring-emerald-500/20" },
  // Referrals
  pending:                    { label: "Pending",            className: "bg-slate-500/12 text-slate-700 dark:text-slate-400 ring-slate-500/20" },
  assigned:                   { label: "Assigned",           className: "bg-sky-500/12 text-sky-700 dark:text-sky-400 ring-sky-500/20" },
  overdue:                    { label: "Overdue",            className: "bg-red-500/12 text-red-700 dark:text-red-400 ring-red-500/20" },
  completed:                  { label: "Completed",          className: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 ring-emerald-500/20" },
  // Screening / AI
  draft:                      { label: "Draft",              className: "bg-slate-500/12 text-slate-700 dark:text-slate-400 ring-slate-500/20" },
  uploading:                  { label: "Uploading",          className: "bg-sky-500/12 text-sky-700 dark:text-sky-400 ring-sky-500/20" },
  processing:                 { label: "Processing",         className: "bg-sky-500/12 text-sky-700 dark:text-sky-400 ring-sky-500/20" },
  quality_failed:             { label: "Retake required",    className: "bg-red-500/12 text-red-700 dark:text-red-400 ring-red-500/20" },
  ready_for_review:           { label: "Awaiting review",    className: "bg-amber-500/12 text-amber-700 dark:text-amber-400 ring-amber-500/20" },
  reviewed:                   { label: "Reviewed",           className: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 ring-emerald-500/20" },
  included_in_report:         { label: "In report",          className: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 ring-emerald-500/20" },
  // AI risk
  low_movement_risk:          { label: "Low risk",           className: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 ring-emerald-500/20" },
  moderate_movement_risk:     { label: "Moderate risk",      className: "bg-amber-500/12 text-amber-700 dark:text-amber-400 ring-amber-500/20" },
  high_movement_risk:         { label: "High risk signal",   className: "bg-red-500/12 text-red-700 dark:text-red-400 ring-red-500/20" },
  // Urgency
  routine:                    { label: "Routine",            className: "bg-slate-500/12 text-slate-600 dark:text-slate-400 ring-slate-500/20" },
  priority:                   { label: "Priority",           className: "bg-amber-500/12 text-amber-700 dark:text-amber-500 ring-amber-500/20" },
  urgent:                     { label: "Urgent",             className: "bg-orange-500/12 text-orange-700 dark:text-orange-400 ring-orange-500/20" },
  emergency:                  { label: "Emergency",          className: "bg-red-500/12 text-red-700 dark:text-red-400 ring-red-500/20" },
  // Generic
  active:                     { label: "Active",             className: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 ring-emerald-500/20" },
  paused:                     { label: "Paused",             className: "bg-slate-500/12 text-slate-700 dark:text-slate-400 ring-slate-500/20" },
  scheduled:                  { label: "Scheduled",          className: "bg-sky-500/12 text-sky-700 dark:text-sky-400 ring-sky-500/20" },
  cancelled:                  { label: "Cancelled",          className: "bg-red-500/12 text-red-700 dark:text-red-400 ring-red-500/20" },
  read:                       { label: "Read",               className: "bg-slate-500/12 text-slate-600 dark:text-slate-400 ring-slate-500/20" },
  unread:                     { label: "Unread",             className: "bg-primary/12 text-primary ring-primary/20" },
  low:                        { label: "Low",                className: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 ring-emerald-500/20" },
  moderate:                   { label: "Moderate",           className: "bg-amber-500/12 text-amber-700 dark:text-amber-400 ring-amber-500/20" },
  severe:                     { label: "Severe",             className: "bg-red-500/12 text-red-700 dark:text-red-400 ring-red-500/20" },
  under_review:               { label: "Under review",       className: "bg-amber-500/12 text-amber-700 dark:text-amber-400 ring-amber-500/20" },
  reported:                   { label: "Reported",           className: "bg-slate-500/12 text-slate-700 dark:text-slate-400 ring-slate-500/20" },
  closed:                     { label: "Closed",             className: "bg-slate-500/12 text-slate-600 dark:text-slate-400 ring-slate-500/20" },
  obtained:                   { label: "Obtained",           className: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 ring-emerald-500/20" },
  declined:                   { label: "Declined",           className: "bg-red-500/12 text-red-700 dark:text-red-400 ring-red-500/20" },
  withdrawn:                  { label: "Withdrawn",          className: "bg-red-500/12 text-red-700 dark:text-red-400 ring-red-500/20" },
  deferred:                   { label: "Deferred",           className: "bg-slate-500/12 text-slate-700 dark:text-slate-400 ring-slate-500/20" },
  normal:                     { label: "Normal",             className: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 ring-emerald-500/20" },
  abnormal:                   { label: "Abnormal",           className: "bg-red-500/12 text-red-700 dark:text-red-400 ring-red-500/20" },
  not_assessed:               { label: "Not assessed",       className: "bg-slate-500/12 text-slate-700 dark:text-slate-400 ring-slate-500/20" },
};

export function StatusChip({ value, className }: { value: string; className?: string }) {
  const meta = STATUS_MAP[value];
  const label = meta?.label ?? value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const cls = meta?.className ?? "bg-slate-500/12 text-slate-700 dark:text-slate-400 ring-slate-500/20";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset whitespace-nowrap",
        cls,
        className
      )}
    >
      {label}
    </span>
  );
}

/** Dot only — for inline use in tables */
export function StatusDot({ value }: { value: string }) {
  const dotMap: Record<string, string> = {
    cleared: "bg-emerald-500",
    cleared_with_monitoring: "bg-amber-400",
    sport_specific_restriction: "bg-orange-500",
    pending_evaluation: "bg-sky-400",
    temporarily_not_cleared: "bg-red-500",
    not_cleared: "bg-red-700",
    complete: "bg-emerald-500",
    completed: "bg-emerald-500",
    in_progress: "bg-sky-400",
    processing: "bg-sky-400",
    needs_review: "bg-amber-400",
    blocked: "bg-red-500",
    pending: "bg-slate-400",
    assigned: "bg-sky-400",
    overdue: "bg-red-500",
    reviewed: "bg-emerald-500",
    ready_for_review: "bg-amber-400",
    quality_failed: "bg-red-500",
    draft: "bg-slate-400",
  };
  return (
    <span
      className={cn("inline-block size-2 shrink-0 rounded-full", dotMap[value] ?? "bg-slate-400")}
      aria-hidden="true"
    />
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: React.ElementType;
  title?: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  icon: Icon = Inbox,
  title = "No records yet",
  description = "New records will appear here.",
  action,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-44 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-8 text-center">
      <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
        <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

/** All-clear empty state with a green check — for "nothing needs attention" */
export function AllClearState({ title = "All clear", description }: { title?: string; description?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <CheckCircle2 className="size-8 text-primary/60" aria-hidden="true" />
      <p className="text-sm font-semibold">{title}</p>
      {description && (
        <p className="max-w-xs text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

// ── Data Table ────────────────────────────────────────────────────────────────

export interface TableColumnDef {
  key: string;
  label: string;
  className?: string;
  render?: (value: unknown, row: Record<string, unknown>) => ReactNode;
}

interface DataTableProps {
  columns: TableColumnDef[];
  rows: Record<string, unknown>[];
  onRowClick?: (row: Record<string, unknown>) => void;
  rowHref?: (row: Record<string, unknown>) => string;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function DataTable({ columns, rows, onRowClick, rowHref, emptyTitle, emptyDescription }: DataTableProps) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title={emptyTitle ?? "No records found"}
        description={emptyDescription ?? "Records will appear here as they are added."}
      />
    );
  }
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground",
                  col.className
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {rows.map((row, ri) => {
            const href = rowHref?.(row) as string | undefined;
            const clickable = !!(href || onRowClick);
            const rowContent = (
              <tr
                key={ri}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "transition-colors",
                  clickable && "cursor-pointer hover:bg-muted/40"
                )}
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn("px-4 py-3 align-middle", col.className)}>
                    {col.render
                      ? col.render(row[col.key], row)
                      : (row[col.key] as ReactNode) ?? "—"}
                  </td>
                ))}
              </tr>
            );
            return href ? (
              <tr key={ri} className="transition-colors hover:bg-muted/40">
                {columns.map((col, ci) => (
                  <td key={col.key} className={cn("px-4 py-3 align-middle", col.className)}>
                    {ci === 0 ? (
                      <Link href={href} className="block outline-none focus-visible:underline">
                        {col.render ? col.render(row[col.key], row) : (row[col.key] as ReactNode) ?? "—"}
                      </Link>
                    ) : col.render ? (
                      col.render(row[col.key], row)
                    ) : (
                      (row[col.key] as ReactNode) ?? "—"
                    )}
                  </td>
                ))}
              </tr>
            ) : rowContent;
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Progress Bar ──────────────────────────────────────────────────────────────

export function ProgressBar({
  value,
  label,
  showPercent = true,
  className,
}: {
  value: number;
  label?: string;
  showPercent?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showPercent && <span className="font-semibold tabular-nums">{Math.round(value)}%</span>}
        </div>
      )}
      <Progress value={value} className="h-1.5" />
    </div>
  );
}

// ── Inline nav link ───────────────────────────────────────────────────────────

export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1 text-xs font-medium text-primary transition-opacity hover:opacity-80"
    >
      {children}
      <ChevronRight className="size-3" aria-hidden="true" />
    </Link>
  );
}

// ── Form wrapper ──────────────────────────────────────────────────────────────

export function FormCard({
  title,
  description,
  children,
  className,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border bg-card", className)}>
      {(title || description) && (
        <>
          <div className="px-5 py-4">
            {title && <SectionTitle>{title}</SectionTitle>}
            {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
          </div>
          <Divider />
        </>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

// ── Info row (dl-style) ───────────────────────────────────────────────────────

export function InfoGrid({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
      {items.map((item, i) => (
        <div key={i}>
          <dt className="text-xs font-medium text-muted-foreground">{item.label}</dt>
          <dd className="mt-0.5 font-medium">{item.value ?? "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

// ── Hero banner (for page tops like the Overview header) ─────────────────────

interface HeroBannerProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
}

export function HeroBanner({ eyebrow, title, description, children, footer }: HeroBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border bg-card">
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
          <div className="space-y-1.5">
            {eyebrow && <SectionLabel>{eyebrow}</SectionLabel>}
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
            {description && (
              <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">{description}</p>
            )}
          </div>
          {children && (
            <div className="flex flex-wrap items-center gap-2">{children}</div>
          )}
        </div>
        {footer && <div className="mt-6">{footer}</div>}
      </div>
    </div>
  );
}

// ── Tab strip (lightweight) ───────────────────────────────────────────────────

export interface TabDef {
  id: string;
  label: string;
  count?: number;
}

interface TabStripProps {
  tabs: TabDef[];
  active: string;
  onChange: (id: string) => void;
}

export function TabStrip({ tabs, active, onChange }: TabStripProps) {
  return (
    <div
      className="flex gap-0.5 rounded-xl border bg-muted/40 p-1"
      role="tablist"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            "outline-none focus-visible:ring-2 focus-visible:ring-ring",
            active === tab.id
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={cn(
                "inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                active === tab.id
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ── Blockquote info note ──────────────────────────────────────────────────────

export function InfoNote({ children, variant = "default" }: { children: ReactNode; variant?: "default" | "warning" | "critical" }) {
  const variantMap = {
    default: "border-border/60 bg-muted/40 text-muted-foreground",
    warning: "border-amber-500/30 bg-amber-500/5 text-amber-800 dark:text-amber-300",
    critical: "border-red-500/30 bg-red-500/5 text-red-800 dark:text-red-300",
  };
  return (
    <div className={cn("rounded-xl border px-4 py-3 text-sm leading-relaxed", variantMap[variant])}>
      {children}
    </div>
  );
}

// ── Action button strip ───────────────────────────────────────────────────────

export function ActionStrip({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

// ── Metric row (horizontal stat) ─────────────────────────────────────────────

export function MetricRow({
  items,
}: {
  items: { label: string; value: number | string; color?: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tabular-nums leading-none">{item.value}</span>
          <span className="text-xs text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
