import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { streakApi } from "./streakApi";
import { QUIZ_API, prepareAuthHeaders } from "@/config/api.config";

export const quizApi = createApi({
  reducerPath: "quizApi",
  baseQuery: fetchBaseQuery({
    baseUrl: QUIZ_API,
    credentials: "include",
    prepareHeaders: prepareAuthHeaders,
  }),
  tagTypes: ["Quiz", "Attempt"],
  endpoints: (builder) => ({
    getCourseQuiz: builder.query({
      query: (courseId) => ({
        url: `course/${courseId}`,
        method: "GET",
      }),
      providesTags: ["Quiz", "Attempt"],
    }),
    startQuiz: builder.mutation({
      query: (quizId) => ({
        url: `${quizId}/start`,
        method: "POST",
      }),
      invalidatesTags: ["Attempt"],
    }),
    submitQuiz: builder.mutation({
      query: ({ quizId, attemptId, answers }) => ({
        url: `${quizId}/submit`,
        method: "POST",
        body: { attemptId, answers },
      }),
      invalidatesTags: ["Quiz", "Attempt"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(streakApi.util.invalidateTags(["Streak", "Badges", "Activity", "Stats"]));
        } catch {}
      },
    }),
    getAttemptResult: builder.query({
      query: (attemptId) => ({
        url: `attempt/${attemptId}`,
        method: "GET",
      }),
      providesTags: ["Attempt"],
    }),
    getMyAttempts: builder.query({
      query: (courseId) => ({
        url: `my-attempts/${courseId}`,
        method: "GET",
      }),
      providesTags: ["Attempt"],
    }),

    // Admin Endpoints
    getAllAdminQuizzes: builder.query({
      query: () => ({
        url: "admin/all",
        method: "GET",
      }),
      providesTags: ["Quiz"],
    }),
    createQuiz: builder.mutation({
      query: (quizData) => ({
        url: "admin",
        method: "POST",
        body: quizData,
      }),
      invalidatesTags: ["Quiz"],
    }),
    updateQuiz: builder.mutation({
      query: ({ quizId, ...updateData }) => ({
        url: `admin/${quizId}`,
        method: "PUT",
        body: updateData,
      }),
      invalidatesTags: ["Quiz"],
    }),
    deleteQuiz: builder.mutation({
      query: (quizId) => ({
        url: `admin/${quizId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Quiz"],
    }),
    addQuestion: builder.mutation({
      query: ({ quizId, questionData }) => ({
        url: `admin/${quizId}/question`,
        method: "POST",
        body: questionData,
      }),
      invalidatesTags: ["Quiz"],
    }),
    updateQuestion: builder.mutation({
      query: ({ quizId, questionId, questionData }) => ({
        url: `admin/${quizId}/question/${questionId}`,
        method: "PUT",
        body: questionData,
      }),
      invalidatesTags: ["Quiz"],
    }),
    deleteQuestion: builder.mutation({
      query: ({ quizId, questionId }) => ({
        url: `admin/${quizId}/question/${questionId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Quiz"],
    }),
    getQuizAnalytics: builder.query({
      query: (quizId) => ({
        url: `admin/analytics/${quizId}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetCourseQuizQuery,
  useStartQuizMutation,
  useSubmitQuizMutation,
  useGetAttemptResultQuery,
  useGetMyAttemptsQuery,
  useGetAllAdminQuizzesQuery,
  useCreateQuizMutation,
  useUpdateQuizMutation,
  useDeleteQuizMutation,
  useAddQuestionMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
  useGetQuizAnalyticsQuery,
} = quizApi;
