"use client";

import { memo } from "react";
import { CartIcon } from "@/(client)/cart/components/CartIcon";
import CategoryMegaMenu from "./CategoryMegaMenu";
import SearchBar from "./SearchBar";
import NotificationBell from "@/components/ui/NotificationBell";
import HeaderLogo from "@/components/generalSettings/HeaderLogo";
import { CompareButton } from "./CompareButton";
import { UserMenuButton } from "./UserMenuButton";

const DesktopHeader = memo(() => {
  return (
    <div className="desktop-header-row hidden md:flex items-center justify-between gap-4 lg:gap-4 relative">
      <HeaderLogo />
      <CategoryMegaMenu />
      <div className="flex-1 max-w-2xl relative">
        <SearchBar />
      </div>
      <div className="flex items-center gap-1">
        <CompareButton />
        <NotificationBell variant="user" />
        <CartIcon />
        <UserMenuButton />
      </div>
    </div>
  );
});

DesktopHeader.displayName = "DesktopHeader";

export default DesktopHeader;
