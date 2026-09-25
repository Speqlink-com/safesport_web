"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  // topbar
  Bell,
  CircleUserRound,
  Moon,
  Sun,
  LogOut,
  ChevronRight,
  // nav icons — all referenced by string in catalog navGroups
  LayoutDashboard,
  HeartPulse,
  Activity,
  ClipboardList,
  FileQuestion,
  ShieldCheck,
  Award,
  FileText,
  CalendarDays,
  CircleUser,
  MessageSquare,
  Settings,
  SlidersHorizontal,
  Users,
  Heart,
  Bandage,
  Dumbbell,
  FileSignature,
  FileCheck,
  FolderOpen,
  Stethoscope,
  TriangleAlert,
  RefreshCw,
  ArrowRightLeft,
  ScanLine,
  BrainCircuit,
  CalendarClock,
  ListChecks,
  FileBarChart,
  TrendingUp,
  ArrowDownToLine,
  CheckCircle2,
  UsersRound,
  Trophy,
  BarChart3,
  CalendarCheck,
  FilePlus,
  Ban,
  ClipboardCheck,
  UserCheck,
  Building2,
  UserPlus,
  Clock,
  LayoutList,
  KeyRound,
  Settings2,
  GitBranch,
  BellDot,
  ShieldAlert,
  Eye,
  MonitorCheck,
  Server,
  Plug,
  HardDrive,
  Cog,
  LifeBuoy,
  Bug,
  // collapsible chevron
  ChevronDown,
  // additional icons
  CircleCheck,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import Logo from "@/components/Logo";
import {
  navigation,
  navGroups,
  identities,
  roles,
  href,
  type Role,
  type NavItem,
  human,
} from "./catalog";
import { Choice } from "./ui";
import { useWorkspace } from "./store";

// ── Icon resolver ──────────────────────────────────────────────────────────
// Maps string names (stored in catalog.ts) to Lucide components so catalog.ts
// stays a plain .ts file without JSX imports.
const ICONS: Record<string, React.ElementType> = {
  LayoutDashboard,
  HeartPulse,
  Activity,
  ClipboardList,
  FileQuestion,
  ShieldCheck,
  Award,
  FileText,
  CalendarDays,
  CircleUser,
  MessageSquare,
  Settings,
  SlidersHorizontal,
  Users,
  Heart,
  Bandage,
  Dumbbell,
  FileSignature,
  FileCheck,
  FolderOpen,
  Stethoscope,
  TriangleAlert,
  RefreshCw,
  ArrowRightLeft,
  ScanLine,
  BrainCircuit,
  CalendarClock,
  ListChecks,
  FileBarChart,
  TrendingUp,
  ArrowDownToLine,
  CheckCircle2,
  UsersRound,
  Trophy,
  BarChart3,
  CalendarCheck,
  FilePlus,
  Ban,
  ClipboardCheck,
  UserCheck,
  Building2,
  UserPlus,
  Clock,
  LayoutList,
  KeyRound,
  Settings2,
  GitBranch,
  BellDot,
  ShieldAlert,
  Eye,
  MonitorCheck,
  Server,
  Plug,
  HardDrive,
  Cog,
  LifeBuoy,
  Bug,
  // fallback aliases
  Timeline: Activity,
  CircleCheck,
};

function NavIcon({ name, className = "size-4 shrink-0" }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Activity;
  return <Icon className={className} aria-hidden="true" />;
}

// ── Active-path helper ─────────────────────────────────────────────────────
// Returns true when a nav path matches the current URL, respecting the
// existing workspace.tsx rule: longer matches win.
function useIsActive(role: Role, path: string): boolean {
  const pathname = usePathname();
  const full = href(role, path);
  if (path === "") return pathname === full;
  if (!pathname.startsWith(full)) return false;
  // Make sure no sibling nav item is a longer match for this exact URL
  const siblings = navigation[role];
  return !siblings.some(
    (other) =>
      other.path !== path &&
      pathname.startsWith(href(role, other.path)) &&
      href(role, other.path).length > full.length,
  );
}

// ── CollapsibleGroup ───────────────────────────────────────────────────────
function CollapsibleGroup({
  role,
  item,
}: {
  role: Role;
  item: Extract<NavItem, { kind: "group" }>;
}) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  const anyChildActive = item.children.some((child) => {
    const full = href(role, child.path);
    if (!pathname.startsWith(full)) return false;
    return !navigation[role].some(
      (other) =>
        other.path !== child.path &&
        pathname.startsWith(href(role, other.path)) &&
        href(role, other.path).length > full.length,
    );
  });

  const [open, setOpen] = useState(anyChildActive || (item.defaultOpen ?? false));

  return (
    <div className="space-y-0.5">
      {/* Group trigger */}
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={[
          "flex w-full min-h-9 items-center gap-2.5 rounded-lg px-3 py-2 text-sm",
          "outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "transition-colors",
          anyChildActive
            ? "text-foreground font-medium"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        ].join(" ")}
      >
        <NavIcon name={item.icon} />
        <span className="flex-1 truncate text-left">{item.label}</span>
        <ChevronDown
          className={[
            "size-3.5 shrink-0 transition-transform duration-200",
            open ? "rotate-180" : "",
          ].join(" ")}
          aria-hidden="true"
        />
      </button>

      {/* Children */}
      {open && (
        <div className="ml-3 space-y-0.5 border-l border-border/50 pl-3">
          {item.children.map((child) => {
            const full = href(role, child.path);
            const active =
              pathname === full ||
              (child.path !== "" &&
                pathname.startsWith(`${full}/`) &&
                !navigation[role].some(
                  (other) =>
                    other.path !== child.path &&
                    href(role, other.path) === pathname,
                ));
            return (
              <Link
                key={child.path}
                href={full}
                onClick={() => setOpenMobile(false)}
                aria-current={active ? "page" : undefined}
                className={[
                  "flex min-h-8 items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm",
                  "outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  "transition-colors",
                  active
                    ? "bg-primary/15 font-semibold text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                ].join(" ")}
              >
                <NavIcon name={child.icon} className="size-3.5 shrink-0" />
                <span className="flex-1 truncate">{child.label}</span>
                {active && (
                  <span className="ml-auto size-1.5 rounded-full bg-primary shrink-0" aria-hidden="true" />
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── StandaloneLink ─────────────────────────────────────────────────────────
function StandaloneLink({
  role,
  item,
}: {
  role: Role;
  item: Extract<NavItem, { kind: "link" }>;
}) {
  const { setOpenMobile } = useSidebar();
  const active = useIsActive(role, item.path);
  return (
    <Link
      href={href(role, item.path)}
      onClick={() => setOpenMobile(false)}
      aria-current={active ? "page" : undefined}
      className={[
        "flex min-h-9 items-center gap-2.5 rounded-lg px-3 py-2 text-sm",
        "outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "transition-colors",
        active
          ? "bg-primary/15 font-semibold text-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      ].join(" ")}
    >
      <NavIcon name={item.icon} />
      <span className="flex-1 truncate">{item.label}</span>
      {active && (
        <span className="ml-auto size-1.5 rounded-full bg-primary shrink-0" aria-hidden="true" />
      )}
    </Link>
  );
}

// ── Navigation ─────────────────────────────────────────────────────────────
function Navigation({ role }: { role: Role }) {
  const sections = navGroups[role];
  return (
    <nav aria-label="Main navigation" className="flex flex-col gap-0 px-3 py-2">
      {sections.map((section, si) => (
        <div key={si}>
          {/* Section separator (not before first section) */}
          {si > 0 && <div className="my-1 border-t border-border/40" />}

          {/* Optional section heading */}
          {section.heading && (
            <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {section.heading}
            </p>
          )}

          {/* Items */}
          <div className="space-y-0.5">
            {section.items.map((item, ii) =>
              item.kind === "group" ? (
                <CollapsibleGroup key={`${si}-${ii}`} role={role} item={item} />
              ) : (
                <StandaloneLink key={`${si}-${ii}`} role={role} item={item} />
              ),
            )}
          </div>
        </div>
      ))}
    </nav>
  );
}

// ── WorkspaceShell ─────────────────────────────────────────────────────────
export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const candidate = path.split("/")[2];
  const role: Role = roles.includes(candidate as Role)
    ? (candidate as Role)
    : "clinician";
  const { state } = useWorkspace();
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();
  const user = state.accounts[role] ?? identities[role];
  const unread = state.notices.filter((n) => n.role === role && !n.read).length;
  const current = path.split("/").slice(3).join("/");
  const title =
    navigation[role].find((n) => n.path === current)?.label ||
    human(current.split("/")[0] || "Overview");

  return (
    <SidebarProvider>
      {/* Skip-to-content for keyboard/screen-reader users */}
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-background focus:p-4"
        href="#main-content"
      >
        Skip to content
      </a>

      <Sidebar>
        {/* ── Header: Logo + role label ── */}
        <SidebarHeader className="border-b px-4 py-3">
          <Link
            href={href(role)}
            className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="SafeSport home"
          >
            <Logo />
          </Link>
          <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">
            {identities[role].title}
          </p>
        </SidebarHeader>

        {/* ── Scrollable nav content ── */}
        <SidebarContent className="overflow-y-auto">
          <Navigation role={role} />
        </SidebarContent>

        {/* ── Footer: Demo switcher (kept for dev) ── */}
        <SidebarFooter className="border-t px-4 py-3 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Demo workspace
          </p>
          <Choice
            label="Active role"
            value={role}
            onChange={(v) => router.push(href(v as Role))}
            options={roles.map((r) => ({
              value: r,
              label: identities[r].title,
            }))}
          />
          <p className="text-[10px] leading-4 text-muted-foreground">
            Frontend demo · Changes reset on refresh.
          </p>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-w-0">
        {/* ── Topbar ── */}
        <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-3 border-b bg-background/95 px-4 backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <SidebarTrigger />
            <nav
              aria-label="Breadcrumb"
              className="flex min-w-0 items-center gap-2 text-sm"
            >
              <Link
                className="hidden text-muted-foreground hover:text-foreground transition-colors sm:block"
                href={href(role)}
              >
                {identities[role].title}
              </Link>
              <ChevronRight className="hidden size-3 text-muted-foreground sm:block" aria-hidden="true" />
              <span className="truncate font-medium">{title}</span>
            </nav>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle color theme"
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
            >
              <Sun className="size-4 dark:hidden" aria-hidden="true" />
              <Moon className="hidden size-4 dark:block" aria-hidden="true" />
            </Button>
            <Button
              nativeButton={false}
              role="link"
              render={<Link href={href(role, "notifications")} />}
              variant="ghost"
              aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ""}`}
            >
              <Bell className="size-4" aria-hidden="true" />
              {unread > 0 && (
                <Badge className="ml-0.5 h-4 min-w-4 px-1 text-[10px]">
                  {unread}
                </Badge>
              )}
            </Button>
            <Button
              nativeButton={false}
              role="link"
              render={<Link href={href(role, "account")} />}
              variant="ghost"
              aria-label={`Account for ${user.name}`}
            >
              <CircleUserRound className="size-4" aria-hidden="true" />
              <span className="hidden max-w-36 truncate md:inline">
                {user.name}
              </span>
            </Button>
            <Button
              nativeButton={false}
              role="link"
              render={<Link href="/account/signin" />}
              variant="ghost"
              size="icon"
              aria-label="Leave demo workspace"
            >
              <LogOut className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </header>

        {/* ── Main content ── */}
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-[1500px] space-y-6 p-4 pb-12 sm:p-6 lg:p-8"
        >
          {children}
        </main>

        <footer className="mt-auto border-t px-6 py-4 text-xs text-muted-foreground">
          SafeSport™ · Demonstration data · Clinical decisions remain with the
          treating clinician.
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
