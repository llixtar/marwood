import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdminShortcut } from "@/components/AdminShortcut";

export const metadata: Metadata = {
  title: "Marwood | Ексклюзивна білизна",
  description: "Інтернет-магазин жіночої білизни Marwood",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body className="antialiased min-h-screen flex flex-col">
        <AdminShortcut />
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}