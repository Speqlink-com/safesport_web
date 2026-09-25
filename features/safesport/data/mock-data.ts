// SafeSport™ Mock Data Repository
// Shared consistent mock data for prototype - same athletes across all roles

// SafeSport™ Mock Data Repository
// Shared consistent mock data for prototype - same athletes across all roles
import type { Athlete, Organization, Team, Sport, PPEAssessment, Incident, MovementScreening, Referral, ScheduleEvent, Notification } from "../types";

// ==================================================
// ORGANIZATIONS
// ==================================================

export const mockOrganizations: Organization[] = [
  {
    id: "org-001",
    name: "Green Valley Academy",
    type: "academy",
    logo: "/avatars/greenvalley.jpg",
  },
  {
    id: "org-002",
    name: "Alliance High School",
    type: "school",
    logo: "/avatars/alliance.jpg",
  },
  {
    id: "org-003",
    name: "Gor Mahia FC",
    type: "club",
    logo: "/avatars/gormahia.jpg",
  },
  {
    id: "org-004",
    name: "SafeSport Medical Services",
    type: "medical",
  },
];

// ==================================================
// SPORTS & TEAMS
// ==================================================

export const mockSports: Sport[] = [
  { id: "sport-001", name: "Football", category: "football" },
  { id: "sport-002", name: "Rugby", category: "rugby" },
  { id: "sport-003", name: "Netball", category: "netball" },
  { id: "sport-004", name: "Athletics", category: "athletics" },
  { id: "sport-005", name: "Basketball", category: "basketball" },
];

export const mockTeams: Team[] = [
  {
    id: "team-001",
    name: "U16 Football",
    ageGroup: "U16",
    sport: mockSports[0],
    organizationId: "org-001",
  },
  {
    id: "team-002",
    name: "U18 Football",
    ageGroup: "U18",
    sport: mockSports[0],
    organizationId: "org-001",
  },
  {
    id: "team-003",
    name: "U18 Rugby",
    ageGroup: "U18",
    sport: mockSports[1],
    organizationId: "org-003",
  },
  {
    id: "team-004",
    name: "U18 Netball",
    ageGroup: "U18",
    sport: mockSports[2],
    organizationId: "org-002",
  },
];

// ==================================================
// ATHLETES
// ==================================================

export const mockAthletes: Athlete[] = [
  {
    id: "ATH-00124",
    firstName: "Brian",
    lastName: "Otieno",
    dateOfBirth: "2008-03-15",
    age: 18,
    gender: "male",
    photo: "/avatars/brian.jpg",
    currentOrganization: mockOrganizations[0],
    currentTeam: mockTeams[1],
    currentSport: mockSports[0],
    eligibilityStatus: "cleared_with_monitoring",
    readiness: "ready_with_restrictions",
    nextReview: "2026-09-15",
    organizations: [
      {
        organizationId: "org-001",
        organization: mockOrganizations[0],
        joinedAt: "2024-01-10",
        status: "active",
      },
    ],
    teams: [
      {
        teamId: "team-002",
        team: mockTeams[1],
        sport: mockSports[0],
        position: "Midfielder",
        joinedAt: "2024-01-10",
        status: "active",
      },
    ],
    ppeAssessments: [],
    incidents: [],
    screenings: [
      {
        id: "SCR-001",
        athleteId: "ATH-00124",
        performedBy: "PHYS-001",
        performedByName: "Dr. Sarah Chen",
        drill: "jump_landing",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        videoQuality: "pass",
        status: "reviewed",
        aiProcessing: {
          startedAt: "2026-08-18T10:05:00Z",
          completedAt: "2026-08-18T11:30:00Z",
          status: "complete",
          modelVersion: "v2.1.0",
        },
        aiResult: {
          riskLevel: "moderate",
          confidence: 0.87,
          metrics: {
            kneeValgusAngle: 15,
            trunkLean: 8,
            limbSymmetryIndex: 0.82,
          },
          processingTimestamp: "2026-08-18T11:30:00Z",
          modelVersion: "v2.1.0",
        },
        reviewedBy: "PHYS-001",
        reviewedByName: "Dr. Sarah Chen",
        reviewDate: "2026-08-18T14:00:00Z",
        clinicalInterpretation: "Observed landing mechanics show slight valgus collapse on left knee. Recommend single-leg strengthening protocol.",
        reviewerAction: "prevention_program",
        createdAt: "2026-08-18T10:00:00Z",
      },
      {
        id: "SCR-002",
        athleteId: "ATH-00124",
        performedBy: "PHYS-001",
        performedByName: "Dr. Sarah Chen",
        drill: "single_leg_squat",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
        videoQuality: "pass",
        status: "reviewed",
        aiProcessing: {
          startedAt: "2026-08-12T09:05:00Z",
          completedAt: "2026-08-12T10:15:00Z",
          status: "complete",
          modelVersion: "v2.1.0",
        },
        aiResult: {
          riskLevel: "low",
          confidence: 0.92,
          metrics: {
            limbSymmetryIndex: 0.95,
            stabilizationTime: 1.2,
          },
          processingTimestamp: "2026-08-12T10:15:00Z",
          modelVersion: "v2.1.0",
        },
        reviewedBy: "PHYS-001",
        reviewedByName: "Dr. Sarah Chen",
        reviewDate: "2026-08-12T11:30:00Z",
        clinicalInterpretation: "Excellent single-leg stability bilaterally. No concerns identified.",
        reviewerAction: "no_action",
        createdAt: "2026-08-12T09:00:00Z",
      },
      {
        id: "SCR-003",
        athleteId: "ATH-00124",
        performedBy: "PHYS-001",
        performedByName: "Dr. Sarah Chen",
        drill: "sprint_acceleration",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
        videoQuality: "pass",
        status: "processing",
        aiProcessing: {
          startedAt: "2026-08-02T08:35:00Z",
          status: "processing",
          modelVersion: "v2.1.0",
        },
        createdAt: "2026-08-02T08:30:00Z",
      },
    ],
    referrals: [],
    eligibilityHistory: [],
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2026-08-26T10:30:00Z",
  },
  {
    id: "ATH-00156",
    firstName: "Kevin",
    lastName: "Mutua",
    dateOfBirth: "2009-07-22",
    age: 17,
    gender: "male",
    currentOrganization: mockOrganizations[0],
    currentTeam: mockTeams[0],
    currentSport: mockSports[0],
    eligibilityStatus: "pending_evaluation",
    readiness: "under_review",
    nextReview: "2026-08-29",
    organizations: [
      {
        organizationId: "org-001",
        organization: mockOrganizations[0],
        joinedAt: "2025-06-01",
        status: "active",
      },
    ],
    teams: [
      {
        teamId: "team-001",
        team: mockTeams[0],
        sport: mockSports[0],
        position: "Forward",
        joinedAt: "2025-06-01",
        status: "active",
      },
    ],
    ppeAssessments: [],
    incidents: [],
    screenings: [],
    referrals: [],
    eligibilityHistory: [],
    createdAt: "2025-06-01T09:00:00Z",
    updatedAt: "2026-08-28T14:00:00Z",
  },
  {
    id: "ATH-00189",
    firstName: "Ian",
    lastName: "Kamau",
    dateOfBirth: "2007-11-03",
    age: 18,
    gender: "male",
    currentOrganization: mockOrganizations[2],
    currentTeam: mockTeams[2],
    currentSport: mockSports[1],
    eligibilityStatus: "cleared",
    readiness: "ready",
    organizations: [
      {
        organizationId: "org-003",
        organization: mockOrganizations[2],
        joinedAt: "2023-09-01",
        status: "active",
      },
    ],
    teams: [
      {
        teamId: "team-003",
        team: mockTeams[2],
        sport: mockSports[1],
        position: "Flanker",
        joinedAt: "2023-09-01",
        status: "active",
      },
    ],
    ppeAssessments: [],
    incidents: [],
    screenings: [],
    referrals: [],
    eligibilityHistory: [],
    createdAt: "2023-09-01T10:00:00Z",
    updatedAt: "2026-08-20T11:00:00Z",
  },
  {
    id: "ATH-00201",
    firstName: "Trey",
    lastName: "Mwangi",
    dateOfBirth: "2008-05-18",
    age: 18,
    gender: "male",
    currentOrganization: mockOrganizations[0],
    currentTeam: mockTeams[1],
    currentSport: mockSports[0],
    eligibilityStatus: "cleared",
    readiness: "ready",
    nextReview: "2026-12-01",
    organizations: [
      {
        organizationId: "org-001",
        organization: mockOrganizations[0],
        joinedAt: "2024-08-01",
        status: "active",
      },
    ],
    teams: [
      {
        teamId: "team-002",
        team: mockTeams[1],
        sport: mockSports[0],
        position: "Defender",
        joinedAt: "2024-08-01",
        status: "active",
      },
    ],
    ppeAssessments: [],
    incidents: [],
    screenings: [],
    referrals: [],
    eligibilityHistory: [],
    createdAt: "2024-08-01T09:00:00Z",
    updatedAt: "2026-07-15T10:00:00Z",
  },
  {
    id: "ATH-00217",
    firstName: "David",
    lastName: "Kimani",
    dateOfBirth: "2009-01-09",
    age: 17,
    gender: "male",
    currentOrganization: mockOrganizations[0],
    currentTeam: mockTeams[0],
    currentSport: mockSports[0],
    eligibilityStatus: "temporarily_not_cleared",
    readiness: "not_ready",
    nextReview: "2026-09-05",
    organizations: [
      {
        organizationId: "org-001",
        organization: mockOrganizations[0],
        joinedAt: "2025-01-15",
        status: "active",
      },
    ],
    teams: [
      {
        teamId: "team-001",
        team: mockTeams[0],
        sport: mockSports[0],
        position: "Goalkeeper",
        joinedAt: "2025-01-15",
        status: "active",
      },
    ],
    ppeAssessments: [],
    incidents: [],
    screenings: [],
    referrals: [],
    eligibilityHistory: [],
    createdAt: "2025-01-15T08:30:00Z",
    updatedAt: "2026-08-22T09:00:00Z",
  },
  {
    id: "ATH-00298",
    firstName: "Moses",
    lastName: "Olunga",
    dateOfBirth: "2007-09-12",
    age: 19,
    gender: "male",
    photo: "/avatars/moses.jpg",
    currentOrganization: mockOrganizations[2],
    currentTeam: mockTeams[2],
    currentSport: mockSports[0],
    eligibilityStatus: "cleared",
    readiness: "ready",
    organizations: [
      {
        organizationId: "org-003",
        organization: mockOrganizations[2],
        joinedAt: "2022-01-10",
        status: "active",
      },
    ],
    teams: [
      {
        teamId: "team-003",
        team: mockTeams[2],
        sport: mockSports[0],
        position: "Striker",
        joinedAt: "2022-01-10",
        status: "active",
      },
    ],
    ppeAssessments: [],
    incidents: [],
    screenings: [],
    referrals: [],
    eligibilityHistory: [],
    createdAt: "2022-01-10T08:00:00Z",
    updatedAt: "2026-08-15T10:00:00Z",
  },
  {
    id: "ATH-00312",
    firstName: "Mary",
    lastName: "Wanjiku",
    dateOfBirth: "2008-06-20",
    age: 18,
    gender: "female",
    photo: "/avatars/mary.jpg",
    currentOrganization: mockOrganizations[1],
    currentTeam: mockTeams[3],
    currentSport: mockSports[2],
    eligibilityStatus: "cleared",
    readiness: "ready",
    organizations: [
      {
        organizationId: "org-002",
        organization: mockOrganizations[1],
        joinedAt: "2023-01-15",
        status: "active",
      },
    ],
    teams: [
      {
        teamId: "team-004",
        team: mockTeams[3],
        sport: mockSports[2],
        position: "Wing Attack",
        joinedAt: "2023-01-15",
        status: "active",
      },
    ],
    ppeAssessments: [],
    incidents: [],
    screenings: [],
    referrals: [],
    eligibilityHistory: [],
    createdAt: "2023-01-15T09:00:00Z",
    updatedAt: "2026-08-25T11:00:00Z",
  },
];

// ==================================================
// PPE ASSESSMENTS
// ==================================================

export const mockPPEAssessments: PPEAssessment[] = [
  {
    id: "ppe-001",
    athleteId: "ATH-00156",
    clinicianId: "clin-001",
    clinicianName: "Dr. Sarah Ndungu",
    assessmentDate: "2026-08-28",
    status: "needs_review",
    consent: "provided",
    history: "complete",
    examination: "in_progress",
    baseline: "not_started",
    referrals: [],
    reviewFlags: [
      {
        type: "cardiovascular",
        severity: "moderate",
        description: "History of exercise-induced palpitations",
        resolved: false,
      },
    ],
    createdAt: "2026-08-28T09:00:00Z",
    updatedAt: "2026-08-28T14:00:00Z",
  },
  {
    id: "ppe-002",
    athleteId: "ATH-00124",
    clinicianId: "clin-001",
    clinicianName: "Dr. Sarah Ndungu",
    assessmentDate: "2026-08-15",
    status: "complete",
    consent: "provided",
    history: "complete",
    examination: "complete",
    baseline: "complete",
    movementScreening: "complete",
    referrals: ["ref-001"],
    reviewFlags: [],
    createdAt: "2026-08-15T08:00:00Z",
    updatedAt: "2026-08-15T16:30:00Z",
  },
];

// ==================================================
// INCIDENTS
// ==================================================

export const mockIncidents: Incident[] = [
  {
    id: "inc-001",
    athleteId: "ATH-00217",
    clinicianId: "clin-001",
    clinicianName: "Dr. Sarah Ndungu",
    incidentDate: "2026-08-22",
    location: "Training Pitch A",
    sport: mockSports[0],
    type: "sprain_strain",
    severity: "moderate",
    description: "Right ankle inversion during cutting maneuver",
    treatment: "RICE protocol initiated, ankle support applied",
    referralCreated: true,
    referralId: "ref-003",
    createdAt: "2026-08-22T15:30:00Z",
  },
  {
    id: "inc-002",
    athleteId: "ATH-00124",
    clinicianId: "clin-001",
    clinicianName: "Dr. Sarah Ndungu",
    incidentDate: "2026-08-10",
    location: "Match Field",
    sport: mockSports[0],
    type: "acute_injury",
    severity: "minor",
    description: "Minor hamstring tightness reported",
    treatment: "Rest and observation",
    referralCreated: false,
    createdAt: "2026-08-10T17:00:00Z",
  },
];

// ==================================================
// MOVEMENT SCREENINGS
// ==================================================

export const mockScreenings: MovementScreening[] = [
  {
    id: "scr-001",
    athleteId: "ATH-00124",
    performedBy: "physio-001",
    performedByName: "James Ochieng",
    drill: "jump_landing",
    videoQuality: "pass",
    status: "ready_for_review",
    aiProcessing: {
      startedAt: "2026-08-18T10:00:00Z",
      completedAt: "2026-08-18T10:02:30Z",
      status: "complete",
      modelVersion: "v2.3.1",
    },
    aiResult: {
      riskLevel: "moderate",
      confidence: 0.82,
      metrics: {
        kneeValgusAngle: 15.3,
        trunkLean: 12.1,
        limbSymmetryIndex: 0.89,
        stabilizationTime: 1.8,
      },
      processingTimestamp: "2026-08-18T10:02:30Z",
      modelVersion: "v2.3.1",
    },
    createdAt: "2026-08-18T09:45:00Z",
  },
  {
    id: "scr-002",
    athleteId: "ATH-00156",
    performedBy: "physio-001",
    performedByName: "James Ochieng",
    drill: "single_leg_squat",
    videoQuality: "pass",
    status: "processing",
    aiProcessing: {
      startedAt: "2026-08-28T11:00:00Z",
      status: "processing",
      modelVersion: "v2.3.1",
    },
    createdAt: "2026-08-28T10:50:00Z",
  },
];

// ==================================================
// REFERRALS
// ==================================================

export const mockReferrals: Referral[] = [
  {
    id: "ref-001",
    athleteId: "ATH-00124",
    createdBy: "clin-001",
    createdByName: "Dr. Sarah Ndungu",
    type: "physiotherapy",
    reason: "Functional movement screening indicated moderate knee valgus risk",
    urgency: "routine",
    assignedTo: "physio-001",
    assignedToName: "James Ochieng",
    providerFacility: "SafeSport Physiotherapy Center",
    createdAt: "2026-08-18T14:00:00Z",
    appointmentDate: "2026-08-25T09:00:00Z",
    status: "in_progress",
    outcome: "pending",
    relatedPPE: "ppe-002",
  },
  {
    id: "ref-002",
    athleteId: "ATH-00156",
    createdBy: "clin-001",
    createdByName: "Dr. Sarah Ndungu",
    type: "cardiology",
    reason: "Exercise-induced palpitations - requires specialist evaluation",
    urgency: "priority",
    createdAt: "2026-08-28T14:30:00Z",
    appointmentDate: "2026-09-02T10:00:00Z",
    status: "assigned",
    outcome: "pending",
    relatedPPE: "ppe-001",
  },
  {
    id: "ref-003",
    athleteId: "ATH-00217",
    createdBy: "clin-001",
    createdByName: "Dr. Sarah Ndungu",
    type: "physiotherapy",
    reason: "Right ankle sprain - rehabilitation required",
    urgency: "priority",
    assignedTo: "physio-001",
    assignedToName: "James Ochieng",
    createdAt: "2026-08-22T16:00:00Z",
    appointmentDate: "2026-08-24T14:00:00Z",
    status: "in_progress",
    outcome: "pending",
    relatedIncident: "inc-001",
  },
];

// ==================================================
// SCHEDULE / EVENTS
// ==================================================

export const mockSchedule: ScheduleEvent[] = [
  {
    id: "evt-001",
    title: "PPE Assessment - Kevin Mutua",
    type: "ppe",
    athleteId: "ATH-00156",
    athleteName: "Kevin Mutua",
    clinicianId: "clin-001",
    clinicianName: "Dr. Sarah Ndungu",
    startTime: "2026-08-28T09:00:00Z",
    endTime: "2026-08-28T09:45:00Z",
    location: "Clinic Room 2",
    status: "in_progress",
  },
  {
    id: "evt-002",
    title: "Movement Screening - Brian Otieno",
    type: "screening",
    athleteId: "ATH-00124",
    athleteName: "Brian Otieno",
    clinicianId: "clin-001",
    startTime: "2026-08-28T15:00:00Z",
    endTime: "2026-08-28T15:30:00Z",
    location: "Movement Lab",
    status: "scheduled",
  },
  {
    id: "evt-003",
    title: "Reassessment - David Kimani",
    type: "reassessment",
    athleteId: "ATH-00217",
    athleteName: "David Kimani",
    clinicianId: "clin-001",
    startTime: "2026-09-05T10:00:00Z",
    endTime: "2026-09-05T10:30:00Z",
    location: "Clinic Room 1",
    status: "scheduled",
  },
];

// ==================================================
// NOTIFICATIONS
// ==================================================

export const mockNotifications: Notification[] = [
  {
    id: "notif-001",
    userId: "clin-001",
    type: "clinical_review",
    title: "PPE Requires Review",
    message: "Kevin Mutua's PPE assessment has cardiovascular flags requiring review",
    priority: "high",
    relatedEntityType: "ppe",
    relatedEntityId: "ppe-001",
    read: false,
    actionUrl: "/dashboard/safesport/clinician/ppe/ppe-001",
    createdAt: "2026-08-28T14:05:00Z",
  },
  {
    id: "notif-002",
    userId: "clin-001",
    type: "ai_review",
    title: "AI Screening Ready for Review",
    message: "Movement screening for Brian Otieno is ready for clinical interpretation",
    priority: "normal",
    relatedEntityType: "screening",
    relatedEntityId: "scr-001",
    read: false,
    actionUrl: "/dashboard/safesport/clinician/screenings/scr-001",
    createdAt: "2026-08-18T10:05:00Z",
  },
  {
    id: "notif-003",
    userId: "clin-001",
    type: "referral",
    title: "Referral Overdue",
    message: "Follow-up required for Brian Otieno's physiotherapy referral",
    priority: "normal",
    relatedEntityType: "referral",
    relatedEntityId: "ref-001",
    read: true,
    createdAt: "2026-08-26T09:00:00Z",
  },
];

// ==================================================
// HELPER FUNCTIONS
// ==================================================

export function getAthleteById(id: string): Athlete | undefined {
  return mockAthletes.find((a) => a.id === id);
}

export function getPPEByAthleteId(athleteId: string): PPEAssessment[] {
  return mockPPEAssessments.filter((p) => p.athleteId === athleteId);
}

export function getIncidentsByAthleteId(athleteId: string): Incident[] {
  return mockIncidents.filter((i) => i.athleteId === athleteId);
}

export function getReferralsByAthleteId(athleteId: string): Referral[] {
  return mockReferrals.filter((r) => r.athleteId === athleteId);
}

export function getScreeningsByAthleteId(athleteId: string): MovementScreening[] {
  return mockScreenings.filter((s) => s.athleteId === athleteId);
}

// Clinician Dashboard Stats
export function getClinicianDashboardStats() {
  return {
    ppeDue: mockPPEAssessments.filter((p) => p.status === "not_started" || p.status === "in_progress").length,
    pendingReviews: mockPPEAssessments.filter((p) => p.status === "needs_review").length,
    activeReferrals: mockReferrals.filter((r) => r.status === "pending" || r.status === "assigned" || r.status === "in_progress").length,
    reassessmentsDue: 2, // Static for prototype
    aiReviewsPending: mockScreenings.filter((s) => s.status === "ready_for_review").length,
    incidentsLast7Days: mockIncidents.filter((i) => {
      const incidentDate = new Date(i.incidentDate);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return incidentDate >= weekAgo;
    }).length,
  };
}
