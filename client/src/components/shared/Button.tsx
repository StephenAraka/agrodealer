import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  endIcon?: ReactNode;
};

export function Button({
  variant = "primary",
  fullWidth = true,
  endIcon,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const variantClassName =
    variant === "primary"
      ? "bg-primaryYellow text-white hover:brightness-95"
      : "bg-transparent text-textBlack hover:bg-black/5";

  const widthClassName = fullWidth ? "w-full" : "w-auto";

  return (
    <button
      className={`flex h-[64px] ${widthClassName} items-center justify-center rounded-xl px-6 text-[30px] font-semibold transition ${variantClassName} ${className}`.trim()}
      {...props}
    >
      <span>{children}</span>
      {endIcon ? <span className="ml-5 text-[38px] leading-none">{endIcon}</span> : null}
    </button>
  );
}
