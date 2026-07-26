

import { IBaseResponse, IForgotPasswordPayload, IUserRespon, IUserResponse, IVerifyOTPPayload } from "@/types/global";
import baseApi from "../baseApi";



export type UsersApiResponse = {
  success: boolean;
  message: string;
  data: {
    meta: {
      page: number;
      limit: number;
      total: number;
    };
    data: {
      id: string;
      name: string;
      role: "USER" | "ADMIN" | "SUPERADMIN";
      email: string;
      phone: string;
      location: string | null;
      expertise: string[];
      startTime: string | null;
      endTime: string | null;
      workingDays: ("M" | "T" | "W" | "TH" | "F" | "S" | "SU")[];
      isDeleted: boolean;
      notes: string | null;
      profileImage: string | null;
      password: string | null;
      resetToken: string | null;
      resetExpires: string | null;
      inviteSentAt: string | null;
      inviteCount: number;
      isPasswordChanged: boolean;
      createdAt: string;
      updatedAt: string;
    }[];
  };
};

export type WorkingDay = "M" | "T" | "W" | "TH" | "F" | "S" | "SU";

export type ResourceRegistration = {
  name: string;
  role?: string; // e.g. "USER", "ADMIN", etc.
  email: string;

  password?: string;
  location?: string | null;
  expertise?: string[]; // comma-separated → array
  startTime?: string | null; // e.g. "09:00"
  endTime?: string | null; // e.g. "18:00"
  workingDays?: WorkingDay[];
  notes?: string | null;
  profileImage?: File | null; // for upload (optional)
};

export type AuthSuccessResponse = {
  success: boolean;
  message: string;
  data: {
    id: string;
    name: string;
    role: string;
    email: string;
    phone: string;
    location: string | null;
    expertise: string[];
    startTime: string | null;
    endTime: string | null;
    workingDays: WorkingDay[];
    notes: string | null;
    profileImage: string | null;
    // other fields you don't need in UI can stay
    [key: string]: unknown;
  };
};

type LoginRequest = {
  email: string;
  password: string;
};

type LoginResponse = {
  accessToken: string;
  success: boolean;
  message?: string;
  data: {
    result: unknown;
    user: {
      id: string;
      name: string;
      email: string;
      role?: string;
    };
    accessToken: string;
  };
};

export interface ResourceUpdateInput {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  location?: string | null;
  expertise?: { set: string[] } | string[] | null | undefined;
  workingDays?: { set: WorkingDay[] } | WorkingDay[] | null | undefined;
  startTime?: string | null;
  endTime?: string | null;
  notes?: string | null;
  profileImage?: string | null;
}

const authApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getMe: builder.query({
      query: () => "/auth/me",
      providesTags: ["User"],
    }),
    logIn: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
    }),

    signUp: builder.mutation<AuthSuccessResponse, ResourceRegistration>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    // get all resourse (user)
    getAllResource: builder.query<IUserResponse, void>({
      query: () => ({
        url: `/users`,
        method: "GET",
      }),
      providesTags: ["User"],
    }),

   
   
 

    forgotPassword: builder.mutation({
      query: (body: IForgotPasswordPayload) => ({
        url: "auth/forgot-password",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    // reset password
    resetPassword: builder.mutation<IBaseResponse, { token: string; password: string }>({
      query: ({ token, password }) => ({
        url: `/auth/reset-password?token=${token}`,
        method: "POST",
        body: { password },
      }),
      invalidatesTags: ["User"],
    }),

    // set password
    setUpPassword: builder.mutation({
      query: (body: unknown) => ({
        url: "/auth/set-password",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
   
    updateProfile: builder.mutation<IBaseResponse, FormData>({
      query: (body) => ({
        url: "/users/update-profile",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    verifyOtp: builder.mutation({
      query: (body: IVerifyOTPPayload) => ({
        url: "/otp/verify",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetMeQuery,
  useLogInMutation,
  useSignUpMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useSetUpPasswordMutation,
  useVerifyOtpMutation,
  useGetAllResourceQuery,
  useUpdateProfileMutation,
} = authApi;
