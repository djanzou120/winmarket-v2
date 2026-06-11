import { Navbar } from '@/components/layout/navbar';
import { Hero } from '@/components/home/hero';
import { FeaturedProducts } from '@/components/home/featured-products';
import { Categories } from '@/components/home/categories';
import { Footer } from '@/components/layout/footer';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main id="main-content" role="main" className="focus:outline-none" tabIndex={-1}>
        <Hero />
        <Categories />
        <FeaturedProducts />
      </main>

      <Footer />
    </div>
  );
}