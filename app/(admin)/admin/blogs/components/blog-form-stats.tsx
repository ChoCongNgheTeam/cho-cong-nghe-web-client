"use client";

type BlogFormStatsProps = {
  views: number;
  rating: number;
  comments: number;
};

export default function BlogFormStats({ views, rating, comments }: BlogFormStatsProps) {
  return (
    <section className="rounded-2xl border border-neutral bg-neutral-light p-4">
      <h3 className="mb-3 text-xl font-semibold text-primary">Chi tiết bài viết</h3>
      <div className="space-y-2 text-[14px]">
        <div className="flex items-center justify-between">
          <span className="text-primary-light">Lượt xem</span>
          <span className="font-semibold text-primary">{views}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-primary-light">Đánh giá người dùng</span>
          <span className="font-semibold text-primary">{rating.toFixed(1)} / 5</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-primary-light">Bình luận</span>
          <span className="font-semibold text-primary">{comments}</span>
        </div>
      </div>
    </section>
  );
}
