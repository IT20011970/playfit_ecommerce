
import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const AdminLayout: React.FC = () => {
  const { logout } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const linkClasses = "flex items-center px-4 py-2 text-gray-100 hover:bg-gray-700 rounded-md transition-colors";
  const activeLinkClasses = "bg-primary";

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-gray-800 text-white flex-shrink-0 p-4">
        <div className="text-2xl font-bold mb-8">Admin Panel</div>
        <nav className="space-y-2">
          <NavLink to="/admin/dashboard" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>Dashboard</NavLink>
          <NavLink to="/admin/products" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>Products</NavLink>
          <NavLink to="/admin/orders" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>Orders</NavLink>
          <button onClick={handleLogout} className={`${linkClasses} w-full text-left mt-8`}>
            Logout
          </button>
        </nav>
      </aside>
      <main className="flex-1 p-6 md:p-10">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
