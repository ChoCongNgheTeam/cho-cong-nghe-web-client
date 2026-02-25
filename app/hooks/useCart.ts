import {
   createContext,
   useContext,
   useState,
   useEffect,
   useCallback,
   ReactNode,
} from "react";
import { CartContext, CartContextValue } from "@/contexts/CartContext";
export function useCart(): CartContextValue {
   const ctx = useContext(CartContext);
   if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
   return ctx;
}
