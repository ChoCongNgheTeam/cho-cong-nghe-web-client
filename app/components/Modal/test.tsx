"use client";

import { useEffect, useState } from "react";
import Popzy from "./Popzy";
import { usePopzy } from "./usePopzy";

export default function Example11() {
   const modal = usePopzy();
   const [content, setContent] = useState("Loading...");

   useEffect(() => {
      if (modal.isOpen) {
         // Simulate API call
         setTimeout(() => {
            setContent("Dữ liệu đã tải xong!");
         }, 2000);
      } else {
         setContent("Loading...");
      }
   }, [modal.isOpen]);

   return (
      <>
         <button onClick={modal.open}>Tải dữ liệu</button>
         <Popzy
            isOpen={modal.isOpen}
            onClose={modal.close}
            content={<div className="text-center">{content}</div>}
         />
      </>
   );
}
