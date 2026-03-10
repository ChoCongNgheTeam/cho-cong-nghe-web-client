"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ApiError } from "@/lib/api";
import { useToasty } from "@/components/Toast";
import {
  AdminBlogDetail,
  AdminBlogUpsertPayload,
  createAdminBlog,
  getAdminBlogById,
  updateAdminBlog,
} from "../_lib/blog.api";
import BlogFormActivity from "./blog-form-activity";
import BlogFormBasicInfo from "./blog-form-basic-info";
import BlogFormContent from "./blog-form-content";
import BlogFormMedia from "./blog-form-media";
import BlogFormPreviewAndSeo from "./blog-form-preview-and-seo";
import BlogFormStats from "./blog-form-stats";
import { mapBlogDetailToForm, stripHtml, toSlug } from "./blog-form-utils";

type BlogFormProps = {
  mode: "create" | "edit";
  blogId?: string;
  initialData?: AdminBlogDetail;
};

export type BlogFormState = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  thumbnail: string;
  category: string;
  tags: string;
  seoTitle: string;
  seoDescription: string;
  scheduledAt: string;
  isFeatured: boolean;
};


export default function BlogForm({ mode, blogId, initialData }: BlogFormProps) {
  const router = useRouter();
  const toast = useToasty();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);
  const [showPreviewContent, setShowPreviewContent] = useState(false);
  const submitModeRef = useRef<"draft" | "publish">("publish");

  const [form, setForm] = useState<BlogFormState>(
    initialData
      ? mapBlogDetailToForm(initialData)
      : {
          title: "",
          slug: "",
          excerpt: "",
          content: "",
          thumbnail: "",
          category: "",
          tags: "",
          seoTitle: "",
          seoDescription: "",
          scheduledAt: "",
          isFeatured: true,
        }
  );

  const [loadingInitialData, setLoadingInitialData] = useState(mode === "edit" && !initialData);

  const userStats = useMemo(
    () => ({
      views: initialData?.viewCount ?? 0,
      rating: initialData?.ratingAvg ?? 0,
      comments: initialData?.commentsCount ?? 0,
    }),
    [initialData]
  );

  const submitLabel = mode === "create" ? "Hoạt động" : "Cập nhật";

  useEffect(() => {
    if (!thumbnailFile) {
      setThumbnailPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(thumbnailFile);
    setThumbnailPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [thumbnailFile]);

  useEffect(() => {
    if (mode !== "edit" || !blogId || initialData) return;

    let isMounted = true;

    const fetchBlogDetail = async () => {
      try {
        setLoadingInitialData(true);
        const blog = await getAdminBlogById(blogId);
        if (isMounted) setForm(mapBlogDetailToForm(blog));
      } catch (error) {
        if (isMounted) {
          const message = error instanceof Error ? error.message : "Không thể tải dữ liệu bài viết";
          toast.error(message);
        }
      } finally {
        if (isMounted) setLoadingInitialData(false);
      }
    };

    void fetchBlogDetail();

    return () => {
      isMounted = false;
    };
  }, [blogId, initialData, mode, toast]);

  if (loadingInitialData) {
    return (
      <section className="space-y-4 bg-neutral-light-active p-6">
        <h1 className="text-2xl font-semibold text-primary">Đang tải dữ liệu bài viết...</h1>
      </section>
    );
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề bài viết");
      return;
    }

    if (form.title.trim().length < 3) {
      toast.error("Tiêu đề phải có ít nhất 3 ký tự");
      return;
    }

    const plainContent = stripHtml(form.content);
    if (!plainContent) {
      toast.error("Vui lòng nhập nội dung bài viết");
      return;
    }

    if (plainContent.length < 10) {
      toast.error("Nội dung phải có ít nhất 10 ký tự");
      return;
    }

    if (form.content.includes("src=\"blob:")) {
      toast.error("Vui lòng chờ ảnh upload xong trước khi lưu");
      return;
    }

    const scheduledAtIso = form.scheduledAt ? new Date(form.scheduledAt).toISOString() : undefined;

    const payload: AdminBlogUpsertPayload = {
      title: form.title.trim(),
      content: form.content.trim(),
      imageFile: thumbnailFile ?? undefined,
      imageUrl: form.thumbnail.trim() || undefined,
      status: submitModeRef.current === "publish" ? "PUBLISHED" : "DRAFT",
      publishedAt: submitModeRef.current === "publish" ? scheduledAtIso : undefined,
      slug: form.slug.trim() || toSlug(form.title),
      excerpt: form.excerpt.trim() || plainContent.slice(0, 180),
      thumbnail: form.thumbnail.trim() || undefined,
      category: form.category.trim() || undefined,
      tags: form.tags
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      seoTitle: form.seoTitle.trim() || undefined,
      seoDescription: form.seoDescription.trim() || undefined,
      isFeatured: form.isFeatured,
      scheduledAt: scheduledAtIso,
    };

    setIsSubmitting(true);
    try {
      if (mode === "create") {
        await createAdminBlog(payload);
        toast.success(
          submitModeRef.current === "publish"
            ? "Đăng bài viết thành công"
            : "Lưu nháp bài viết thành công"
        );
        router.push("/admin/blogs");
      } else if (blogId) {
        await updateAdminBlog(blogId, payload);
        toast.success(
          submitModeRef.current === "publish"
            ? "Cập nhật và đăng bài viết thành công"
            : "Cập nhật bài viết nháp thành công"
        );
        router.refresh();
      }
    } catch (error) {
      console.error("[BlogForm submit error]", error);
      const message = (() => {
        if (error instanceof ApiError) {
          const fieldErrors = error.data?.errors as Record<string, string> | undefined;
          if (fieldErrors && Object.keys(fieldErrors).length > 0) {
            return Object.values(fieldErrors)[0];
          }
          return (error.data?.message as string | undefined) ?? error.message;
        }
        if (error instanceof Error) return error.message;
        return "Không thể lưu bài viết";
      })();
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "h-12 w-full rounded-xl border border-neutral bg-neutral-light-active px-4 text-[14px] text-primary outline-none transition focus:border-accent";

  return (
    <section className="space-y-6 bg-neutral-light-active p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold leading-tight text-primary">
          {mode === "create" ? "Tạo bài viết" : "Chỉnh sửa bài viết"}
        </h1>
        <p className="text-base text-primary-light">
          {mode === "create" ? "Thêm bài viết mới" : "Cập nhật nội dung bài viết"}
        </p>
      </header>

      <h2 className="text-xl font-semibold leading-tight text-primary">Điền đầy đủ thông tin sản phẩm</h2>

      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="rounded-2xl border border-neutral bg-neutral-light p-5">
          <span className="inline-flex rounded-xl bg-accent px-4 py-2 text-sm font-medium text-neutral-light">
            Thông tin cơ bản
          </span>

          <div className="mt-5 space-y-4">
            <BlogFormBasicInfo form={form} setForm={setForm} inputClass={inputClass} toSlug={toSlug} />
            <BlogFormMedia form={form} setForm={setForm} setThumbnailFile={setThumbnailFile} inputClass={inputClass} />
            <BlogFormContent form={form} setForm={setForm} />
          </div>
        </section>

        <aside className="space-y-4">
          <BlogFormActivity
            form={form}
            setForm={setForm}
            inputClass={inputClass}
            isSubmitting={isSubmitting}
            submitLabel={submitLabel}
            submitModeRef={submitModeRef}
            showPreviewContent={showPreviewContent}
            setShowPreviewContent={setShowPreviewContent}
          />

          <BlogFormPreviewAndSeo
            form={form}
            setForm={setForm}
            thumbnailPreviewUrl={thumbnailPreviewUrl}
            showPreviewContent={showPreviewContent}
          />

          {mode === "edit" ? (
            <BlogFormStats
              views={userStats.views}
              rating={userStats.rating}
              comments={userStats.comments}
            />
          ) : null}
        </aside>
      </form>
    </section>
  );
}
