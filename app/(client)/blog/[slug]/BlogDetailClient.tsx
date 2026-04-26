"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useEffect, useCallback } from "react";
import BlogCategoryBar from "../components/BlogCategoryBar";
import CommentSection from "../../products/product-comment/Commentsection";
import { getComments, getReplies, postComment } from "../../products/_lib";
import type { Comment } from "../../products/product-comment/Productreview";
import { BlogDetail } from "../types/blog.type";

type Props = {
  blog: BlogDetail;
};

type FontSize = "small" | "base" | "large";

const articleClassMap: Record<FontSize, string> = {
  small: "text-[14px] leading-[1.75]",
  base: "text-[16px] leading-[1.85]",
  large: "text-[18px] leading-[1.95]",
};

function stripHtml(value: string): string {
  return value
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function createExcerptFromHtml(value: string, maxLength = 220): string {
  const plain = stripHtml(value);
  if (!plain) return "";
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength).trim()}...`;
}

function extractHeadingList(html: string, limit = 10): string[] {
  const matches = html.match(/<h[1-3][^>]*>[\s\S]*?<\/h[1-3]>/gi) ?? [];

  return matches
    .map((item) => stripHtml(item))
    .filter(Boolean)
    .slice(0, limit);
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Vừa đăng";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function BlogDetailClient({ blog }: Props) {
  const [fontSize, setFontSize] = useState<FontSize>("base");

  const contentSections = useMemo(
    () => extractHeadingList(blog.content),
    [blog.content]
  );

  const excerpt = useMemo(
    () => createExcerptFromHtml(blog.content),
    [blog.content]
  );

  const articleHtml = blog.content?.trim()
    ? blog.content
    : "<p>Nội dung bài viết đang được cập nhật.</p>";

  const publishedAtLabel = formatDateTime(blog.publishedAt || blog.createdAt);

  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  const fetchComments = useCallback(async () => {
    setLoadingComments(true);
    try {
      const result = await getComments("BLOG", blog.id);
      setComments(result?.data ?? []);
    } catch (error) {
      console.error("Lỗi khi lấy bình luận blog:", error);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  }, [blog.id]);

  const fetchReplies = useCallback(async (commentId: string) => {
    try {
      const result = await getReplies(commentId);
      const replies = result?.data ?? [];
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, replies, _repliesCount: replies.length } : c,
        ),
      );
    } catch (error) {
      console.error("Lỗi khi lấy replies:", error);
    }
  }, []);

  const handleCommentSubmit = useCallback(
    async (content: string) => {
      const response = await postComment({
        content,
        targetType: "BLOG",
        targetId: blog.id,
      });
      await fetchComments();
      return response?.data;
    },
    [blog.id, fetchComments],
  );

  const handleReplySubmit = useCallback(
    async (parentId: string, content: string) => {
      const response = await postComment({
        content,
        targetType: "BLOG",
        targetId: blog.id,
        parentId,
      });
      await fetchReplies(parentId);
      return response?.data;
    },
    [blog.id, fetchReplies],
  );

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return (
    <main className="mx-auto max-w-[1240px] px-4 py-8 lg:px-6">
      <div className="mb-6 text-[13px] text-primary-light">
        <Link href="/" className="hover:text-primary">
          Trang chủ
        </Link>{" "}
        /{" "}
        <Link href="/blog" className="hover:text-primary">
          Tin tức
        </Link>{" "}
        {blog.category?.name ? (
          <>
            /{" "}
            <Link
              href={`/blog?category=${blog.category.slug}&page=1`}
              className="hover:text-primary"
            >
              {blog.category.name}
            </Link>{" "}
          </>
        ) : null}
        /{" "}
        <span className="text-primary line-clamp-1 inline-block align-bottom">
          {blog.title}
        </span>
      </div>

      <section className="mb-8">
        <BlogCategoryBar
          active={blog.category?.slug}
          className="gap-5 border-b border-neutral pb-2 text-[14px]"
          itemClassName="pb-1 font-medium"
        />
      </section>

      <section className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="overflow-hidden rounded-xl bg-neutral-light lg:col-span-5">
          <div className="relative aspect-[5/4] w-full">
            <Image
              src={blog.thumbnail || "/images/avatar.png"}
              alt={blog.title}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 520px, 100vw"
            />
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="mb-2 text-[14px] text-primary-light">
            {blog.author.fullName || "Tác giả"} • {publishedAtLabel}
          </div>
          <h1 className="text-[34px] font-bold leading-[1.15] text-primary xl:text-[52px]">
            {blog.title}
          </h1>
          {excerpt ? (
            <p className="mt-4 max-w-[640px] text-[16px] leading-[1.7] text-primary-light">
              {excerpt}
            </p>
          ) : null}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <div className="sticky top-24">
            <div className="mb-3 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFontSize("small")}
                className={`rounded-md border px-3 py-1.5 text-[12px] font-semibold uppercase tracking-wide ${
                  fontSize === "small"
                    ? "border-primary bg-primary text-white"
                    : "border-neutral bg-white text-primary hover:border-primary-light"
                }`}
              >
                Nhỏ
              </button>
              <button
                type="button"
                onClick={() => setFontSize("base")}
                className={`rounded-md border px-3 py-1.5 text-[12px] font-semibold uppercase tracking-wide ${
                  fontSize === "base"
                    ? "border-primary bg-primary text-white"
                    : "border-neutral bg-white text-primary hover:border-primary-light"
                }`}
              >
                Vừa
              </button>
              <button
                type="button"
                onClick={() => setFontSize("large")}
                className={`rounded-md border px-3 py-1.5 text-[12px] font-semibold uppercase tracking-wide ${
                  fontSize === "large"
                    ? "border-primary bg-primary text-white"
                    : "border-neutral bg-white text-primary hover:border-primary-light"
                }`}
              >
                Lớn
              </button>
            </div>

            <div className="overflow-hidden rounded-md bg-[#f3f4f6] text-sm">
              <div className="border-b border-[#e5e7eb] px-4 py-3 font-semibold text-primary">
                Nội dung bài viết
              </div>
              <ul className="px-4 py-2">
                {(contentSections.length > 0
                  ? contentSections
                  : ["Nội dung chính đang được cập nhật."]
                ).map((item, index) => (
                  <li
                    key={`${blog.id}-${index}-${item}`}
                    className={`border-l py-2 pl-3 text-[13px] leading-5 ${
                      index === 0
                        ? "border-primary font-medium text-primary"
                        : "border-transparent text-primary-light"
                    }`}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        <article className={`lg:col-span-9 ${articleClassMap[fontSize]} text-primary`}>
          <div
            className="[&_h1]:mb-3 [&_h1]:text-[2.2em] [&_h1]:font-bold [&_h1]:leading-tight [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-[1.7em] [&_h2]:font-bold [&_h2]:leading-tight [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-[1.35em] [&_h3]:font-semibold [&_h3]:leading-tight [&_img]:my-5 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-xl [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-neutral [&_blockquote]:pl-4 [&_blockquote]:italic"
            dangerouslySetInnerHTML={{ __html: articleHtml }}
          />
        </article>
      </section>

      <section className="mt-12">
        <div className="bg-neutral-light rounded-xl p-6">
          <CommentSection
            productId={blog.id}
            comments={comments}
            loading={loadingComments}
            onCommentSubmit={handleCommentSubmit}
            onReplySubmit={handleReplySubmit}
            onFetchReplies={fetchReplies}
            title="Hãy để lại ý kiến của bạn"
            description="Bình luận của bạn sẽ giúp độc giả khác và tác giả cải thiện nội dung."
            placeholder="Viết bình luận của bạn..."
            submitLabel="Gửi bình luận"
          />
        </div>
      </section>
    </main>
  );
}
