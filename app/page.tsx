import { Hero } from "@/components/sections/Hero";
import { Features } from "@/components/sections/Features";
import { CatalogGallery } from "@/components/sections/CatalogGallery";
import { ProductShowcase } from "@/components/sections/ProductShowcase";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
      <CatalogGallery />
      <ProductShowcase />
    </main>
  );
}