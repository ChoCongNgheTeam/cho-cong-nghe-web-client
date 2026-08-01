"use client";

import { useEffect, useState } from "react";
import { Lightbulb, Loader2, MousePointerClick, Eye, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { StatsCard } from "@/components/admin/StatsCard";
import { useToasty } from "@/components/toast";
import { getRecommendationAnalytics } from "./_lib/recommendations";
import { ALGORITHM_LABELS, DAYS_OPTIONS } from "./_lib/constants";
import type { RecommendationAnalytics } from "./recommendation.types";

export default function RecommendationAnalyticsPage() {
  const { error: toastError } = useToasty();
  const [days, setDays] = useState(30);
  const [data, setData] = useState<RecommendationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getRecommendationAnalytics({ days })
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch((err: unknown) => {
        if (!cancelled) toastError((err as Error)?.message || "Không thể tải thống kê");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  return (
    <div className="min-h-screen bg-neutral-light">
      <div className="px-6 pt-5 pb-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <Lightbulb size={18} />
          </div>
          <div>
            <h1 className="text-[18px] font-bold text-primary">Hiệu suất gợi ý sản phẩm</h1>
            <p className="text-[12px] text-primary">Lượt hiển thị, lượt click và CTR theo từng thuật toán gợi ý</p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-neutral-light-active rounded-xl p-1">
          {DAYS_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 text-[12px] font-medium rounded-lg transition-colors cursor-pointer ${
                days === d ? "bg-accent text-white" : "text-primary hover:bg-neutral-light"
              }`}
            >
              {d} ngày
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 pb-8 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={22} className="animate-spin text-accent" />
          </div>
        ) : !data ? (
          <p className="text-[13px] text-neutral-dark text-center py-20">Không có dữ liệu</p>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <StatsCard label="Tổng lượt hiển thị" value={data.totalShown.toLocaleString("vi-VN")} sub={`${days} ngày gần nhất`} icon={<Eye size={16} />} />
              <StatsCard
                label="Tổng lượt click"
                value={data.totalClicked.toLocaleString("vi-VN")}
                sub={`${days} ngày gần nhất`}
                icon={<MousePointerClick size={16} />}
                valueClassName="text-accent"
                iconClassName="text-accent"
              />
              <StatsCard label="CTR tổng" value={`${data.ctr}%`} sub="Tỉ lệ click / hiển thị" icon={<TrendingUp size={16} />} valueClassName="text-emerald-600" iconClassName="text-emerald-600" />
            </div>

            {/* Daily trend chart */}
            <div className="bg-white border border-neutral rounded-xl p-5">
              <p className="text-[13px] font-semibold text-primary mb-4">Xu hướng theo ngày</p>
              {data.daily.length === 0 ? (
                <p className="text-[13px] text-neutral-dark text-center py-10">Chưa có dữ liệu trong khoảng thời gian này</p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.daily} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e6e6e6" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                      <Line type="monotone" dataKey="shown" name="Hiển thị" stroke="#e8873a" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="clicked" name="Click" stroke="#10b981" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* By algorithm table */}
            <div className="bg-white border border-neutral rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-neutral bg-neutral-light-active/50">
                <p className="text-[13px] font-semibold text-primary">Theo thuật toán gợi ý</p>
              </div>
              {data.byAlgorithm.length === 0 ? (
                <p className="text-[13px] text-neutral-dark text-center py-10">Chưa có dữ liệu</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral bg-neutral-light-hover">
                      <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-primary uppercase">Thuật toán</th>
                      <th className="px-5 py-2.5 text-right text-[11px] font-semibold text-primary uppercase">Lượt hiển thị</th>
                      <th className="px-5 py-2.5 text-right text-[11px] font-semibold text-primary uppercase">Lượt click</th>
                      <th className="px-5 py-2.5 text-right text-[11px] font-semibold text-primary uppercase">CTR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.byAlgorithm.map((row) => (
                      <tr key={row.algorithm} className="border-b border-neutral last:border-0">
                        <td className="px-5 py-3 text-[13px] font-medium text-primary">{ALGORITHM_LABELS[row.algorithm] ?? row.algorithm}</td>
                        <td className="px-5 py-3 text-[13px] text-primary text-right">{row.shown.toLocaleString("vi-VN")}</td>
                        <td className="px-5 py-3 text-[13px] text-primary text-right">{row.clicked.toLocaleString("vi-VN")}</td>
                        <td className="px-5 py-3 text-[13px] font-semibold text-right text-emerald-600">{row.ctr}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
