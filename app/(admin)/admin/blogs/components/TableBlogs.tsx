import { Eye, Pencil, Trash2, ChevronDown } from "lucide-react";
import Link from "next/link";
import { AdminColumn } from "@/components/admin/AdminTables";
import { BlogCard } from "../blog.types";
import { BlogStatusBadge } from "./BlogStatusBadge";
import { BLOG_STATUS_LABELS, BLOG_TYPE_LABELS, BLOG_TYPE_COLORS } from "../const";
import type { BlogType } from "../blog.types";
import { formatDate, formatNumber } from "@/helpers";

interface GetBlogColumnsParams {
  page: number;
  pageSize: number;
  selected: Set<string>;
  openStatusId: string | null;
  toggleOne: (id: string) => void;
  setOpenStatusId: (id: string | null) => void;
  onChangeStatus: (blog: BlogCard, status: string) => void;
  onDeleteClick: (blog: BlogCard) => void;
}

const STATUS_DROPDOWN = [
  { value: "PUBLISHED", label: "Đăng", color: "text-emerald-600 bg-emerald-50" },
  { value: "DRAFT", label: "Nháp", color: "text-neutral-dark bg-neutral-light-active" },
  { value: "ARCHIVED", label: "Lưu trữ", color: "text-neutral-dark bg-neutral-light-active" },
];

export function getBlogColumns({ page, pageSize, selected, openStatusId, toggleOne, setOpenStatusId, onChangeStatus, onDeleteClick }: GetBlogColumnsParams): AdminColumn<BlogCard>[] {
  return [
    {
      key: "_select",
      label: "",
      width: "w-10",
      align: "center",
      render: (blog) => (
        <input
          type="checkbox"
          checked={selected.has(blog.id)}
          onChange={(e) => {
            e.stopPropagation();
            toggleOne(blog.id);
          }}
          className="w-3.5 h-3.5 rounded accent-accent cursor-pointer"
        />
      ),
    },
    {
      key: "_stt",
      label: "STT",
      width: "w-14",
      render: (_, idx) => (page - 1) * pageSize + idx + 1,
    },
    {
      key: "title",
      label: "Bài viết",
      render: (blog) => (
        <div className="flex items-center gap-3 max-w-sm">
          {blog.thumbnail ? (
            <img src={blog.thumbnail} alt={blog.title} className="w-12 h-9 rounded-lg object-cover shrink-0 border border-neutral" />
          ) : (
            <div className="w-12 h-9 rounded-lg bg-neutral-light-active shrink-0 flex items-center justify-center border border-neutral">
              <span className="text-[10px] text-neutral-dark/40">No img</span>
            </div>
          )}
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-primary line-clamp-2 leading-snug">{blog.title}</p>
            <p className="text-[11px] text-neutral-dark mt-0.5 line-clamp-1">{blog.excerpt}</p>
          </div>
        </div>
      ),
    },
    {
      key: "author",
      label: "Tác giả",
      render: (blog) => (
        <div className="flex items-center gap-2">
          {blog.author.avatarImage ? (
            <img src={blog.author.avatarImage} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-accent">{(blog.author.fullName ?? blog.author.email)[0].toUpperCase()}</span>
            </div>
          )}
          <span className="text-[12px] text-primary truncate max-w-[100px]">{blog.author.fullName ?? blog.author.email}</span>
        </div>
      ),
    },
    {
      key: "viewCount",
      label: "Lượt xem",
      align: "center",
      render: (blog) => <span className="text-[13px] font-semibold text-primary">{formatNumber(blog.viewCount)}</span>,
    },
    {
      key: "type",
      label: "Loại",
      render: (blog) => {
        const label = BLOG_TYPE_LABELS[blog.type as BlogType] ?? blog.type;
        const color = BLOG_TYPE_COLORS[blog.type as BlogType] ?? "text-neutral-dark bg-neutral-light-active";
        return <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-semibold whitespace-nowrap ${color}`}>{label}</span>;
      },
    },
    {
      key: "publishedAt",
      label: "Ngày đăng",
      render: (blog) => (
        <div className="space-y-0.5">
          {blog.publishedAt ? <p className="text-[12px] text-primary">{formatDate(blog.publishedAt)}</p> : <p className="text-[11px] text-neutral-dark italic">Chưa đăng</p>}
          {blog.updatedAt && <p className="text-[10px] text-neutral-dark/60">Sửa {formatDate(blog.updatedAt)}</p>}
        </div>
      ),
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (blog) => {
        const isOpen = openStatusId === blog.id;

        return (
          <div className="relative inline-block">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenStatusId(isOpen ? null : blog.id);
              }}
              className="flex items-center gap-1.5 cursor-pointer"
            >
              <BlogStatusBadge status={blog.status} />
              <ChevronDown size={11} className="text-neutral-dark" />
            </button>
            {isOpen && (
              <div className="absolute z-20 left-0 top-full mt-1 w-36 bg-neutral-light border border-neutral rounded-xl shadow-lg overflow-hidden">
                {STATUS_DROPDOWN.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (opt.value !== blog.status) onChangeStatus(blog, opt.value);
                      setOpenStatusId(null);
                    }}
                    className={`w-full text-left px-3 py-2 text-[12px] font-medium hover:bg-neutral-light-active cursor-pointer ${opt.value === blog.status ? "opacity-40 cursor-default" : ""} ${opt.color}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "_actions",
      label: "Hành động",
      align: "right",
      render: (blog) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/admin/blogs/${blog.id}`}
            title="Xem chi tiết"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-accent-light hover:text-accent transition-colors"
          >
            <Eye size={14} />
          </Link>
          <Link
            href={`/admin/blogs/${blog.id}?edit=true`}
            title="Chỉnh sửa"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-accent-light hover:text-accent transition-colors"
          >
            <Pencil size={14} />
          </Link>
          <button
            title="Xoá"
            onClick={() => onDeleteClick(blog)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-promotion-light hover:text-promotion transition-colors cursor-pointer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];
}
