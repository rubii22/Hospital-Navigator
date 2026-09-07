import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "active" | "warning" | "danger" | "draft" | "primary" | "neutral";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  size = "sm",
}) => {
  const variantStyles = {
    active:
      "bg-[var(--color-status-active-bg)] text-[var(--color-status-active-text)] border border-[var(--color-status-active-border)]",
    warning:
      "bg-[var(--color-status-warning-bg)] text-[var(--color-status-warning-text)] border border-[var(--color-status-warning-border)]",
    danger:
      "bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger-text)] border border-[var(--color-status-danger-border)]",
    draft:
      "bg-[var(--color-status-draft-bg)] text-[var(--color-status-draft-text)] border border-[var(--color-status-draft-border)]",
    primary:
      "bg-[rgba(37,99,235,0.15)] text-[var(--color-accent-primary)] border border-[rgba(37,99,235,0.3)]",
    neutral:
      "bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border border-border-subtle",
  };

  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5 font-medium rounded-md",
    md: "text-xs px-2.5 py-1 font-medium rounded-lg",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 leading-none ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      {children}
    </span>
  );
};
