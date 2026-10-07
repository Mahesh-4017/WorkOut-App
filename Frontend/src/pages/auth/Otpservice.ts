import { apiClient } from "../../api/client";

export type OtpPurpose = "verifyEmail" | "verifyPhone" | "resetPassword";

export async function verifyOtpRequest(
  purpose: OtpPurpose,
  target: string,
  code: string
): Promise<void> {
  await apiClient.post("/app/auth/otp/verify", { purpose, target, code });
}

export async function resendOtpRequest(
  purpose: OtpPurpose,
  target: string
): Promise<void> {
  await apiClient.post("/app/auth/otp/send", { purpose, target });
}

export async function sendResetCodeRequest(email: string): Promise<void> {
  await resendOtpRequest("resetPassword", email);
}

export async function resetPasswordRequest(
  email: string,
  code: string,
  newPassword: string
): Promise<void> {
  await apiClient.post("/app/auth/otp/reset-password", {
    email,
    code,
    newPassword,
  });
}