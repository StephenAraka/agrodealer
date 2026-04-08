export const LOGIN_ISSUES = ["forgot_username", "forgot_password"] as const;

export type LoginIssue = (typeof LOGIN_ISSUES)[number];

export const validateName = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) return "Name is required";
  if (trimmed.length < 2) return "Name must be at least 2 characters";
  return "";
};

export const validateUsername = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) return "Username is required";
  if (trimmed.length < 3) return "Username must be at least 3 characters";
  return "";
};

export const validatePhoneNumber = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) return "Mobile number is required";
  if (!/^[0-9+]{10,15}$/.test(trimmed)) {
    return "Enter a valid mobile number";
  }

  return "";
};

export const validateOtp = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) return "Verification code is required";
  if (!/^[0-9]{4,6}$/.test(trimmed)) return "Enter a valid code";
  return "";
};

export const validateLoginIssue = (value: string) => {
  if (!LOGIN_ISSUES.includes(value as LoginIssue)) {
    return "Please select a login issue";
  }

  return "";
};

export const validatePassword = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) return "Password is required";
  if (trimmed.length < 6) return "Password must be at least 6 characters";
  return "";
};

export const validateConfirmPassword = (password: string, confirmPassword: string) => {
  const error = validatePassword(confirmPassword);
  if (error) return error;

  if (password.trim() !== confirmPassword.trim()) {
    return "Passwords do not match";
  }

  return "";
};
