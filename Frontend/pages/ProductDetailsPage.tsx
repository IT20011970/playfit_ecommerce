
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Product } from '../types';

const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { findProduct, addToCart, isLoggedIn } = useAppContext();
  const product: Product | undefined = id ? findProduct(id) : undefined;

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(product?.sizes[0] || '');
  const [selectedColor, setSelectedColor] = useState(product?.colors[0] || '');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold">Product not found</h2>
        <button onClick={() => navigate('/')} className="mt-4 px-6 py-2 bg-primary text-white rounded-lg">Go Home</button>
      </div>
    );
  }

  const handleAddToCart = async () => {
    setError('');
    setSuccess('');
    
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    if (product) {
      try {
        await addToCart(product, quantity, selectedSize, selectedColor);
        setSuccess('Added to cart successfully!');
        setTimeout(() => {
          navigate('/cart');
        }, 1000);
      } catch (err) {
        setError('Failed to add to cart. Please try again.');
        console.error('Add to cart error:', err);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <div>
          <img src={product.image} alt={product.name} className="w-full h-auto object-cover rounded-lg shadow-lg" />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{product.name}</h1>
          <p className="text-gray-500 mb-4">{product.category}</p>
          <p className="text-3xl font-bold text-primary mb-6">${product.price.toFixed(2)}</p>
          <p className="text-gray-700 leading-relaxed mb-6">{product.description}</p>
          
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Color</h3>
            <div className="flex items-center space-x-3">
              {product.colors.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`h-8 w-8 rounded-full border-2 ${selectedColor === color ? 'border-primary ring-2 ring-primary' : 'border-gray-300'}`}
                  style={{ backgroundColor: color.toLowerCase() }}
                >
                  <span className="sr-only">{color}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Size</h3>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 border rounded-md text-sm font-medium ${selectedSize === size ? 'bg-primary text-white border-primary' : 'bg-white text-gray-900 hover:bg-gray-50'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-4 mb-8">
            <h3 className="text-sm font-medium text-gray-900">Quantity</h3>
            <div className="flex items-center border rounded-md">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-1 text-lg">-</button>
              <span className="px-4 py-1">{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)} className="px-3 py-1 text-lg">+</button>
            </div>
          </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
          
            {success && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                {success}
              </div>
            )}

          <button
            onClick={handleAddToCart}
            className="w-full py-3 px-6 bg-secondary text-black font-bold text-lg rounded-lg hover:bg-opacity-80 transition-transform transform hover:scale-105"
          >
            Add to Cart
          </button>
          <p className="text-sm text-center mt-4 text-green-600">In Stock: {product.stock} items</p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
