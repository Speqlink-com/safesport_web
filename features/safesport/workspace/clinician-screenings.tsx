"use client";
/**
 * clinician-screenings.tsx
 * Redesigned Movement Screening list, AI Review queue, and Screening detail.
 * Preserves all clinical logic. Critical: AI risk ≠ medical eligibility.
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
import { Label } from "@/components/ui/label";
import {
BrainCircuit,
CheckCircle2,
ChevronRight,
Eye,
RefreshCw,
ScanLine,
TriangleAlert,
Video
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
Bar,
BarChart,
Cell,
ResponsiveContainer,
Tooltip,
XAxis,
YAxis,
} from "recharts";
import { toast } from "sonner";
import { href,human,identities } from "./catalog";
import {
AllClearState,
EmptyState,
HeroBanner,
InfoNote,
PageHeader,
SectionCard,
StatCard,
StatusChip
} from "./clinician-ui";
import { scopedRecords } from "./records";
import {
fullName,
newId,
today,
useWorkspace,
visibleAthletes,
type RecordItem,
} from "./store";
import { Choice,Notes } from "./ui";

// ── Screenings surface ────────────────────────────────────────────────────────

export function ClinicianScreenings({
  id,
  reviewOnly = false,
}: {
  id?: string;
  reviewOnly?: boolean;
}) {
  const { state } = useWorkspace();
  const role = "clinician" as const;
  const athletes = visibleAthletes(state, role);
  let records = scopedRecords(state, role, "screenings");
  if (reviewOnly) records = records.filter((r) => r.status === "ready_for_review");

  if (id && id !== "new") {
    const detail = scopedRecords(state, role, "screenings").find((r) => r.id === id);
    if (!detail)
      return (
        <div className="space-y-6">
          <PageHeader
            title="Screening unavailable"
            back={{ label: "Back to screenings", href: href(role, "screenings") }}
          />
          <EmptyState icon={ScanLine} title="Screening not found" description="This record is not in your permitted demo workspace." />
        </div>
      );
    return <ScreeningDetail initial={detail} reviewOnly={reviewOnly} />;
  }

  return <ScreeningsList records={records} athletes={athletes} reviewOnly={reviewOnly} />;
}

// ── Screenings list ───────────────────────────────────────────────────────────

function ScreeningsList({
  records,
  athletes,
  reviewOnly,
}: {
  records: RecordItem[];
  athletes: ReturnType<typeof visibleAthletes>;
  reviewOnly: boolean;
}) {
  const { state } = useWorkspace();
  const role = "clinician" as const;
  const [captureOpen, setCaptureOpen] = useState(false);

  const total = scopedRecords(state, role, "screenings").length;
  const processing = records.filter((r) => r.status === "processing").length;
  const awaitingReview = records.filter((r) => r.status === "ready_for_review").length;
  const reviewed = records.filter((r) => r.reviewer).length;

  const riskColor = (risk?: string) => {
    if (risk === "high") return "text-red-600 dark:text-red-400";
    if (risk === "moderate") return "text-amber-600 dark:text-amber-500";
    if (risk === "low") return "text-emerald-600 dark:text-emerald-400";
    return "text-muted-foreground";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={reviewOnly ? "AI review" : "Movement"}
        title={reviewOnly ? "AI review queue" : "Movement screening"}
        description="Movement-risk signals support clinical interpretation. AI results never determine medical eligibility. Human review is mandatory."
      >
        {!reviewOnly && (
          <Button size="sm" onClick={() => setCaptureOpen(true)} className="gap-1.5">
            <Video className="size-3.5" aria-hidden="true" />
            New screening
          </Button>
        )}
      </PageHeader>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total screenings" value={total} icon={ScanLine} accent="neutral" />
        <StatCard label="Processing" value={processing} icon={RefreshCw} accent="blue" />
        <StatCard label="Awaiting review" value={awaitingReview} icon={Eye} accent={awaitingReview > 0 ? "amber" : "neutral"} />
        <StatCard label="Human reviewed" value={reviewed} icon={CheckCircle2} accent="green" />
      </div>

      {/* AI disclaimer */}
      <InfoNote variant="warning">
        <strong>Clinical governance:</strong> AI movement-risk signals are movement observations that inform clinical judgement. They do not constitute a medical finding, diagnosis, or eligibility decision. Every AI result requires human clinical review before any action is taken.
      </InfoNote>

      {/* Table */}
      <SectionCard
        label={reviewOnly ? "Awaiting interpretation" : "Screening history"}
        title={reviewOnly ? "AI review queue" : "All screenings"}
      >
        {records.length === 0 ? (
          reviewOnly ? (
            <AllClearState
              title="Review queue is clear"
              description="No screenings are currently awaiting human clinical review."
            />
          ) : (
            <EmptyState
              icon={ScanLine}
              title="No screenings recorded"
              description="Capture a movement screening to begin the AI review pipeline."
              action={<Button size="sm" onClick={() => setCaptureOpen(true)}>New screening</Button>}
            />
          )
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Athlete</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Drill</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Status</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">AI signal</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Date</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {records.map((r) => {
                  const athlete = athletes.find((a) => a.id === r.athleteId);
                  const destPath = reviewOnly ? `ai-reviews/${r.id}` : `screenings/${r.id}`;
                  return (
                    <tr key={r.id} className="group transition-colors hover:bg-muted/40">
                      <td className="px-4 py-3">
                        <Link href={href("clinician", destPath)} className="outline-none focus-visible:underline">
                          <p className="font-semibold">{fullName(athlete)}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{r.id}</p>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm">{human(r.kind)}</td>
                      <td className="px-4 py-3"><StatusChip value={r.status} /></td>
                      <td className="px-4 py-3">
                        {r.risk ? (
                          <span className={`text-xs font-semibold ${riskColor(r.risk)}`}>
                            {r.risk.charAt(0).toUpperCase() + r.risk.slice(1)} signal
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{r.date?.slice(0, 10) ?? "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <Link href={href("clinician", destPath)}>
                          <Button variant="outline" size="sm" className="gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100">
                            {reviewOnly ? "Review" : "Open"} <ChevronRight className="size-3" aria-hidden="true" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Capture dialog */}
      <Dialog open={captureOpen} onOpenChange={setCaptureOpen}>
        <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Capture movement screening</DialogTitle>
            <DialogDescription>
              Local video preview only. No video is uploaded and no AI service is invoked in this demo.
            </DialogDescription>
          </DialogHeader>
          {captureOpen && (
            <ScreeningCapture onClose={() => setCaptureOpen(false)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Capture form ──────────────────────────────────────────────────────────────

function ScreeningCapture({ onClose }: { onClose: () => void }) {
  const { state, update } = useWorkspace();
  const router = useRouter();
  const role = "clinician" as const;
  const athletes = visibleAthletes(state, role);
  const [athleteId, setAthleteId] = useState(athletes[0]?.id || "");
  const [drill, setDrill] = useState("jump_landing");
  const [file, setFile] = useState<{ name: string; url: string } | null>(null);
  const consent = state.consents[athleteId];

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!file) return;
        const r: RecordItem = {
          id: newId("scr"),
          athleteId,
          title: human(drill),
          kind: drill,
          status: "draft",
          quality: "pending",
          date: today,
          assigned: identities.clinician.name,
          notes: "",
          file: file.url,
          fileName: file.name,
        };
        update(
          (s) => ({ ...s, records: { ...s.records, screenings: [r, ...s.records.screenings] } }),
          "Movement screening captured",
          role,
          `screenings/${r.id}`,
        );
        onClose();
        router.push(href(role, `screenings/${r.id}`));
      }}
    >
      <Choice
        label="Athlete"
        value={athleteId}
        onChange={(value) => {
          setAthleteId(value);
          if (file) URL.revokeObjectURL(file.url);
          setFile(null);
        }}
        options={athletes.map((a) => ({ value: a.id, label: fullName(a) }))}
      />
      <Choice
        label="Drill"
        value={drill}
        onChange={setDrill}
        options={["jump_landing", "single_leg_squat", "sprint_acceleration", "cutting_maneuver", "kicking_mechanics"]}
      />
      <InfoNote>
        Target 1080p, 30 fps, camera 3–5 metres away. Adequate lighting. Follow the protocol for the configured frontal / sagittal view. Retake if keypoints are occluded.
      </InfoNote>
      {consent?.clinical !== "obtained" || !consent.video ? (
        <InfoNote variant="critical">
          Clinical consent and separate video consent are required before capturing movement video.
        </InfoNote>
      ) : (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="screening-video">Movement video (up to 100 MB)</Label>
            <Input
              id="screening-video"
              type="file"
              accept="video/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                if (!f.type.startsWith("video/") || f.size > 100 * 1024 * 1024) {
                  toast.error("Select a video up to 100 MB.");
                  return;
                }
                if (file) URL.revokeObjectURL(file.url);
                setFile({ name: f.name, url: URL.createObjectURL(f) });
              }}
            />
          </div>
          {file && (
            <video className="aspect-video w-full rounded-xl bg-black" controls src={file.url} aria-label="Movement capture preview" />
          )}
        </>
      )}
      <div className="flex justify-end gap-2 border-t pt-4">
        <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={!file || consent?.clinical !== "obtained" || !consent.video}>
          Save capture
        </Button>
      </div>
    </form>
  );
}

// ── Screening detail ──────────────────────────────────────────────────────────

function ScreeningDetail({
  initial,
  reviewOnly,
}: {
  initial: RecordItem;
  reviewOnly: boolean;
}) {
  const { state, update } = useWorkspace();
  const role = "clinician" as const;
  const [form, setForm] = useState(initial);
  const [processing, setProcessing] = useState(false);
  const [reason, setReason] = useState("");
  const athlete = state.athletes.find((a) => a.id === form.athleteId);

  const save = (record: RecordItem, title: string) => {
    setForm(record);
    update(
      (s) => ({
        ...s,
        records: {
          ...s.records,
          screenings: s.records.screenings.map((r) => (r.id === record.id ? record : r)),
        },
      }),
      title,
      role,
      `screenings/${record.id}`,
    );
  };

  const simulate = () => {
    setProcessing(true);
    setTimeout(() => {
      save(
        {
          ...form,
          status: "ready_for_review",
          risk: "moderate",
          model: "DEMO-2.3.1",
          confidence: 0.82,
          metrics: { kneeValgusAngle: 15.3, trunkLean: 12.1, limbSymmetryIndex: 0.89, stabilizationTime: 1.8 },
        },
        "Demo movement result ready for human review",
      );
      setProcessing(false);
    }, 800);
  };

  const metricsData = form.metrics
    ? [
        { label: "Knee valgus (°)", value: form.metrics.kneeValgusAngle ?? 0 },
        { label: "Trunk lean (°)", value: form.metrics.trunkLean ?? 0 },
        { label: "LSI", value: (form.metrics.limbSymmetryIndex ?? 0) * 100 },
        { label: "Stab. (s)", value: (form.metrics.stabilizationTime ?? 0) * 10 },
      ]
    : [];

  const backPath = reviewOnly ? "ai-reviews" : "screenings";

  return (
    <div className="space-y-6">
      <HeroBanner
        eyebrow={reviewOnly ? "AI review" : "Movement screening"}
        title={human(form.kind)}
        description={`${fullName(athlete)} · ${form.id} · ${form.date?.slice(0, 10) ?? "—"}`}
        footer={
          <div className="flex flex-wrap gap-2">
            <StatusChip value={processing ? "processing" : form.status} />
            {form.quality && form.quality !== "pending" && <StatusChip value={form.quality === "pass" ? "normal" : "quality_failed"} />}
          </div>
        }
      >
        <Link href={href(role, backPath)}>
          <Button variant="outline" size="sm">← {reviewOnly ? "AI queue" : "All screenings"}</Button>
        </Link>
      </HeroBanner>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Left: Video + quality */}
        <SectionCard label="Capture" title="Movement video">
          {form.file ? (
            <video controls className="aspect-video w-full rounded-xl bg-black" src={form.file} aria-label="Movement screening video" />
          ) : (
            <EmptyState
              icon={Video}
              title="No video attached"
              description="This seed record has no video. Create a new screening to preview a local video. Seed metrics are demonstration data."
            />
          )}

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Video quality</span>
              {form.quality && form.quality !== "pending" ? (
                <StatusChip value={form.quality === "pass" ? "normal" : "quality_failed"} />
              ) : (
                <span className="text-muted-foreground">Not assessed</span>
              )}
            </div>

            <Choice
              label="Assess capture quality"
              value={form.quality || "pending"}
              onChange={(v) =>
                save(
                  {
                    ...form,
                    quality: v,
                    status: v === "fail" ? "quality_failed" : form.status === "quality_failed" ? "draft" : form.status,
                    risk: v === "fail" ? undefined : form.risk,
                    metrics: v === "fail" ? undefined : form.metrics,
                  },
                  "Video quality reviewed",
                )
              }
              options={[
                { value: "pending", label: "Not yet assessed" },
                { value: "pass", label: "Usable — proceed to AI" },
                { value: "fail", label: "Retake required" },
              ]}
            />

            {form.quality === "fail" && (
              <div className="space-y-3">
                <Notes label="Retake instructions" value={reason} onChange={setReason} />
                <Button
                  size="sm"
                  disabled={!reason.trim()}
                  onClick={() => save({ ...form, notes: reason }, "Retake requested")}
                >
                  Save retake instructions
                </Button>
              </div>
            )}

            {!["reviewed", "included_in_report"].includes(form.status) && form.quality !== "fail" && (
              <div className="border-t pt-3 space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={form.quality !== "pass" || processing}
                  onClick={simulate}
                >
                  {processing ? "Preparing demo result…" : "Load simulated AI result"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Simulated metrics are a fixed demo fixture, not an analysis of the uploaded video.
                </p>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Right: AI signal + review */}
        <SectionCard label="AI movement signal" title="Clinical interpretation">
          <InfoNote variant="warning">
            AI movement-risk signals support clinical interpretation. They do not determine medical eligibility. Human review is required before any clinical action.
          </InfoNote>

          {form.risk && form.quality !== "fail" ? (
            <div className="mt-4 space-y-4">
              {/* Risk level */}
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Signal level</p>
                <StatusChip value={`${form.risk}_movement_risk`} />
              </div>

              {/* Model info */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Model: {form.model ?? "—"}</span>
                <span>Confidence: {form.confidence !== undefined ? `${Math.round(form.confidence * 100)}%` : "—"}</span>
              </div>

              {/* Metrics grid */}
              {form.metrics && (
                <div className="rounded-xl bg-muted/40 p-4 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Biomechanical metrics</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      { key: "kneeValgusAngle", label: "Knee valgus angle", unit: "°" },
                      { key: "trunkLean", label: "Trunk lean", unit: "°" },
                      { key: "limbSymmetryIndex", label: "Limb symmetry index", unit: "" },
                      { key: "stabilizationTime", label: "Stabilization time", unit: " s" },
                    ].map((m) => (
                      <div key={m.key}>
                        <p className="text-xs text-muted-foreground">{m.label}</p>
                        <p className="mt-0.5 font-semibold tabular-nums">
                          {form.metrics![m.key] === undefined ? "—" : `${form.metrics![m.key]}${m.unit}`}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Mini bar chart */}
                  <div className="mt-2 h-28 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={metricsData} margin={{ top: 2, right: 4, left: -20, bottom: 0 }} barSize={14}>
                        <XAxis dataKey="label" tick={{ fontSize: 9, fill: "currentColor", opacity: 0.5 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 9, fill: "currentColor", opacity: 0.5 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ fontSize: 11, borderRadius: 8 }}
                          cursor={{ fill: "currentColor", fillOpacity: 0.04 }}
                        />
                        <Bar dataKey="value" radius={[3, 3, 0, 0]} fillOpacity={0.85}>
                          {metricsData.map((_, i) => (
                            <Cell key={i} fill={i === 0 || i === 1 ? "#FBBF24" : "#72E34D"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Drill: {human(form.kind)}. No universal cut-off is applied. Interpret in protocol and capture context.
                  </p>
                </div>
              )}

              {/* Human review form */}
              {!form.reviewer ? (
                <form
                  className="space-y-3 border-t pt-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    save(
                      { ...form, status: "reviewed", reviewer: identities.clinician.name },
                      "Movement interpretation signed",
                    );
                    toast.success("Human review saved");
                  }}
                >
                  <Notes
                    label="Clinical interpretation"
                    value={form.interpretation || ""}
                    onChange={(v) => setForm({ ...form, interpretation: v })}
                    required
                  />
                  <Choice
                    label="Reviewer action"
                    value={form.action || ""}
                    onChange={(v) => setForm({ ...form, action: v })}
                    options={["no_action", "prevention_program", "physiotherapy_referral", "further_assessment", "other"]}
                  />
                  <Button
                    type="submit"
                    disabled={!form.action || !form.interpretation?.trim()}
                    className="w-full"
                  >
                    Sign human review
                  </Button>
                  {form.action === "physiotherapy_referral" && (
                    <Link href={href(role, `referrals/new?athleteId=${form.athleteId}&source=${form.id}`)}>
                      <Button variant="outline" size="sm" className="w-full">Create referral →</Button>
                    </Link>
                  )}
                </form>
              ) : (
                <div className="border-t pt-4 space-y-3">
                  <StatusChip value="reviewed" />
                  <p className="text-sm leading-relaxed">{form.interpretation}</p>
                  {form.action && (
                    <p className="text-xs text-muted-foreground">
                      Action: {human(form.action)}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">Reviewed by {form.reviewer}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4">
              {form.quality === "fail" ? (
                <EmptyState
                  icon={TriangleAlert}
                  title="Retake required"
                  description="No AI result is available for insufficient-quality video. Retake instructions have been recorded."
                />
              ) : (
                <EmptyState
                  icon={BrainCircuit}
                  title="Result pending"
                  description="Assess video quality and load the simulated AI result to proceed with human review."
                />
              )}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
