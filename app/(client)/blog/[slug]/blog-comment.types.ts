export interface BlogCommentUser {
  id: string;
  fullName: string;
  email?: string;
  avatarImage?: string;
}

export interface BlogReply {
  id: string;
  userId: string;
  content: string;
  targetType: string;
  targetId: string;
  isApproved: boolean;
  createdAt: string;
  user: BlogCommentUser;
  replies?: BlogReply[];
  _repliesCount?: number;
  parentId?: string;
}

export interface BlogComment {
  id: string;
  userId: string;
  content: string;
  targetType: "BLOG";
  targetId: string;
  isApproved: boolean;
  createdAt: string;
  user: BlogCommentUser;
  replies?: BlogReply[];
  _repliesCount?: number;
  parentId?: string;
}

export function buildBlogCommentTree(flatList: BlogComment[]): BlogComment[] {
  const map = new Map<string, BlogComment>();
  const roots: BlogComment[] = [];

  flatList.forEach((item) => {
    map.set(item.id, { ...item, replies: [], _repliesCount: 0 });
  });

  flatList.forEach((item) => {
    const node = map.get(item.id);
    if (!node) return;

    if (item.parentId && map.has(item.parentId)) {
      const parent = map.get(item.parentId);
      if (!parent) return;
      parent.replies = [...(parent.replies ?? []), node];
      parent._repliesCount = (parent._repliesCount ?? 0) + 1;
      return;
    }

    roots.push(node);
  });

  return roots;
}
