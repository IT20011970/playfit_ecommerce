
import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { orderService } from '../graphql/orderService';

interface Order {
  id: number;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  totalAmount: number;
  status: string;
  trackingId?: string;
  createdAt: string;
  items: {
    id: number;
    productName: string;
    productPrice: number;
    productImage: string;
    quantity: number;
    size: string;
    color: string;
  }[];
}

const OrderConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { orders } = useAppContext();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      
      // Get message from navigation state if available
      const stateMessage = location.state?.message;
      if (stateMessage) {
        setMessage(stateMessage);
      }

      // First, check if order is already in orders array
      const orderId = id ? parseInt(id, 10) : null;
      if (orderId) {
        const foundOrder = orders.find(o => o.id === orderId);
        if (foundOrder) {
          setOrder(foundOrder);
          setLoading(false);
          return;
        }

        // If not found, retry fetching from API with delays
        let retries = 3;
        let delay = 1000; // Start with 1 second
        
        while (retries > 0 && !order) {
          try {
            console.log(`Fetching order ${orderId}, retries left: ${retries}`);
            const fetchedOrder = await orderService.getOrderById(orderId);
            if (fetchedOrder) {
              setOrder(fetchedOrder);
              setLoading(false);
              return;
            }
          } catch (error) {
            console.error(`Error fetching order (attempt ${4 - retries}):`, error);
          }
          
          retries--;
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // Exponential backoff
          }
        }
      }
      
      setLoading(false);
    };

    fetchOrderDetails();
  }, [id, orders, location.state]);

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
        </div>
        <p className="text-gray-600 mt-4">Processing your order...</p>
        {message && <p className="text-blue-600 mt-2">{message}</p>}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
        <p className="text-gray-600 mb-4">Your order is being processed. Please check back in a moment.</p>
        <Link to="/" className="inline-block bg-primary text-white py-2 px-4 rounded">Go Home</Link>
      </div>
    );
  }
  
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 className="text-3xl font-bold mt-4">Thank you for your order!</h1>
        <p className="text-gray-600 mt-2">Your order has been placed successfully.</p>
        <p className="text-gray-600 mt-1">An email confirmation has been sent to <span className="font-semibold">{order.customerEmail}</span>.</p>
        
        <div className="text-left bg-gray-50 p-6 rounded-lg my-8 border">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <p className="mb-2"><strong>Order ID:</strong> #{order.id}</p>
          <p className="mb-2"><strong>Status:</strong> <span className="text-blue-600 capitalize">{order.status}</span></p>
          <p className="mb-2"><strong>Estimated Delivery:</strong> {estimatedDelivery.toDateString()}</p>
          <div className="border-t my-4"></div>
          {order.items.map(item => (
            <div key={item.id} className="flex justify-between items-center mb-3">
              <div>
                <p className="font-medium">{item.productName} x{item.quantity}</p>
                <p className="text-sm text-gray-500">Size: {item.size}, Color: {item.color}</p>
              </div>
              <p className="font-semibold">${(item.productPrice * item.quantity).toFixed(2)}</p>
            </div>
          ))}
          <div className="border-t my-4"></div>
          <div className="flex justify-between font-bold text-lg">
            <p>Total</p>
            <p>${order.totalAmount.toFixed(2)}</p>
          </div>
        </div>

        <Link to="/" className="inline-block bg-primary text-white font-semibold py-3 px-8 rounded-lg hover:bg-opacity-90 transition">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
