import type { PendingRegistration, SessionResponse } from "./types/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
const CSRF_COOKIE = "safesport_csrf";

export class AuthApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "AuthApiError";
  }
}

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const prefix = `${encodeURIComponent(name)}=`;
  return document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))
    ?.slice(prefix.length);
}

async function ensureCsrf(): Promise<string> {
  let token = readCookie(CSRF_COOKIE);
  if (!token) {
    const response = await fetch(`${API_URL}/auth/csrf`, { credentials: "include" });
    if (!response.ok) throw new AuthApiError("Unable to initialize a secure session", response.status);
    token = readCookie(CSRF_COOKIE);
  }
  if (!token) throw new AuthApiError("Unable to initialize a secure session", 0);
  return decodeURIComponent(token);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData)) headers.set("Content-Type", "application/json");
  if (options.method && options.method !== "GET") {
    headers.set("X-CSRF-Token", await ensureCsrf());
  }
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers,
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { detail?: string | Array<{ msg?: string }> } | null;
    const detail = Array.isArray(body?.detail)
      ? body.detail[0]?.msg ?? "Please check your information"
      : body?.detail ?? "Something went wrong. Please try again.";
    throw new AuthApiError(detail, response.status);
  }
  return response.json() as Promise<T>;
}

async function downloadFile(path: string, filename: string): Promise<void> {
  const response = await fetch(`${API_URL}${path}`, { credentials: "include" });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new AuthApiError(body?.detail ?? "Unable to download file", response.status);
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const authApi = {
  login: (email: string, password: string) =>
    request<{ detail: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  verifyLogin: (code: string) =>
    request<SessionResponse>("/auth/login/verify", { method: "POST", body: JSON.stringify({ code }) }),
  resendLoginOtp: () => request<{ detail: string }>("/auth/login/resend", { method: "POST" }),
  me: () => request<SessionResponse>("/auth/me"),
  updateMe: (payload: { first_name: string; last_name: string; phone?: string }) =>
    request<SessionResponse>("/auth/me", { method: "PUT", body: JSON.stringify(payload) }),
  refresh: () => request<SessionResponse>("/auth/refresh", { method: "POST" }),
  logout: () => request<{ detail: string }>("/auth/logout", { method: "POST" }),
  startRegistration: (payload: Record<string, unknown>) =>
    request<{ detail: string }>("/auth/register/start", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  verifyRegistration: (code: string) =>
    request<{ detail: string }>("/auth/register/verify", { method: "POST", body: JSON.stringify({ code }) }),
  resendRegistrationOtp: () => request<{ detail: string }>("/auth/register/resend", { method: "POST" }),
  currentRegistration: () => request<PendingRegistration>("/auth/register/current"),
  lookupGuardianAthlete: (safeSportId: string) =>
    request<GuardianAthleteLookup>(`/auth/register/guardian/athlete/${encodeURIComponent(safeSportId)}`),
  completeRegistration: () => request<SessionResponse>("/auth/register/complete", { method: "POST" }),
  forgotPassword: (email: string) =>
    request<{ detail: string }>("/auth/password/forgot", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  resetPassword: (password: string) =>
    request<{ detail: string }>("/auth/password/reset", {
      method: "POST",
      body: JSON.stringify({ password }),
    }),
};

export interface GuardianAthleteLookup {
  id: string;
  safesport_id: string;
  first_name: string;
  last_name: string;
  organization_name: string;
  sport_name: string;
}

export interface CatalogSport {
  id: string;
  name: string;
  is_active: boolean;
}

export interface CatalogInstitution {
  id: string;
  name: string;
  type: "school" | "club" | "academy" | "professional" | "medical";
  city: string;
  country: string;
  contact_email: string | null;
  logo_url: string | null;
  is_active: boolean;
  sports: CatalogSport[];
}

export interface AdminOverview {
  total_users: number;
  active_users: number;
  institutions: number;
  active_institutions: number;
  sports: number;
  active_sports: number;
}

export interface AdminUser {
  id: string;
  safesport_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role:
    | "athlete"
    | "guardian"
    | "clinician"
    | "physiotherapist"
    | "coach"
    | "institution"
    | "operations"
    | "sys-admin";
  is_active: boolean;
  is_verified: boolean;
  profile_data: Record<string, string>;
  created_at: string;
}

export interface AdminUserPayload {
  email?: string;
  first_name: string;
  last_name: string;
  role: AdminUser["role"];
  password?: string;
  is_active: boolean;
  institution_id?: string;
}

export const catalogApi = {
  institutions: (search = "") =>
    request<CatalogInstitution[]>(`/catalog/institutions?search=${encodeURIComponent(search)}`),
  sports: () => request<CatalogSport[]>("/catalog/sports"),
};

export const systemAdminApi = {
  overview: () => request<AdminOverview>("/admin/overview"),
  users: () => request<AdminUser[]>("/admin/users"),
  createUser: (payload: Required<Pick<AdminUserPayload, "email" | "password">> & AdminUserPayload) =>
    request<AdminUser>("/admin/users", { method: "POST", body: JSON.stringify(payload) }),
  updateUser: (id: string, payload: AdminUserPayload) =>
    request<AdminUser>(`/admin/users/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  institutions: () => request<CatalogInstitution[]>("/admin/institutions"),
  sports: () => request<CatalogSport[]>("/admin/sports"),
  createSport: (name: string) =>
    request<CatalogSport>("/admin/sports", { method: "POST", body: JSON.stringify({ name }) }),
  saveInstitution: (form: FormData, institutionId?: string) =>
    request<CatalogInstitution>(
      institutionId ? `/admin/institutions/${institutionId}` : "/admin/institutions",
      { method: institutionId ? "PUT" : "POST", body: form },
    ),
};

export interface CareRecordPayload {
  id?: string;
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
  encounterId?: string;
  referralId?: string;
  reviewedEncounterId?: string;
  file?: string;
  fileName?: string;
  extra?: Record<string, unknown>;
}

export interface CareWorkspacePayload {
  records: Record<string, CareRecordPayload[]>;
  notices: unknown[];
}

export const careApi = {
  workspace: () => request<CareWorkspacePayload>("/care/workspace"),
  saveRecord: (collection: string, payload: CareRecordPayload, id?: string) =>
    request<CareRecordPayload>(id ? `/care/${collection}/${id}` : `/care/${collection}`, {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(payload),
    }),
};

export interface ReportAthlete {
  id: string;
  name: string;
  institution: string;
  sport: string;
}

export interface TermReportSummary {
  id: string;
  athlete_id: string;
  athlete_name: string;
  title: string;
  period_start: string;
  period_end: string;
  status: string;
  created_at: string;
}

export const reportsApi = {
  athletes: () => request<ReportAthlete[]>("/reports/athletes"),
  generateTermly: (payload: { title: string; period_start: string; period_end: string }) =>
    request<TermReportSummary[]>("/reports/termly/generate", { method: "POST", body: JSON.stringify(payload) }),
  termly: () => request<TermReportSummary[]>("/reports/termly"),
  downloadFull: (athleteId: string, filename = `safesport-full-report-${athleteId}.pdf`) =>
    downloadFile(`/reports/full/${athleteId}`, filename),
  downloadTermly: (reportId: string, filename = `safesport-term-report-${reportId}.pdf`) =>
    downloadFile(`/reports/termly/${reportId}`, filename),
};

export interface MessageUser {
  id: string;
  name: string;
  role: string;
  institution_id?: string | null;
}

export interface MessageItem {
  id: string;
  conversation_id: string;
  sender: MessageUser;
  body: string;
  attachment_url?: string | null;
  attachment_name?: string | null;
  attachment_type?: string | null;
  created_at: string;
}

export interface ConversationItem {
  id: string;
  kind: string;
  title: string;
  institution_id?: string | null;
  members: MessageUser[];
  messages: MessageItem[];
}

export interface MessagingWorkspacePayload {
  current_user: MessageUser;
  people: MessageUser[];
  conversations: ConversationItem[];
}

function websocketUrl(path: string): string {
  const base = API_URL.replace(/^http/, "ws").replace(/\/api\/v1$/, "");
  return `${base}/api/v1${path}`;
}

export const messagingApi = {
  workspace: () => request<MessagingWorkspacePayload>("/messaging/workspace"),
  startDirect: (recipientId: string) =>
    request<ConversationItem>(`/messaging/conversations/direct/${recipientId}`, { method: "POST" }),
  sendMessage: (conversationId: string, body: string, attachment?: File | null) => {
    const form = new FormData();
    form.set("conversation_id", conversationId);
    form.set("body", body);
    if (attachment) form.set("attachment", attachment);
    return request<MessageItem>("/messaging/messages", { method: "POST", body: form });
  },
  wsUrl: (conversationId: string) => websocketUrl(`/messaging/ws/${conversationId}`),
};

export function dashboardForRole(role: string): string {
  return `/safesport/${role}`;
}

export interface PublicCertificateSummary {
  assessment_id: string;
  code: string;
  athlete_name: string;
  safesport_id: string;
  institution: string;
  sport: string;
  eligibility: string;
  restrictions: string;
  review_date: string;
  clinician_signature: string;
  issued_at: string | null;
  download_url: string;
}

export interface PublicCertificateLookup {
  safesport_id: string;
  athlete_name: string;
  institution: string;
  sport: string;
  certificates: PublicCertificateSummary[];
}

export const publicCertificateApi = {
  lookupBySafeSportId: (safeSportId: string) =>
    request<PublicCertificateLookup>(`/ppe/certificates/public/by-safesport/${encodeURIComponent(safeSportId)}`),
};

export interface PPEWorkspacePayload {
  athletes: unknown[];
  consents: Record<string, unknown>;
  encounters: unknown[];
  notices: unknown[];
}

export const ppeApi = {
  workspace: () => request<PPEWorkspacePayload>("/ppe/workspace"),
  saveConsent: (athleteId: string, payload: Record<string, unknown>) =>
    request<Record<string, unknown>>(`/ppe/consents/${athleteId}`, { method: "PUT", body: JSON.stringify(payload) }),
  saveQuestionnaireDraft: (athleteId: string, payload: Record<string, unknown>) =>
    request<Record<string, unknown>>(`/ppe/questionnaires/${athleteId}/draft`, { method: "POST", body: JSON.stringify(payload) }),
  submitQuestionnaire: (athleteId: string, payload: Record<string, unknown>) =>
    request<Record<string, unknown>>(`/ppe/questionnaires/${athleteId}/submit`, { method: "POST", body: JSON.stringify(payload) }),
  startAssessment: (athleteId: string) =>
    request<Record<string, unknown>>("/ppe/assessments/start", { method: "POST", body: JSON.stringify({ athlete_id: athleteId }) }),
  saveAssessment: (assessmentId: string, payload: Record<string, unknown>) =>
    request<Record<string, unknown>>(`/ppe/assessments/${assessmentId}`, { method: "PUT", body: JSON.stringify(payload) }),
  finalizeAssessment: (assessmentId: string, payload: Record<string, unknown>) =>
    request<Record<string, unknown>>(`/ppe/assessments/${assessmentId}/finalize`, { method: "POST", body: JSON.stringify(payload) }),
  deleteAssessment: (assessmentId: string) =>
    request<{ detail: string; deleted: string[] }>(`/ppe/assessments/${assessmentId}`, { method: "DELETE" }),
  deleteDraftAssessments: (assessmentIds: string[]) =>
    request<{ detail: string; deleted: string[] }>("/ppe/assessments/delete-drafts", {
      method: "POST",
      body: JSON.stringify({ assessment_ids: assessmentIds }),
    }),
  downloadCertificate: (assessmentId: string, filename = `safesport-certificate-${assessmentId}.pdf`) =>
    downloadFile(`/ppe/certificates/${assessmentId}`, filename),
  certificateUrl: (assessmentId: string) => `${API_URL}/ppe/certificates/${assessmentId}`,
  verifyCertificateUrl: (code: string) => `${API_URL}/ppe/certificates/verify/${encodeURIComponent(code)}`,
};
