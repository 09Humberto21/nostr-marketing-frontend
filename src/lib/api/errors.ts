import { AxiosError } from "axios";
import type {
  HTTPValidationError,
  ValidationErrorItem,
} from "@/lib/types/api";

/**
 * Normalized error shape consumed by forms and toasts.
 *
 * `message` is always safe to show. `fieldErrors` maps a form field name to a
 * human message, parsed from FastAPI's 422 `detail[].loc` (the last `loc`
 * segment is the offending field).
 */
export interface ApiError {
  status: number | null;
  message: string;
  fieldErrors: Record<string, string>;
  /** True for 422 validation errors. */
  isValidation: boolean;
  raw?: unknown;
}

const STATUS_FALLBACK: Record<number, string> = {
  400: "The request was invalid. Please review the data and try again.",
  401: "Your session has expired. Please sign in again.",
  403: "You don't have permission to perform this action.",
  404: "We couldn't find what you were looking for.",
  409: "This action conflicts with the current state.",
  422: "Some fields need your attention.",
  429: "Too many requests. Please slow down and retry.",
  500: "Something went wrong on the server. Please try again later.",
  503: "The service is temporarily unavailable. Please try again shortly.",
};

function fieldFromLoc(loc: (string | number)[]): string {
  // FastAPI body errors look like ["body", "zap_amount_sats"] — take the last
  // string segment as the field key.
  const segments = loc.filter((s): s is string => typeof s === "string" && s !== "body");
  return segments[segments.length - 1] ?? "_root";
}

function isValidationError(data: unknown): data is HTTPValidationError {
  return (
    typeof data === "object" &&
    data !== null &&
    Array.isArray((data as HTTPValidationError).detail)
  );
}

/** Convert any thrown value into a predictable {@link ApiError}. */
export function parseApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    const status = error.response?.status ?? null;
    const data = error.response?.data;

    // 422 — Pydantic validation errors.
    if (status === 422 && isValidationError(data)) {
      const fieldErrors: Record<string, string> = {};
      (data.detail as ValidationErrorItem[]).forEach((item) => {
        const field = fieldFromLoc(item.loc);
        // Keep the first error per field; it's the most relevant.
        if (!fieldErrors[field]) fieldErrors[field] = capitalize(item.msg);
      });
      const first = Object.values(fieldErrors)[0];
      return {
        status,
        message: first ?? STATUS_FALLBACK[422]!,
        fieldErrors,
        isValidation: true,
        raw: data,
      };
    }

    // Other HTTP errors — FastAPI returns { detail: string } (or sometimes a
    // list). Surface it if it's a readable string.
    const detail = (data as { detail?: unknown } | undefined)?.detail;
    let message: string | undefined;
    if (typeof detail === "string") message = detail;
    else if (Array.isArray(detail) && typeof detail[0] === "string") message = detail[0];

    if (!message && status && STATUS_FALLBACK[status]) message = STATUS_FALLBACK[status];

    // Network / no-response errors.
    if (!message) {
      if (error.code === "ERR_NETWORK") {
        message = "Cannot reach the server. Check your connection and the API URL.";
      } else if (error.code === "ECONNABORTED") {
        message = "The request timed out. Please try again.";
      } else {
        message = error.message || "An unexpected error occurred.";
      }
    }

    return { status, message, fieldErrors: {}, isValidation: false, raw: data };
  }

  if (error instanceof Error) {
    return {
      status: null,
      message: error.message,
      fieldErrors: {},
      isValidation: false,
      raw: error,
    };
  }

  return {
    status: null,
    message: "An unexpected error occurred.",
    fieldErrors: {},
    isValidation: false,
    raw: error,
  };
}

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}
