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
  created_at: string;
}

export interface AdminUserPayload {
  email?: string;
  first_name: string;
  last_name: string;
  role: AdminUser["role"];
  password?: string;
  is_active: boolean;
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

export function dashboardForRole(role: string): string {
  return `/safesport/${role}`;
}
