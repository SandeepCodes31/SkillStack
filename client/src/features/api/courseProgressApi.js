import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { streakApi } from "./streakApi";
import { COURSE_PROGRESS_API, prepareAuthHeaders } from "@/config/api.config";

export const courseProgressApi = createApi({
  reducerPath: "courseProgressApi",
  baseQuery: fetchBaseQuery({
    baseUrl: COURSE_PROGRESS_API,
    credentials: "include",
    prepareHeaders: prepareAuthHeaders,
  }),
  endpoints: (builder) => ({
    getCourseProgress: builder.query({
      query: (courseId) => ({
        url: `/${courseId}`,
        method: "GET",
      }),
    }),
    updateLectureProgress: builder.mutation({
      query: ({ courseId, lectureId }) => ({
        url: `/${courseId}/lecture/${lectureId}/view`,
        method:"POST"
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(streakApi.util.invalidateTags(["Streak", "Badges", "Activity", "Stats"]));
        } catch {}
      },
    }),

    completeCourse: builder.mutation({
        query:(courseId) => ({
            url:`/${courseId}/complete`,
            method:"POST"
        }),
        async onQueryStarted(arg, { dispatch, queryFulfilled }) {
          try {
            await queryFulfilled;
            dispatch(streakApi.util.invalidateTags(["Streak", "Badges", "Activity", "Stats"]));
          } catch {}
        },
    }),
    inCompleteCourse: builder.mutation({
        query:(courseId) => ({
            url:`/${courseId}/incomplete`,
            method:"POST"
        }),
        async onQueryStarted(arg, { dispatch, queryFulfilled }) {
          try {
            await queryFulfilled;
            dispatch(streakApi.util.invalidateTags(["Streak", "Badges", "Activity", "Stats"]));
          } catch {}
        },
    }),
    
  }),
});
export const {
useGetCourseProgressQuery,
useUpdateLectureProgressMutation,
useCompleteCourseMutation,
useInCompleteCourseMutation
} = courseProgressApi;




