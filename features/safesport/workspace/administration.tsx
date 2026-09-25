"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { roles, type Role, identities, human, href } from "./catalog";
import {
  useWorkspace,
  visibleAthletes,
  newId,
  today,
  fullName,
  type RecordItem,
} from "./store";
import {
  PageHeading,
  Panel,
  DataList,
  Field,
  Choice,
  Notes,
  Empty,
  Check,
  Status,
  Export,
  Go,
  Tabbed,
} from "./ui";
export function Teams({ role, view }: { role: Role; view?: string }) {
  const { state, update } = useWorkspace();
  const [teamId, setTeamId] = useState("all");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [org, setOrg] = useState(
    role === "institution" ? "org-001" : state.organizations[0]?.id || "",
  );
  const [sport, setSport] = useState("Football");
  const permitted = state.teams.filter(
    (t) =>
      !["coach", "institution"].includes(role) ||
      t.organizationId === "org-001",
  );
  const athletes = visibleAthletes(state, role).filter(
    (a) => teamId === "all" || a.currentTeam?.id === teamId,
  );
  const canEdit = ["institution", "operations", "sys-admin"].includes(role);
  return (
    <>
      <PageHeading
        title={
          view === "attendance"
            ? "Team attendance"
            : view === "sports"
              ? "Sports & teams"
              : view === "readiness"
                ? "Team readiness"
                : "Teams"
        }
        description="Team membership and operational participation information."
      >
        {canEdit && <Button onClick={() => setOpen(true)}>Create team</Button>}
      </PageHeading>
      <Choice
        label="Team"
        value={teamId}
        onChange={setTeamId}
        options={[
          { value: "all", label: "All teams" },
          ...permitted.map((t) => ({ value: t.id, label: t.name })),
        ]}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {permitted
          .filter((t) => teamId === "all" || t.id === teamId)
          .map((t) => (
            <Panel
              key={t.id}
              title={t.name}
              description={`${t.sport.name} · ${t.ageGroup}`}
            >
              <p className="text-sm">
                {
                  state.organizations.find((o) => o.id === t.organizationId)
                    ?.name
                }
              </p>
              {role !== "sys-admin" && (
                <p className="text-2xl font-semibold">
                  {athletes.filter((a) => a.currentTeam?.id === t.id).length}
                  <span className="text-sm font-normal text-muted-foreground">
                    {" "}
                    athletes
                  </span>
                </p>
              )}
              <Button variant="outline" onClick={() => setTeamId(t.id)}>
                Select team
              </Button>
            </Panel>
          ))}
      </div>
      {role !== "sys-admin" && (
        <Panel
          title={
            view === "attendance"
              ? "Session attendance"
              : "Roster and readiness"
          }
        >
          <DataList
            label="athletes"
            rows={athletes.map((a) => ({
              id: a.id,
              name: fullName(a),
              status: a.eligibilityStatus,
              detail: a.currentTeam?.name,
              to:
                view === "attendance"
                  ? undefined
                  : href(role, `athletes/${a.id}`),
              action:
                view === "attendance" ? (
                  <Check
                    label={`Present: ${a.firstName}`}
                    checked={state.attendance[a.id] ?? false}
                    onChange={(v) =>
                      update(
                        (s) => ({
                          ...s,
                          attendance: { ...s.attendance, [a.id]: v },
                        }),
                        "Attendance updated",
                        role,
                        "attendance",
                      )
                    }
                  />
                ) : undefined,
            }))}
          />
        </Panel>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create team</DialogTitle>
            <DialogDescription>
              A local team can be assigned during athlete registration.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const id = newId("team");
              update(
                (s) => ({
                  ...s,
                  teams: [
                    ...s.teams,
                    {
                      id,
                      name,
                      ageGroup: "Open",
                      organizationId: org,
                      sport: {
                        id: newId("sport"),
                        name: sport,
                        category:
                          sport.toLowerCase() === "football"
                            ? "football"
                            : sport.toLowerCase() === "rugby"
                              ? "rugby"
                              : "other",
                      },
                    },
                  ],
                }),
                "Team created",
                role,
                "teams",
              );
              setOpen(false);
              setName("");
              toast.success("Team created");
            }}
          >
            <Field label="Team name" value={name} onChange={setName} required />
            <Choice
              label="Organization"
              value={org}
              onChange={setOrg}
              options={state.organizations
                .filter((o) => role !== "institution" || o.id === "org-001")
                .map((o) => ({ value: o.id, label: o.name }))}
            />
            <Choice
              label="Sport"
              value={sport}
              onChange={setSport}
              options={[
                "Football",
                "Rugby",
                "Netball",
                "Athletics",
                "Basketball",
              ]}
            />
            <Button type="submit">Save team</Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
export function Organizations({ role }: { role: Role }) {
  const { state, update } = useWorkspace();
  const [editing, setEditing] = useState<{
    id: string;
    name: string;
    type: "school" | "club" | "academy" | "professional" | "medical";
  } | null>(null);
  const records = state.organizations.filter(
    (o) => role !== "institution" || o.id === "org-001",
  );
  return (
    <>
      <PageHeading
        title={role === "institution" ? "Institution profile" : "Organizations"}
        description="Institution and service-provider directory."
      >
        {role !== "institution" && (
          <Button
            onClick={() => setEditing({ id: "", name: "", type: "school" })}
          >
            Add organization
          </Button>
        )}
      </PageHeading>
      <Panel title="Directory">
        <DataList
          label="organizations"
          rows={records.map((o) => ({
            id: o.id,
            name: o.name,
            status: "active",
            detail: human(o.type),
            action: (
              <Button variant="outline" onClick={() => setEditing(o)}>
                Edit profile
              </Button>
            ),
          }))}
        />
      </Panel>
      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Organization profile</DialogTitle>
            <DialogDescription>
              Edit this demo directory entry.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const item = { ...editing, id: editing.id || newId("org") };
                update(
                  (s) => ({
                    ...s,
                    organizations: [
                      item,
                      ...s.organizations.filter((o) => o.id !== item.id),
                    ],
                    athletes: s.athletes.map((a) =>
                      a.currentOrganization?.id === item.id
                        ? { ...a, currentOrganization: item }
                        : a,
                    ),
                  }),
                  "Organization updated",
                  role,
                  "organizations",
                );
                setEditing(null);
                toast.success("Organization saved");
              }}
            >
              <Field
                label="Organization name"
                value={editing.name}
                onChange={(v) => setEditing({ ...editing, name: v })}
                required
              />
              <Choice
                label="Organization type"
                value={editing.type}
                onChange={(v) =>
                  setEditing({ ...editing, type: v as typeof editing.type })
                }
                options={[
                  "school",
                  "club",
                  "academy",
                  "professional",
                  "medical",
                ]}
              />
              <Button variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit">Save profile</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
const permissions: Record<Role, string> = {
  athlete:
    "Own permitted profile, consent, health summaries, certificates and care communication.",
  guardian:
    "Linked minor’s permitted summaries, consent / assent and care coordination. Confidential history excluded.",
  clinician:
    "Authorized clinical assessment, history, examination, referral and final eligibility.",
  physiotherapist:
    "Assigned movement screening, human review and rehabilitation. No unrelated sensitive history.",
  coach:
    "Team participation status, practical restrictions, attendance and incident reporting. No clinical narratives or AI metrics.",
  institution:
    "Institution rosters, aggregate readiness, schedules and operational coordination. No clinical record.",
  operations:
    "Scheduling, staffing, assignment and referral progress. Clinical reasons and narratives excluded.",
  "sys-admin":
    "User / access configuration, organization metadata and technical activity. No clinical content.",
};
export function Users({ role, view }: { role: Role; view?: string }) {
  const { state, update } = useWorkspace();
  const [editing, setEditing] = useState<RecordItem | null>(null);
  const canEdit = role === "sys-admin";
  const records = state.records.users.filter(
    (u) =>
      role === "sys-admin" ||
      [
        "coach",
        "institution",
        "clinician",
        "physiotherapist",
        "operations",
      ].includes(u.assigned),
  );
  return (
    <>
      <PageHeading
        title={
          view === "roles"
            ? "Role permissions"
            : view === "staff"
              ? "Staff directory"
              : "Users & access"
        }
        description="Role boundaries are represented in the UI. Server-side authorization is deferred."
      >
        {canEdit && (
          <Button
            onClick={() =>
              setEditing({
                id: "",
                title: "",
                status: "invited",
                notes: "",
                assigned: "coach",
                date: today,
                kind: "user",
              })
            }
          >
            Add demo user
          </Button>
        )}
      </PageHeading>
      <Tabbed
        initial={view === "roles" ? "permissions" : "users"}
        tabs={[
          {
            id: "users",
            label: "Directory",
            content: (
              <Panel title="People and access">
                <DataList
                  label="users"
                  rows={records.map((u) => ({
                    id: u.id,
                    name: u.title,
                    status: u.status,
                    detail: `${human(u.assigned)} · ${u.notes}`,
                    date: u.date,
                    action: canEdit ? (
                      <Button variant="outline" onClick={() => setEditing(u)}>
                        Manage access
                      </Button>
                    ) : undefined,
                  }))}
                />
              </Panel>
            ),
          },
          {
            id: "permissions",
            label: "Role boundaries",
            content: (
              <Panel
                title="Workspace permissions"
                description="Each role sees the information needed for its responsibilities."
              >
                <dl className="divide-y divide-border/50">
                  {roles.map((r) => (
                    <div
                      key={r}
                      className="grid gap-2 py-4 first:pt-0 last:pb-0 sm:grid-cols-[200px_1fr]"
                    >
                      <dt className="text-sm font-semibold">
                        {identities[r].title}
                      </dt>
                      <dd className="text-sm leading-6 text-muted-foreground">
                        {permissions[r]}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Panel>
            ),
          },
        ]}
      />
      {!canEdit && (
        <Panel title="Request access changes">
          <p className="text-sm text-muted-foreground">
            Send an administrative request through your connected demo
            conversation.
          </p>
          <Go to={href(role, "messages")}>Contact administration</Go>
        </Panel>
      )}
      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage demo access</DialogTitle>
            <DialogDescription>
              No real account is provisioned and no invitation is sent.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const user = { ...editing, id: editing.id || newId("user") };
                update(
                  (s) => ({
                    ...s,
                    records: {
                      ...s.records,
                      users: [
                        user,
                        ...s.records.users.filter((u) => u.id !== user.id),
                      ],
                    },
                  }),
                  "Demo user access updated",
                  role,
                  "users",
                );
                setEditing(null);
                toast.success("Demo access updated");
              }}
            >
              <Field
                label="Full name"
                value={editing.title}
                onChange={(v) => setEditing({ ...editing, title: v })}
                required
              />
              <Field
                label="Email"
                type="email"
                value={editing.notes}
                onChange={(v) => setEditing({ ...editing, notes: v })}
                required
              />
              <Choice
                label="Role"
                value={editing.assigned}
                onChange={(v) => setEditing({ ...editing, assigned: v })}
                options={roles.map((r) => ({
                  value: r,
                  label: identities[r].title,
                }))}
              />
              <Choice
                label="Access status"
                value={editing.status}
                onChange={(v) => setEditing({ ...editing, status: v })}
                options={["invited", "active", "suspended"]}
              />
              <Button variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit">Save access</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
export function Configuration({ role, view }: { role: Role; view: string }) {
  const { state, update } = useWorkspace();
  const kind = view.split("/").at(-1) || "services";
  const records = state.records.configs.filter((c) => c.kind === kind);
  const [editing, setEditing] = useState<RecordItem | null>(null);
  return (
    <>
      <PageHeading
        title={
          kind === "notifications"
            ? "Notification configuration"
            : `${human(kind)} catalogue`
        }
        description="Review and edit demo catalogue entries. Clinical governance rules in the PPE workflow remain mandatory."
      >
        <Button
          onClick={() =>
            setEditing({
              id: "",
              title: "",
              notes: "",
              assigned: "Clinical governance",
              date: today,
              kind,
              status: "draft",
            })
          }
        >
          Add entry
        </Button>
      </PageHeading>
      <Panel title="Configured entries">
        <DataList
          label="entries"
          rows={records.map((c) => ({
            id: c.id,
            name: c.title,
            status: c.status,
            detail: c.notes,
            action: (
              <Button variant="outline" onClick={() => setEditing(c)}>
                Edit
              </Button>
            ),
          }))}
        />
      </Panel>
      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Catalogue entry</DialogTitle>
            <DialogDescription>
              Catalogue metadata is local; no clinical protocol is deployed from
              this preview.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const config = { ...editing, id: editing.id || newId("cfg") };
                update(
                  (s) => ({
                    ...s,
                    records: {
                      ...s.records,
                      configs: [
                        config,
                        ...s.records.configs.filter((c) => c.id !== config.id),
                      ],
                    },
                  }),
                  "Catalogue entry updated",
                  role,
                  view,
                );
                setEditing(null);
                toast.success("Catalogue updated");
              }}
            >
              <Field
                label="Name"
                value={editing.title}
                onChange={(v) => setEditing({ ...editing, title: v })}
                required
              />
              <Notes
                label="Description / protocol notes"
                value={editing.notes}
                onChange={(v) => setEditing({ ...editing, notes: v })}
                required
              />
              <Choice
                label="Status"
                value={editing.status}
                onChange={(v) => setEditing({ ...editing, status: v })}
                options={["draft", "active", "retired"]}
              />
              <Button variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit">Save entry</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
export function Audit({ role }: { role: Role }) {
  const { state } = useWorkspace();
  const records =
    role === "sys-admin"
      ? state.audit
      : state.audit.filter(
          (a) => a.actor === identities[role].name || a.actor === "System",
        );
  const content = [
    "timestamp,actor,event",
    ...records.map((r) =>
      [r.date, r.actor, r.title]
        .map((v) => `"${v.replaceAll('"', '""')}"`)
        .join(","),
    ),
  ].join("\n");
  return (
    <>
      <PageHeading
        title="Activity log"
        description="Local technical event metadata. Clinical narratives are excluded. This is not a durable audit trail."
      >
        <Export name="demo-activity.csv" content={content} />
      </PageHeading>
      <Panel title="Recent events">
        <DataList
          label="events"
          rows={records.map((r) => ({
            id: r.id,
            name: r.title,
            status: "recorded",
            detail: r.actor,
            date: r.date,
          }))}
        />
      </Panel>
    </>
  );
}
export function System({ view }: { view: string }) {
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const title = human(view.split("/").at(-1) || "System");
  return (
    <>
      <PageHeading
        title={title}
        description="Technical frontend preview. No backend service health is asserted."
      >
        <Button
          variant="outline"
          disabled={loading}
          onClick={() => {
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
              setChecked(true);
            }, 400);
          }}
        >
          {loading ? "Checking local state…" : "Refresh local status"}
        </Button>
      </PageHeading>
      {view.includes("integrations") ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[
            "Identity provider",
            "Movement AI service",
            "Notification delivery",
            "Document storage",
          ].map((s) => (
            <Panel key={s} title={s}>
              <Status value="not_connected" />
              <p className="text-sm text-muted-foreground">
                Configuration and connection are deferred to the backend phase.
              </p>
            </Panel>
          ))}
        </div>
      ) : view.includes("errors") ? (
        <Empty
          title="No frontend errors recorded in this demo view"
          description="Production error collection is not connected. Browser verification is recorded separately in the completion report."
        />
      ) : view.includes("jobs") ? (
        <Empty
          title="No background jobs"
          description="This prototype runs local UI actions only; no queue or worker is connected."
        />
      ) : view.includes("sessions") ? (
        <Panel title="Current demo session">
          <Status value="local_only" />
          <p className="text-sm">
            One in-memory browser tab. There is no authenticated session or
            token.
          </p>
          <Go to="/account/signin" secondary>
            Leave workspace
          </Go>
        </Panel>
      ) : view.includes("storage") ? (
        <Panel title="Local attachment previews">
          <Status value="memory_only" />
          <p className="text-sm">
            Files selected in messaging, documents and screening are represented
            by local object URLs. No file is uploaded. Refreshing releases the
            demo state.
          </p>
        </Panel>
      ) : (
        <Panel title="Frontend runtime">
          <Status value={loading ? "checking" : "demo_available"} />
          <p className="text-sm">
            {checked
              ? "Local status refreshed."
              : "The frontend is available in this browser."}{" "}
            API, database, AI and delivery services are not connected.
          </p>
        </Panel>
      )}
    </>
  );
}
