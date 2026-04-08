import { apiRequest } from "./client";

type LoginPayload = {
  username: string;
  password: string;
};

type RegisterPayload = {
  name: string;
  username: string;
  password: string;
  phone_number: string;
};

type VerifyPhonePayload = {
  phone_number: string;
  otp_code: string;
};

type ForgotUsernamePayload = {
  phone_number: string;
  otp_code?: string;
};

type ForgotPasswordRequestPayload = {
  username: string;
  phone_number: string;
};

type ForgotPasswordResetPayload = {
  username: string;
  phone_number: string;
  otp_code: string;
  new_password: string;
};

export const login = (payload: LoginPayload) =>
  apiRequest<{ token: string; user: { id: number; name: string; username: string } }>(
    "/auth/login",
    {
      method: "POST",
      body: payload,
    },
  );

export const register = (payload: RegisterPayload) =>
  apiRequest<{
    user: { id: number; name: string; username: string; phone_number: string; is_phone_verified: boolean };
    otp_code: string;
  }>("/auth/register", {
    method: "POST",
    body: payload,
  });

export const verifyPhone = (payload: VerifyPhonePayload) =>
  apiRequest<{ user: { id: number; username: string; phone_number: string; is_phone_verified: boolean } }>(
    "/auth/verify-phone",
    {
      method: "POST",
      body: payload,
    },
  );

export const requestForgotUsernameOtp = (payload: ForgotUsernamePayload) =>
  apiRequest<{ otp_code: string }>("/auth/forgot-username/request-otp", {
    method: "POST",
    body: payload,
  });

export const verifyForgotUsernameOtp = (payload: Required<ForgotUsernamePayload>) =>
  apiRequest<{ username: string }>("/auth/forgot-username/verify-otp", {
    method: "POST",
    body: payload,
  });

export const requestForgotPasswordOtp = (payload: ForgotPasswordRequestPayload) =>
  apiRequest<{ otp_code: string }>("/auth/forgot-password/request-otp", {
    method: "POST",
    body: payload,
  });

export const resetForgotPassword = (payload: ForgotPasswordResetPayload) =>
  apiRequest<never>("/auth/forgot-password/reset", {
    method: "POST",
    body: payload,
  });
