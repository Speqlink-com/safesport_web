// SafeSport™ Mock Onboarding Data
// Realistic athlete onboarding states for prototype testing

// SafeSport™ Mock Onboarding Data
// Realistic athlete onboarding states for prototype testing
import type { AthleteOnboardingData, PPEReadiness } from "../types/onboarding";

// ==================================================
// BRIAN OTIENO - MOSTLY COMPLETE
// ==================================================

export const brianOnboarding: AthleteOnboardingData = {
  athleteId: "ATH-00124",
  state: "questionnaire_incomplete",
  progress: {
    overall: 72,
    sections: {
      profile: "complete",
      emergency: "complete",
      guardian: "not_applicable", // Over 18
      participation: "complete",
      questionnaire: "in_progress",
      consent: "not_started",
    },
    nextStep: "questionnaire",
    isComplete: false,
  },
  profile: {
    firstName: "Brian",
    lastName: "Otieno",
    email: "b.otieno@athlete.safesport.com",
    dateOfBirth: "2008-03-15",
    sex: "male",
    age: 18,
    isMinor: false,
  },
  emergencyContact: {
    name: "Jane Otieno",
    phone: "+254712345678",
    relationship: "Mother",
  },
  participation: {
    institutionId: "org-001",
    institutionName: "Green Valley Academy",
    teamId: "team-002",
    teamName: "U18 Football",
    sportId: "sport-001",
    sportName: "Football",
    position: "Midfielder",
    primarySport: true,
  },
  startedAt: "2026-08-25T10:00:00Z",
  lastUpdatedAt: "2026-08-29T14:30:00Z",
};

// ==================================================
// KEVIN MUTUA - NEW ATHLETE (MINOR)
// ==================================================

export const kevinOnboarding: AthleteOnboardingData = {
  athleteId: "ATH-00156",
  state: "in_progress",
  progress: {
    overall: 28,
    sections: {
      profile: "complete",
      emergency: "not_started",
      guardian: "not_started",
      participation: "complete",
      questionnaire: "not_started",
      consent: "not_started",
    },
    nextStep: "emergency_contact",
    isComplete: false,
  },
  profile: {
    firstName: "Kevin",
    lastName: "Mutua",
    email: "k.mutua@athlete.safesport.com",
    dateOfBirth: "2009-07-22",
    sex: "male",
    age: 17,
    isMinor: true,
  },
  participation: {
    institutionId: "org-001",
    institutionName: "Green Valley Academy",
    teamId: "team-001",
    teamName: "U16 Football",
    sportId: "sport-001",
    sportName: "Football",
    primarySport: true,
  },
  startedAt: "2026-08-30T08:00:00Z",
  lastUpdatedAt: "2026-08-30T08:15:00Z",
};

// ==================================================
// IAN KAMAU - READY FOR PPE
// ==================================================

export const ianOnboarding: AthleteOnboardingData = {
  athleteId: "ATH-00178",
  state: "ready_for_ppe",
  progress: {
    overall: 100,
    sections: {
      profile: "complete",
      emergency: "complete",
      guardian: "not_applicable",
      participation: "complete",
      questionnaire: "complete",
      consent: "complete",
    },
    nextStep: undefined,
    isComplete: true,
  },
  profile: {
    firstName: "Ian",
    lastName: "Kamau",
    email: "i.kamau@athlete.safesport.com",
    dateOfBirth: "2007-11-10",
    sex: "male",
    age: 18,
    isMinor: false,
  },
  emergencyContact: {
    name: "Peter Kamau",
    phone: "+254723456789",
    relationship: "Father",
  },
  participation: {
    institutionId: "org-001",
    institutionName: "Green Valley Academy",
    teamId: "team-002",
    teamName: "U18 Football",
    sportId: "sport-001",
    sportName: "Football",
    position: "Defender",
    primarySport: true,
  },
  questionnaire: {
    cardiovascular: [],
    familyCardiac: [],
    respiratory: [],
    neurologic: [],
    musculoskeletal: [],
    generalMedical: [],
    allergy: [],
    medication: [],
    visionHearing: [],
    skinInfection: [],
    mentalHealth: [],
    femaleAthlete: [],
    previousRestriction: [],
    completedAt: "2026-08-28T16:45:00Z",
    reviewFlags: [
      {
        domain: "musculoskeletal",
        severity: "moderate",
        description: "Previous ankle sprain requiring follow-up",
        requiresFollowUp: true,
      },
    ],
  },
  consent: {
    clinicalRequired: true,
    clinicalProvided: true,
    videoProvided: false,
    researchOptIn: false,
    aiOptIn: false,
    consents: [
      {
        id: "consent-001",
        type: "clinical_assessment",
        version: "1.0",
        providedBy: "ATH-00178",
        providedByRole: "athlete",
        scope: ["clinical_assessment", "medical_history"],
        providedAt: "2026-08-28T17:00:00Z",
      },
    ],
  },
  startedAt: "2026-08-20T09:00:00Z",
  lastUpdatedAt: "2026-08-28T17:00:00Z",
  readyForPPEAt: "2026-08-28T17:00:00Z",
};

// ==================================================
// TREY MWANGI - PPE IN PROGRESS
// ==================================================

export const treyOnboarding: AthleteOnboardingData = {
  athleteId: "ATH-00189",
  state: "ppe_in_progress",
  progress: {
    overall: 100,
    sections: {
      profile: "complete",
      emergency: "complete",
      guardian: "not_applicable",
      participation: "complete",
      questionnaire: "complete",
      consent: "complete",
    },
    nextStep: undefined,
    isComplete: true,
  },
  profile: {
    firstName: "Trey",
    lastName: "Mwangi",
    email: "t.mwangi@athlete.safesport.com",
    dateOfBirth: "2008-05-20",
    sex: "male",
    age: 18,
    isMinor: false,
  },
  emergencyContact: {
    name: "Sarah Mwangi",
    phone: "+254734567890",
    relationship: "Mother",
  },
  participation: {
    institutionId: "org-001",
    institutionName: "Green Valley Academy",
    teamId: "team-002",
    teamName: "U18 Football",
    sportId: "sport-001",
    sportName: "Football",
    position: "Forward",
    primarySport: true,
  },
  questionnaire: {
    cardiovascular: [],
    familyCardiac: [],
    respiratory: [],
    neurologic: [],
    musculoskeletal: [],
    generalMedical: [],
    allergy: [],
    medication: [],
    visionHearing: [],
    skinInfection: [],
    mentalHealth: [],
    femaleAthlete: [],
    previousRestriction: [],
    completedAt: "2026-08-26T14:00:00Z",
    reviewFlags: [],
  },
  consent: {
    clinicalRequired: true,
    clinicalProvided: true,
    videoProvided: true,
    researchOptIn: true,
    aiOptIn: true,
    consents: [
      {
        id: "consent-002",
        type: "clinical_assessment",
        version: "1.0",
        providedBy: "ATH-00189",
        providedByRole: "athlete",
        scope: ["clinical_assessment", "medical_history"],
        providedAt: "2026-08-26T14:30:00Z",
      },
      {
        id: "consent-003",
        type: "video_consent",
        version: "1.0",
        providedBy: "ATH-00189",
        providedByRole: "athlete",
        scope: ["movement_screening", "video_recording"],
        providedAt: "2026-08-26T14:30:00Z",
      },
    ],
  },
  startedAt: "2026-08-22T10:00:00Z",
  lastUpdatedAt: "2026-08-29T09:00:00Z",
  readyForPPEAt: "2026-08-26T14:30:00Z",
};

// ==================================================
// PPE READINESS QUEUE
// ==================================================

export const ppeReadinessQueue: PPEReadiness[] = [
  {
    athleteId: "ATH-00178",
    athleteName: "Ian Kamau",
    isReady: true,
    readyAt: "2026-08-28T17:00:00Z",
    blockers: [],
    status: "ready",
  },
  {
    athleteId: "ATH-00189",
    athleteName: "Trey Mwangi",
    isReady: true,
    readyAt: "2026-08-26T14:30:00Z",
    blockers: [],
    status: "in_progress",
    scheduledDate: "2026-08-30T09:00:00Z",
    clinicianId: "user-clinician-001",
    clinicianName: "Dr. Sarah Ndungu",
  },
  {
    athleteId: "ATH-00124",
    athleteName: "Brian Otieno",
    isReady: false,
    blockers: ["Health questionnaire incomplete", "Consent required"],
    status: "not_ready",
  },
  {
    athleteId: "ATH-00156",
    athleteName: "Kevin Mutua",
    isReady: false,
    blockers: [
      "Emergency contact required",
      "Guardian information required",
      "Health questionnaire required",
      "Consent required",
    ],
    status: "not_ready",
  },
];

// ==================================================
// HELPER FUNCTIONS
// ==================================================

export function getOnboardingDataByAthleteId(athleteId: string): AthleteOnboardingData | undefined {
  const onboardingMap: Record<string, AthleteOnboardingData> = {
    "ATH-00124": brianOnboarding,
    "ATH-00156": kevinOnboarding,
    "ATH-00178": ianOnboarding,
    "ATH-00189": treyOnboarding,
  };
  return onboardingMap[athleteId];
}

export function getPPEReadiness(athleteId: string): PPEReadiness | undefined {
  return ppeReadinessQueue.find((r) => r.athleteId === athleteId);
}

export function calculateOnboardingProgress(data: AthleteOnboardingData): number {
  const sections = data.progress.sections;
  const sectionKeys = Object.keys(sections) as Array<keyof typeof sections>;
  
  let completed = 0;
  let total = 0;
  
  sectionKeys.forEach((key) => {
    const status = sections[key];
    if (status !== "not_applicable") {
      total++;
      if (status === "complete") {
        completed++;
      }
    }
  });
  
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}
