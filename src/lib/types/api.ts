/**
 * TypeScript contracts for the Satoshi Galaxy Platform API.
 *
 * Hand-derived from the OpenAPI 3.1 schema (v0.1.0). String enums that the
 * backend models as plain `string` are narrowed here to literal unions for
 * safer UI logic, with a permissive fallback so unexpected values never crash
 * the client.
 */

/* ------------------------------------------------------------------ */
/* Enums / unions                                                      */
/* ------------------------------------------------------------------ */

export type CampaignStatus =
  | "draft"
  | "active"
  | "paused"
  | "paused_insufficient_funds"
  | "completed"
  | "expired";

export type ZapStatus = "pending" | "succeeded" | "failed";
export type CommentStatus = "pending" | "succeeded" | "failed";

export type InteractionStatus =
  | "success"
  | "zap_failed"
  | "comment_failed"
  | "pending_comment_retry";

export type UserRole = "company_user" | "platform_admin";

/** Allowed impact packages (business model). */
export const PACKAGE_IMPACTS = [100, 500, 1000] as const;
export type PackageImpacts = (typeof PACKAGE_IMPACTS)[number];

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

export interface RegisterRequest {
  company_name: string;
  contact_email: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface AuthUserOut {
  id: number;
  company_id: number | null;
  email: string;
  role: UserRole | string;
}

export interface AuthCompanyOut {
  id: number;
  name: string;
  contact_email: string;
}

export interface MeResponse {
  user: AuthUserOut;
  company: AuthCompanyOut | null;
}

/* ------------------------------------------------------------------ */
/* Companies                                                           */
/* ------------------------------------------------------------------ */

export interface CompanyOut {
  id: number;
  name: string;
  contact_email: string;
}

export interface CompanyUpdate {
  name?: string | null;
  contact_email?: string | null;
}

/* ------------------------------------------------------------------ */
/* Campaigns                                                           */
/* ------------------------------------------------------------------ */

export interface CampaignCreate {
  name: string;
  product_description: string;
  product_url: string;
  keywords: string[];
  nwc_url: string;
  package_impacts: number;
  zap_amount_sats: number;
}

export interface CampaignUpdate {
  name?: string | null;
  product_description?: string | null;
  product_url?: string | null;
  keywords?: string[] | null;
  nwc_url?: string | null;
  package_impacts?: number | null;
  zap_amount_sats?: number | null;
}

export interface CampaignOut {
  id: number;
  company_id: number;
  name: string;
  product_description: string;
  product_url: string;
  keywords: string[];
  status: CampaignStatus | string;
  package_impacts: number;
  zap_amount_sats: number;
  started_at: string | null;
  ends_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignActivate {
  nwc_url: string;
}

export interface CampaignResume {
  nwc_url: string;
}

export interface CampaignNwcTestRequest {
  nwc_url: string;
}

export interface CampaignNwcTestResult {
  ok: boolean;
  required_sats: number;
  available_sats: number;
  checked_at: string;
}

/* ------------------------------------------------------------------ */
/* Metrics & interactions                                              */
/* ------------------------------------------------------------------ */

export interface CampaignMetrics {
  status: CampaignStatus | string;
  posts_analyzed: number;
  posts_relevant: number;
  users_discarded: number;
  zaps_sent: number;
  comments_published: number;
  total_sats_sent: number;
  impacts_consumed: number;
  impacts_remaining: number;
  interactions: number;
}

export interface CampaignInteractionOut {
  id: number;
  target_pubkey: string;
  source_event_id: string | null;
  zap_amount_sats: number;
  zap_status: ZapStatus | string;
  comment_status: CommentStatus | string;
  comment_event_id: string | null;
  generated_comment: string | null;
  status: InteractionStatus | string;
  error_code: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignInteractionPage {
  items: CampaignInteractionOut[];
  total: number;
  page: number;
  page_size: number;
}

/* ------------------------------------------------------------------ */
/* Notifications                                                       */
/* ------------------------------------------------------------------ */

/** Backend models this as a plain string; narrowed for icon/tone mapping. */
export type NotificationType =
  | "campaign"
  | "wallet"
  | "interaction"
  | "system"
  | string;

export interface NotificationOut {
  id: number;
  company_id: number;
  campaign_id: number | null;
  type: NotificationType;
  title: string;
  message: string;
  read_at: string | null;
  created_at: string;
}

export interface NotificationPage {
  items: NotificationOut[];
  total: number;
  page: number;
  page_size: number;
}

/* ------------------------------------------------------------------ */
/* Admin (platform_admin role)                                         */
/* ------------------------------------------------------------------ */

export interface AdminMonitoringState {
  worker_state: string;
  subscribed: boolean;
  active_campaigns: number;
  last_heartbeat_at: string | null;
  stale: boolean;
}

/** Lighter campaign projection returned by the admin listing. */
export interface AdminCampaignOut {
  id: number;
  company_id: number;
  name: string;
  status: CampaignStatus | string;
  package_impacts: number;
  zap_amount_sats: number;
  started_at: string | null;
  ends_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Same shape as a campaign interaction, plus owning campaign/company ids. */
export interface AdminInteractionOut extends CampaignInteractionOut {
  campaign_id: number;
  company_id: number;
}

export interface AdminInteractionPage {
  items: AdminInteractionOut[];
  total: number;
  page: number;
  page_size: number;
}

/* ------------------------------------------------------------------ */
/* Validation errors                                                   */
/* ------------------------------------------------------------------ */

export interface ValidationErrorItem {
  loc: (string | number)[];
  msg: string;
  type: string;
  input?: unknown;
  ctx?: Record<string, unknown>;
}

export interface HTTPValidationError {
  detail?: ValidationErrorItem[];
}

/** FastAPI also returns `{ detail: string }` for non-validation HTTP errors. */
export interface HTTPDetailError {
  detail?: string;
}
