/**
 * Centralized API Configuration with Environment Variable Support
 * Uses VITE_API_BASE_URL from .env when present, with secure fallback.
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== "undefined" && import.meta.env.PROD
    ? window.location.origin
    : "http://localhost:8080");

export const USER_API = `${API_BASE_URL}/api/v1/user/`;
export const COURSE_API = `${API_BASE_URL}/api/v1/course`;
export const COURSE_PROGRESS_API = `${API_BASE_URL}/api/v1/progress`;
export const COURSE_PURCHASE_API = `${API_BASE_URL}/api/v1/purchase`;
export const QUIZ_API = `${API_BASE_URL}/api/v1/quiz/`;
export const CERTIFICATE_API = `${API_BASE_URL}/api/v1/certificate/`;
export const STREAK_API = `${API_BASE_URL}/api/v1/streak/`;
export const MEDIA_API = `${API_BASE_URL}/api/v1/media/`;

export const prepareAuthHeaders = (headers) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }
  return headers;
};

