export const roles = [
  "athlete",
  "guardian",
  "clinician",
  "physiotherapist",
  "coach",
  "institution",
  "operations",
  "sys-admin",
] as const;
export type Role = (typeof roles)[number];
export const identities: Record<
  Role,
  { name: string; title: string; email: string }
> = {
  athlete: {
    name: "Brian Otieno",
    title: "Athlete",
    email: "brian@example.test",
  },
  guardian: {
    name: "Jane Mutua",
    title: "Guardian",
    email: "jane@example.test",
  },
  clinician: {
    name: "Dr Sarah Njeri",
    title: "Clinician",
    email: "sarah@safesport.test",
  },
  physiotherapist: {
    name: "James Ochieng",
    title: "Physiotherapist",
    email: "james@safesport.test",
  },
  coach: {
    name: "David Otieno",
    title: "Coach",
    email: "coach@greenvalley.test",
  },
  institution: {
    name: "Grace Wanjiku",
    title: "Institution administrator",
    email: "grace@greenvalley.test",
  },
  operations: {
    name: "Faith Akinyi",
    title: "Operations coordinator",
    email: "faith@safesport.test",
  },
  "sys-admin": {
    name: "Alex Mwangi",
    title: "System administrator",
    email: "alex@safesport.test",
  },
};
export type Surface =
  | "home"
  | "athletes"
  | "profile"
  | "health"
  | "consent"
  | "questionnaires"
  | "assessments"
  | "screenings"
  | "referrals"
  | "rehabilitation"
  | "eligibility"
  | "certificates"
  | "reports"
  | "messages"
  | "notifications"
  | "schedule"
  | "teams"
  | "organizations"
  | "incidents"
  | "tasks"
  | "settings"
  | "users"
  | "config"
  | "audit"
  | "system"
  | "documents";
export type Nav = {
  path: string;
  label: string;
  surface: Surface;
  group: string;
};
const n = (
  path: string,
  label: string,
  surface: Surface,
  group = "Workspace",
): Nav => ({ path, label, surface, group });
const common: Nav[] = [
  n("messages", "Messages", "messages", "Connect"),
  n("notifications", "Notifications", "notifications", "Connect"),
  n("account", "My account", "profile", "Account"),
  n("settings", "Settings", "settings", "Account"),
];
export const navigation: Record<Role, Nav[]> = {
  athlete: [
    n("", "Overview", "home"),
    n("profile", "My profile", "profile"),
    n("health", "My health", "health"),
    n("consent", "Consent & privacy", "consent"),
    n("questionnaires", "Health questionnaire", "questionnaires"),
    n("screening", "Movement screening", "screenings"),
    n("timeline", "Health timeline", "health"),
    n("certificates", "Certificates", "certificates"),
    n("reports", "Reports", "reports"),
    n("schedule", "Appointments", "schedule"),
    ...common,
  ],
  guardian: [
    n("", "Overview", "home"),
    n("athletes", "Linked athletes", "athletes"),
    n("health", "Health summary", "health"),
    n("assessments", "Assessments", "assessments"),
    n("injuries", "Injuries", "incidents"),
    n("rehabilitation", "Rehabilitation", "rehabilitation"),
    n("eligibility", "Participation status", "eligibility"),
    n("consent", "Consent & assent", "consent"),
    n("questionnaires", "Questionnaires", "questionnaires"),
    n("certificates", "Certificates", "certificates"),
    n("documents", "Documents", "documents"),
    ...common,
  ],
  clinician: [
    n("", "Overview", "home"),
    n("athletes", "Athletes", "athletes"),
    n("assessments", "PPE assessments", "assessments"),
    n("screenings", "Movement screening", "screenings"),
    n("ai-reviews", "AI review queue", "screenings"),
    n("incidents", "Incidents", "incidents"),
    n("eligibility", "Eligibility decisions", "eligibility"),
    n("referrals", "Referrals", "referrals"),
    n("reassessments", "Reassessments", "rehabilitation"),
    n("schedule", "Schedule", "schedule"),
    n("events", "Events", "schedule"),
    n("tasks", "Tasks", "tasks"),
    n("reports", "Reports", "reports"),
    n("certificates", "Certificates", "certificates"),
    ...common,
  ],
  physiotherapist: [
    n("", "Overview", "home"),
    n("athletes", "Assigned athletes", "athletes"),
    n("screenings", "Movement screening", "screenings"),
    n("ai-reviews", "AI review queue", "screenings"),
    n("rehabilitation", "Rehabilitation", "rehabilitation"),
    n("progress", "Progress reviews", "rehabilitation"),
    n("referrals/incoming", "Incoming referrals", "referrals"),
    n("referrals/mine", "My referrals", "referrals"),
    n("referrals/completed", "Completed referrals", "referrals"),
    n("schedule", "Schedule", "schedule"),
    ...common,
  ],
  coach: [
    n("", "Overview", "home"),
    n("roster", "Team roster", "athletes"),
    n("status", "Participation status", "eligibility"),
    n("restrictions", "Activity restrictions", "eligibility"),
    n("training", "Training schedule", "schedule"),
    n("events", "Events", "schedule"),
    n("attendance", "Attendance", "teams"),
    n("readiness", "Team readiness", "teams"),
    n("screening", "Screening completion", "tasks"),
    n("alerts", "Action alerts", "tasks"),
    n("incidents", "Report an incident", "incidents"),
    ...common,
  ],
  institution: [
    n("", "Overview", "home"),
    n("athletes", "Athletes", "athletes"),
    n("teams", "Teams", "teams"),
    n("sports", "Sports", "teams"),
    n("readiness", "Institution readiness", "reports"),
    n("ppe", "PPE completion", "reports"),
    n("screening", "Screening completion", "reports"),
    n("injuries", "Injury trends", "reports"),
    n("referrals", "Referral coordination", "referrals"),
    n("schedule", "Schedule", "schedule"),
    n("events", "Events", "schedule"),
    n("coverage", "Clinical coverage", "schedule"),
    n("staff", "Staff directory", "users"),
    n("reports", "Reports", "reports"),
    n("reports/injuries", "Injury report", "reports"),
    n("reports/readiness", "Readiness report", "reports"),
    n("reports/screening", "Screening report", "reports"),
    n("reports/compliance", "Consent compliance", "reports"),
    n("profile", "Institution profile", "organizations"),
    n("users", "Access requests", "users"),
    ...common,
  ],
  operations: [
    n("", "Overview", "home"),
    n("tasks", "Task board", "tasks"),
    n("activity", "Coordination activity", "audit"),
    n("calendar", "Calendar", "schedule"),
    n("appointments", "Appointments", "schedule"),
    n("events", "Events", "schedule"),
    n("rosters", "Team rosters", "teams"),
    n("coverage", "Clinical coverage", "schedule"),
    n("screening", "Screening sessions", "schedule"),
    n("clinics", "Clinics", "schedule"),
    n("assignments", "Staff assignments", "schedule"),
    n("referrals", "Referral coordination", "referrals"),
    n("referrals/pending", "Pending referrals", "referrals"),
    n("referrals/overdue", "Overdue referrals", "referrals"),
    n("referrals/completed", "Completed referrals", "referrals"),
    n("institutions", "Institutions", "organizations"),
    n("teams", "Teams", "teams"),
    n("services", "Service catalogue", "config"),
    n("reports", "Operations reports", "reports"),
    ...common,
  ],
  "sys-admin": [
    n("", "Overview", "home"),
    n("users", "User management", "users"),
    n("roles", "Role permissions", "users"),
    n("organizations", "Organizations", "organizations"),
    n("config/sports", "Sport configuration", "config"),
    n("config/assessments", "Assessment configuration", "config"),
    n("config/workflows", "Workflow configuration", "config"),
    n("config/notifications", "Notification preferences", "config"),
    n("security/access", "Access review", "users"),
    n("security/audit", "Audit activity", "audit"),
    n("security/sessions", "Demo sessions", "system"),
    n("system/health", "System health", "system"),
    n("system/integrations", "Integrations", "system"),
    n("system/storage", "Storage", "system"),
    n("system/jobs", "Jobs", "system"),
    n("support/activity", "Support activity", "audit"),
    n("support/errors", "Error log", "system"),
    ...common,
  ],
};
export const href = (role: Role, path = "") =>
  `/safesport/${role}${path ? `/${path}` : ""}`;
export const human = (value: string) =>
  value
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
export const clinical = (role: Role) =>
  role === "clinician" || role === "physiotherapist";
export const personal = (role: Role) =>
  role === "athlete" || role === "guardian";

// ---------------------------------------------------------------------------
// Structured navigation groups for the sidebar UI.
// Each NavItem is either a standalone link (no children) or a collapsible
// group (has children).  Icon names reference lucide-react exports and are
// resolved inside shell.tsx so this file stays a plain .ts module.
// ---------------------------------------------------------------------------
export type NavItem =
  | {
      kind: "link";
      path: string;
      label: string;
      icon: string;
    }
  | {
      kind: "group";
      label: string;
      icon: string;
      /** Default open when any child is active. Always auto-opens on active. */
      defaultOpen?: boolean;
      children: { path: string; label: string; icon: string }[];
    };

export type NavSection = {
  /** Optional visible section heading (uppercase label above group) */
  heading?: string;
  items: NavItem[];
};

export const navGroups: Record<Role, NavSection[]> = {
  // ── ATHLETE ──────────────────────────────────────────────────────────────
  athlete: [
    {
      items: [
        { kind: "link", path: "", label: "Overview", icon: "LayoutDashboard" },
      ],
    },
    {
      heading: "My Health",
      items: [
        { kind: "link", path: "health", label: "My Health", icon: "HeartPulse" },
        { kind: "link", path: "timeline", label: "Health Timeline", icon: "Timeline" },
        { kind: "link", path: "screening", label: "Movement Screening", icon: "Activity" },
        {
          kind: "group",
          label: "Assessments & Consent",
          icon: "ClipboardList",
          children: [
            { path: "questionnaires", label: "Health Questionnaire", icon: "FileQuestion" },
            { path: "consent", label: "Consent & Privacy", icon: "ShieldCheck" },
          ],
        },
      ],
    },
    {
      heading: "My Records",
      items: [
        { kind: "link", path: "certificates", label: "Certificates", icon: "Award" },
        { kind: "link", path: "reports", label: "Reports", icon: "FileText" },
        { kind: "link", path: "schedule", label: "Appointments", icon: "CalendarDays" },
      ],
    },
    {
      heading: "My Account",
      items: [
        { kind: "link", path: "profile", label: "My Profile", icon: "CircleUser" },
        { kind: "link", path: "messages", label: "Messages", icon: "MessageSquare" },
        { kind: "link", path: "notifications", label: "Notifications", icon: "Bell" },
        { kind: "link", path: "account", label: "Account", icon: "Settings" },
        { kind: "link", path: "settings", label: "Settings", icon: "SlidersHorizontal" },
      ],
    },
  ],

  // ── GUARDIAN ─────────────────────────────────────────────────────────────
  guardian: [
    {
      items: [
        { kind: "link", path: "", label: "Overview", icon: "LayoutDashboard" },
      ],
    },
    {
      heading: "Linked Athletes",
      items: [
        { kind: "link", path: "athletes", label: "Linked Athletes", icon: "Users" },
        {
          kind: "group",
          label: "Health & Care",
          icon: "HeartPulse",
          defaultOpen: true,
          children: [
            { path: "health", label: "Health Summary", icon: "Heart" },
            { path: "assessments", label: "Assessments", icon: "ClipboardList" },
            { path: "injuries", label: "Injuries", icon: "Bandage" },
            { path: "rehabilitation", label: "Rehabilitation", icon: "Dumbbell" },
            { path: "eligibility", label: "Participation Status", icon: "ShieldCheck" },
          ],
        },
        {
          kind: "group",
          label: "Consent & Privacy",
          icon: "FileSignature",
          children: [
            { path: "consent", label: "Consent & Assent", icon: "FileCheck" },
            { path: "questionnaires", label: "Questionnaires", icon: "FileQuestion" },
          ],
        },
      ],
    },
    {
      heading: "Documents",
      items: [
        { kind: "link", path: "certificates", label: "Certificates", icon: "Award" },
        { kind: "link", path: "documents", label: "Documents", icon: "FolderOpen" },
      ],
    },
    {
      heading: "Account",
      items: [
        { kind: "link", path: "messages", label: "Messages", icon: "MessageSquare" },
        { kind: "link", path: "notifications", label: "Notifications", icon: "Bell" },
        { kind: "link", path: "account", label: "Account", icon: "CircleUser" },
        { kind: "link", path: "settings", label: "Settings", icon: "SlidersHorizontal" },
      ],
    },
  ],

  // ── CLINICIAN ─────────────────────────────────────────────────────────────
  clinician: [
    {
      items: [
        { kind: "link", path: "", label: "Overview", icon: "LayoutDashboard" },
        { kind: "link", path: "athletes", label: "Athletes", icon: "Users" },
      ],
    },
    {
      heading: "Clinical",
      items: [
        {
          kind: "group",
          label: "Assessments",
          icon: "Stethoscope",
          defaultOpen: true,
          children: [
            { path: "assessments", label: "PPE Assessments", icon: "ClipboardList" },
            { path: "incidents", label: "Incidents", icon: "TriangleAlert" },
            { path: "eligibility", label: "Eligibility Decisions", icon: "ShieldCheck" },
            { path: "reassessments", label: "Reassessments", icon: "RefreshCw" },
            { path: "certificates", label: "Certificates", icon: "Award" },
          ],
        },
        {
          kind: "group",
          label: "Referrals",
          icon: "ArrowRightLeft",
          children: [
            { path: "referrals", label: "All Referrals", icon: "ArrowRightLeft" },
          ],
        },
      ],
    },
    {
      heading: "Movement",
      items: [
        {
          kind: "group",
          label: "Screening & AI",
          icon: "ScanLine",
          children: [
            { path: "screenings", label: "Movement Screening", icon: "Activity" },
            { path: "ai-reviews", label: "AI Review Queue", icon: "BrainCircuit" },
          ],
        },
      ],
    },
    {
      heading: "Operations",
      items: [
        {
          kind: "group",
          label: "Schedule & Tasks",
          icon: "CalendarDays",
          children: [
            { path: "schedule", label: "Schedule", icon: "CalendarDays" },
            { path: "events", label: "Events", icon: "CalendarClock" },
            { path: "tasks", label: "Tasks", icon: "ListChecks" },
          ],
        },
        { kind: "link", path: "reports", label: "Reports", icon: "FileBarChart" },
      ],
    },
    {
      heading: "Connect",
      items: [
        { kind: "link", path: "messages", label: "Messages", icon: "MessageSquare" },
        { kind: "link", path: "notifications", label: "Notifications", icon: "Bell" },
        { kind: "link", path: "account", label: "Account", icon: "CircleUser" },
        { kind: "link", path: "settings", label: "Settings", icon: "SlidersHorizontal" },
      ],
    },
  ],

  // ── PHYSIOTHERAPIST ───────────────────────────────────────────────────────
  physiotherapist: [
    {
      items: [
        { kind: "link", path: "", label: "Overview", icon: "LayoutDashboard" },
        { kind: "link", path: "athletes", label: "Assigned Athletes", icon: "Users" },
      ],
    },
    {
      heading: "Movement",
      items: [
        {
          kind: "group",
          label: "Screening & AI",
          icon: "ScanLine",
          defaultOpen: true,
          children: [
            { path: "screenings", label: "Movement Screening", icon: "Activity" },
            { path: "ai-reviews", label: "AI Review Queue", icon: "BrainCircuit" },
          ],
        },
        {
          kind: "group",
          label: "Rehabilitation",
          icon: "Dumbbell",
          children: [
            { path: "rehabilitation", label: "Rehab Plans", icon: "ClipboardList" },
            { path: "progress", label: "Progress Reviews", icon: "TrendingUp" },
          ],
        },
      ],
    },
    {
      heading: "Referrals",
      items: [
        {
          kind: "group",
          label: "Referrals",
          icon: "ArrowRightLeft",
          children: [
            { path: "referrals/incoming", label: "Incoming", icon: "ArrowDownToLine" },
            { path: "referrals/mine", label: "My Referrals", icon: "ArrowRightLeft" },
            { path: "referrals/completed", label: "Completed", icon: "CheckCircle2" },
          ],
        },
        { kind: "link", path: "schedule", label: "Schedule", icon: "CalendarDays" },
      ],
    },
    {
      heading: "Connect",
      items: [
        { kind: "link", path: "messages", label: "Messages", icon: "MessageSquare" },
        { kind: "link", path: "notifications", label: "Notifications", icon: "Bell" },
        { kind: "link", path: "account", label: "Account", icon: "CircleUser" },
        { kind: "link", path: "settings", label: "Settings", icon: "SlidersHorizontal" },
      ],
    },
  ],

  // ── COACH ─────────────────────────────────────────────────────────────────
  coach: [
    {
      items: [
        { kind: "link", path: "", label: "Overview", icon: "LayoutDashboard" },
      ],
    },
    {
      heading: "My Team",
      items: [
        { kind: "link", path: "roster", label: "Team Roster", icon: "Users" },
        {
          kind: "group",
          label: "Athlete Status",
          icon: "ShieldCheck",
          defaultOpen: true,
          children: [
            { path: "status", label: "Participation Status", icon: "CircleCheck" },
            { path: "restrictions", label: "Activity Restrictions", icon: "Ban" },
          ],
        },
        {
          kind: "group",
          label: "Team Readiness",
          icon: "BarChart3",
          children: [
            { path: "attendance", label: "Attendance", icon: "CalendarCheck" },
            { path: "readiness", label: "Team Readiness", icon: "BarChart3" },
            { path: "screening", label: "Screening Completion", icon: "ScanLine" },
          ],
        },
      ],
    },
    {
      heading: "Schedule",
      items: [
        {
          kind: "group",
          label: "Training & Events",
          icon: "CalendarDays",
          children: [
            { path: "training", label: "Training Schedule", icon: "CalendarDays" },
            { path: "events", label: "Events", icon: "CalendarClock" },
          ],
        },
      ],
    },
    {
      heading: "Alerts & Safety",
      items: [
        { kind: "link", path: "alerts", label: "Action Alerts", icon: "TriangleAlert" },
        { kind: "link", path: "incidents", label: "Report Incident", icon: "FilePlus" },
      ],
    },
    {
      heading: "Connect",
      items: [
        { kind: "link", path: "messages", label: "Messages", icon: "MessageSquare" },
        { kind: "link", path: "notifications", label: "Notifications", icon: "Bell" },
        { kind: "link", path: "account", label: "Account", icon: "CircleUser" },
        { kind: "link", path: "settings", label: "Settings", icon: "SlidersHorizontal" },
      ],
    },
  ],

  // ── INSTITUTION ───────────────────────────────────────────────────────────
  institution: [
    {
      items: [
        { kind: "link", path: "", label: "Overview", icon: "LayoutDashboard" },
      ],
    },
    {
      heading: "Athletes & Teams",
      items: [
        { kind: "link", path: "athletes", label: "Athletes", icon: "Users" },
        {
          kind: "group",
          label: "Teams & Sports",
          icon: "Trophy",
          children: [
            { path: "teams", label: "Teams", icon: "UsersRound" },
            { path: "sports", label: "Sports", icon: "Trophy" },
          ],
        },
      ],
    },
    {
      heading: "Health & Safety",
      items: [
        { kind: "link", path: "readiness", label: "Institution Readiness", icon: "ShieldCheck" },
        {
          kind: "group",
          label: "Compliance",
          icon: "ClipboardCheck",
          defaultOpen: true,
          children: [
            { path: "ppe", label: "PPE Completion", icon: "ClipboardList" },
            { path: "screening", label: "Screening Completion", icon: "ScanLine" },
            { path: "injuries", label: "Injury Trends", icon: "Bandage" },
            { path: "referrals", label: "Referral Coordination", icon: "ArrowRightLeft" },
          ],
        },
      ],
    },
    {
      heading: "Operations",
      items: [
        {
          kind: "group",
          label: "Schedule",
          icon: "CalendarDays",
          children: [
            { path: "schedule", label: "Schedule", icon: "CalendarDays" },
            { path: "events", label: "Events", icon: "CalendarClock" },
            { path: "coverage", label: "Clinical Coverage", icon: "Stethoscope" },
          ],
        },
        { kind: "link", path: "staff", label: "Staff Directory", icon: "UserCheck" },
      ],
    },
    {
      heading: "Reports",
      items: [
        {
          kind: "group",
          label: "Reports",
          icon: "FileBarChart",
          children: [
            { path: "reports", label: "All Reports", icon: "FileBarChart" },
            { path: "reports/injuries", label: "Injury Report", icon: "Bandage" },
            { path: "reports/readiness", label: "Readiness Report", icon: "ShieldCheck" },
            { path: "reports/screening", label: "Screening Report", icon: "ScanLine" },
            { path: "reports/compliance", label: "Consent Compliance", icon: "FileCheck" },
          ],
        },
      ],
    },
    {
      heading: "Organization",
      items: [
        { kind: "link", path: "profile", label: "Institution Profile", icon: "Building2" },
        { kind: "link", path: "users", label: "Access Requests", icon: "UserPlus" },
        { kind: "link", path: "messages", label: "Messages", icon: "MessageSquare" },
        { kind: "link", path: "notifications", label: "Notifications", icon: "Bell" },
        { kind: "link", path: "account", label: "Account", icon: "CircleUser" },
        { kind: "link", path: "settings", label: "Settings", icon: "SlidersHorizontal" },
      ],
    },
  ],

  // ── OPERATIONS ────────────────────────────────────────────────────────────
  operations: [
    {
      items: [
        { kind: "link", path: "", label: "Overview", icon: "LayoutDashboard" },
        { kind: "link", path: "tasks", label: "Task Board", icon: "ListChecks" },
        { kind: "link", path: "activity", label: "Coordination Activity", icon: "Activity" },
      ],
    },
    {
      heading: "Scheduling",
      items: [
        {
          kind: "group",
          label: "Calendar & Appointments",
          icon: "CalendarDays",
          defaultOpen: true,
          children: [
            { path: "calendar", label: "Calendar", icon: "CalendarDays" },
            { path: "appointments", label: "Appointments", icon: "CalendarCheck" },
            { path: "events", label: "Events", icon: "CalendarClock" },
            { path: "rosters", label: "Team Rosters", icon: "UsersRound" },
          ],
        },
        {
          kind: "group",
          label: "Service Delivery",
          icon: "Stethoscope",
          children: [
            { path: "coverage", label: "Clinical Coverage", icon: "Stethoscope" },
            { path: "screening", label: "Screening Sessions", icon: "ScanLine" },
            { path: "clinics", label: "Clinics", icon: "Building2" },
            { path: "assignments", label: "Staff Assignments", icon: "UserCheck" },
          ],
        },
      ],
    },
    {
      heading: "Referrals",
      items: [
        {
          kind: "group",
          label: "Referral Tracking",
          icon: "ArrowRightLeft",
          children: [
            { path: "referrals", label: "All Referrals", icon: "ArrowRightLeft" },
            { path: "referrals/pending", label: "Pending", icon: "Clock" },
            { path: "referrals/overdue", label: "Overdue", icon: "TriangleAlert" },
            { path: "referrals/completed", label: "Completed", icon: "CheckCircle2" },
          ],
        },
      ],
    },
    {
      heading: "Organizations",
      items: [
        {
          kind: "group",
          label: "Institutions & Teams",
          icon: "Building2",
          children: [
            { path: "institutions", label: "Institutions", icon: "Building2" },
            { path: "teams", label: "Teams", icon: "UsersRound" },
            { path: "services", label: "Service Catalogue", icon: "LayoutList" },
          ],
        },
        { kind: "link", path: "reports", label: "Operations Reports", icon: "FileBarChart" },
      ],
    },
    {
      heading: "Connect",
      items: [
        { kind: "link", path: "messages", label: "Messages", icon: "MessageSquare" },
        { kind: "link", path: "notifications", label: "Notifications", icon: "Bell" },
        { kind: "link", path: "account", label: "Account", icon: "CircleUser" },
        { kind: "link", path: "settings", label: "Settings", icon: "SlidersHorizontal" },
      ],
    },
  ],

  // ── SYS-ADMIN ─────────────────────────────────────────────────────────────
  "sys-admin": [
    {
      items: [
        { kind: "link", path: "", label: "Overview", icon: "LayoutDashboard" },
      ],
    },
    {
      heading: "Administration",
      items: [
        {
          kind: "group",
          label: "Users & Access",
          icon: "Users",
          defaultOpen: true,
          children: [
            { path: "users", label: "User Management", icon: "Users" },
            { path: "roles", label: "Role Permissions", icon: "KeyRound" },
            { path: "organizations", label: "Organizations", icon: "Building2" },
          ],
        },
        {
          kind: "group",
          label: "Configuration",
          icon: "Settings2",
          children: [
            { path: "config/sports", label: "Sport Configuration", icon: "Trophy" },
            { path: "config/assessments", label: "Assessment Config", icon: "ClipboardList" },
            { path: "config/workflows", label: "Workflow Config", icon: "GitBranch" },
            { path: "config/notifications", label: "Notification Prefs", icon: "BellDot" },
          ],
        },
      ],
    },
    {
      heading: "Security",
      items: [
        {
          kind: "group",
          label: "Security & Audit",
          icon: "ShieldAlert",
          children: [
            { path: "security/access", label: "Access Review", icon: "Eye" },
            { path: "security/audit", label: "Audit Activity", icon: "ClipboardCheck" },
            { path: "security/sessions", label: "Demo Sessions", icon: "MonitorCheck" },
          ],
        },
      ],
    },
    {
      heading: "System",
      items: [
        {
          kind: "group",
          label: "System",
          icon: "Server",
          children: [
            { path: "system/health", label: "System Health", icon: "HeartPulse" },
            { path: "system/integrations", label: "Integrations", icon: "Plug" },
            { path: "system/storage", label: "Storage", icon: "HardDrive" },
            { path: "system/jobs", label: "Background Jobs", icon: "Cog" },
          ],
        },
        {
          kind: "group",
          label: "Support",
          icon: "LifeBuoy",
          children: [
            { path: "support/activity", label: "Support Activity", icon: "Activity" },
            { path: "support/errors", label: "Error Log", icon: "Bug" },
          ],
        },
      ],
    },
    {
      heading: "Connect",
      items: [
        { kind: "link", path: "messages", label: "Messages", icon: "MessageSquare" },
        { kind: "link", path: "notifications", label: "Notifications", icon: "Bell" },
        { kind: "link", path: "account", label: "Account", icon: "CircleUser" },
        { kind: "link", path: "settings", label: "Settings", icon: "SlidersHorizontal" },
      ],
    },
  ],
};
