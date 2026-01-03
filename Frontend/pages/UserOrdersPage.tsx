import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';

const UserOrdersPage: React.FC = () => {
  const { orders, currentUser } = useAppContext();

  // Filter orders to show only current user's orders (safety check)
  const userOrders = currentUser?.role === 'admin' 
    ? orders.filter(order => order.userId === currentUser.id)
    : orders;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'SHIPPED':
        return 'bg-green-100 text-green-800';
      case 'DELIVERED':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      
      {userOrders.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
          <Link to="/" className="text-primary hover:underline">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {userOrders.map((order) => (
            <div key={order.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Order #{order.id}</h2>
                  <p className="text-gray-600 text-sm">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold mb-2">Items:</h3>
                <div className="space-y-2">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>
                        {item.productName} x {item.quantity}
                        {item.size && ` (Size: ${item.size})`}
                        {item.color && ` (Color: ${item.color})`}
                      </span>
                      <span className="font-medium">${(item.productPrice * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 mt-4 pt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Delivery Address:</p>
                    <p className="text-sm">{order.customerAddress}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total Amount:</p>
                    <p className="text-2xl font-bold text-primary">${order.totalAmount.toFixed(2)}</p>
                  </div>
                </div>

                {order.trackingId && (
                  <div className="mt-4 bg-green-50 p-3 rounded-md">
                    <p className="text-sm font-medium text-green-800">
                      Tracking ID: <span className="font-bold">{order.trackingId}</span>
                    </p>
                    {order.shippedBy && (
                      <p className="text-xs text-green-700 mt-1">
                        Shipped by: {order.shippedBy}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserOrdersPage;
