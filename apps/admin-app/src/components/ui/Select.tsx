import React from "react";

interface Option {
  label: string;
  value: string | number;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  className = "",
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="font-medium text-[var(--color-text-secondary)] text-xs">
          {label}
        </label>
      )}
      <select
        className={`w-full bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] border border-border-subtle focus:border-[var(--color-border-focus)] rounded-lg px-3.5 py-2 text-sm transition-colors outline-none cursor-pointer ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            className="bg-[var(--color-bg-card)]"
          >
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};
