export type NavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
};

export type NavGroup = {
  label: string;
  icon: React.ElementType;
  items: NavItem[];
  /** Mở sẵn nhóm này khi load trang, bất kể có đang active hay không */
  defaultOpen?: boolean;
};
