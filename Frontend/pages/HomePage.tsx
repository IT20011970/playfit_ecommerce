
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';
import { HeroCarousel } from '../components/HeroCarousel';
import { SearchIcon } from '../components/icons/SearchIcon';

const HomePage: React.FC = () => {
  const { products } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const newArrivals = useMemo(() => products.filter(p => p.isNewArrival).slice(0, 4), [products]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <HeroCarousel />

      {/* New Arrivals */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">New Arrivals</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {newArrivals.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* All Products */}
      <section id="products">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">All Products</h2>
          <div className="relative w-full md:w-1/3">
            <input
              type="text"
              placeholder="Search by name, brand, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-10">No products found matching your search.</p>
        )}
      </section>
    </div>
  );
};

export default HomePage;
