
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';
import { HeroCarousel } from '../components/HeroCarousel';
import { SearchIcon } from '../components/icons/SearchIcon';

interface CategoryPageProps {
  category: 'Men' | 'Women' | 'Kids' | 'Accessories';
}

const CategoryPage: React.FC<CategoryPageProps> = ({ category }) => {
  const { products } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');

  const categoryProducts = useMemo(() => {
    return products.filter(product =>
      product.category.toLowerCase() === category.toLowerCase()
    );
  }, [products, category]);

  const filteredProducts = useMemo(() => {
    return categoryProducts.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categoryProducts, searchTerm]);

  const categoryColors: Record<string, string> = {
    Men: 'bg-blue-600',
    Women: 'bg-pink-600',
    Kids: 'bg-purple-600',
    Accessories: 'bg-green-600'
  };

  const categoryDescriptions: Record<string, string> = {
    Men: 'Discover premium sportswear designed for peak performance',
    Women: 'Elevate your workout with stylish and functional activewear',
    Kids: 'Quality sportswear for young athletes to play and grow',
    Accessories: 'Complete your look with essential sport accessories'
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <HeroCarousel initialCategory={category} />

      {/* Products Section */}
      <section id="products">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">{category} Products</h2>
            <p className="text-gray-600">{categoryProducts.length} products available</p>
          </div>
          <div className="relative w-full md:w-1/3 mt-4 md:mt-0">
            <input
              type="text"
              placeholder="Search products..."
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
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-2">
              {searchTerm
                ? 'No products found matching your search.'
                : `No products available in ${category} category yet.`}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-primary hover:underline mt-2"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default CategoryPage;
