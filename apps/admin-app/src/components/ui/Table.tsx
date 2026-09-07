import React from "react";

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  align?: "left" | "center" | "right";
  width?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export function Table<T extends { id?: string | number }>({
  columns,
  data,
  emptyMessage = "No records found",
  onRowClick,
}: TableProps<T>) {
  return (
    <div className="bg-[var(--color-bg-card)] border border-border-subtle rounded-xl w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[var(--color-bg-surface)] border-border-subtle border-b">
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className={`py-3 px-4 text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider ${
                  col.align === "right"
                    ? "text-right"
                    : col.align === "center"
                      ? "text-center"
                      : "text-left"
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-[var(--color-border-subtle)] divide-y">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="py-12 text-[var(--color-text-muted)] text-sm text-center"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, idx) => (
              <tr
                key={item.id ?? idx}
                onClick={() => onRowClick && onRowClick(item)}
                className={`transition-colors ${
                  onRowClick
                    ? "hover:bg-[var(--color-bg-surface-hover)] cursor-pointer"
                    : "hover:bg-[var(--color-bg-card-hover)]"
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`py-3.5 px-4 text-sm text-[var(--color-text-primary)] ${
                      col.align === "right"
                        ? "text-right"
                        : col.align === "center"
                          ? "text-center"
                          : "text-left"
                    }`}
                  >
                    {col.render
                      ? col.render(item)
                      : ((item as Record<string, any>)[col.key] ?? "-")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
