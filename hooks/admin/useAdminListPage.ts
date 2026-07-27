"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

export interface AdminListMeta {
  page: number;
  totalPages: number;
  total: number;
}

export interface AdminListFetchResult<T, Meta extends AdminListMeta = AdminListMeta> {
  data: T[];
  meta: Meta;
}

interface BaseFetchParams<SortByT extends string> {
  page: number;
  limit: number;
  search?: string;
  sortBy: SortByT;
  sortOrder: "asc" | "desc";
}

interface UseAdminListPageOptions<T, SortByT extends string, ExtraParams extends object, Meta extends AdminListMeta> {
  /** Hàm gọi API danh sách — nhận params chuẩn (page/limit/search/sortBy/sortOrder) + extraParams đặc thù module */
  fetchFn: (params: BaseFetchParams<SortByT> & ExtraParams) => Promise<AdminListFetchResult<T, Meta>>;
  defaultSortBy: SortByT;
  defaultSortOrder?: "asc" | "desc";
  defaultPageSize?: number;
  /** Filter đặc thù từng module (activeTab, dateFrom, dateTo, typeFilter...).
   * Hook không biết hình dạng cụ thể — chỉ ghép thẳng vào params khi fetch.
   * Đổi giá trị của object này (vd đổi tab) sẽ tự trigger refetch + reset trang. */
  extraParams?: ExtraParams;
  /** Lấy id duy nhất của 1 dòng, dùng cho chọn nhiều dòng (checkbox) */
  getId: (row: T) => string;
  /** Meta mặc định khi chưa fetch lần nào — bắt buộc vì mỗi module có shape Meta khác nhau (activeCounts, statusCounts...) */
  defaultMeta: Meta;
}

const EMPTY_EXTRA_PARAMS = {} as const;

export function useAdminListPage<T, SortByT extends string = string, ExtraParams extends object = Record<string, never>, Meta extends AdminListMeta = AdminListMeta>({
  fetchFn,
  defaultSortBy,
  defaultSortOrder = "asc",
  defaultPageSize = 20,
  extraParams,
  getId,
  defaultMeta,
}: UseAdminListPageOptions<T, SortByT, ExtraParams, Meta>) {
  const [data, setData] = useState<T[]>([]);
  const [meta, setMeta] = useState<Meta>(defaultMeta);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortByT>(defaultSortBy);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(defaultSortOrder);

  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Đếm để trigger refetch thủ công (nút "Làm mới") — refetch() chỉ tăng số
  // này lên, effect bên dưới tự chạy lại. Không expose lại chính function
  // fetch để gọi trực tiếp từ effect (tránh warning "set-state-in-effect"
  // do linter không lần được vào bên trong 1 function tham chiếu ngoài).
  const [refreshTick, setRefreshTick] = useState(0);

  const resetPage = useCallback(() => setPage(1), []);

  const resolvedExtraParams = extraParams ?? (EMPTY_EXTRA_PARAMS as ExtraParams);
  // Deps array chỉ chấp nhận "simple expression" — memo hoá JSON key riêng
  // thay vì gọi JSON.stringify(...) trực tiếp trong mảng dependency.
  const extraParamsKey = useMemo(() => JSON.stringify(resolvedExtraParams), [resolvedExtraParams]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);
      try {
        const params = {
          page,
          limit: pageSize,
          search: search || undefined,
          sortBy,
          sortOrder,
          ...resolvedExtraParams,
        } as BaseFetchParams<SortByT> & ExtraParams;

        const res = await fetchFn(params);
        if (cancelled) return;
        setData(res.data);
        setMeta(res.meta);
      } catch (err: unknown) {
        if (cancelled) return;
        setError((err as Error)?.message ?? "Không thể tải dữ liệu");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    setSelected(new Set());

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, search, sortBy, sortOrder, extraParamsKey, fetchFn, refreshTick]);

  const refetch = useCallback(() => setRefreshTick((t) => t + 1), []);

  const toggleOne = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected((prev) => {
      const allChecked = data.length > 0 && data.every((row) => prev.has(getId(row)));
      const next = new Set(prev);
      if (allChecked) data.forEach((row) => next.delete(getId(row)));
      else data.forEach((row) => next.add(getId(row)));
      return next;
    });
  }, [data, getId]);

  const clearSelection = useCallback(() => setSelected(new Set()), []);

  return {
    // data
    data,
    setData,
    meta,
    loading,
    error,
    setError,
    refetch,
    // paging
    page,
    setPage,
    pageSize,
    setPageSize,
    resetPage,
    // search
    search,
    setSearch,
    searchInput,
    setSearchInput,
    // sort
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    // selection
    selected,
    setSelected,
    toggleOne,
    toggleAll,
    clearSelection,
  };
}
