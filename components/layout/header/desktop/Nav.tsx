"use client";

import { memo } from "react";
import CartIcon from "@/components/ui/CartIcon";
import CategoryMegaMenu from "./CategoryMegaMenu";
import SearchBar from "@/components/layout/header/search/SearchBar";
import NotificationBell from "@/components/ui/NotificationBell";
import HeaderLogo from "@/components/general/HeaderLogo";
import CompareButton from "@/components/layout/actions/CompareButton";
import UserMenuButton from "@/components/layout/actions/UserMenuButton";

const DesktopNav = memo(() => {
  return (
    <div className="desktop-header-row hidden md:flex items-center justify-between gap-4 lg:gap-4 relative">
      <HeaderLogo />
      <CategoryMegaMenu />
      <div className="flex-1 max-w-2xl flex flex-col gap-0.5">
        <SearchBar />
      </div>
      <div className="flex items-center gap-2">
        <CompareButton />
        <NotificationBell variant="user" />
        <CartIcon />
        <UserMenuButton />
      </div>
    </div>
  );
});

DesktopNav.displayName = "DesktopNav";

export default DesktopNav;
