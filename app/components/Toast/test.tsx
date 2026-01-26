"use client";
import { useToasty } from "./ToastProvider";

export default function Example() {
   const toast = useToasty();
   return (
      <>
         <button
            onClick={() => {
               /// something...
               toast.info("ánhhsfdh", {
                  title: "Tên không tồn tại",
                  buttons: [
                     {
                        label: "View Cart",
                        onClick: () => {
                           window.location.href = "/cart";
                        },
                        variant: "primary",
                     },
                  ],
                  duration: 5000,
                  showProgress: true,
                  pauseOnHover: true,
               });
            }}
         >
            Upload
         </button>
      </>
   );
}
