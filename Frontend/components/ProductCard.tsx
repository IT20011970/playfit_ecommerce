
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { useAppContext } from '../context/AppContext';
import { Modal } from './Modal';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, isLoggedIn } = useAppContext();
  const navigate = useNavigate();
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent any default behavior
    
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    
    setIsAdding(true);
    try {
      // For simplicity, add with default size and color
      await addToCart(product, 1, product.sizes[0], product.colors[0]);
      // Visual feedback - button will show "Added!" briefly
      setTimeout(() => setIsAdding(false), 1000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart. Please try again.');
      setIsAdding(false);
    }
  };

  return (
    <>
      <div className="bg-surface rounded-lg shadow-lg overflow-hidden group transform hover:-translate-y-2 transition-transform duration-300 ease-in-out">
        <div className="relative">
          <Link to={`/product/${product.id}`}>
            <img className="h-64 w-full object-cover" src={product.image} alt={product.name} />
          </Link>
          <div className="absolute top-2 right-2">
            <button
              onClick={() => setIsZoomModalOpen(true)}
              className="bg-white bg-opacity-75 rounded-full p-2 text-gray-700 hover:bg-opacity-100 hover:text-primary transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
            </button>
          </div>
          {product.isNewArrival && (
            <span className="absolute top-2 left-2 bg-accent text-white text-xs font-bold px-2 py-1 rounded">NEW</span>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 truncate group-hover:text-primary">
            <Link to={`/product/${product.id}`}>{product.name}</Link>
          </h3>
          <p className="text-gray-500 text-sm mt-1">{product.category}</p>
          <div className="flex justify-between items-center mt-4">
            <p className="text-xl font-bold text-primary">${product.price.toFixed(2)}</p>
            <button
              onClick={handleAddToCart}
                disabled={isAdding}
                className="px-4 py-2 bg-secondary text-black font-semibold rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isAdding ? 'Added!' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
      <Modal isOpen={isZoomModalOpen} onClose={() => setIsZoomModalOpen(false)}>
        <img src={product.image} alt={product.name} className="max-w-full max-h-[80vh] object-contain" />
      </Modal>
    </>
  );
};
