import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "ghost" | "dark" | "outline";
type ButtonSize = "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  endIcon?: ReactNode;
};

export function Button({
  variant = "primary",
  size = "lg",
  fullWidth = true,
  endIcon,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const variantClassName = {
    primary: "bg-primaryYellow text-white hover:brightness-95",
    ghost: "bg-transparent text-textBlack hover:bg-black/5",
    dark: "bg-textBlack text-white hover:brightness-95",
    outline: "border border-textBlack/50 bg-white text-textBlack hover:bg-black/5",
  }[variant];

  const sizeClassName = {
    lg: "h-[64px] rounded-xl px-6 text-cs-15 font-bold",
    md: "h-[48px] rounded-[9px] px-5 text-cs-15 font-bold",
  }[size];

  const widthClassName = fullWidth ? "w-full" : "w-auto";

  return (
    <button
      className={`flex ${sizeClassName} ${widthClassName} items-center justify-center transition ${variantClassName} ${className}`.trim()}
      {...props}
    >
      <span>{children}</span>
      {endIcon ? <span className="ml-5 text-[38px] leading-none">{endIcon}</span> : null}
    </button>
  );
}
