"use client";

import { useEffect, useState } from "react";
import { Lightbulb, Loader2, RefreshCw, Sparkles, XCircle, TrendingUp, Flame, ListChecks } from "lucide-react";
import { StatsCard } from "@/components/admin/StatsCard";
import AdminTable from "@/components/admin/AdminTables";
import { useToasty } from "@/components/toast";
import { getTrendForecasts, generateTrendForecast } from "./_lib/trend-forecast";
import { DAYS_OPTIONS, periodLabel } from "./_lib/constants";
import { getTrendForecastColumns } from "./components/TableTrendForecast";
import type { TrendForecastItem } from "./trend-forecast.types";

export default function TrendForecastPage() {
  const { error: toastError, success: toastSuccess } = useToasty();

  const [days, setDays] = useState(7);
  const [forecasts, setForecasts] = useState<TrendForecastItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const fetchForecasts = () => {
    setLoading(true);
    setError(null);
    getTrendForecasts()
      .then((res) => setForecasts(res.data))
      .catch((err: unknown) => setError((err as Error)?.message || "Không thể tải dự báo xu hướng"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchForecasts();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await generateTrendForecast({ days });
      setForecasts(res.data);
      toastSuccess?.(res.message || "Tạo dự báo xu hướng thành công");
    } catch (err: unknown) {
      toastError((err as Error)?.message || "Không thể tạo dự báo xu hướng");
    } finally {
      setGenerating(false);
    }
  };

  const columns = getTrendForecastColumns({ page: 1, pageSize: forecasts.length || 1 });

  const avgScore = forecasts.length ? Math.round(forecasts.reduce((sum, f) => sum + f.forecastScore, 0) / forecasts.length) : 0;
  const hotCount = forecasts.filter((f) => f.forecastScore >= 80).length;
  const latestPeriod = periodLabel(forecasts[0]?.period);

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <Lightbulb size={18} />
          </div>
          <div>
            <h1 className="text-[20px] font-bold text-primary">Dự báo xu hướng</h1>
            <p className="text-[12px] text-primary">
              AI phân tích tìm kiếm &amp; đơn hàng để gợi ý nhập hàng, chạy khuyến mãi theo xu hướng
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchForecasts}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 border border-neutral rounded-xl text-[13px] text-primary hover:bg-neutral-light-active transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>

          <div className="flex items-center gap-1 bg-neutral-light-active rounded-xl p-1">
            {DAYS_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1.5 text-[12px] font-medium rounded-lg transition-colors cursor-pointer ${days === d ? "bg-accent text-white" : "text-primary hover:bg-neutral-light"}`}
              >
                {d} ngày
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent/90 text-white text-[13px] font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-60"
          >
            {generating ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
            {generating ? "Đang phân tích..." : "Tạo dự báo mới"}
          </button>
        </div>
      </div>

      <p className="px-6 -mt-2 pb-3 text-[11px] text-neutral-dark">
        Lưu ý: tạo dự báo mới sẽ thay thế toàn bộ dự báo hiện tại, dựa trên dữ liệu tìm kiếm &amp; bán hàng trong {days} ngày gần nhất.
      </p>

      {/* Stats */}
      <div className="px-6 pb-5 grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatsCard label="Tổng số dự báo" value={forecasts.length} sub={latestPeriod} icon={<ListChecks size={16} />} />
        <StatsCard
          label="Điểm trung bình"
          value={avgScore}
          sub="Trên thang 0–100"
          icon={<TrendingUp size={16} />}
          valueClassName="text-accent"
          iconClassName="text-accent"
        />
        <StatsCard
          label="Cần nhập hàng gấp"
          value={hotCount}
          sub="Điểm dự báo ≥ 80"
          icon={<Flame size={16} />}
          valueClassName="text-promotion"
          iconClassName="text-promotion"
        />
        <StatsCard label="Khoảng phân tích gần nhất" value={latestPeriod} sub="Của lần tạo dự báo gần nhất" icon={<Sparkles size={16} />} />
      </div>

      {/* Main card */}
      <div className="mx-6 bg-neutral-light border border-neutral rounded-2xl overflow-hidden shadow-sm mb-8">
        {error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <XCircle size={36} className="text-promotion opacity-50" />
            <p className="text-[13px] text-primary">{error}</p>
            <button onClick={fetchForecasts} className="px-4 py-2 rounded-lg bg-accent text-white text-[13px] cursor-pointer">
              Thử lại
            </button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-accent" />
          </div>
        ) : forecasts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Lightbulb size={36} className="text-primary opacity-30" />
            <p className="text-[13px] text-primary">Chưa có dự báo nào</p>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-4 py-2 rounded-lg bg-accent text-white text-[13px] cursor-pointer disabled:opacity-60"
            >
              Tạo dự báo đầu tiên
            </button>
          </div>
        ) : (
          <AdminTable<TrendForecastItem> columns={columns} data={forecasts} rowKey="keyword" className="mx-0" />
        )}
      </div>
    </div>
  );
}
