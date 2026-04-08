import type { SelectHTMLAttributes } from "react";

type Option = {
  label: string;
  value: string;
};

type DropdownSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  id: string;
  label: string;
  options: Option[];
  error?: string;
  containerClassName?: string;
};

export function DropdownSelect({
  id,
  label,
  options,
  error,
  className = "",
  containerClassName = "",
  ...props
}: DropdownSelectProps) {
  return (
    <div className={containerClassName}>
      <label htmlFor={id} className="cs-poppins-semibold-13 block">
        {label}
      </label>
      <select
        id={id}
        className={`mt-2 h-[48px] w-full rounded-[9px] border border-textGreen bg-transparent px-4 text-cs-20 font-semibold text-textBlack focus:outline-none ${className}`.trim()}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <p className="mt-1 text-cs-11 font-semibold text-red-600">{error}</p> : null}
    </div>
  );
}
