"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Button, DropdownSelect, SuccessModal, TextInput } from "@/components/shared";
import {
  requestForgotPasswordOtp,
  requestForgotUsernameOtp,
  resetForgotPassword,
  verifyForgotUsernameOtp,
} from "@/lib/api/auth";
import { appToast } from "@/lib/toast";
import {
  validateConfirmPassword,
  validateLoginIssue,
  validateOtp,
  validatePassword,
  validatePhoneNumber,
  validateUsername,
} from "@/lib/validators/auth";

type LoginHelpFormProps = {
  onBack: () => void;
  initialUsername?: string;
  onRecoveredUsername?: (username: string) => void;
  onPasswordResetSuccess?: (username: string) => void;
};

const ISSUE_OPTIONS = [
  { label: "Select Option", value: "" },
  { label: "Forgot username", value: "forgot_username" },
  { label: "Forgot password", value: "forgot_password" },
];

export function LoginHelpForm({
  onBack,
  initialUsername = "",
  onRecoveredUsername,
  onPasswordResetSuccess,
}: LoginHelpFormProps) {
  const [issue, setIssue] = useState("");
  const [username, setUsername] = useState(initialUsername);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<"verify" | "reset">("verify");
  const [isLoadingOtp, setIsLoadingOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState({
    issue: "",
    username: "",
    phoneNumber: "",
    verificationCode: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [otpRequested, setOtpRequested] = useState(false);

  const nextDisabled = useMemo(() => {
    return (
      !issue ||
      !phoneNumber.trim() ||
      !verificationCode.trim() ||
      (issue === "forgot_password" && !username.trim())
    );
  }, [issue, phoneNumber, verificationCode, username]);

  const validateVerifyStep = () => {
    const nextErrors = {
      issue: validateLoginIssue(issue),
      username: issue === "forgot_password" ? validateUsername(username) : "",
      phoneNumber: validatePhoneNumber(phoneNumber),
      verificationCode: validateOtp(verificationCode),
      newPassword: "",
      confirmPassword: "",
    };

    setErrors(nextErrors);

    return (
      !nextErrors.issue &&
      !nextErrors.username &&
      !nextErrors.phoneNumber &&
      !nextErrors.verificationCode
    );
  };

  const validateResetStep = () => {
    const passwordError = validatePassword(newPassword);
    const confirmPasswordError = validateConfirmPassword(newPassword, confirmPassword);

    setErrors((prev) => ({
      ...prev,
      newPassword: passwordError,
      confirmPassword: confirmPasswordError,
    }));

    return !passwordError && !confirmPasswordError;
  };

  const handleOtpRequest = async () => {
    const issueError = validateLoginIssue(issue);
    const phoneError = validatePhoneNumber(phoneNumber);
    const usernameError = issue === "forgot_password" ? validateUsername(username) : "";

    setErrors((prev) => ({
      ...prev,
      issue: issueError,
      username: usernameError,
      phoneNumber: phoneError,
    }));

    if (issueError || phoneError || usernameError) return;

    setIsLoadingOtp(true);

    try {
      if (issue === "forgot_username") {
        const response = await requestForgotUsernameOtp({
          phone_number: phoneNumber.trim(),
        });

        appToast.success(`OTP sent successfully: ${response.data?.otp_code || ""}`.trim());
      }

      if (issue === "forgot_password") {
        const response = await requestForgotPasswordOtp({
          username: username.trim(),
          phone_number: phoneNumber.trim(),
        });

        appToast.success(`OTP sent successfully: ${response.data?.otp_code || ""}`.trim());
      }

      setOtpRequested(true);
    } catch (error) {
      appToast.error(error instanceof Error ? error.message : "Failed to request OTP");
    } finally {
      setIsLoadingOtp(false);
    }
  };

  const handleNext = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateVerifyStep()) return;

    setIsSubmitting(true);

    try {
      if (issue === "forgot_username") {
        const response = await verifyForgotUsernameOtp({
          phone_number: phoneNumber.trim(),
          otp_code: verificationCode.trim(),
        });

        const recoveredUsername = response.data?.username;
        if (recoveredUsername) {
          onRecoveredUsername?.(recoveredUsername);
          appToast.success(`Your username is: ${recoveredUsername}`);
        } else {
          appToast.success("Username recovery successful");
        }

        onBack();
        return;
      }

      setStep("reset");
      appToast.success("OTP accepted. Set your new password.");
    } catch (error) {
      appToast.error(error instanceof Error ? error.message : "Failed to verify OTP");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateResetStep()) return;

    setIsSubmitting(true);

    try {
      await resetForgotPassword({
        username: username.trim(),
        phone_number: phoneNumber.trim(),
        otp_code: verificationCode.trim(),
        new_password: newPassword.trim(),
      });

      setShowSuccessModal(true);
    } catch (error) {
      appToast.error(error instanceof Error ? error.message : "Failed to reset password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {step === "verify" ? (
        <div className="relative w-full max-w-117.5 rounded-2xl border border-borderGray bg-white px-7 py-10 shadow-[0_10px_26px_rgba(0,0,0,0.08)] sm:px-12 sm:py-14">
          <h1 className="cs-futura-bold-37 max-w-75 leading-[1.2]">I have trouble logging in</h1>

          <form className="mt-10 space-y-6" onSubmit={handleNext} noValidate>
            <DropdownSelect
              id="loginIssue"
              name="loginIssue"
              label="Login Issue"
              value={issue}
              options={ISSUE_OPTIONS}
              error={errors.issue}
              onChange={(event) => {
                setIssue(event.target.value);
                setErrors((prev) => ({ ...prev, issue: "", username: "" }));
              }}
            />

            {issue === "forgot_password" ? (
              <TextInput
                id="helpUsername"
                name="helpUsername"
                label="Username"
                placeholder="Enter your username"
                value={username}
                error={errors.username}
                onChange={(event) => {
                  setUsername(event.target.value);
                  setErrors((prev) => ({ ...prev, username: "" }));
                }}
                className="text-cs-16 font-normal"
              />
            ) : null}

            <TextInput
              id="mobileNumber"
              name="mobileNumber"
              label="Mobile Number"
              placeholder="0712345678"
              value={phoneNumber}
              error={errors.phoneNumber}
              inputMode="tel"
              onChange={(event) => {
                setPhoneNumber(event.target.value);
                setErrors((prev) => ({ ...prev, phoneNumber: "" }));
              }}
              className="text-cs-16 font-normal"
            />

            <div className="grid grid-cols-[1fr_auto] items-end gap-4">
              <TextInput
                id="verificationCode"
                name="verificationCode"
                label="Verification Code"
                placeholder="xxxxxx"
                value={verificationCode}
                error={errors.verificationCode}
                onChange={(event) => {
                  setVerificationCode(event.target.value);
                  setErrors((prev) => ({ ...prev, verificationCode: "" }));
                }}
                className="text-cs-16 font-normal"
              />
              <Button
                type="button"
                onClick={handleOtpRequest}
                variant="dark"
                size="md"
                fullWidth={false}
                className="min-w-30"
                disabled={isLoadingOtp}
              >
                {isLoadingOtp ? "Sending..." : "Get OTP"}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-5 pt-4">
              <Button type="button" variant="outline" size="md" onClick={onBack}>
                Back
              </Button>
              <Button
                type="submit"
                size="md"
                className="disabled:cursor-not-allowed disabled:opacity-60"
                disabled={nextDisabled || isSubmitting}
              >
                {isSubmitting ? "Please wait..." : "Next"}
              </Button>
            </div>

            {otpRequested ? (
              <p className="cs-poppins-regular-13">OTP has been requested for this number.</p>
            ) : null}
          </form>
        </div>
      ) : (
        <div className="relative w-full max-w-130 rounded-2xl border border-borderGray bg-white px-7 py-10 shadow-[0_10px_26px_rgba(0,0,0,0.08)] sm:px-12 sm:py-14">
          <Image
            src="/images/green-leaves-white-background.png"
            alt="Decorative leaves"
            width={275}
            height={180}
            className="pointer-events-none absolute -right-1 -top-1 h-auto w-47.5"
          />

          <h1 className="cs-futura-bold-37 mt-2 leading-[1.1]">Set new password</h1>

          <form className="mt-10 space-y-8" onSubmit={handleChangePassword} noValidate>
            <TextInput
              id="newPassword"
              name="newPassword"
              label="New Password"
              placeholder="Enter New Password"
              type="password"
              value={newPassword}
              error={errors.newPassword}
              onChange={(event) => {
                setNewPassword(event.target.value);
                setErrors((prev) => ({ ...prev, newPassword: "" }));
              }}
              className="text-cs-16 font-normal"
            />

            <TextInput
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm Password"
              placeholder="Confirm Password"
              type="password"
              value={confirmPassword}
              error={errors.confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setErrors((prev) => ({ ...prev, confirmPassword: "" }));
              }}
              className="text-cs-16 font-normal"
            />

            <div className="grid grid-cols-2 gap-5 pt-2">
              <Button type="button" variant="outline" size="md" onClick={() => setStep("verify")}>
                Back
              </Button>
              <Button type="submit" size="md" disabled={isSubmitting}>
                {isSubmitting ? "Please wait..." : "Change"}
              </Button>
            </div>
          </form>
        </div>
      )}

      <SuccessModal
        open={showSuccessModal}
        subtitle="Set password"
        message="Your password has been set successfully"
        onClose={() => {
          setShowSuccessModal(false);
          onPasswordResetSuccess?.(username.trim());
        }}
      />
    </>
  );
}
