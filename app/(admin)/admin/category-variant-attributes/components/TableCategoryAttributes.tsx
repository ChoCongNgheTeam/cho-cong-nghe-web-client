"use client";

import { Pencil } from "lucide-react";
import { AdminColumn } from "@/components/admin/AdminTables";
import { CategoryWithAttributes } from "../category-variant-attribute.types";

interface GetColumnsParams {
  onEditClick: (cat: CategoryWithAttributes) => void;
}

export function getCategoryAttributeColumns({ onEditClick }: GetColumnsParams): AdminColumn<CategoryWithAttributes>[] {
  return [
    {
      key: "name",
      label: "Danh mục",
      render: (cat) => (
        <div className="space-y-0.5">
          <span className="text-[13px] font-medium text-primary block">{cat.name}</span>
          <span className="text-[11px] text-neutral-dark font-mono bg-neutral-light-active px-1.5 py-0.5 rounded">{cat.slug}</span>
        </div>
      ),
    },
    {
      key: "attributes",
      label: "Thuộc tính liên kết",
      render: (cat) => {
        if (cat.attributes.length === 0) {
          return <span className="text-[12px] text-neutral-dark/50 italic">Chưa liên kết</span>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {cat.attributes.map((attr) => (
              <span key={attr.id} className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-accent/10 text-accent">
                {attr.name}
                <span className="ml-1 text-accent/50 font-mono">({attr.code})</span>
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: "_count",
      label: "Số thuộc tính",
      align: "center",
      render: (cat) => <span className="text-[13px] font-semibold text-primary">{cat.attributes.length}</span>,
    },
    {
      key: "isActive",
      label: "Trạng thái",
      render: (cat) =>
        cat.isActive ? (
          <span className="text-[12px] font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">Hoạt động</span>
        ) : (
          <span className="text-[12px] font-medium text-orange-500 bg-orange-50 px-2.5 py-1 rounded-lg">Tạm dừng</span>
        ),
    },
    {
      key: "_actions",
      label: "Hành động",
      align: "right",
      render: (cat) => (
        <button
          title="Chỉnh sửa"
          onClick={() => onEditClick(cat)}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-accent-light hover:text-accent transition-colors cursor-pointer"
        >
          <Pencil size={14} />
        </button>
      ),
    },
  ];
}
