import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedIn, userLoggedOut } from "../authSlice";
import { USER_API, prepareAuthHeaders } from "@/config/api.config";

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
          localStorage.removeItem("token");
          dispatch(userLoggedOut({ user: null }));
        } catch (error) {
          console.log("Logout error:", error);
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
          localStorage.removeItem("token");
          dispatch(userLoggedOut());
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
