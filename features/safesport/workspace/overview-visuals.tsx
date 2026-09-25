"use client";

import { Distribution } from "./distribution";
import { Progress } from "@/components/ui/progress";
import { type Role, human, personal } from "./catalog";
import { useWorkspace, visibleAthletes } from "./store";
import { scopedRecords } from "./records";
import { Panel, Status, Empty } from "./ui";

export function OverviewVisual({ role }: { role: Role }) {
  const { state } = useWorkspace();
  const athletes = visibleAthletes(state, role);
  if (personal(role) && !athletes.length)
    return (
      <Empty
        title="No linked athlete"
        description="Your care summary will appear when an athlete is linked."
      />
    );
  if (personal(role))
    return (
      <div className="space-y-5">
        {athletes.map((athlete) => (
          <div key={athlete.id} className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-lg font-semibold">
                {athlete.firstName} {athlete.lastName}
              </p>
              <Status value={athlete.eligibilityStatus} />
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              Your participation status is set by your clinician. Review your
              care steps and upcoming appointments below.
            </p>
            <div className="divide-y divide-border/50">
              {[
                {
                  name: "Clinical consent",
                  done: state.consents[athlete.id]?.clinical === "obtained",
                },
                {
                  name: "Assessment finalized",
                  done: state.encounters.some(
                    (e) => e.athleteId === athlete.id && e.finalized,
                  ),
                },
              ].map((step) => (
                <div
                  key={step.name}
                  className="flex items-center justify-between gap-3 py-3 text-sm"
                >
                  <span>{step.name}</span>
                  <Status value={step.done ? "complete" : "pending"} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  const values =
    role === "sys-admin"
      ? state.records.users.map((u) => u.status)
      : role === "operations"
        ? scopedRecords(state, role, "referrals").map((r) => r.status)
        : role === "physiotherapist"
          ? scopedRecords(state, role, "screenings").map((r) => r.status)
          : athletes.map((a) => a.eligibilityStatus);
  const data = Array.from(new Set(values)).map((value) => ({
    name: human(value),
    value: values.filter((v) => v === value).length,
  }));
  return <Distribution data={data} label="Current record distribution" />;
}

export function RehabilitationVisual({ role }: { role: Role }) {
  const { state } = useWorkspace();
  const plans = scopedRecords(state, role, "plans");
  return (
    <Panel
      title="Recovery progress"
      description="Recorded progress on assigned rehabilitation plans."
    >
      {plans.length ? (
        plans.map((plan) => (
          <div key={plan.id} className="space-y-2">
            <div className="flex justify-between gap-3 text-sm">
              <span>{plan.title}</span>
              <span className="font-semibold tabular-nums">
                {plan.progress ?? 0}%
              </span>
            </div>
            <Progress value={Number(plan.progress ?? 0)} />
          </div>
        ))
      ) : (
        <Empty
          title="No active rehabilitation plans"
          description="Assigned plans will appear here."
        />
      )}
    </Panel>
  );
}
