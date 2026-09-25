"use client";
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  mockAthletes,
  mockOrganizations,
  mockTeams,
  mockScreenings,
  mockReferrals,
  mockIncidents,
} from "../data/mock-data";
import type { Athlete, EligibilityStatus } from "../types";
import { type Role, identities } from "./catalog";
export const today = "2026-09-24";
export const historyDomains = [
  "Cardiovascular",
  "Family cardiac",
  "Respiratory",
  "Neurologic",
  "Musculoskeletal",
  "General medical",
  "Allergy",
  "Medication",
  "Vision and hearing",
  "Skin and infection",
  "Mental health",
  "Female athlete health",
  "Previous restriction",
];
export const historyPrompts: Record<string, string> = {
  Cardiovascular:
    "Have you had chest pain, fainting or near-fainting during exercise, palpitations, or a known heart condition?",
  "Family cardiac":
    "Has a relative had an unexpected sudden death at a young age or an inherited heart condition?",
  Respiratory:
    "Do you have asthma, wheezing, or difficulty breathing during exercise?",
  Neurologic:
    "Have you had a concussion, seizure, loss of consciousness, or concerning headaches or neurologic symptoms?",
  Musculoskeletal:
    "Have you had a major injury, surgery, current pain, or joint instability?",
  "General medical":
    "Do you have another medical condition, recent illness, hospitalization, or surgery that the clinician should review?",
  Allergy:
    "Do you have medication, food, or environmental allergies, including a history of anaphylaxis?",
  Medication:
    "Do you currently take any prescribed, non-prescribed, or emergency medication?",
  "Vision and hearing":
    "Do you have a vision or hearing condition, or use corrective lenses or hearing assistance?",
  "Skin and infection":
    "Do you have a current skin condition, infection, or relevant infectious illness?",
  "Mental health":
    "Do you have concerns about distress, anxiety, mood, sleep, or burnout? You may request a private clinician discussion.",
  "Female athlete health":
    "Where relevant, do you have menstrual or energy-availability concerns? You may discuss relevance and details privately with the clinician.",
  "Previous restriction":
    "Have you previously been medically restricted from sport?",
};
export const examDomains = [
  "General",
  "Cardiovascular",
  "Respiratory",
  "Neurologic",
  "Vision",
  "Skin",
  "Abdomen",
];
export const baselineDomains = [
  "Spine",
  "Shoulder",
  "Elbow / wrist / hand",
  "Hip",
  "Knee",
  "Ankle / foot",
];
export const eligibilityOptions: EligibilityStatus[] = [
  "cleared",
  "cleared_with_monitoring",
  "pending_evaluation",
  "sport_specific_restriction",
  "temporarily_not_cleared",
  "not_cleared",
];
export interface Consent {
  clinical: string;
  video: boolean;
  research: boolean;
  assent: boolean;
  signer: string;
  at: string;
  version: string;
}
export interface Encounter {
  id: string;
  athleteId: string;
  date: string;
  status: string;
  history: Record<string, string>;
  followups: Record<string, string>;
  reviewed: boolean;
  exam: Record<string, string>;
  examNotes: Record<string, string>;
  baseline: Record<string, string>;
  baselineNotes: Record<string, string>;
  vitals: Record<string, string>;
  sportNotes: string;
  decision: EligibilityStatus;
  restrictions: string;
  plan: string;
  reviewDate: string;
  rationale: string;
  signature: string;
  finalized: boolean;
}
export interface RecordItem {
  id: string;
  athleteId?: string;
  title: string;
  status: string;
  date: string;
  notes: string;
  assigned: string;
  kind: string;
  outcome?: string;
  coordination?: string;
  urgency?: string;
  progress?: number;
  parentId?: string;
  file?: string;
  fileName?: string;
  quality?: string;
  interpretation?: string;
  action?: string;
  risk?: string;
  model?: string;
  confidence?: number;
  metrics?: Record<string, number>;
  reviewer?: string;
}
export type Collection =
  | "referrals"
  | "screenings"
  | "incidents"
  | "plans"
  | "sessions"
  | "reviews"
  | "events"
  | "tasks"
  | "documents"
  | "users"
  | "configs";
export interface Notice {
  id: string;
  role: Role;
  title: string;
  path: string;
  read: boolean;
  date: string;
}
export interface Message {
  id: string;
  thread: string;
  sender: Role;
  recipient: Role;
  text: string;
  date: string;
  file?: string;
  fileName?: string;
  fileType?: string;
}
export interface State {
  athletes: Athlete[];
  consents: Record<string, Consent>;
  encounters: Encounter[];
  records: Record<Collection, RecordItem[]>;
  notices: Notice[];
  messages: Message[];
  audit: { id: string; title: string; actor: string; date: string }[];
  accounts: Partial<
    Record<Role, { name: string; email: string; phone: string }>
  >;
  preferences: Record<string, boolean>;
  registration: Record<string, string>;
  athleteId: string;
  guardianId: string;
  organizations: typeof mockOrganizations;
  teams: typeof mockTeams;
  attendance: Record<string, boolean>;
}
export function emptyEncounter(id: string, athleteId: string): Encounter {
  return {
    id,
    athleteId,
    date: today,
    status: "in_progress",
    history: {},
    followups: {},
    reviewed: false,
    exam: {},
    examNotes: {},
    baseline: {},
    baselineNotes: {},
    vitals: {},
    sportNotes: "",
    decision: "pending_evaluation",
    restrictions: "",
    plan: "",
    reviewDate: "",
    rationale: "",
    signature: "",
    finalized: false,
  };
}
export const newId = (prefix: string) =>
  `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
const consent = (name: string): Consent => ({
  clinical: "obtained",
  video: true,
  research: false,
  assent: true,
  signer: name,
  at: today,
  version: "PPE privacy v1.0",
});
const brian: Encounter = {
  ...emptyEncounter("ppe-002", "ATH-00124"),
  date: "2026-09-20",
  status: "complete",
  history: Object.fromEntries(
    historyDomains.map((d) => [
      d,
      d === "Female athlete health" ? "private" : "no",
    ]),
  ),
  followups: {
    "Female athlete health": "Private review completed with clinician.",
  },
  reviewed: true,
  exam: Object.fromEntries(examDomains.map((d) => [d, "normal"])),
  examNotes: {},
  baseline: Object.fromEntries(baselineDomains.map((d) => [d, "normal"])),
  vitals: { "Systolic BP": "118", "Diastolic BP": "76", Pulse: "64" },
  sportNotes: "Football: hamstring and landing review completed.",
  decision: "cleared_with_monitoring",
  restrictions: "Modified training load; follow agreed rehabilitation plan.",
  plan: "Weekly physiotherapy review.",
  reviewDate: "2026-10-20",
  rationale: "Clinical assessment completed; monitoring indicated.",
  signature: identities.clinician.name,
  finalized: true,
};
function seed(): State {
  const athletes = mockAthletes.map((a) => ({
    ...a,
    age:
      2026 -
      Number(a.dateOfBirth.slice(0, 4)) -
      (a.dateOfBirth.slice(5) > "09-24" ? 1 : 0),
    currentSport: a.currentTeam?.sport ?? a.currentSport,
    ppeAssessments: [],
    screenings: [],
    referrals: [],
    incidents: [],
    eligibilityHistory: [],
    nextReview: a.id === brian.athleteId ? brian.reviewDate : a.nextReview,
  }));
  return {
    athletes,
    athleteId: "ATH-00124",
    guardianId: "ATH-00156",
    organizations: mockOrganizations,
    teams: mockTeams,
    attendance: {},
    consents: {
      "ATH-00124": consent("Brian Otieno"),
      "ATH-00156": {
        ...consent(""),
        clinical: "deferred",
        video: false,
        assent: false,
      },
      "ATH-00217": consent("Parent / guardian"),
    },
    encounters: [
      brian,
      {
        ...emptyEncounter("ppe-001", "ATH-00156"),
        status: "blocked",
        history: { Cardiovascular: "yes" },
        followups: {
          Cardiovascular:
            "Palpitations during exertion; clinician follow-up required.",
        },
      },
    ],
    records: {
      referrals: mockReferrals.map((r) => ({
        id: r.id,
        athleteId: r.athleteId,
        title: r.type.replaceAll("_", " "),
        kind: r.type,
        status: r.status,
        date: r.appointmentDate?.slice(0, 10) || "2026-09-30",
        notes: r.reason,
        assigned:
          r.type === "physiotherapy"
            ? identities.physiotherapist.name
            : r.assignedToName || "",
        urgency: r.urgency,
        outcome: r.outcome === "pending" ? "" : r.outcome || "",
      })),
      screenings: [
        ...mockScreenings,
        ...mockAthletes
          .flatMap((a) => a.screenings)
          .map((s) => ({ ...s, id: `legacy-${s.id}` })),
      ].map((s) => ({
        id: s.id,
        athleteId: s.athleteId,
        title: s.drill.replaceAll("_", " "),
        kind: s.drill,
        status: s.status,
        date: s.createdAt.slice(0, 10),
        notes: "",
        assigned: identities.physiotherapist.name,
        quality: s.videoQuality,
        interpretation: s.clinicalInterpretation,
        reviewer: s.reviewedBy ? identities.physiotherapist.name : undefined,
        action: s.reviewerAction,
        risk: s.aiResult?.riskLevel,
        model: s.aiResult?.modelVersion,
        confidence: s.aiResult?.confidence,
        metrics: s.aiResult?.metrics,
      })),
      incidents: mockIncidents.map((i) => ({
        id: i.id,
        athleteId: i.athleteId,
        title: i.type.replaceAll("_", " "),
        kind: i.type,
        status: "under_review",
        date: i.incidentDate.slice(0, 10),
        notes: i.description,
        assigned: identities.clinician.name,
        urgency: i.severity,
      })),
      plans: [
        {
          id: "rehab-001",
          athleteId: "ATH-00124",
          title: "Hamstring strength and return to training",
          kind: "rehabilitation",
          status: "active",
          date: "2026-10-01",
          notes:
            "Progressive strength, controlled running and weekly symptom review. Stop and contact the care team if symptoms worsen.",
          assigned: identities.physiotherapist.name,
          progress: 40,
          parentId: "ref-001",
        },
        {
          id: "rehab-002",
          athleteId: "ATH-00217",
          title: "Ankle mobility and balance",
          kind: "rehabilitation",
          status: "active",
          date: "2026-10-05",
          notes: "Graded balance and mobility under supervision.",
          assigned: identities.physiotherapist.name,
          progress: 20,
          parentId: "ref-003",
        },
      ],
      sessions: [],
      reviews: [],
      events: [
        {
          id: "evt-001",
          athleteId: "ATH-00156",
          title: "PPE history review",
          status: "scheduled",
          date: "2026-09-25T09:00",
          notes: "Green Valley clinic • Room 2",
          assigned: identities.clinician.name,
          kind: "ppe",
        },
        {
          id: "evt-002",
          athleteId: "ATH-00124",
          title: "Movement screening",
          status: "scheduled",
          date: "2026-09-26T10:00",
          notes: "Green Valley sports hall",
          assigned: identities.physiotherapist.name,
          kind: "screening",
        },
      ],
      tasks: [
        {
          id: "task-001",
          athleteId: "ATH-00156",
          title: "Arrange guardian consent",
          status: "pending",
          date: today,
          notes: "Consent must be completed before clinical assessment.",
          assigned: identities.operations.name,
          kind: "consent",
        },
        {
          id: "task-002",
          athleteId: "ATH-00124",
          title: "Confirm modified training plan",
          status: "pending",
          date: today,
          notes: "Acknowledge the published participation restrictions.",
          assigned: identities.coach.name,
          kind: "participation",
        },
      ],
      documents: [],
      users: Object.entries(identities).map(([role, u]) => ({
        id: role,
        title: u.name,
        status: "active",
        date: today,
        notes: u.email,
        assigned: role,
        kind: "user",
      })),
      configs: [
        {
          id: "cfg-001",
          title: "Football",
          status: "active",
          date: today,
          notes: "Landing, cutting, hamstring and concussion review",
          assigned: "Clinical governance",
          kind: "sports",
        },
        {
          id: "cfg-002",
          title: "PPE mandatory stages",
          status: "active",
          date: today,
          notes:
            "Consent, history, vitals, examination, baseline and clinician decision",
          assigned: "Clinical governance",
          kind: "assessments",
        },
        {
          id: "cfg-003",
          title: "Closed-loop referrals",
          status: "active",
          date: today,
          notes:
            "An outcome and closure note are required to complete a referral.",
          assigned: "Clinical governance",
          kind: "workflows",
        },
        {
          id: "cfg-004",
          title: "Physiotherapy",
          status: "active",
          date: today,
          notes: "Movement review and rehabilitation",
          assigned: identities.physiotherapist.name,
          kind: "services",
        },
      ],
    },
    notices: [
      {
        id: "note-001",
        role: "athlete",
        title: "Your participation certificate is available",
        path: "certificates",
        read: false,
        date: today,
      },
      {
        id: "note-002",
        role: "guardian",
        title: "Kevin needs consent and assent",
        path: "consent",
        read: false,
        date: today,
      },
      {
        id: "note-003",
        role: "clinician",
        title: "PPE review is blocked pending consent",
        path: "assessments/ppe-001",
        read: false,
        date: today,
      },
      {
        id: "note-004",
        role: "physiotherapist",
        title: "Movement screening awaits your review",
        path: "ai-reviews/scr-001",
        read: false,
        date: today,
      },
    ],
    messages: [
      {
        id: "msg-001",
        thread: "athlete:physiotherapist",
        sender: "physiotherapist",
        recipient: "athlete",
        text: "Your next movement review is scheduled. Please bring your training shoes.",
        date: "2026-09-24T08:30:00",
      },
    ],
    audit: [
      {
        id: "audit-001",
        title: "Demo workspace opened",
        actor: "System",
        date: today,
      },
    ],
    accounts: {},
    preferences: {},
    registration: {},
  };
}
const Context = createContext<{
  state: State;
  setState: Dispatch<SetStateAction<State>>;
  update: (
    change: (s: State) => State,
    title: string,
    role: Role,
    path?: string,
    audiences?: Role[],
  ) => void;
} | null>(null);
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(seed);
  function update(
    change: (s: State) => State,
    title: string,
    role: Role,
    path = "notifications",
    audiences: Role[] = [role],
  ) {
    const id = newId("event");
    const date = new Date().toISOString();
    setState((s) => {
      const next = change(s);
      return {
        ...next,
        audit: [
          { id, title, actor: identities[role].name, date },
          ...next.audit,
        ],
        notices: [
          ...audiences
            .filter((r) => next.preferences[`${r}-reminders`] !== false)
            .map((r, i) => ({
              id: `${id}-${i}`,
              role: r,
              title,
              path: r === role ? path : "notifications",
              read: false,
              date,
            })),
          ...next.notices,
        ],
      };
    });
  }
  return (
    <Context.Provider value={{ state, setState, update }}>
      {children}
    </Context.Provider>
  );
}
export function useWorkspace() {
  const context = useContext(Context);
  if (!context) throw new Error("Workspace provider is required");
  return context;
}
export function visibleAthletes(state: State, role: Role) {
  if (role === "sys-admin") return [];
  if (role === "athlete")
    return state.athletes.filter((a) => a.id === state.athleteId);
  if (role === "guardian")
    return state.athletes.filter(
      (a) => a.id === state.guardianId && a.age < 18,
    );
  if (role === "coach" || role === "institution")
    return state.athletes.filter(
      (a) => a.currentOrganization?.id === "org-001",
    );
  if (role === "physiotherapist") {
    const assigned = new Set(
      [
        ...state.records.referrals,
        ...state.records.plans,
        ...state.records.screenings,
      ]
        .filter((r) => r.assigned === identities.physiotherapist.name)
        .map((r) => r.athleteId),
    );
    return state.athletes.filter((a) => assigned.has(a.id));
  }
  return state.athletes;
}
export const fullName = (a?: Athlete) =>
  a ? `${a.firstName} ${a.lastName}` : "Unassigned athlete";
export function certificateText(a: Athlete, e: Encounter) {
  return `SAFESPORT — DEMO PARTICIPATION CERTIFICATE\nNot a valid medical certificate\n\n${fullName(a)} • ${a.id}\n${a.currentOrganization?.name} • ${a.currentSport?.name}\nAssessment: ${e.date}\nEligibility: ${e.decision.replaceAll("_", " ")}\nRestrictions: ${e.restrictions || "None specified"}\nMonitoring: ${e.plan || "None specified"}\nReview: ${e.reviewDate}\nClinician: ${e.signature}\nVerification: DEMO-${e.id}\n`;
}
