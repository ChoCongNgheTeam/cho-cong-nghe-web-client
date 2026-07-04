import type { NavGroup } from "./types";

export function isItemActive(pathname: string, href: string, allHrefs: Set<string>): boolean {
  if (pathname === href) return true;
  if (pathname.startsWith(href + "/")) {
    const hasMoreSpecificMatch = [...allHrefs].some((other) => other !== href && other.startsWith(href) && pathname.startsWith(other));
    return !hasMoreSpecificMatch;
  }
  return false;
}

export function isGroupActive(group: NavGroup, pathname: string, allHrefs: Set<string>): boolean {
  return group.items.some((i) => isItemActive(pathname, i.href, allHrefs));
}
