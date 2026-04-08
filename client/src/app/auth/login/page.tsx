"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { AuthSplitLayout, LoginHelpForm } from "@/components/global";
import { Button, TextInput } from "@/components/shared";
import { login } from "@/lib/api/auth";
import { saveSession } from "@/lib/session";
import { appToast } from "@/lib/toast";
import { validatePassword, validateUsername } from "@/lib/validators/auth";

export default function LoginPage() {
  const router = useRouter();
  const [showHelpForm, setShowHelpForm] = useState(false);
  const [loginStep, setLoginStep] = useState<"username" | "password">("username");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleUsernameSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const error = validateUsername(username);
    setUsernameError(error);

    if (!error) {
      setLoginStep("password");
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const error = validatePassword(password);
    setPasswordError(error);
    if (error) return;

    setIsSubmitting(true);

    try {
      const response = await login({
        username: username.trim(),
        password: password.trim(),
      });

      const token = response.data?.token;
      const user = response.data?.user;
      if (token && user) {
        saveSession(token, {
          id: user.id,
          name: user.name,
          username: user.username,
        });
      }

      appToast.success(response.message || "Login successful");
      router.push("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      appToast.error(message);

      if (message.toLowerCase().includes("not verified")) {
        router.push("/auth/register");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthSplitLayout
      leftPanel={
        <>
          <Image
            src="/images/bg.png"
            alt="Farmer in field"
            fill
            priority
            className="object-cover"
          />

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
      {showHelpForm ? (
        <LoginHelpForm
          initialUsername={username}
          onRecoveredUsername={(value) => {
            setUsername(value);
            setLoginStep("password");
          }}
          onPasswordResetSuccess={(value) => {
            setShowHelpForm(false);
            if (value) setUsername(value);
            setLoginStep("password");
            setPassword("");
            appToast.success("Password changed. Please sign in.");
          }}
          onBack={() => setShowHelpForm(false)}
        />
      ) : (
      <div className="relative w-full max-w-117.5 rounded-2xl border border-borderGray bg-white px-7 py-10 shadow-[0_10px_26px_rgba(0,0,0,0.08)] sm:px-12 sm:py-14">
            <Image
              src="/images/green-leaves-white-background.png"
              alt="Decorative leaves"
              width={275}
              height={180}
              className="pointer-events-none absolute -right-1 -top-1 h-auto w-47.5"
            />

            <p className="text-[17px] font-semibold uppercase tracking-wide text-textGray">
              Welcome to
            </p>
            <h1 className="cs-futura-bold-37 mt-1 max-w-72.5 leading-[0.95]">
              Agro dealer Portal
            </h1>

            <p className="cs-poppins-medium-20 mt-8">
              {loginStep === "username"
                ? "Enter your username to continue"
                : "Enter your password to continue"}
            </p>

            {loginStep === "username" ? (
              <form className="mt-8" onSubmit={handleUsernameSubmit} noValidate>
                <TextInput
                  id="username"
                  name="username"
                  label="Username"
                  value={username}
                  error={usernameError}
                  onChange={(event) => {
                    setUsername(event.target.value);
                    setUsernameError("");
                  }}
                />

                <Button type="submit" className="mt-12" endIcon={<span aria-hidden="true">›</span>}>
                  Continue
                </Button>
              </form>
            ) : (
              <form className="mt-8" onSubmit={handlePasswordSubmit} noValidate>
                <div>
                  <p className="cs-poppins-semibold-13 mb-2">Password</p>
                  <div className="flex items-center border-b border-borderGray pb-3">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        setPasswordError("");
                      }}
                      className="w-full bg-transparent text-cs-20 font-medium text-textBlack focus:outline-none"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="ml-3 text-textBlack/80"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {passwordError ? (
                    <p className="mt-1 text-cs-11 font-semibold text-red-600">{passwordError}</p>
                  ) : null}
                </div>

                <div className="mt-10 grid grid-cols-2 gap-4">
                  <Button type="button" variant="outline" size="md" onClick={() => setLoginStep("username")}>
                    Back
                  </Button>
                  <Button type="submit" size="md" disabled={isSubmitting}>
                    {isSubmitting ? "Signing in..." : "Sign in"}
                  </Button>
                </div>
              </form>
            )}

            <p className="cs-poppins-regular-13 mt-12 text-center">
              Having trouble logging in?{" "}
              <Link
                href="#"
                className="cs-poppins-bold-13"
                onClick={(event) => {
                  event.preventDefault();
                  setShowHelpForm(true);
                }}
              >
                Get Help
              </Link>
            </p>

            <p className="cs-poppins-regular-13 mt-2 text-center">
              Don&apos;t have an account?{" "}
              <Link href="/auth/register" className="cs-poppins-bold-13">
                Create account
              </Link>
            </p>
      </div>
      )}
    </AuthSplitLayout>
  );
}
