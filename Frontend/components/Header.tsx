
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ShoppingCartIcon } from './icons/ShoppingCartIcon';
import { UserIcon } from './icons/UserIcon';
import { OrdersIcon } from './icons/OrdersIcon';

const Header: React.FC = () => {
  const { cart, currentUser, isAdmin, logout } = useAppContext();
  const navigate = useNavigate();
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Helper function to extract username from email
  const getUsernameFromEmail = (email: string | undefined): string => {
    if (!email) return 'User';
    return email.split('@')[0];
  };

  return (
    <header className="bg-surface shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <Link to="/" className="text-3xl font-bold text-primary tracking-wider">
              PlayFit
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link to="/" className="text-gray-700 hover:bg-primary hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Home</Link>
              <Link to="/men" className="text-gray-700 hover:bg-primary hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Men</Link>
              <Link to="/women" className="text-gray-700 hover:bg-primary hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Women</Link>
              <Link to="/kids" className="text-gray-700 hover:bg-primary hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Kids</Link>
              <Link to="/accessories" className="text-gray-700 hover:bg-primary hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Accessories</Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {currentUser && (
              <Link to="/orders" className="relative text-gray-700 hover:text-primary transition-colors" title="My Orders">
                <OrdersIcon className="h-6 w-6" />
              </Link>
            )}
            
            <Link to="/cart" className="relative text-gray-700 hover:text-primary transition-colors">
              <ShoppingCartIcon className="h-6 w-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
            
            <div className="ml-4 flex items-center space-x-3">
              {currentUser ? (
                <>
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">Hi, {getUsernameFromEmail(currentUser.email)}</span>
                  {isAdmin && (
                     <Link to="/admin/dashboard" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">Admin</Link>
                  )}
                  <button onClick={handleLogout} className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">Logout</button>
                </>
              ) : (
                <Link to="/login" className="text-gray-700 hover:text-primary transition-colors">
                  <UserIcon className="h-6 w-6" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
