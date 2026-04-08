import type { InputHTMLAttributes } from "react";

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  id: string;
  containerClassName?: string;
  error?: string;
};

export function TextInput({
  label,
  id,
  containerClassName = "",
  error,
  className = "",
  ...props
}: TextInputProps) {
  return (
    <div className={containerClassName}>
      <label htmlFor={id} className="cs-poppins-semibold-13 block">
        {label}
      </label>
      <input
        id={id}
        className={`mt-2 w-full border-b border-borderGray bg-transparent pb-3 text-cs-20 font-medium text-textBlack focus:outline-none ${className}`.trim()}
        {...props}
      />
      {error ? <p className="mt-1 text-cs-11 font-semibold text-red-600">{error}</p> : null}
    </div>
  );
}
