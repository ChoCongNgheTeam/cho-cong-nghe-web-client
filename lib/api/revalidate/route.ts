import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

// POST /api/revalidate
// BE gọi endpoint này ngay sau khi mutation (promotion/product/campaign/...)
// để invalidate cache Home ngay lập tức, thay vì đợi hết `revalidate` window.
//
// Body: { tags: string[] }
// Header bắt buộc: Authorization: Bearer <FE_REVALIDATE_SECRET>

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${process.env.FE_REVALIDATE_SECRET}`;

  if (!process.env.FE_REVALIDATE_SECRET || authHeader !== expected) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const tags: unknown = body?.tags;

  if (!Array.isArray(tags) || tags.length === 0 || !tags.every((t) => typeof t === "string")) {
    return NextResponse.json({ message: "Body phải có dạng { tags: string[] }" }, { status: 400 });
  }

  for (const tag of tags) {
    revalidateTag(tag);
  }

  return NextResponse.json({ revalidated: true, tags });
}
