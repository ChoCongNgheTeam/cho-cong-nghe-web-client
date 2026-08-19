import { AdminColumn } from "@/components/admin/AdminTables";
import { sttColumn } from "@/components/admin/columns/adminColumns";
import { TrendForecastItem } from "../trend-forecast.types";
import { getScoreLevel } from "../_lib/constants";

interface GetTrendForecastColumnsParams {
  page: number;
  pageSize: number;
}

export function getTrendForecastColumns({ page, pageSize }: GetTrendForecastColumnsParams): AdminColumn<TrendForecastItem>[] {
  return [
    sttColumn<TrendForecastItem>(page, pageSize),
    {
      key: "keyword",
      label: "Từ khóa",
      render: (item) => <span className="text-[13px] font-medium text-primary">{item.keyword}</span>,
    },
    {
      key: "forecastScore",
      label: "Điểm dự báo",
      align: "center",
      render: (item) => {
        const level = getScoreLevel(item.forecastScore);
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${level.color}`}>
            {item.forecastScore} · {level.label}
          </span>
        );
      },
    },
    {
      key: "suggestedAction",
      label: "Hành động đề xuất",
      render: (item) => <span className="text-[13px] text-primary font-medium">{item.suggestedAction}</span>,
    },
    {
      key: "reasoning",
      label: "Lý do",
      render: (item) => (
        <span title={item.reasoning} className="line-clamp-2 text-[13px] text-neutral-dark max-w-md block">
          {item.reasoning}
        </span>
      ),
    },
    {
      key: "generatedAt",
      label: "Thời gian tạo",
      align: "right",
      render: (item) => (
        <span className="text-[12px] text-neutral-dark whitespace-nowrap">
          {new Date(item.generatedAt).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}
        </span>
      ),
    },
  ];
}
