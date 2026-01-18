export interface HeaderTopProps {
   isAuthenticated: boolean;
}

export interface DesktopHeaderProps {
   searchQuery: string;
   isDarkMode: boolean;
   isAuthenticated: boolean;
   user: any;
   showUserMenu: boolean;
   userMenuRef: React.RefObject<HTMLDivElement | null>;
   onSearchChange: (query: string) => void;
   onUserMenuToggle: () => void;
   onUserMenuClose: () => void;
   onLogout: () => void;
}

export interface MobileHeaderProps {
   mobileMenuOpen: boolean;
   mobileSearchOpen: boolean;
   searchQuery: string;
   isDarkMode: boolean;
   onMenuToggle: () => void;
   onSearchToggle: () => void;
   onSearchChange: (query: string) => void;
}
