import apiRequest from "@/lib/api";

export type TrashResource =
   | "categories"
   | "products"
   | "brands"
   | "users"
   | "blogs"
   | "comments"
   | "reviews"
   | "promotions"
   | "vouchers";

export interface TrashItem {
   id: string;
   name?: string;
   // users
   fullName?: string;
   userName?: string;
   email?: string;
   // orders
   orderCode?: string;
   // blogs
   title?: string;
   // comments / reviews
   content?: string;
   rating?: number;
   // promotions / vouchers
   code?: string;
   slug?: string;
   deletedAt?: string;
   [key: string]: any;
}

export interface PaginationInfo {
   page: number;
   limit: number;
   total: number;
   totalPages: number;
}

interface RawTrashResponse {
   data: TrashItem[];
   pagination?: PaginationInfo;
   meta?: PaginationInfo;
   message: string;
}

export interface TrashResponse {
   data: TrashItem[];
   pagination: PaginationInfo;
   message: string;
}

export interface GetTrashParams {
   resource: TrashResource;
   page?: number;
   limit?: number;
   search?: string;
}

export const DEFAULT_PAGINATION: PaginationInfo = {
   page: 1,
   limit: 20,
   total: 0,
   totalPages: 0,
};

export const getTrash = async ({
   resource,
   page = 1,
   limit = 20,
   search,
}: GetTrashParams): Promise<TrashResponse> => {
   const raw = await apiRequest.get<RawTrashResponse>(
      `/${resource}/admin/trash`,
      {
         params: {
            page: Number(page),
            limit: Number(limit),
            ...(search ? { search } : {}),
         },
      },
   );

   return {
      data: raw.data ?? [],
      pagination: raw.pagination ?? raw.meta ?? DEFAULT_PAGINATION,
      message: raw.message,
   };
};

export const restoreTrashItem = async (
   resource: TrashResource,
   id: string,
): Promise<{ message: string }> => {
   return apiRequest.post<{ message: string }>(
      `/${resource}/admin/${id}/restore`,
   );
};

export const getItemDisplayName = (
   item: TrashItem,
   resource: TrashResource,
): string => {
   switch (resource) {
      case "users":
         return item.fullName || item.userName || item.email || item.id;
      case "blogs":
         return item.title || item.name || item.id;
      case "comments":
      case "reviews":
         return item.content
            ? item.content.slice(0, 40) + (item.content.length > 40 ? "…" : "")
            : item.id;
      case "promotions":
      case "vouchers":
         return item.name || item.code || item.id;
      default:
         return item.name || item.id;
   }
};

export const getItemSubInfo = (
   item: TrashItem,
   resource: TrashResource,
): string | null => {
   switch (resource) {
      case "users":
         return item.email ?? null;
      case "blogs":
         return item.slug ?? null;
      case "reviews":
         return item.rating ? `${item.rating} ★` : null;
      case "promotions":
      case "vouchers":
         return item.code ?? null;
      default:
         return item.slug ?? null;
   }
};
