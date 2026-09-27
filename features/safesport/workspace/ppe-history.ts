/** Individual questions from package.md §5; unknown remains distinct from no. */
export const ppeQuestions = [
  {
    id: "chest",
    domain: "Cardiovascular",
    label: "Chest pain, pressure or discomfort with exercise?",
  },
  {
    id: "fainting",
    domain: "Cardiovascular",
    label: "Fainting or near-fainting, especially during exercise?",
  },
  {
    id: "palpitations",
    domain: "Cardiovascular",
    label: "Unexplained racing, pounding or irregular heartbeat?",
  },
  {
    id: "cardiac-diagnosis",
    domain: "Cardiovascular",
    label:
      "Known heart problem, murmur, high blood pressure or abnormal cardiac test?",
  },
  {
    id: "family-death",
    domain: "Family cardiac",
    label: "Unexpected or sudden death in a close relative at a young age?",
  },
  {
    id: "family-condition",
    domain: "Family cardiac",
    label:
      "Family history of cardiomyopathy, inherited arrhythmia or significant heart disease?",
  },
  {
    id: "breathing",
    domain: "Respiratory",
    label: "Asthma, exercise breathing difficulty, wheeze or inhaler use?",
  },
  {
    id: "neurologic",
    domain: "Neurologic",
    label:
      "Concussion, seizure, unexplained loss of consciousness or significant neurologic symptoms?",
  },
  {
    id: "injury",
    domain: "Musculoskeletal",
    label:
      "Previous fracture, dislocation, ligament injury, major sprain, muscle or tendon injury, or surgery?",
  },
  {
    id: "current-limitation",
    domain: "Musculoskeletal",
    label:
      "Current pain, swelling, instability, weakness or limitation affecting sport?",
  },
  {
    id: "medical",
    domain: "General medical",
    label: "Chronic illness, hospitalization or major surgery?",
  },
  {
    id: "allergy",
    domain: "Allergy",
    label: "Medication, food or environmental allergy, or anaphylaxis?",
  },
  {
    id: "medication",
    domain: "Medication",
    label: "Regular, as-needed or emergency medication?",
  },
  {
    id: "vision",
    domain: "Vision and hearing",
    label: "Vision or hearing problem affecting participation?",
  },
  {
    id: "skin",
    domain: "Skin and infection",
    label: "Skin condition or recurrent infection relevant to sport?",
  },
  {
    id: "mental",
    domain: "Mental health",
    label:
      "Significant stress, anxiety, low mood, sleep problems, burnout or sport-related distress?",
    private: true,
  },
  {
    id: "female",
    domain: "Female athlete health",
    label: "Menstrual or energy-availability concerns, where relevant?",
    private: true,
  },
  {
    id: "restriction",
    domain: "Previous restriction",
    label: "Previously restricted from sport by a health professional?",
  },
] as const;

export const detailFields = [
  ["condition", "Condition / injury"],
  ["onset", "Date / onset"],
  ["symptoms", "Symptoms"],
  ["treatment", "Treatment"],
  ["investigations", "Investigations"],
  ["specialist", "Specialist involved"],
  ["currentStatus", "Current status"],
  ["medication", "Medication / dose / indication"],
  ["rehabilitation", "Rehabilitation"],
  ["returnDecision", "Previous return-to-play decision"],
] as const;
export const questionExtraFields: Record<
  string,
  readonly (readonly [keyof HistoryDetail, string])[]
> = {
  "family-death": [
    ["relationship", "Relative and relationship"],
    ["age", "Age at death"],
    ["diagnosis", "Cause / diagnosis if known"],
  ],
  "family-condition": [
    ["relationship", "Relative and relationship"],
    ["age", "Age at diagnosis"],
    ["diagnosis", "Known diagnosis"],
  ],
  breathing: [
    ["control", "Asthma / breathing control"],
    ["exacerbations", "Recent exacerbations"],
  ],
  allergy: [
    ["trigger", "Allergy trigger"],
    ["severity", "Reaction / severity"],
    ["emergency", "Emergency medication / response plan"],
  ],
};
export type HistoryDetail = Partial<
  Record<
    | (typeof detailFields)[number][0]
    | "relationship"
    | "age"
    | "diagnosis"
    | "control"
    | "exacerbations"
    | "trigger"
    | "severity"
    | "emergency",
    string
  >
>;
export type InjuryHistory = HistoryDetail & { id: string; region: string };
export interface DetailedHistory {
  historyAnswers?: Record<string, string>;
  historyDetails?: Record<string, HistoryDetail>;
  historyResolutions?: Record<string, string>;
  historySubmitted?: boolean;
  injuries?: InjuryHistory[];
  concussion?: {
    present: string;
    episodes: string;
    lastEpisode: string;
    recovery: string;
    symptoms: string;
  };
}
export function historyErrors(history: DetailedHistory, clinician = false) {
  const errors: string[] = [];
  for (const q of ppeQuestions) {
    const answer = history.historyAnswers?.[q.id];
    if (!answer) errors.push(`Answer: ${q.label}`);
    if (
      answer === "yes" &&
      detailFields.some(
        ([key]) => !history.historyDetails?.[q.id]?.[key]?.trim(),
      )
    )
      errors.push(`Complete the structured follow-up: ${q.label}`);
    if (
      answer === "yes" &&
      (questionExtraFields[q.id] || []).some(
        ([key]) => !history.historyDetails?.[q.id]?.[key]?.trim(),
      )
    )
      errors.push(`Complete the specific follow-up: ${q.label}`);
    if (
      clinician &&
      ["yes", "unknown", "private"].includes(answer || "") &&
      !history.historyResolutions?.[q.id]?.trim()
    )
      errors.push(`Document clinician resolution: ${q.label}`);
  }
  if (
    ["injury", "current-limitation"].some(
      (id) => history.historyAnswers?.[id] === "yes",
    )
  ) {
    if (!history.injuries?.length)
      errors.push(
        "Record each injury or current musculoskeletal problem separately.",
      );
    if (
      history.injuries?.some(
        (injury) =>
          !injury.region.trim() ||
          detailFields.some(([key]) => !injury[key]?.trim()),
      )
    )
      errors.push("Complete the structured fields for each injury.");
  }
  if (history.historyAnswers?.neurologic === "yes") {
    const c = history.concussion;
    if (!c?.present)
      errors.push(
        "Confirm whether the neurologic history includes concussion.",
      );
    if (
      c?.present === "yes" &&
      (!Number.isInteger(Number(c.episodes)) ||
        Number(c.episodes) < 1 ||
        !c.lastEpisode.trim() ||
        !c.recovery.trim() ||
        !c.symptoms.trim())
    )
      errors.push(
        "Complete concussion episode count, most recent episode, recovery and symptoms.",
      );
  }
  return errors;
}
export function summarizeHistory(answers: Record<string, string>) {
  return Object.fromEntries(
    [...new Set(ppeQuestions.map((q) => q.domain))].map((domain) => {
      const values = ppeQuestions
        .filter((q) => q.domain === domain)
        .map((q) => answers[q.id]);
      return [
        domain,
        values.includes("yes")
          ? "yes"
          : values.includes("private")
            ? "private"
            : values.includes("unknown")
              ? "unknown"
              : values.every((v) => v === "no")
                ? "no"
                : "",
      ];
    }),
  );
}
