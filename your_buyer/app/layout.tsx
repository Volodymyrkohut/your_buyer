import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LayoutWrapper } from "@/app/components/layout/LayoutWrapper";
import { CartProvider } from "@/app/contexts/CartContext";
import { UserProvider } from "@/app/contexts/UserContext";
import { WishlistProvider } from "@/app/contexts/WishlistContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KKrist - E-commerce Website",
  description: "Shop the latest fashion trends at KKrist",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserProvider>
          <CartProvider>
            <WishlistProvider>
              <LayoutWrapper>{children}</LayoutWrapper>
            </WishlistProvider>
          </CartProvider>
        </UserProvider>
      </body>
    </html>
  );
}
