import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  icon,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles = {
    primary:
      "bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary-hover)] text-white shadow-sm",
    secondary:
      "bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-surface-hover)] text-[var(--color-text-primary)] border border-border-subtle",
    danger:
      "bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger-text)] border border-[var(--color-status-danger-border)] hover:bg-[var(--color-status-danger-text)] hover:text-white",
    outline:
      "border border-[var(--color-border-medium)] hover:bg-[var(--color-bg-surface)] text-[var(--color-text-primary)]",
    ghost:
      "hover:bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
  };

  const sizeStyles = {
    sm: "text-xs px-2.5 py-1.5 gap-1.5",
    md: "text-sm px-3.5 py-2 gap-2",
    lg: "text-base px-4.5 py-2.5 gap-2.5",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
