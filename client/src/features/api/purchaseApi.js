import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { COURSE_PURCHASE_API } from "@/config/api.config";

export const purchaseApi = createApi({
  reducerPath: "purchaseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: COURSE_PURCHASE_API,
    credentials: "include",
  }),
  tagTypes: ["Purchases", "CourseDetail"],
  endpoints: (builder) => ({
    createCheckoutSession: builder.mutation({
      query: (courseId) => ({
        url: "/checkout/create-checkout-session",
        method: "POST",
        body: { courseId },
      }),
      invalidatesTags: ["Purchases"],
    }),
    verifySession: builder.query({
      query: (sessionId) => ({
        url: `/verify-session/${sessionId}`,
        method: "GET",
      }),
      providesTags: ["Purchases"],
    }),
    getCourseDetailWithStatus: builder.query({
      query: (courseId) => ({
        url: `/course/${courseId}/detail-with-status`,
        method: "GET",
      }),
      providesTags: (result, error, courseId) => [
        { type: "CourseDetail", id: courseId },
      ],
    }),
    getMyPurchases: builder.query({
      query: () => ({
        url: `/my-purchases`,
        method: "GET",
      }),
      providesTags: ["Purchases"],
    }),
    getAllPurchases: builder.query({
      query: () => ({
        url: `/all-purchases`,
        method: "GET",
      }),
      providesTags: ["Purchases"],
    }),
    getPurchasedCourses: builder.query({
      query: () => ({
        url: `/`,
        method: "GET",
      }),
      providesTags: ["Purchases"],
    }),
    getReceipt: builder.query({
      query: (arg) => {
        if (typeof arg === "object" && arg !== null) {
          const query = arg.sessionId ? `?session_id=${encodeURIComponent(arg.sessionId)}` : "";
          return {
            url: `/receipt/${arg.purchaseId}${query}`,
            method: "GET",
          };
        }
        return {
          url: `/receipt/${arg}`,
          method: "GET",
        };
      },
    }),
  }),
});

export const {
  useCreateCheckoutSessionMutation,
  useVerifySessionQuery,
  useGetCourseDetailWithStatusQuery,
  useGetMyPurchasesQuery,
  useGetAllPurchasesQuery,
  useGetPurchasedCoursesQuery,
  useGetReceiptQuery,
} = purchaseApi;
