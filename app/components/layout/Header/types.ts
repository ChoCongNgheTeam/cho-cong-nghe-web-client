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
