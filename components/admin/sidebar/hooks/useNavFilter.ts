import { useMemo } from "react";
import type { NavGroup } from "../types";

// Bỏ dấu tiếng Việt để so khớp không phân biệt có dấu/không dấu
function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function useNavFilter(navGroups: NavGroup[], query: string) {
  const trimmed = query.trim();
  const isFiltering = trimmed.length > 0;

  const filteredGroups = useMemo(() => {
    if (!isFiltering) return navGroups;
    const normalizedQuery = normalize(trimmed);
    return navGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => normalize(item.title).includes(normalizedQuery)),
      }))
      .filter((group) => group.items.length > 0);
  }, [navGroups, isFiltering, trimmed]);

  return { filteredGroups, isFiltering };
}
