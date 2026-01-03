
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { orderService } from '../../graphql/orderService';

interface OrderItem {
  id: number;
  productName: string;
  productPrice: number;
  productImage: string;
  quantity: number;
  size: string;
  color: string;
}

interface Order {
  id: number;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  totalAmount: number;
  status: string;
  trackingId?: string;
  shippedBy?: string;
  createdAt: string;
  items: OrderItem[];
}

const AdminOrdersPage: React.FC = () => {
  const { currentUser } = useAppContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isShipping, setIsShipping] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const allOrders = await orderService.getAllOrders();
      setOrders(allOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShipOrder = async (order: Order) => {
    if (!trackingNumber.trim()) {
      alert('Please enter a tracking ID');
      return;
    }

    if (!currentUser) {
      alert('You must be logged in as admin');
      return;
    }

    try {
        await orderService.shipOrder({
          orderId: Number(order.id) || parseInt(String(order.id), 10),
          trackingId: trackingNumber.trim(),
          shippedByAdmin: currentUser.email || currentUser.name,
        });
            
      alert('Order shipped successfully!');
      setSelectedOrder(null);
      setTrackingNumber('');
      await fetchOrders();
    } catch (error) {
      console.error('Error shipping order:', error);
      alert('Failed to ship order');
    } finally {
      setIsShipping(false);
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-yellow-100 text-yellow-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading orders...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Orders</h1>
      
      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500">No orders found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Order ID</th>
                <th scope="col" className="px-6 py-3">Customer</th>
                <th scope="col" className="px-6 py-3">Email</th>
                <th scope="col" className="px-6 py-3">Date</th>
                <th scope="col" className="px-6 py-3">Total</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Tracking</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono">#{order.id}</td>
                  <td className="px-6 py-4">{order.customerName}</td>
                  <td className="px-6 py-4">{order.customerEmail}</td>
                  <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-semibold">${order.totalAmount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {order.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {order.trackingId ? (
                      <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                        {order.trackingId}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {order.status.toLowerCase() === 'pending' && (
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-yellow-600 hover:underline text-xs font-medium"
                      >
                        Ship Order
                      </button>
                    )}
                    {order.status.toLowerCase() === 'shipped' && (
                      <span className="text-xs text-green-600">
                        Shipped by {order.shippedBy}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Ship Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">Ship Order #{selectedOrder.id}</h2>
            
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <p className="text-sm"><strong>Customer:</strong> {selectedOrder.customerName}</p>
              <p className="text-sm"><strong>Address:</strong> {selectedOrder.customerAddress}</p>
              <p className="text-sm"><strong>Total:</strong> ${selectedOrder.totalAmount.toFixed(2)}</p>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2">Order Items:</h3>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {selectedOrder.items.map(item => (
                  <div key={item.id} className="text-xs p-2 bg-gray-50 rounded">
                    <span className="font-medium">{item.productName}</span> - 
                    <span> {item.quantity}x ${item.productPrice.toFixed(2)}</span>
                    <span className="text-gray-500"> ({item.size}, {item.color})</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Tracking Number</label>
              <input 
                type="text"
                value={trackingNumber}
                onChange={e => setTrackingNumber(e.target.value)}
                className="border rounded-md w-full px-3 py-2"
                placeholder="Enter tracking number"
                required
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedOrder(null);
                  setTrackingNumber('');
                }}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                disabled={isShipping}
              >
                Cancel
              </button>
              <button
                onClick={() => handleShipOrder(selectedOrder)}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
                disabled={isShipping || !trackingNumber.trim()}
              >
                {isShipping ? 'Shipping...' : 'Ship Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;

