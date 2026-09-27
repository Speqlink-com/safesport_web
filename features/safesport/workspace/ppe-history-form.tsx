"use client";
import { Button } from "@/components/ui/button";
import { Choice, Field, Notes, Check } from "./ui";
import {
  detailFields,
  questionExtraFields,
  ppeQuestions,
  summarizeHistory,
  type HistoryDetail,
} from "./ppe-history";
import { newId, type Encounter } from "./store";

export function PPEHistoryFields({
  value,
  onChange,
  guardian = false,
  clinician = false,
}: {
  value: Encounter;
  onChange: (patch: Partial<Encounter>) => void;
  guardian?: boolean;
  clinician?: boolean;
}) {
  const answers = value.historyAnswers || {};
  const patch = (change: Partial<Encounter>) =>
    onChange({ ...change, reviewed: false });
  const detail = (id: string, next: HistoryDetail) =>
    patch({ historyDetails: { ...value.historyDetails, [id]: next } });
  return (
    <div className="space-y-5">
      {!value.historyAnswers && (
        <p className="rounded-lg border bg-muted/40 p-3 text-sm">
          This record has a domain summary only. Confirm each question below;
          earlier grouped answers have not been copied into individual answers.
        </p>
      )}
      <p className="text-sm text-muted-foreground">
        For positive answers, complete each follow-up field. Enter “Unknown” or
        “None” where appropriate. You can save a draft and return later.
      </p>
      {clinician &&
        ["allergy", "medication"].some((id) => answers[id] === "yes") && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
            <p className="font-semibold">
              Allergies and medication — review before examination
            </p>
            {["allergy", "medication"]
              .filter((id) => answers[id] === "yes")
              .map((id) => (
                <p key={id} className="mt-2">
                  {value.historyDetails?.[id]?.condition || "Details pending"} ·{" "}
                  {value.historyDetails?.[id]?.medication ||
                    "Medication details pending"}
                </p>
              ))}
          </div>
        )}
      {ppeQuestions.map((q) => {
        const isPrivate = "private" in q && q.private;
        const hidden = guardian && isPrivate;
        const answer = hidden ? "private" : answers[q.id] || "";
        return (
          <section
            key={q.id}
            className="space-y-4 rounded-lg border border-border/60 p-4"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {q.domain}
            </p>
            <Choice
              label={q.label}
              value={answer}
              disabled={hidden}
              options={[
                "yes",
                "no",
                "unknown",
                ...(isPrivate
                  ? [
                      {
                        value: "private",
                        label: "Discuss privately with clinician",
                      },
                    ]
                  : []),
              ]}
              onChange={(v) => {
                const next = { ...answers, [q.id]: v };
                patch({
                  historyAnswers: next,
                  history: summarizeHistory(next),
                  historyResolutions: {
                    ...value.historyResolutions,
                    [q.id]: "",
                  },
                });
              }}
            />
            {answer === "yes" && !hidden && (
              <HistoryDetails
                prefix={q.label}
                value={value.historyDetails?.[q.id] || {}}
                onChange={(next) => detail(q.id, next)}
              />
            )}
            {answer === "yes" && !hidden && (
              <div className="grid gap-4 sm:grid-cols-2">
                {(questionExtraFields[q.id] || []).map(([key, label]) => (
                  <Field
                    key={key}
                    label={`${q.label} — ${label}`}
                    value={value.historyDetails?.[q.id]?.[key] || ""}
                    onChange={(v) =>
                      detail(q.id, {
                        ...value.historyDetails?.[q.id],
                        [key]: v,
                      })
                    }
                  />
                ))}
              </div>
            )}
            {answer === "private" && (
              <p className="text-sm text-muted-foreground">
                Review privately with the clinician. Sensitive answers and
                clinical notes are not shown to guardians.
              </p>
            )}
            {clinician && ["yes", "unknown", "private"].includes(answer) && (
              <Notes
                label={`${q.label} — clinician resolution`}
                value={value.historyResolutions?.[q.id] || ""}
                onChange={(v) =>
                  patch({
                    historyResolutions: {
                      ...value.historyResolutions,
                      [q.id]: v,
                    },
                  })
                }
              />
            )}
          </section>
        );
      })}
      {answers.neurologic === "yes" && (
        <section className="space-y-4 rounded-lg border p-4">
          <h3 className="font-semibold">Concussion history</h3>
          <Choice
            label="Does this include concussion?"
            value={value.concussion?.present || ""}
            options={["yes", "no", "unknown"]}
            onChange={(present) =>
              patch({
                concussion: {
                  episodes: "",
                  lastEpisode: "",
                  recovery: "",
                  symptoms: "",
                  ...value.concussion,
                  present,
                },
              })
            }
          />
          {value.concussion?.present === "yes" && (
            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["episodes", "Number of concussion episodes"],
                  [
                    "lastEpisode",
                    "Most recent concussion date / approximate date",
                  ],
                  ["recovery", "Concussion recovery status"],
                  ["symptoms", "Current concussion symptoms"],
                ] as const
              ).map(([key, label]) => (
                <Field
                  key={key}
                  label={label}
                  value={value.concussion?.[key] || ""}
                  type={key === "episodes" ? "number" : "text"}
                  min={key === "episodes" ? 1 : undefined}
                  onChange={(v) =>
                    patch({
                      concussion: {
                        present: "yes",
                        episodes: "",
                        lastEpisode: "",
                        recovery: "",
                        symptoms: "",
                        ...value.concussion,
                        [key]: v,
                      },
                    })
                  }
                />
              ))}
            </div>
          )}
        </section>
      )}
      {["injury", "current-limitation"].some((id) => answers[id] === "yes") && (
        <section className="space-y-4">
          <h3 className="font-semibold">
            Individual injuries / current problems
          </h3>
          {(value.injuries || []).map((injury, i) => (
            <div key={injury.id} className="space-y-4 rounded-lg border p-4">
              <Field
                label={`Injury ${i + 1}: body region`}
                value={injury.region}
                onChange={(region) =>
                  patch({
                    injuries: value.injuries?.map((item) =>
                      item.id === injury.id ? { ...item, region } : item,
                    ),
                  })
                }
              />
              <HistoryDetails
                prefix={`Injury ${i + 1}`}
                value={injury}
                onChange={(next) =>
                  patch({
                    injuries: value.injuries?.map((item) =>
                      item.id === injury.id ? { ...item, ...next } : item,
                    ),
                  })
                }
              />
              <Button
                variant="outline"
                onClick={() =>
                  patch({
                    injuries: value.injuries?.filter(
                      (item) => item.id !== injury.id,
                    ),
                  })
                }
              >
                Remove injury {i + 1}
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={() =>
              patch({
                injuries: [
                  ...(value.injuries || []),
                  { id: newId("injury"), region: "" },
                ],
              })
            }
          >
            Add injury / current problem
          </Button>
        </section>
      )}
      {clinician && (
        <Check
          label="I have reviewed all history responses and resolved the flags with a documented plan."
          checked={value.reviewed}
          onChange={(reviewed) => onChange({ reviewed })}
        />
      )}
    </div>
  );
}
function HistoryDetails({
  prefix,
  value,
  onChange,
}: {
  prefix: string;
  value: HistoryDetail;
  onChange: (next: HistoryDetail) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {detailFields.map(([key, label]) => (
        <Field
          key={key}
          label={`${prefix} — ${label}`}
          value={value[key] || ""}
          onChange={(v) => onChange({ ...value, [key]: v })}
        />
      ))}
    </div>
  );
}
