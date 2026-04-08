import type { InputHTMLAttributes } from "react";

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  id: string;
  containerClassName?: string;
};

export function TextInput({
  label,
  id,
  containerClassName = "",
  className = "",
  ...props
}: TextInputProps) {
  return (
    <div className={containerClassName}>
      <label htmlFor={id} className="block text-xl font-medium text-textGray">
        {label}
      </label>
      <input
        id={id}
        className={`mt-2 w-full border-b border-borderGray bg-transparent pb-3 text-[30px] font-semibold text-textBlack focus:outline-none ${className}`.trim()}
        {...props}
      />
    </div>
  );
}
