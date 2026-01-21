import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastyProvider } from "./components/Toast";
import Example1 from "./components/Modal/test";
import FullFeaturedSlider from "./components/Slider/test";
import Example from "./components/Toast/test";
import Example11 from "./components/Modal/test";
const geistSans = Geist({
   variable: "--font-geist-sans",
   subsets: ["latin"],
});

const geistMono = Geist_Mono({
   variable: "--font-geist-mono",
   subsets: ["latin"],
});

export const metadata: Metadata = {
   title: "Trang chủ ChoCongNghe",
   description: "Đang phát triển",
};

// function LayoutContent({ children }: { children: React.ReactNode }) {
//    const { user, showWelcome, setShowWelcome } = useAuth();

//    return (
//       <>
//          {showWelcome && user && (
//             <WelcomeAnimation
//                userName={user.fullName}
//                onComplete={() => setShowWelcome(false)}
//             />
//          )}
//          {children}
//       </>
//    );
// }

export default function RootLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <html lang="vi" suppressHydrationWarning>
         <head>
            <meta name="color-scheme" content="light dark" />
         </head>
         <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
         >
            <ToastyProvider>
               <AuthProvider>
                  {/* <LayoutContent> */}
                  {children}
                  {/* </LayoutContent> */}
               </AuthProvider>
            </ToastyProvider>
         </body>
      </html>
   );
}
