import React from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "md",
}) => {
  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center bg-[var(--color-bg-modal-overlay)] backdrop-blur-sm p-4 animate-fadeIn">
      <div
        className={`w-full ${maxWidthStyles[maxWidth]} bg-[var(--color-bg-card)] border border-[var(--color-border-medium)] rounded-xl shadow-2xl overflow-hidden flex flex-col`}
      >
        <div className="flex justify-between items-center px-5 py-4 border-border-subtle border-b">
          <h3 className="font-semibold text-[var(--color-text-heading)] text-base">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="hover:bg-[var(--color-bg-surface)] p-1 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
