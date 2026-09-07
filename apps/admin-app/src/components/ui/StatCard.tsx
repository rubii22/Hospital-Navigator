import React from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  iconBgColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  icon,
}) => {
  return (
    <div className="flex justify-between items-start bg-[var(--color-bg-card)] p-5 border border-border-subtle rounded-xl">
      <div className="flex flex-col gap-1">
        <span className="font-medium text-[var(--color-text-secondary)] text-xs uppercase tracking-wider">
          {label}
        </span>
        <div className="font-bold text-[var(--color-text-heading)] text-2xl">
          {value}
        </div>
        {subValue && (
          <span className="text-[var(--color-text-muted)] text-xs">
            {subValue}
          </span>
        )}
      </div>
      <div className="bg-[var(--color-bg-surface)] p-3 border border-border-subtle rounded-xl text-[var(--color-accent-primary)]">
        {icon}
      </div>
    </div>
  );
};
