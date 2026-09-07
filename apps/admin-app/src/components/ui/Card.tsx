import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  onClick,
  hoverable = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-[var(--color-bg-card)] border border-border-subtle rounded-xl p-5 ${
        hoverable
          ? "hover:border-[var(--color-border-medium)] hover:bg-[var(--color-bg-card-hover)] transition-all cursor-pointer"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
};
