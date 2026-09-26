import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { STREAK_API } from "@/config/api.config";

export const streakApi = createApi({
  reducerPath: "streakApi",
  baseQuery: fetchBaseQuery({
    baseUrl: STREAK_API,
    credentials: "include",
    prepareHeaders: (headers) => {
      try {
        const clientTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (clientTz) {
          headers.set("x-timezone", clientTz);
        }
      } catch (e) {
        headers.set("x-timezone", "Asia/Kolkata");
      }
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
      }
      return headers;
    },
  }),
  tagTypes: ["Streak", "Badges", "Activity", "Stats"],
  endpoints: (builder) => ({
    getMyStreak: builder.query({
      query: () => ({
        url: "my",
        method: "GET",
      }),
      providesTags: ["Streak"],
    }),
    getMyBadges: builder.query({
      query: () => ({
        url: "badges",
        method: "GET",
      }),
      providesTags: ["Badges"],
    }),
    getMyActivity: builder.query({
      query: (days = 112) => ({
        url: `activity?days=${days}`,
        method: "GET",
      }),
      providesTags: ["Activity"],
    }),
    getMyLearningStats: builder.query({
      query: () => ({
        url: "stats",
        method: "GET",
      }),
      providesTags: ["Stats"],
    }),
    getAdminStreakAnalytics: builder.query({
      query: () => ({
        url: "admin/analytics",
        method: "GET",
      }),
      providesTags: ["Streak"],
    }),
  }),
});

export const {
  useGetMyStreakQuery,
  useGetMyBadgesQuery,
  useGetMyActivityQuery,
  useGetMyLearningStatsQuery,
  useGetAdminStreakAnalyticsQuery,
} = streakApi;
