"use client";

import { ReactNode } from "react";

export interface AdminColumn<T> {
  key: string;
  label: string;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (row: T, index: number) => ReactNode;
}

export interface AdminTableProps<T> {
  columns: AdminColumn<T>[];
  data: T[];
  selectable?: boolean;
  selectedIds?: Set<string>;
  onToggleAll?: () => void;
  rowKey?: keyof T | ((row: T) => string | number);
  loading?: boolean;
  skeletonRows?: number;
  emptyText?: ReactNode;
  hoverAble?: boolean;
  onRowClick?: (row: T, index: number) => void;
  rowClassName?: (row: T, index: number) => string;
  className?: string;
  emptyMessage?: string;
}

const alignClass: Record<string, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr className="border-b border-neutral last:border-0">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded bg-neutral animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

export default function AdminTable<T extends object>({
  columns,
  data,
  rowKey = "id" as keyof T,
  loading = false,
  skeletonRows = 5,
  emptyText = "Không có dữ liệu",
  hoverAble = true,
  onRowClick,
  rowClassName,
  className = "",
}: AdminTableProps<T>) {
  const getKey = (row: T, i: number): string | number => {
    if (typeof rowKey === "function") return rowKey(row);
    return (row[rowKey] as string | number) ?? i;
  };

  return (
    <div className={`overflow-x-auto rounded-xl border border-neutral bg-neutral-light ${className}`}>
      <table className="w-full border-collapse">
        {/* ── Head ── */}
        <thead>
          <tr className="border-b border-neutral bg-neutral-light-hover">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`
                           px-4 py-3
                           text-[12px] font-semibold uppercase tracking-wide
                           text-primary whitespace-nowrap select-none
                           ${alignClass[col.align ?? "left"]}
                           ${col.width ?? ""}
                        `}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        {/* ── Body ── */}
        <tbody>
          {loading ? (
            Array.from({ length: skeletonRows }).map((_, i) => <SkeletonRow key={i} cols={columns.length} />)
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-20 text-center text-[13px] text-neutral-dark">
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={getKey(row, rowIdx)}
                onClick={() => onRowClick?.(row, rowIdx)}
                className={[
                  "border-b border-neutral last:border-0 transition-colors duration-100",
                  hoverAble ? "hover:bg-neutral-light-active/50" : "",
                  onRowClick ? "cursor-pointer" : "",
                  rowClassName?.(row, rowIdx) ?? "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`
                                 px-4 py-3
                                 text-[13px] text-primary
                                 ${alignClass[col.align ?? "left"]}
                                 ${col.width ?? ""}
                              `}
                  >
                    {col.render ? col.render(row, rowIdx) : String((row as Record<string, unknown>)[col.key] ?? "—")}
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
