import { hotelApi } from "../baseQuery";

export interface LoginRequest {
  code: string;
  password: string;
}

export interface LoginResponse {
  requiresOtp: boolean;
  email?: string;
  username?: string;
  userId?: string;
  token?: string;
  message?: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  propertyId?: number | null;
}

export interface VerifyOtpRequest {
  username: string;
  otp: number;
}

export interface RegisterUserRequest {
  firstName: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  password: string;
}

export const authApi = hotelApi.injectEndpoints({
  endpoints: (builder) => ({
    loginUser: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: "/user/login",
        method: "POST",
        body,
      }),
    }),
    registerUser: builder.mutation<unknown, RegisterUserRequest>({
      query: (body) => ({
        url: "/user/register",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Staff"],
    }),
    verifyOtp: builder.mutation<string, VerifyOtpRequest>({
      query: (body) => ({
        url: "/user/verify-otp",
        method: "POST",
        body,
      }),
    }),
    resendVerification: builder.mutation<unknown, { userName: string }>({
      query: (body) => ({
        url: "/user/resend-verification",
        method: "POST",
        body,
      }),
    }),
  }),
  overrideExisting: true,
});

export const { useLoginUserMutation, useRegisterUserMutation, useVerifyOtpMutation, useResendVerificationMutation } = authApi;

