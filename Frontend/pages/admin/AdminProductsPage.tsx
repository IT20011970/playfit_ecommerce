
import React, { useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { useNotificationContext } from '../../context/NotificationContext';

const AdminProductsPage: React.FC = () => {
  const { products, deleteProduct, currentUser } = useAppContext();
  const { notifications } = useNotificationContext();

  // Refresh products when inventory-related notifications are received
  const refreshProducts = useCallback(async () => {
    // Force refetch products from the server
    window.location.reload();
  }, []);

  useEffect(() => {
    // Check for inventory-related notifications
    const latestNotification = notifications[0];
    
    if (latestNotification) {
      const isInventoryNotification = 
        latestNotification.title?.includes('Product') ||
        latestNotification.title?.includes('Inventory') ||
        latestNotification.title?.includes('Stock');
      
      if (isInventoryNotification) {
        console.log('📦 Inventory notification received, refreshing products...');
        setTimeout(refreshProducts, 1000); // Small delay to ensure backend is updated
      }
    }
  }, [notifications, refreshProducts]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Products</h1>
        <Link
          to="/admin/products/new"
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90"
        >
          Add New Product
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Product Name</th>
              <th scope="col" className="px-6 py-3">Category</th>
              <th scope="col" className="px-6 py-3">Price</th>
              <th scope="col" className="px-6 py-3">Stock</th>
              <th scope="col" className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} className="bg-white border-b hover:bg-gray-50">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{product.name}</th>
                <td className="px-6 py-4">{product.category}</td>
                <td className="px-6 py-4">${product.price.toFixed(2)}</td>
                <td className="px-6 py-4">{product.stock}</td>
                <td className="px-6 py-4 space-x-2">
                  <Link to={`/admin/products/edit/${product.id}`} className="font-medium text-blue-600 hover:underline">Edit</Link>
                  <button onClick={() => window.confirm('Are you sure?') && deleteProduct(product.id)} className="font-medium text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProductsPage;
