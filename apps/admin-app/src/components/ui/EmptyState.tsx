import React from "react";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col justify-center items-center bg-[var(--color-bg-card)] p-12 border border-border-subtle border-dashed rounded-xl text-center">
      <div className="bg-[var(--color-bg-surface)] mb-3 p-3.5 rounded-2xl text-[var(--color-text-muted)]">
        {icon}
      </div>
      <h4 className="mb-1 font-semibold text-[var(--color-text-heading)] text-base">
        {title}
      </h4>
      {description && (
        <p className="mb-4 max-w-sm text-[var(--color-text-muted)] text-sm">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
};
