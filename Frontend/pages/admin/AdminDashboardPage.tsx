import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const AdminDashboardPage: React.FC = () => {
  const { orders, products, seedProducts } = useAppContext();
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedProducts = async () => {
    if (window.confirm('This will seed the database with initial product data. Continue?')) {
      setIsSeeding(true);
      try {
        await seedProducts();
        alert('Products seeded successfully!');
      } catch (error) {
        alert('Error seeding products. Check console for details.');
      } finally {
        setIsSeeding(false);
      }
    }
  };

  // Fixed: Use totalAmount instead of total
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  
  // Fixed: Use productId instead of product.id
  const topSellingProducts = [...products]
    .sort((a, b) => {
        const salesA = orders.flatMap(o => o.items || []).filter(i => i.productId === a.id).reduce((sum, i) => sum + i.quantity, 0);
        const salesB = orders.flatMap(o => o.items || []).filter(i => i.productId === b.id).reduce((sum, i) => sum + i.quantity, 0);
        return salesB - salesA;
    })
    .slice(0, 5);
  const lowStockProducts = products.filter(p => p.stock < 10);

  const StatCard = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
      <div className="bg-primary text-white p-4 rounded-full mr-4">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        {products.length === 0 && (
          <button
            onClick={handleSeedProducts}
            disabled={isSeeding}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSeeding ? 'Seeding Products...' : 'Seed Initial Products'}
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>} />
        <StatCard title="Total Orders" value={orders.length} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
        <StatCard title="Total Products" value={products.length} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Top Selling Products</h2>
            <ul>
                {topSellingProducts.map(p => <li key={p.id} className="border-b last:border-0 py-2">{p.name}</li>)}
            </ul>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Low Stock Alerts</h2>
            {lowStockProducts.length > 0 ? (
                 <ul>
                    {lowStockProducts.map(p => 
                        <li key={p.id} className="border-b last:border-0 py-2 flex justify-between">
                            <span>{p.name}</span>
                            <span className="font-bold text-red-500">{p.stock} left</span>
                        </li>
                    )}
                </ul>
            ) : <p className="text-gray-500">No products with low stock.</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;