export type AuthRole =
  | "athlete"
  | "guardian"
  | "clinician"
  | "physiotherapist"
  | "coach"
  | "institution"
  | "operations"
  | "sys-admin";

export interface SessionUser {
  id: string;
  safesport_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: AuthRole;
  profile_data: Record<string, string>;
}

export interface SessionResponse {
  user: SessionUser;
}

export interface PendingRegistration {
  email: string;
  first_name: string;
  last_name: string;
  role: "athlete" | "guardian";
  profile_data: Record<string, string>;
  is_verified: boolean;
}
