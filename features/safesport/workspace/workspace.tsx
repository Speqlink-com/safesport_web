"use client";
import { usePathname } from "next/navigation";
import {
  roles,
  type Role,
  navigation,
  href,
  type Surface,
  identities,
} from "./catalog";
import { Empty, Go, PageHeading, Panel } from "./ui";
import { Home, Athletes, Health, Profile, Settings } from "./people";
import {
  ConsentScreen,
  Questionnaire,
  Assessments,
  Eligibility,
} from "./clinical";
import {
  Records,
  Screenings,
  Rehabilitation,
  Reports,
  Schedule,
} from "./records";
import { Notifications, Messages } from "./communication";
import {
  Teams,
  Organizations,
  Users,
  Configuration,
  Audit,
  System,
} from "./administration";
import { useWorkspace } from "./store";
const aliases: Partial<Record<string, Surface>> = {
  athletes: "athletes",
  roster: "athletes",
  profile: "profile",
  account: "profile",
  health: "health",
  timeline: "health",
  consent: "consent",
  questionnaires: "questionnaires",
  assessments: "assessments",
  screening: "screenings",
  screenings: "screenings",
  "ai-reviews": "screenings",
  referrals: "referrals",
  rehabilitation: "rehabilitation",
  progress: "rehabilitation",
  reassessments: "rehabilitation",
  eligibility: "eligibility",
  status: "eligibility",
  restrictions: "eligibility",
  certificates: "certificates",
  reports: "reports",
  messages: "messages",
  notifications: "notifications",
  schedule: "schedule",
  appointments: "schedule",
  events: "schedule",
  calendar: "schedule",
  teams: "teams",
  incidents: "incidents",
  injuries: "incidents",
  tasks: "tasks",
  alerts: "tasks",
  settings: "settings",
  documents: "documents",
};
const permitted: Record<Role, Surface[]> = {
  athlete: [
    "home",
    "athletes",
    "profile",
    "health",
    "consent",
    "questionnaires",
    "assessments",
    "screenings",
    "referrals",
    "rehabilitation",
    "eligibility",
    "certificates",
    "reports",
    "messages",
    "notifications",
    "schedule",
    "settings",
    "documents",
    "incidents",
  ],
  guardian: [
    "home",
    "athletes",
    "profile",
    "health",
    "consent",
    "questionnaires",
    "assessments",
    "referrals",
    "rehabilitation",
    "eligibility",
    "certificates",
    "reports",
    "messages",
    "notifications",
    "schedule",
    "settings",
    "documents",
    "incidents",
  ],
  clinician: [
    "home",
    "athletes",
    "profile",
    "health",
    "consent",
    "questionnaires",
    "assessments",
    "screenings",
    "referrals",
    "rehabilitation",
    "eligibility",
    "certificates",
    "reports",
    "messages",
    "notifications",
    "schedule",
    "settings",
    "documents",
    "incidents",
    "tasks",
  ],
  physiotherapist: [
    "home",
    "athletes",
    "profile",
    "screenings",
    "referrals",
    "rehabilitation",
    "reports",
    "messages",
    "notifications",
    "schedule",
    "settings",
    "tasks",
  ],
  coach: [
    "home",
    "athletes",
    "profile",
    "eligibility",
    "messages",
    "notifications",
    "schedule",
    "teams",
    "incidents",
    "tasks",
    "settings",
  ],
  institution: [
    "home",
    "athletes",
    "profile",
    "eligibility",
    "referrals",
    "reports",
    "messages",
    "notifications",
    "schedule",
    "teams",
    "organizations",
    "settings",
    "users",
  ],
  operations: [
    "home",
    "athletes",
    "profile",
    "referrals",
    "reports",
    "messages",
    "notifications",
    "schedule",
    "teams",
    "organizations",
    "settings",
    "users",
    "tasks",
    "config",
    "audit",
  ],
  "sys-admin": [
    "home",
    "profile",
    "messages",
    "notifications",
    "teams",
    "organizations",
    "settings",
    "users",
    "config",
    "audit",
    "system",
  ],
};
export default function Workspace() {
  const pathname = usePathname();
  return <WorkspaceRoute key={pathname} pathname={pathname} />;
}
function WorkspaceRoute({ pathname }: { pathname: string }) {
  const parts = pathname.split("/").filter(Boolean);
  const candidate = parts[1];
  const role: Role = roles.includes(candidate as Role)
    ? (candidate as Role)
    : "clinician";
  const path = roles.includes(candidate as Role)
    ? parts.slice(2).join("/")
    : candidate || "";
  const segments = path.split("/");
  const exact = navigation[role].find((n) => n.path === path);
  const base = segments[0];
  const surface =
    exact?.surface || (base.startsWith("ATH-") ? "athletes" : aliases[base]);
  const id = base.startsWith("ATH-")
    ? base
    : !exact && segments.length > 1
      ? segments.slice(1).join("/")
      : undefined;
  const { state } = useWorkspace();
  const safeId =
    id && base === "screening" && id.startsWith("SCR-") ? `legacy-${id}` : id;
  if (!path) return <Home role={role} />;
  if (!surface || !permitted[role].includes(surface))
    return (
      <Empty
        title="Page unavailable in this workspace"
        description="Use your role’s navigation to open a permitted demo page."
      >
        <Go to={href(role)}>
          Return to {identities[role].title.toLowerCase()} overview
        </Go>
      </Empty>
    );
  switch (surface) {
    case "home":
      return <Home role={role} />;
    case "athletes":
      return <Athletes role={role} id={safeId} />;
    case "profile":
      return (
        <Profile
          role={role}
          account={base === "account" || role !== "athlete"}
        />
      );
    case "health":
      return <Health role={role} view={base} />;
    case "consent":
      return <ConsentScreen role={role} />;
    case "questionnaires":
      return <Questionnaire role={role} />;
    case "assessments":
      return <Assessments role={role} id={safeId} />;
    case "screenings":
      return (
        <Screenings
          role={role}
          id={safeId}
          reviewOnly={base === "ai-reviews"}
        />
      );
    case "referrals":
      return (
        <Records
          role={role}
          collection="referrals"
          id={safeId}
          view={exact?.path.split("/")[1]}
        />
      );
    case "rehabilitation":
      return <Rehabilitation role={role} view={base} />;
    case "eligibility":
      return <Eligibility role={role} />;
    case "certificates":
      return <Eligibility role={role} certificates />;
    case "reports":
      return <Reports role={role} view={path} />;
    case "notifications":
      return <Notifications role={role} />;
    case "messages":
      return <Messages key={role} role={role} />;
    case "schedule":
      return <Schedule role={role} id={safeId} view={base} />;
    case "teams":
      return <Teams role={role} view={base} />;
    case "organizations":
      return <Organizations role={role} />;
    case "incidents":
      return <Records role={role} collection="incidents" id={safeId} />;
    case "tasks":
      return base === "screening" ? (
        <>
          <PageHeading
            title="Screening completion"
            description="Operational completion only. Clinical findings and AI metrics are restricted."
          />
          <Panel title="Team completion">
            <p className="text-sm">
              {
                state.records.screenings.filter(
                  (s) =>
                    s.reviewer &&
                    state.athletes.some(
                      (a) =>
                        a.id === s.athleteId &&
                        a.currentOrganization?.id === "org-001",
                    ),
                ).length
              }{" "}
              reviewed screenings in your institution.
            </p>
            <Go to={href(role, "roster")} secondary>
              View team roster
            </Go>
          </Panel>
        </>
      ) : (
        <Records role={role} collection="tasks" id={safeId} />
      );
    case "settings":
      return <Settings role={role} />;
    case "documents":
      return <Records role={role} collection="documents" id={safeId} />;
    case "users":
      return <Users role={role} view={base} />;
    case "config":
      return <Configuration role={role} view={path} />;
    case "audit":
      return <Audit role={role} />;
    case "system":
      return <System view={path} />;
  }
}
