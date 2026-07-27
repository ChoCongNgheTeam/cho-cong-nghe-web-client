import Link from "next/link";
import { Eye } from "lucide-react";
import { AdminColumn } from "@/components/admin/AdminTables";
import { sttColumn } from "@/components/admin/columns/adminColumns";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { STOCKTAKE_STATUS_LABEL } from "../_lib/constants";
import { Stocktake } from "../inventory.types";

const formatDateTime = (iso: string) => new Date(iso).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function getStocktakeColumns(page: number, pageSize: number): AdminColumn<Stocktake>[] {
  return [
    sttColumn<Stocktake>(page, pageSize),
    {
      key: "code",
      label: "Mã phiếu",
      render: (s) => (
        <Link href={`/admin/inventory/stocktake/${s.id}`} className="text-[13px] font-mono text-accent hover:underline">
          {s.code}
        </Link>
      ),
    },
    {
      key: "warehouse",
      label: "Kho",
      render: (s) => <span className="text-[13px] text-primary">{s.warehouse.name}</span>,
    },
    {
      key: "items",
      label: "Số dòng SP",
      align: "center",
      render: (s) => <span className="text-[13px] text-primary">{s.items.length}</span>,
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (s) => {
        const st = STOCKTAKE_STATUS_LABEL[s.status];
        return <StatusBadge label={st.label} className={st.color} />;
      },
    },
    {
      key: "createdAt",
      label: "Ngày tạo",
      render: (s) => <span className="text-[12px] text-neutral-dark whitespace-nowrap">{formatDateTime(s.createdAt)}</span>,
    },
    {
      key: "_actions",
      label: "Hành động",
      align: "right",
      render: (s) => (
        <Link href={`/admin/inventory/stocktake/${s.id}`} className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-neutral-dark hover:bg-accent-light hover:text-accent transition-colors">
          <Eye size={14} />
        </Link>
      ),
    },
  ];
}
