import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedIn, userLoggedOut } from "../authSlice";
import { USER_API, prepareAuthHeaders } from "@/config/api.config";
import { courseApi } from "./courseApi";
import { courseProgressApi } from "./courseProgressApi";
import { purchaseApi } from "./purchaseApi";
import { quizApi } from "./quizApi";
import { certificateApi } from "./certificateApi";
import { streakApi } from "./streakApi";

const resetAllApiState = (dispatch) => {
  try {
    dispatch(authApi.util.resetApiState());
    dispatch(courseApi.util.resetApiState());
    dispatch(courseProgressApi.util.resetApiState());
    dispatch(purchaseApi.util.resetApiState());
    dispatch(quizApi.util.resetApiState());
    dispatch(certificateApi.util.resetApiState());
    dispatch(streakApi.util.resetApiState());
  } catch (e) {
    console.warn("Could not reset api state:", e);
  }
};

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: USER_API,
    credentials: "include",
    prepareHeaders: prepareAuthHeaders,
  }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (inputData) => ({
        url: "register",
        method: "POST",
        body: inputData,
      }),
      invalidatesTags: ["User"],
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          resetAllApiState(dispatch);
          if (result?.data?.token) {
            localStorage.setItem("token", result.data.token);
          }
          if (result?.data?.user) {
            dispatch(userLoggedIn({ user: result.data.user }));
          }
        } catch (error) {
          console.log("Register error in slice:", error);
        }
      },
    }),
    loginUser: builder.mutation({
      query: (inputData) => ({
        url: "login",
        method: "POST",
        body: inputData,
      }),
      invalidatesTags: ["User"],
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          resetAllApiState(dispatch);
          if (result?.data?.token) {
            localStorage.setItem("token", result.data.token);
          }
          if (result?.data?.user) {
            dispatch(userLoggedIn({ user: result.data.user }));
          }
        } catch (error) {
          console.log("Login error in slice:", error);
        }
      },
    }),
    logoutUser: builder.mutation({
      query: () => ({
        url: "logout",
        method: "GET",
      }),
      invalidatesTags: ["User"],
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          await queryFulfilled;
        } catch (error) {
          console.log("Logout error:", error);
        } finally {
          localStorage.removeItem("token");
          localStorage.clear();
          dispatch(userLoggedOut());
          resetAllApiState(dispatch);
        }
      },
    }),
    loadUser: builder.query({
      query: () => ({
        url: "profile",
        method: "GET",
      }),
      providesTags: ["User"],
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          if (result?.data?.user) {
            dispatch(userLoggedIn({ user: result.data.user }));
          }
        } catch (error) {
          const status = error?.error?.status || error?.status;
          if (status === 401 || status === 403) {
            localStorage.removeItem("token");
            dispatch(userLoggedOut());
          }
        }
      },
    }),

    updateUser: builder.mutation({
      query: (FormData) => ({
        url: "profile/update",
        method: "PUT",
        body: FormData,
        credentials: "include",
      }),
      invalidatesTags: ["User"],
      async onQueryStarted(formData, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          if (result?.data?.user) {
            dispatch(userLoggedIn({ user: result.data.user }));
          }
        } catch (error) {
          console.log("Profile update failed:", error);
        }
      },
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useLoadUserQuery,
  useLogoutUserMutation,
  useUpdateUserMutation,
  useLoginUserMutation,
} = authApi;
