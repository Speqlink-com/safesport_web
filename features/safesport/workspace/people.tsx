"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  HeartPulse,
  ShieldCheck,
  ArrowRight,
  CalendarDays,
  UsersRound,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { type Role, identities, href, personal } from "./catalog";
import {
  useWorkspace,
  visibleAthletes,
  fullName,
  newId,
  today,
  type State,
} from "./store";
import type { Athlete } from "../types";
import {
  PageHeading,
  Panel,
  Empty,
  Status,
  Go,
  Field,
  Choice,
  Check,
  Tabbed,
  DataList,
} from "./ui";
import { Records, Rehabilitation, scopedRecords } from "./records";
import { Assessments, Eligibility, ConsentScreen } from "./clinical";
import { PPEProgress } from "./ppe-progress";
import { ClinicianHome } from "./clinician-home";
import Link from "next/link";
import { OverviewVisual, RehabilitationVisual } from "./overview-visuals";
import { authApi, systemAdminApi, type AdminOverview } from "@/features/auth/api";
import { useAuthStore } from "@/features/auth/store";
export function Home({ role }: { role: Role }) {
  // Hooks must be called unconditionally before any early return.
  const { state } = useWorkspace();
  const [adminOverview, setAdminOverview] = useState<AdminOverview | null>(null);

  useEffect(() => {
    let active = true;
    if (role !== "sys-admin") return;
    void systemAdminApi.overview()
      .then((overview) => {
        if (active) setAdminOverview(overview);
      })
      .catch(() => {
        if (active) setAdminOverview(null);
      });
    return () => {
      active = false;
    };
  }, [role]);

  // ── Clinician gets a dedicated redesigned overview ──────────────────────
  if ((role as string) === "clinician") return <ClinicianHome />;
  // ───────────────────────────────────────────────────────────────────────

  const athletes = visibleAthletes(state, role);
  const encounters = state.encounters.filter((e) =>
    athletes.some((a) => a.id === e.athleteId),
  );
  const referrals = scopedRecords(state, role, "referrals");
  const events = scopedRecords(state, role, "events").filter(
    (e) => e.status === "scheduled",
  );
  const notices = state.notices.filter((n) => n.role === role && !n.read);
  const finalizedAssessments = encounters.filter((e) => e.finalized);
  const submittedAssessments = encounters.filter(
    (e) => e.finalized || e.historySubmitted || e.reviewed || e.status !== "draft",
  );
  const assessmentTotal = finalizedAssessments.length
    ? finalizedAssessments.length
    : submittedAssessments.length;
  const screened = scopedRecords(state, role, "screenings");
  const authUser = useAuthStore((auth) => auth.user);
  const user =
    authUser?.role === role
      ? `${authUser.first_name} ${authUser.last_name}`
      : state.accounts[role]?.name || identities[role].name;
  const displayDate = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date());
  const stats =
    role === "sys-admin"
      ? [
          {
            label: "Total users",
            value: adminOverview?.total_users ?? state.records.users.length,
            path: "users",
            icon: UsersRound,
          },
          {
            label: "Active users",
            value: adminOverview?.active_users ?? state.records.users.filter((u) => u.status === "active").length,
            path: "security/access",
            icon: ShieldCheck,
          },
          {
            label: "Institutions",
            value: adminOverview?.institutions ?? state.organizations.length,
            path: "organizations",
            icon: ClipboardList,
          },
          {
            label: "Sports",
            value: adminOverview?.sports ?? 0,
            path: "config/sports",
            icon: CalendarDays,
          },
        ]
      : [
          {
            label: personal(role)
              ? "Linked athlete records"
              : "Athletes in scope",
            value: athletes.length,
            path:
              role === "athlete"
                ? "profile"
                : role === "coach"
                  ? "roster"
                  : "athletes",
            icon: UsersRound,
          },
          {
            label:
              role === "physiotherapist"
                ? "Awaiting movement review"
                : "Cleared for participation",
            value:
              role === "physiotherapist"
                ? screened.filter((s) => s.status === "ready_for_review").length
                : athletes.filter((a) => a.eligibilityStatus === "cleared")
                    .length,
            path:
              role === "physiotherapist"
                ? "ai-reviews"
                : role === "institution"
                  ? "readiness"
                  : role === "operations"
                    ? "reports"
                    : "eligibility",
            icon: ShieldCheck,
          },
          {
            label: "Open referrals",
            value: referrals.filter((r) => r.status !== "completed").length,
            path:
              role === "athlete" || role === "guardian"
                ? "health"
                : role === "coach"
                  ? "alerts"
                  : "referrals",
            icon: HeartPulse,
          },
          {
            label: "Upcoming appointments",
            value: events.length,
            path: role === "guardian" ? "health" : "schedule",
            icon: CalendarDays,
          },
        ];
  const primary =
    role === "clinician"
      ? "assessments"
      : role === "physiotherapist"
        ? "rehabilitation"
        : role === "athlete"
          ? "health"
          : role === "guardian"
            ? "consent"
            : role === "coach"
              ? "roster"
              : role === "institution"
                ? "readiness"
                : role === "operations"
                  ? "appointments"
                  : "users";
  return (
    <>
      <PageHeading
        eyebrow={`${identities[role].title} workspace · ${displayDate}`}
        title={`Welcome, ${user.split(" ")[0] === "Dr" ? user : user.split(" ")[0]}`}
        description={
          role === "sys-admin"
            ? "Manage access, configuration and technical metadata. Clinical content is excluded from this workspace."
            : personal(role)
              ? "Your care, progress and next steps in one place."
              : "A clear view of the people and actions that need your attention."
        }
      >
        <Go to={href(role, primary)}>
          Open {primary.replaceAll("-", " ")}
          <ArrowRight />
        </Go>
      </PageHeading>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={href(role, s.path)}
            className="group rounded-xl border border-border/70 bg-card p-4 sm:p-5 transition-colors hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-ring"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                {s.label}
              </p>
              <s.icon className="size-4 text-muted-foreground" />
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tight tabular-nums">
              {s.value}
            </p>
            <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              View details{" "}
              <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
            </p>
          </Link>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Panel
          title={
            role === "sys-admin"
              ? "Access overview"
              : role === "operations"
                ? "Referral coordination"
                : role === "physiotherapist"
                  ? "Screening workload"
                  : personal(role)
                    ? "Your participation summary"
                    : "Participation overview"
          }
          description="Derived from current SafeSport records."
        >
          <OverviewVisual role={role} />
        </Panel>
        <Panel
          title="Needs attention"
          description="Take the next step in your workspace."
        >
          {notices.slice(0, 3).map((n) => (
            <div
              className="flex items-start justify-between gap-3 border-b border-border/50 pb-4"
              key={n.id}
            >
              <div>
                <p className="text-sm font-medium">{n.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {n.date.slice(0, 10)}
                </p>
              </div>
              <Go to={href(role, n.path)} secondary>
                Open
              </Go>
            </div>
          ))}
          {!notices.length && (
            <Empty
              title="You’re up to date"
              description="New actions appear here as the care team updates records."
            />
          )}
          <Go to={href(role, "notifications")} secondary>
            All notifications
          </Go>
        </Panel>
      </div>
      {role === "physiotherapist" && <RehabilitationVisual role={role} />}
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title={
            role === "sys-admin" ? "Recent system activity" : "Upcoming care"
          }
        >
          {role === "sys-admin" ? (
            state.audit.slice(0, 4).map((a) => (
              <div key={a.id} className="border-b pb-3 text-sm">
                <p>{a.title}</p>
                <p className="text-xs text-muted-foreground">
                  {a.actor} · {a.date.slice(0, 10)}
                </p>
              </div>
            ))
          ) : events.length ? (
            events.slice(0, 4).map((e) => (
              <div
                className="flex items-center justify-between gap-3 border-b pb-3"
                key={e.id}
              >
                <div>
                  <p className="text-sm font-medium">{e.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {e.date.replace("T", " · ")} · {e.assigned}
                  </p>
                </div>
                <Go to={href(role, `schedule/${e.id}`)} secondary>
                  Details
                </Go>
              </div>
            ))
          ) : (
            <Empty
              title="No upcoming appointments"
              description="Appointments will appear when the coordinator schedules them."
            />
          )}
        </Panel>
        <Panel
          title={
            role === "sys-admin" ? "Backend connections" : "Care completion"
          }
        >
          {role === "sys-admin" ? (
            <>
              <Status value="not_connected" />
              <p className="text-sm text-muted-foreground">
                Authentication, storage, messaging and AI connections are not
                configured in this frontend demo.
              </p>
              <Go to={href(role, "system/integrations")} secondary>
                Integration status
              </Go>
            </>
          ) : (
            <>
              <p className="text-3xl font-semibold">
                {finalizedAssessments.length}
                <span className="text-base font-normal text-muted-foreground">
                  {" "}
                  / {assessmentTotal} assessments finalized
                </span>
              </p>
              <Progress
                value={
                  assessmentTotal
                    ? (finalizedAssessments.length / assessmentTotal) * 100
                    : 0
                }
              />
              <p className="text-sm text-muted-foreground">
                Injury, rehabilitation and return-to-play updates appear as
                your care team records them.
              </p>
              <Go
                to={href(
                  role,
                  role === "coach"
                    ? "screening"
                    : role === "institution" || role === "operations"
                      ? "reports"
                      : role === "physiotherapist"
                        ? "progress"
                        : role === "guardian"
                        ? "health"
                        : "assessments",
                )}
                secondary
              >
                Review progress
              </Go>
            </>
          )}
        </Panel>
      </div>
    </>
  );
}
export function Athletes({ role, id }: { role: Role; id?: string }) {
  const { state } = useWorkspace();
  const [open, setOpen] = useState(false);
  const athletes = visibleAthletes(state, role);
  if (id) {
    const a = athletes.find((a) => a.id === id);
    return a ? (
      <AthleteRecord role={role} athlete={a} />
    ) : (
      <Empty
        title="Athlete unavailable"
        description="This athlete is outside your demo workspace."
      >
        <Go to={href(role, "athletes")}>Back to athletes</Go>
      </Empty>
    );
  }
  return (
    <>
      <PageHeading
        title={
          role === "guardian"
            ? "Linked athletes"
            : role === "physiotherapist"
              ? "Assigned athletes"
              : role === "coach"
                ? "Team roster"
                : "Athletes"
        }
        description="One athlete ID connects participation, care and follow-up."
      >
        {["clinician", "operations", "institution"].includes(role) && (
          <Button onClick={() => setOpen(true)}>Register athlete</Button>
        )}
      </PageHeading>
      <Panel title="Athlete directory">
        <DataList
          label="athletes"
          rows={athletes.map((a) => ({
            id: a.id,
            name: fullName(a),
            status: a.eligibilityStatus,
            date: a.nextReview,
            detail: `${a.currentTeam?.name || "No team"} · ${a.currentOrganization?.name || "No institution"}`,
            to: href(role, `athletes/${a.id}`),
          }))}
        />
      </Panel>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Register athlete</DialogTitle>
            <DialogDescription>
              Create a draft record. Consent and clinical eligibility are not
              inferred from registration.
            </DialogDescription>
          </DialogHeader>
          {open && <Registration role={role} onClose={() => setOpen(false)} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
export function makeAthlete(
  state: State,
  form: Record<string, string>,
  id: string,
): Athlete {
  const team = state.teams.find((t) => t.id === form.team);
  const organization = state.organizations.find(
    (o) => o.id === team?.organizationId,
  );
  const age =
    2026 - Number(form.dob.slice(0, 4)) - (form.dob.slice(5) > "09-24" ? 1 : 0);
  return {
    id,
    firstName: form.firstName,
    lastName: form.lastName,
    dateOfBirth: form.dob,
    age,
    gender: (form.gender || "other") as Athlete["gender"],
    currentTeam: team,
    currentSport: team?.sport,
    currentOrganization: organization,
    eligibilityStatus: "pending_evaluation",
    readiness: "under_review",
    organizations: organization
      ? [
          {
            organizationId: organization.id,
            organization,
            joinedAt: today,
            status: "active",
          },
        ]
      : [],
    teams: team
      ? [
          {
            teamId: team.id,
            team,
            sport: team.sport,
            joinedAt: today,
            status: "active",
          },
        ]
      : [],
    ppeAssessments: [],
    incidents: [],
    screenings: [],
    referrals: [],
    eligibilityHistory: [],
    createdAt: today,
    updatedAt: today,
  };
}
function Registration({ role, onClose }: { role: Role; onClose: () => void }) {
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
  const patch = (key: string, value: string) =>
    setForm({ ...form, [key]: value });
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const athlete = makeAthlete(state, form, newId("ATH"));
        if (athlete.age < 18 && !form.guardian.trim()) {
          toast.error("A guardian is required for a minor.");
          return;
        }
        update(
          (s) => ({
            ...s,
            athletes: [athlete, ...s.athletes],
            registration: {
              ...s.registration,
              [`${athlete.id}-emergency`]: `${form.contact} · ${form.phone}`,
              [`${athlete.id}-guardian`]: form.guardian,
            },
          }),
          "Athlete draft registered",
          role,
          `athletes/${athlete.id}`,
        );
        onClose();
        router.push(href(role, `athletes/${athlete.id}`));
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="First name"
          value={form.firstName}
          onChange={(v) => patch("firstName", v)}
          required
        />
        <Field
          label="Last name"
          value={form.lastName}
          onChange={(v) => patch("lastName", v)}
          required
        />
        <Field
          label="Date of birth"
          type="date"
          min="1920-01-01"
          max={today}
          value={form.dob}
          onChange={(v) => patch("dob", v)}
          required
        />
        <Choice
          label="Sex"
          value={form.gender}
          onChange={(v) => patch("gender", v)}
          options={["male", "female", "other"]}
        />
      </div>
      <Choice
        label="Institution / team"
        value={form.team}
        onChange={(v) => patch("team", v)}
        options={state.teams
          .filter(
            (t) => role !== "institution" || t.organizationId === "org-001",
          )
          .map((t) => ({
            value: t.id,
            label: `${state.organizations.find((o) => o.id === t.organizationId)?.name} · ${t.name}`,
          }))}
      />
      <Field
        label="Parent / guardian (required for minors)"
        value={form.guardian}
        onChange={(v) => patch("guardian", v)}
      />
      <Field
        label="Emergency contact name"
        value={form.contact}
        onChange={(v) => patch("contact", v)}
        required
      />
      <Field
        label="Emergency contact phone"
        type="tel"
        value={form.phone}
        onChange={(v) => patch("phone", v)}
        required
      />
      <div className="flex gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Create athlete record</Button>
      </div>
    </form>
  );
}
function AthleteRecord({ role, athlete: a }: { role: Role; athlete: Athlete }) {
  const { state } = useWorkspace();
  const clinicalView = role === "clinician";
  const physio = role === "physiotherapist";
  const permittedPersonal = personal(role);
  const record = state.encounters.find(
    (e) => e.athleteId === a.id && e.finalized,
  );
  const overview = (
    <Panel
      title="Participation summary"
      description={`${a.currentOrganization?.name} · ${a.currentTeam?.name}`}
    >
      <Status value={a.eligibilityStatus} />
      <p className="text-sm">
        {record?.restrictions ||
          "Follow the current published participation status. Contact the care team for clarification."}
      </p>
      <p className="text-sm text-muted-foreground">
        Next review: {record?.reviewDate || a.nextReview || "Not scheduled"}
      </p>
      {clinicalView && (
        <Go to={href(role, "assessments")}>Clinical assessments</Go>
      )}
      {physio && (
        <Go to={href(role, "rehabilitation")}>Rehabilitation workspace</Go>
      )}
    </Panel>
  );
  const timeline = [
    ...state.encounters
      .filter((e) => e.athleteId === a.id)
      .map((e) => ({
        id: e.id,
        name: "PPE assessment",
        status: e.status,
        date: e.date,
        detail: e.finalized
          ? "Clinician decision recorded"
          : "Assessment in progress",
        to:
          clinicalView || permittedPersonal
            ? href(role, `assessments/${e.id}`)
            : undefined,
      })),
    ...state.records.screenings
      .filter((s) => s.athleteId === a.id)
      .map((s) => ({
        id: s.id,
        name: "Movement screening",
        status: s.status,
        date: s.date,
        detail: "Movement review",
        to:
          clinicalView || physio || role === "athlete"
            ? href(
                role,
                `${role === "athlete" ? "screening" : "screenings"}/${s.id}`,
              )
            : undefined,
      })),
  ];
  const tabs = [
    {
      id: "overview",
      label: "Overview",
      content: (
        <>
          {overview}
          {(clinicalView || physio || permittedPersonal) && (
            <PPEProgress role={role} athleteId={a.id} />
          )}
        </>
      ),
    },
    ...(clinicalView || physio || permittedPersonal
      ? [
          {
            id: "referrals",
            label: "Referrals",
            content: (
              <Records
                role={role}
                collection="referrals"
                athleteId={a.id}
                embedded
              />
            ),
          },
          {
            id: "plans",
            label: "Rehabilitation",
            content: (
              <Records
                role={role}
                collection="plans"
                athleteId={a.id}
                embedded
              />
            ),
          },
        ]
      : []),
    ...(clinicalView
      ? [
          {
            id: "clinical",
            label: "Clinical record",
            content: (
              <Panel title="Assessment history">
                <DataList
                  label="assessments"
                  rows={state.encounters
                    .filter((e) => e.athleteId === a.id)
                    .map((e) => ({
                      id: e.id,
                      name: `PPE · ${e.date}`,
                      status: e.status,
                      date: e.date,
                      detail: e.finalized
                        ? e.rationale
                        : "Clinical review pending",
                      to: href(role, `assessments/${e.id}`),
                    }))}
                />
              </Panel>
            ),
          },
        ]
      : []),
    ...(clinicalView || physio || permittedPersonal
      ? [
          {
            id: "timeline",
            label: "Timeline",
            content: <DataList rows={timeline} label="timeline events" />,
          },
        ]
      : []),
    ...(clinicalView || permittedPersonal
      ? [
          {
            id: "consent",
            label: "Consent",
            content: <ConsentScreen role={role} athleteId={a.id} />,
          },
        ]
      : []),
  ];
  return (
    <>
      <PageHeading
        title={fullName(a)}
        description={`${a.id} • ${a.age} years • ${a.currentSport?.name || "Sport not assigned"}`}
      >
        <Go
          to={href(role, role === "athlete" ? "health" : "athletes")}
          secondary
        >
          Back
        </Go>
      </PageHeading>
      <Tabbed tabs={tabs} />
    </>
  );
}
export function Health({ role, view }: { role: Role; view?: string }) {
  const { state } = useWorkspace();
  const authUser = useAuthStore((auth) => auth.user);
  const authName = [authUser?.first_name, authUser?.last_name].filter(Boolean).join(" ").trim();
  const a = visibleAthletes(state, role)[0];
  const healthName = role === "athlete" && authName ? authName : fullName(a);
  const search = useSearchParams();
  if (!a)
    return (
      <Empty
        title="No linked athlete"
        description="Link a permitted athlete to see the health summary."
      />
    );
  return (
    <>
      <PageHeading
        title="My health"
        description={`${healthName} · Your care journey, participation status and next steps.`}
      />
      <Tabbed
        initial={
          view === "timeline" ? "timeline" : search.get("tab") || undefined
        }
        tabs={[
          {
            id: "overview",
            label: "Overview",
            content: <AthleteRecord role={role} athlete={a} />,
          },
          {
            id: "assessments",
            label: "Assessments",
            content: <Assessments role={role} />,
          },
          {
            id: "injuries",
            label: "Injuries",
            content: <Records role={role} collection="incidents" embedded />,
          },
          {
            id: "rehabilitation",
            label: "Rehabilitation",
            content: <Rehabilitation role={role} />,
          },
          {
            id: "eligibility",
            label: "Eligibility",
            content: <Eligibility role={role} />,
          },
          {
            id: "timeline",
            label: "Timeline",
            content: (
              <DataList
                label="care events"
                rows={[
                  ...state.encounters
                    .filter((e) => e.athleteId === a.id)
                    .map((e) => ({
                      id: e.id,
                      name: "PPE assessment",
                      status: e.status,
                      date: e.date,
                      detail: "Clinician-led assessment",
                    })),
                  ...state.records.events
                    .filter((e) => e.athleteId === a.id)
                    .map((e) => ({
                      id: e.id,
                      name: e.title,
                      status: e.status,
                      date: e.date,
                      detail: e.assigned,
                    })),
                ]}
              />
            ),
          },
        ]}
      />
    </>
  );
}
export function Profile({
  role,
  account = false,
}: {
  role: Role;
  account?: boolean;
}) {
  const { state } = useWorkspace();
  const params = useSearchParams();
  const a = visibleAthletes(state, role)[0];
  if (!account && role === "athlete" && a)
    return (
      <>
        <PageHeading
          title="My profile"
          description={`${a.id} · Keep your profile and care information up to date.`}
        />
        <Tabbed
          initial={params.get("tab") || undefined}
          tabs={[
            {
              id: "overview",
              label: "Overview",
              content: <AthleteRecord role={role} athlete={a} />,
            },
            {
              id: "personal",
              label: "Personal details",
              content: (
                <div className="space-y-5">
                  <AccountForm role={role} athlete={a} />
                  <AthleteDetailsForm athlete={a} />
                </div>
              ),
            },
            { id: "health", label: "Health", content: <Health role={role} /> },
            {
              id: "participation",
              label: "Participation",
              content: <Eligibility role={role} />,
            },
            {
              id: "documents",
              label: "Documents",
              content: <Records role={role} collection="documents" embedded />,
            },
          ]}
        />
      </>
    );
  return (
    <>
      <PageHeading
        title="My account"
        description={`${identities[role].title} · Personal account details from your SafeSport session.`}
      />
      <AccountForm role={role} />
    </>
  );
}
function AccountForm({ role, athlete }: { role: Role; athlete?: Athlete }) {
  const { state } = useWorkspace();
  const authUser = useAuthStore((auth) => auth.user);
  const setSession = useAuthStore((auth) => auth.setSession);
  const authName = authUser && authUser.role === role ? `${authUser.first_name} ${authUser.last_name}` : "";
  const authEmail = authUser && authUser.role === role ? authUser.email : "";
  const profile = authUser && authUser.role === role ? authUser.profile_data : {};
  const organizationName =
    profile.organization_name ||
    athlete?.currentOrganization?.name ||
    athlete?.organizations?.[0]?.organization.name ||
    "";
  const sportName =
    profile.sport_name ||
    athlete?.currentTeam?.sport.name ||
    athlete?.teams?.[0]?.sport.name ||
    "";
  const [form, setForm] = useState(
    state.accounts[role] ?? {
      name: athlete ? fullName(athlete) : authName || identities[role].name,
      email: authEmail || identities[role].email,
      phone: profile.phone || "",
    },
  );
  useEffect(() => {
    if (!athlete && authName && authEmail) {
      setForm((current) => ({ ...current, name: authName, email: authEmail, phone: profile.phone || current.phone }));
    }
  }, [athlete, authEmail, authName, profile.phone]);
  return (
    <Panel title="Personal details">
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
        <Field
          label="Full name"
          value={form.name}
          onChange={(v) => setForm({ ...form, name: v })}
          required
        />
        <Field
          label="Email"
          type="email"
          value={form.email}
          onChange={() => undefined}
          disabled
        />
        <Field
          label="Phone"
          type="tel"
          value={form.phone}
          onChange={(v) => setForm({ ...form, phone: v })}
        />
        {role === "athlete" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Institution / school / club"
              value={organizationName}
              onChange={() => undefined}
              disabled
            />
            <Field
              label="Sport"
              value={sportName}
              onChange={() => undefined}
              disabled
            />
          </div>
        )}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() =>
              setForm(
                state.accounts[role] ?? {
                  name: authName || identities[role].name,
                  email: authEmail || identities[role].email,
                  phone: profile.phone || "",
                },
              )
            }
          >
            Cancel changes
          </Button>
          <Button type="submit">Save profile</Button>
        </div>
      </form>
    </Panel>
  );
}
export function Security() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  return (
    <Panel
      title="Security preview"
      description="Authentication and credential storage are deferred. This form demonstrates validation only."
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (password.length < 8 || password !== confirm) {
            toast.error("Use at least 8 characters and matching passwords.");
            return;
          }
          setPassword("");
          setConfirm("");
          toast.success(
            "Validation complete — no credentials were changed or stored.",
          );
        }}
      >
        <Field
          label="New demo password"
          type="password"
          value={password}
          onChange={setPassword}
          required
        />
        <Field
          label="Confirm demo password"
          type="password"
          value={confirm}
          onChange={setConfirm}
          required
        />
        <Button type="submit">Preview password validation</Button>
      </form>
      <p className="text-sm text-muted-foreground">
        Two-factor authentication and session revocation require the future
        authentication service.
      </p>
    </Panel>
  );
}
export function Settings({ role }: { role: Role }) {
  const { state, update } = useWorkspace();
  const [values, setValues] = useState({
    reminders: state.preferences[`${role}-reminders`] ?? true,
    messages: state.preferences[`${role}-messages`] ?? true,
  });
  return (
    <>
      <PageHeading
        title="Workspace settings"
        description="Notification preferences apply to this frontend demo only."
      />
      <Panel title="Preferences">
        <Check
          label="Show care reminder notifications"
          checked={values.reminders}
          onChange={(v) => setValues({ ...values, reminders: v })}
        />
        <Check
          label="Show new message notifications"
          checked={values.messages}
          onChange={(v) => setValues({ ...values, messages: v })}
        />
        <Button
          onClick={() => {
            update(
              (s) => ({
                ...s,
                preferences: {
                  ...s.preferences,
                  [`${role}-reminders`]: values.reminders,
                  [`${role}-messages`]: values.messages,
                },
              }),
              "Preferences updated",
              role,
              "settings",
            );
            toast.success("Preferences saved");
          }}
        >
          Save preferences
        </Button>
      </Panel>
      <Panel title="Privacy and local data">
        <p className="text-sm text-muted-foreground">
          Edits, uploaded previews and conversations exist only in memory.
          Refreshing the page restores the seed dataset. Theme preference is
          managed by the existing theme component.
        </p>
        {personal(role) && (
          <Go to={href(role, "consent")} secondary>
            Review consent choices
          </Go>
        )}
      </Panel>
    </>
  );
}

function AthleteDetailsForm({ athlete }: { athlete: Athlete }) {
  const { state, update } = useWorkspace();
  const [form, setForm] = useState({
    dob: athlete.dateOfBirth,
    gender: athlete.gender,
    team: athlete.currentTeam?.id || "",
    position: athlete.teams[0]?.position || "",
    contact: state.registration[`${athlete.id}-emergency`] || "",
    guardian: state.registration[`${athlete.id}-guardian`] || "",
  });
  return (
    <Panel
      title="Athlete and emergency information"
      description="Your SafeSport ID remains unchanged when details are updated."
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const age =
            2026 -
            Number(form.dob.slice(0, 4)) -
            (form.dob.slice(5) > "09-24" ? 1 : 0);
          if (age < 18 && !form.guardian.trim()) {
            toast.error("Enter a guardian for a minor.");
            return;
          }
          const team = state.teams.find((t) => t.id === form.team);
          const organization = state.organizations.find(
            (o) => o.id === team?.organizationId,
          );
          update(
            (s) => ({
              ...s,
              athletes: s.athletes.map((a) =>
                a.id === athlete.id
                  ? {
                      ...a,
                      dateOfBirth: form.dob,
                      age,
                      gender: form.gender,
                      currentTeam: team,
                      currentSport: team?.sport,
                      currentOrganization: organization,
                      teams: team
                        ? [
                            {
                              teamId: team.id,
                              team,
                              sport: team.sport,
                              joinedAt: today,
                              status: "active",
                              position: form.position,
                            },
                          ]
                        : a.teams,
                    }
                  : a,
              ),
              registration: {
                ...s.registration,
                [`${athlete.id}-emergency`]: form.contact,
                [`${athlete.id}-guardian`]: form.guardian,
              },
            }),
            "Athlete details updated",
            "athlete",
            "profile",
          );
          toast.success("Athlete information saved");
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Date of birth"
            type="date"
            max={today}
            min="1920-01-01"
            value={form.dob}
            onChange={(v) => setForm({ ...form, dob: v })}
            required
          />
          <Choice
            label="Sex"
            value={form.gender}
            onChange={(v) =>
              setForm({ ...form, gender: v as Athlete["gender"] })
            }
            options={["male", "female", "other"]}
          />
        </div>
        <Choice
          label="Team and sport"
          value={form.team}
          onChange={(v) => setForm({ ...form, team: v })}
          options={state.teams.map((t) => ({
            value: t.id,
            label: `${t.name} · ${t.sport.name}`,
          }))}
        />
        <Field
          label="Position / event"
          value={form.position}
          onChange={(v) => setForm({ ...form, position: v })}
        />
        <Field
          label="Emergency contact name and phone"
          value={form.contact}
          onChange={(v) => setForm({ ...form, contact: v })}
          required
        />
        <Field
          label="Parent / guardian (required for minors)"
          value={form.guardian}
          onChange={(v) => setForm({ ...form, guardian: v })}
        />
        <Button type="submit">Save athlete details</Button>
      </form>
    </Panel>
  );
}
