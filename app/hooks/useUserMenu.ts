import { useState, useEffect, useRef } from "react";

export const useUserMenu = () => {
   const [showUserMenu, setShowUserMenu] = useState(false);
   const userMenuRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (
            userMenuRef.current &&
            !userMenuRef.current.contains(event.target as Node)
         ) {
            setShowUserMenu(false);
         }
      };

      if (showUserMenu) {
         document.addEventListener("mousedown", handleClickOutside);
      }

      return () => {
         document.removeEventListener("mousedown", handleClickOutside);
      };
   }, [showUserMenu]);

   return { showUserMenu, setShowUserMenu, userMenuRef };
};
