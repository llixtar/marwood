import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdminShortcut } from "@/components/AdminShortcut";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { QuickViewRoot } from "@/components/product/QuickViewRoot";

const inter = Inter({ 
  subsets: ["latin", "cyrillic"],
  variable: '--font-inter',
});

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  variable: '--font-montserrat',
});

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
    <html lang="uk" className={`${inter.variable} ${montserrat.variable}`}>
      <body className="antialiased min-h-screen flex flex-col font-sans">
        <AuthProvider>
          <AdminShortcut />
          <QuickViewRoot />
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}