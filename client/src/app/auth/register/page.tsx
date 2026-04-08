"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthSplitLayout } from "@/components/global";
import { Button, TextInput } from "@/components/shared";
import { register, verifyPhone } from "@/lib/api/auth";
import { appToast } from "@/lib/toast";
import {
  validateConfirmPassword,
  validateName,
  validateOtp,
  validatePassword,
  validatePhoneNumber,
  validateUsername,
} from "@/lib/validators/auth";

export default function RegisterPage() {
  const router = useRouter();

  const [step, setStep] = useState<"register" | "verify">("register");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const [errors, setErrors] = useState({
    name: "",
    username: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    otpCode: "",
  });

  const validateRegister = () => {
    const nextErrors = {
      name: validateName(name),
      username: validateUsername(username),
      phoneNumber: validatePhoneNumber(phoneNumber),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(password, confirmPassword),
      otpCode: "",
    };

    setErrors(nextErrors);
    return Object.values(nextErrors).every((error) => !error);
  };

  const validateVerify = () => {
    const otpError = validateOtp(otpCode);
    setErrors((prev) => ({ ...prev, otpCode: otpError }));
    return !otpError;
  };

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateRegister()) return;

    setIsSubmitting(true);
    try {
      const response = await register({
        name: name.trim(),
        username: username.trim(),
        password: password.trim(),
        phone_number: phoneNumber.trim(),
      });

      const otp = response.data?.otp_code;
      if (otp) {
        appToast.success(`OTP: ${otp}`);
      }

      appToast.success("Account created. Verify your phone number.");
      setStep("verify");
    } catch (error) {
      appToast.error(error instanceof Error ? error.message : "Failed to create account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyPhone = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateVerify()) return;

    setIsSubmitting(true);
    try {
      await verifyPhone({
        phone_number: phoneNumber.trim(),
        otp_code: otpCode.trim(),
      });

      appToast.success("Phone verified successfully. You can now sign in.");
      router.push("/auth/login");
    } catch (error) {
      appToast.error(error instanceof Error ? error.message : "Phone verification failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthSplitLayout
      leftPanel={
        <>
          <Image src="/images/bg.png" alt="Farmer in field" fill priority className="object-cover" />

          <div className="absolute left-8 top-8">
            <Image src="/images/logo.svg" alt="Bank logo" width={116} height={104} priority />
          </div>

          <div
            className="absolute bottom-0 right-0 h-65 w-85 overflow-hidden bg-white"
            style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
          >
            <div className="relative h-full w-full">
              <Image
                src="/images/logo.png"
                alt="Farmer emblem"
                width={130}
                height={117}
                className="absolute bottom-6 right-6"
              />
            </div>
          </div>
        </>
      }
    >
      <div className="relative w-full max-w-117.5 rounded-2xl border border-borderGray bg-white px-7 py-10 shadow-[0_10px_26px_rgba(0,0,0,0.08)] sm:px-12 sm:py-14">
        <Image
          src="/images/green-leaves-white-background.png"
          alt="Decorative leaves"
          width={275}
          height={180}
          className="pointer-events-none absolute -right-1 -top-1 h-auto w-47.5"
        />

        <p className="text-[17px] font-semibold uppercase tracking-wide text-textGray">Welcome to</p>
        <h1 className="cs-futura-bold-37 mt-1 max-w-72.5 leading-[0.95]">Agro dealer Portal</h1>

        <p className="cs-poppins-medium-20 mt-8">
          {step === "register" ? "Create your account" : "Verify your phone number"}
        </p>

        {step === "register" ? (
          <form className="mt-8 space-y-5" onSubmit={handleRegister} noValidate>
            <TextInput
              id="name"
              name="name"
              label="Name"
              value={name}
              error={errors.name}
              onChange={(event) => {
                setName(event.target.value);
                setErrors((prev) => ({ ...prev, name: "" }));
              }}
            />

            <TextInput
              id="username"
              name="username"
              label="Username"
              value={username}
              error={errors.username}
              onChange={(event) => {
                setUsername(event.target.value);
                setErrors((prev) => ({ ...prev, username: "" }));
              }}
            />

            <TextInput
              id="phone"
              name="phone"
              label="Phone Number"
              value={phoneNumber}
              error={errors.phoneNumber}
              inputMode="tel"
              placeholder="+254700111222"
              onChange={(event) => {
                setPhoneNumber(event.target.value);
                setErrors((prev) => ({ ...prev, phoneNumber: "" }));
              }}
            />

            <TextInput
              id="password"
              name="password"
              label="Password"
              type="password"
              value={password}
              error={errors.password}
              onChange={(event) => {
                setPassword(event.target.value);
                setErrors((prev) => ({ ...prev, password: "" }));
              }}
            />

            <TextInput
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              error={errors.confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setErrors((prev) => ({ ...prev, confirmPassword: "" }));
              }}
            />

            <Button type="submit" className="mt-4" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Account"}
            </Button>
          </form>
        ) : (
          <form className="mt-8 space-y-5" onSubmit={handleVerifyPhone} noValidate>
            <TextInput
              id="verifyPhone"
              name="verifyPhone"
              label="Phone Number"
              value={phoneNumber}
              readOnly
              className="text-textGray"
            />

            <TextInput
              id="otpCode"
              name="otpCode"
              label="Verification Code"
              value={otpCode}
              error={errors.otpCode}
              placeholder="Enter OTP"
              onChange={(event) => {
                setOtpCode(event.target.value);
                setErrors((prev) => ({ ...prev, otpCode: "" }));
              }}
            />

            <div className="grid grid-cols-2 gap-4 pt-2">
              <Button type="button" variant="outline" size="md" onClick={() => setStep("register")}>
                Back
              </Button>
              <Button type="submit" size="md" disabled={isSubmitting}>
                {isSubmitting ? "Verifying..." : "Verify"}
              </Button>
            </div>
          </form>
        )}

        <p className="cs-poppins-regular-13 mt-10 text-center">
          Already have an account?{" "}
          <Link href="/auth/login" className="cs-poppins-bold-13">
            Sign in
          </Link>
        </p>
      </div>
    </AuthSplitLayout>
  );
}
