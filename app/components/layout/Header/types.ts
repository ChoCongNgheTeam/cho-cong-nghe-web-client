export interface HeaderTopProps {
  isAuthenticated: boolean;
}

export interface LinkWithIconProps {
  href: string;
  icon: React.ReactNode;
  text: string;
  mobileText: string;
}

export interface DesktopHeaderProps {
  searchQuery: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    id: string;
    email: string;
    phone?: string;
    userName: string;
    fullName: string;
    role: string;
    avatarImage?: string;
    gender?: string;
    dateOfBirth?: string;
  } | null;
  onSearchChange: (value: string) => void;
  onLogout: () => void;
}

export interface MobileHeaderProps {
  mobileMenuOpen: boolean;
  mobileSearchOpen: boolean;
  searchQuery: string;
  onMenuToggle: () => void;
  onSearchToggle: () => void;
  onSearchChange: (query: string) => void;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  position: number;
  children: Category[];
}

export interface TrendingKeyword {
  id: string;
  name: string;
  slug: string;
  thumbnail: string;
  viewsCount: number;
  priceOrigin: number;
  isTrending: boolean;
}

export interface SearchProduct {
  id: string;
  name: string;
  slug: string;
  thumbnail: string;
  priceOrigin: number;
  inStock: boolean;
  price: { base: number; hasPromotion: boolean };
  rating: { average: number; count: number };
}
