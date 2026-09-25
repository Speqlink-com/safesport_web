"use client";
import Link from "next/link";
import { useId, useState, type ReactNode } from "react";
import { Search, ArrowUpDown, Inbox, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { human } from "./catalog";
import { cn } from "@/lib/utils";
export function PageHeading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-2">
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
export function Panel({
  title,
  description,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "min-w-0 gap-0 rounded-xl border border-border/70 py-0 shadow-none ring-0",
        className,
      )}
    >
      <CardHeader className="border-b border-border/50 px-5 py-4">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        {description && (
          <CardDescription className="text-xs leading-relaxed">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4 p-5">{children}</CardContent>
    </Card>
  );
}
export function Empty({
  title = "No records yet",
  description = "New records will appear here.",
  children,
}: {
  title?: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex min-h-44 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-center">
      <Inbox className="size-7 text-muted-foreground" />
      <h2 className="font-medium">{title}</h2>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      {children}
    </div>
  );
}
export function Status({ value }: { value: string }) {
  const good = [
    "cleared",
    "complete",
    "completed",
    "active",
    "obtained",
    "reviewed",
    "ready",
    "normal",
    "pass",
  ].includes(value);
  const bad = [
    "blocked",
    "declined",
    "withdrawn",
    "not_cleared",
    "temporarily_not_cleared",
    "quality_failed",
    "abnormal",
    "overdue",
  ].includes(value);
  return (
    <Badge
      variant="outline"
      className={cn(
        "max-w-full whitespace-normal border-transparent px-2.5 py-0.5 text-[11px] font-semibold",
        bad
          ? "bg-red-500/10 text-red-700 dark:text-red-400"
          : good
            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
            : [
                  "needs_review",
                  "cleared_with_monitoring",
                  "sport_specific_restriction",
                  "ready_for_review",
                ].includes(value)
              ? "bg-amber-500/10 text-amber-800 dark:text-amber-400"
              : "bg-sky-500/10 text-sky-700 dark:text-sky-400",
      )}
    >
      {human(value || "pending")}
    </Badge>
  );
}
export function Go({
  to,
  children,
  secondary = false,
}: {
  to: string;
  children: ReactNode;
  secondary?: boolean;
}) {
  return (
    <Button
      variant={secondary ? "outline" : "default"}
      nativeButton={false}
      role="link"
      render={<Link href={to} />}
    >
      {children}
    </Button>
  );
}
export function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  min,
  max,
  placeholder,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  min?: string | number;
  max?: string | number;
  placeholder?: string;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        min={min}
        max={max}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
}
export function Notes({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  const id = useId();
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </Label>
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="min-h-24"
      />
    </div>
  );
}
export function Choice({
  label,
  value,
  onChange,
  options,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: (string | { value: string; label: string })[];
  disabled?: boolean;
}) {
  const id = useId();
  const choices = options.map((o) =>
    typeof o === "string" ? { value: o, label: human(o) } : o,
  );
  return (
    <div className="space-y-2">
      <Label id={id}>{label}</Label>
      <Select
        value={value}
        onValueChange={(v) => v !== null && onChange(v)}
        items={choices}
        disabled={disabled}
      >
        <SelectTrigger aria-labelledby={id} className="w-full min-w-0">
          <SelectValue placeholder="Choose an option" />
        </SelectTrigger>
        <SelectContent>
          {choices.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
export function Check({
  label,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="flex items-start gap-3">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
      />
      <Label htmlFor={id} className="leading-5">
        {label}
      </Label>
    </div>
  );
}
export function Tabbed({
  tabs,
  initial,
}: {
  tabs: { id: string; label: string; content: ReactNode }[];
  initial?: string;
}) {
  return (
    <Tabs
      defaultValue={tabs.some((t) => t.id === initial) ? initial : tabs[0]?.id}
    >
      <div className="overflow-x-auto border-b border-border/60 pb-2">
        <TabsList variant="line" className="h-auto min-h-10">
          {tabs.map((t) => (
            <TabsTrigger key={t.id} value={t.id} className="px-3 py-2">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {tabs.map((t) => (
        <TabsContent key={t.id} value={t.id} className="space-y-5 pt-3">
          {t.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
export function download(name: string, content: string, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function Export({ name, content }: { name: string; content: string }) {
  return (
    <Button variant="outline" onClick={() => download(name, content)}>
      <Download />
      Export
    </Button>
  );
}
export interface DataRow {
  id: string;
  name: string;
  status: string;
  detail?: string;
  date?: string;
  to?: string;
  action?: ReactNode;
}
export function DataList({
  rows,
  label = "records",
}: {
  rows: DataRow[];
  label?: string;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [asc, setAsc] = useState(true);
  const [page, setPage] = useState(1);
  const filtered = rows
    .filter(
      (r) =>
        `${r.name} ${r.id} ${r.detail ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase()) &&
        (status === "all" || r.status === status),
    )
    .sort((a, b) =>
      asc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name),
    );
  const pages = Math.max(1, Math.ceil(filtered.length / 8));
  const current = Math.min(page, pages);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative min-w-48 flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            aria-label={`Search ${label}`}
            className="pl-9"
            placeholder={`Search ${label}…`}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Choice
          label="Status filter"
          value={status}
          onChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
          options={[
            { value: "all", label: "All statuses" },
            ...Array.from(new Set(rows.map((r) => r.status))),
          ]}
        />
        <Button
          variant="outline"
          onClick={() => setAsc(!asc)}
          aria-label={`Sort ${asc ? "descending" : "ascending"}`}
        >
          <ArrowUpDown />
          Name {asc ? "A–Z" : "Z–A"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground" aria-live="polite">
        {filtered.length} of {rows.length} {label}
      </p>
      {!filtered.length ? (
        <Empty
          title={rows.length ? "No matching records" : "No records yet"}
          description={
            rows.length
              ? "Try a different search or status filter."
              : "There are no records in this view."
          }
        >
          {rows.length > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setStatus("all");
              }}
            >
              Clear filters
            </Button>
          )}
        </Empty>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/70 bg-card">
          <Table>
            <TableHeader className="bg-muted/40 [&_th]:h-11 [&_th]:text-[11px] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-muted-foreground">
              <TableRow>
                <TableHead className="min-w-48">Record</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="min-w-36">Context</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="[&_td]:px-4 [&_td]:py-4">
              {filtered.slice((current - 1) * 8, current * 8).map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">
                    {r.to ? (
                      <Link
                        className="underline-offset-4 hover:underline focus-visible:outline-2"
                        href={r.to}
                      >
                        {r.name}
                      </Link>
                    ) : (
                      r.name
                    )}
                    <p className="mt-1 text-xs font-normal text-muted-foreground">
                      {r.id}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Status value={r.status} />
                  </TableCell>
                  <TableCell className="max-w-xs whitespace-normal text-muted-foreground">
                    {r.detail || "—"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {r.date?.slice(0, 10) || "—"}
                  </TableCell>
                  <TableCell>
                    {r.action ??
                      (r.to ? (
                        <Go to={r.to} secondary>
                          Open
                        </Go>
                      ) : null)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <div className="flex items-center justify-end gap-3 text-sm">
        <Button
          variant="outline"
          disabled={current === 1}
          onClick={() => setPage(current - 1)}
        >
          Previous
        </Button>
        <span>
          Page {current} of {pages}
        </span>
        <Button
          variant="outline"
          disabled={current === pages}
          onClick={() => setPage(current + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
