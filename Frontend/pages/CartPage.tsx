
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const CartPage: React.FC = () => {
  const { cart, cartTotal, updateCartItemQuantity, removeFromCart } = useAppContext();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Your Shopping Cart</h1>
      {cart.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-md">
          <p className="text-xl text-gray-600">Your cart is empty.</p>
          <Link to="/" className="mt-6 inline-block bg-primary text-white font-semibold py-3 px-8 rounded-lg hover:bg-opacity-90 transition">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
            {cart.map(item => (
              <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex items-center border-b py-4 last:border-b-0">
                <img src={item.product.image} alt={item.product.name} className="w-24 h-24 object-cover rounded-md" />
                <div className="flex-grow ml-4">
                  <h2 className="font-semibold text-lg">{item.product.name}</h2>
                  <p className="text-sm text-gray-500">Size: {item.size}, Color: {item.color}</p>
                  <p className="text-md font-bold text-primary mt-1">${item.product.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center mx-4">
                  <button onClick={() => updateCartItemQuantity(item.product.id, item.size, item.color, item.quantity - 1)} className="px-3 py-1 border rounded-l-md">-</button>
                  <span className="px-4 py-1 border-t border-b">{item.quantity}</span>
                  <button onClick={() => updateCartItemQuantity(item.product.id, item.size, item.color, item.quantity + 1)} className="px-3 py-1 border rounded-r-md">+</button>
                </div>
                <div className="text-right w-24 font-semibold">${(item.product.price * item.quantity).toFixed(2)}</div>
                <button onClick={() => removeFromCart(item.product.id, item.size, item.color)} className="ml-4 text-gray-500 hover:text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            ))}
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md h-fit">
            <h2 className="text-xl font-semibold mb-4 border-b pb-4">Order Summary</h2>
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Shipping</span>
              <span>FREE</span>
            </div>
            <div className="flex justify-between font-bold text-xl mt-4 pt-4 border-t">
              <span>Total</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <button onClick={() => navigate('/checkout')} className="mt-6 w-full bg-secondary text-black font-bold py-3 rounded-lg hover:bg-opacity-80 transition">
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
