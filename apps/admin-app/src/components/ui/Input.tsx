import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
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
      <div className="relative flex items-center">
        {icon && (
          <div className="left-3 absolute text-[var(--color-text-muted)] pointer-events-none">
            {icon}
          </div>
        )}
        <input
          className={`w-full bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] border border-border-subtle focus:border-[var(--color-border-focus)] rounded-lg px-3.5 py-2 text-sm transition-colors outline-none placeholder:text-[var(--color-text-muted)] ${
            icon ? "pl-9" : ""
          } ${error ? "border-[var(--color-status-danger-border)]" : ""} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <span className="text-[var(--color-status-danger-text)] text-xs">
          {error}
        </span>
      )}
    </div>
  );
};
