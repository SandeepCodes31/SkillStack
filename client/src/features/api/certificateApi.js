import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { CERTIFICATE_API } from "@/config/api.config";

export const certificateApi = createApi({
  reducerPath: "certificateApi",
  baseQuery: fetchBaseQuery({
    baseUrl: CERTIFICATE_API,
    credentials: "include",
  }),
  tagTypes: ["Certificate"],
  endpoints: (builder) => ({
    getMyCertificates: builder.query({
      query: () => ({
        url: "my-certificates",
        method: "GET",
      }),
      providesTags: ["Certificate"],
    }),
    getCertificateById: builder.query({
      query: (certificateId) => ({
        url: `${certificateId}`,
        method: "GET",
      }),
      providesTags: ["Certificate"],
    }),
    verifyCertificate: builder.query({
      query: (identifier) => ({
        url: `verify/${identifier}`,
        method: "GET",
      }),
    }),
    getAllAdminCertificates: builder.query({
      query: () => ({
        url: "admin/all",
        method: "GET",
      }),
      providesTags: ["Certificate"],
    }),
  }),
});

export const {
  useGetMyCertificatesQuery,
  useGetCertificateByIdQuery,
  useLazyVerifyCertificateQuery,
  useVerifyCertificateQuery,
  useGetAllAdminCertificatesQuery,
} = certificateApi;
