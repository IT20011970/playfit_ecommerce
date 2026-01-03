
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useNotifications } from '../hooks/useNotifications';

const CheckoutPage: React.FC = () => {
  const { cart, cartTotal, placeOrder, currentUser } = useAppContext();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState({ name: '', email: '', address: '' });
  const [paymentError, setPaymentError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const { notifications } = useNotifications({ userId: currentUser?.id });

  // Listen for order success or failure notification
  useEffect(() => {
    if (!isProcessing) return;

    console.log('Checking notifications:', notifications.length);
    
    // Check for success notification
    const successNotification = notifications.find(
      n => n.type === 'success' && n.title === 'Order Placed Successfully'
    );

    if (successNotification) {
      console.log('Success notification found:', successNotification);
      const realOrderId = successNotification.data?.orderId;
      if (realOrderId) {
        console.log('Navigating to confirmation page with orderId:', realOrderId);
        setIsProcessing(false);
        navigate(`/confirmation/${realOrderId}`, {
          state: {
            message: successNotification.message,
            orderId: realOrderId
          }
        });
        return;
      }
    }

    // Check for failure notification
    const failureNotification = notifications.find(
      n => n.type === 'error' && n.title === 'Failed to Place Order'
    );

    if (failureNotification) {
      console.log('Failure notification found:', failureNotification);
      setIsProcessing(false);
      setPaymentError(true);
      setErrorMessage(failureNotification.message || 'Order failed');
    }
  }, [notifications, isProcessing, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomer(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(false);
    setErrorMessage('');
    
    if (Math.random() > 0.1) { // 90% success rate for payment simulation
        setIsProcessing(true);
        setProcessingMessage('Processing your order...');
        
        try {
          const orderResponse = await placeOrder(customer);
          if (orderResponse && orderResponse.success) {
              setProcessingMessage(orderResponse.message);
          } else {
              setIsProcessing(false);
              setPaymentError(true);
              setErrorMessage(orderResponse?.message || 'Failed to create order');
          }
        } catch (error: any) {
          setIsProcessing(false);
          setPaymentError(true);
          const errorMsg = error?.message || error?.errors?.[0]?.message || 'Failed to create order';
          setErrorMessage(errorMsg);
        }
    } else {
        setPaymentError(true);
        setErrorMessage('Payment failed. Please try again.');
    }
  };
  
  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  // Show processing overlay
  if (isProcessing) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Processing Your Order</h2>
          <p className="text-gray-600">{processingMessage}</p>
          <p className="text-sm text-gray-500 mt-4">Please wait while we process your order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6">Shipping Information</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input type="text" id="name" name="name" value={customer.name} onChange={handleInputChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <input type="email" id="email" name="email" value={customer.email} onChange={handleInputChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">Shipping Address</label>
              <textarea id="address" name="address" rows={3} value={customer.address} onChange={handleInputChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"></textarea>
            </div>
            <h2 className="text-2xl font-semibold mb-6 pt-6">Payment Details (Simulation)</h2>
            <div>
              <label htmlFor="card" className="block text-sm font-medium text-gray-700">Card Number</label>
              <input type="text" id="card" name="card" placeholder="xxxx xxxx xxxx xxxx" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
            </div>
            {paymentError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{errorMessage || 'Payment failed. Please try again.'}</span>
              </div>
            )}
            <button type="submit" className="w-full mt-6 bg-secondary text-black font-bold py-3 rounded-lg hover:bg-opacity-80 transition">
              Place Order
            </button>
          </form>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md h-fit">
          <h2 className="text-2xl font-semibold mb-6">Your Order</h2>
          <div className="space-y-4">
            {cart.map(item => (
              <div key={`${item.product.id}-${item.size}`} className="flex justify-between items-start">
                <div className="flex">
                  <img src={item.product.image} alt={item.product.name} className="w-16 h-16 object-cover rounded-md mr-4" />
                  <div>
                    <p className="font-semibold">{item.product.name} <span className="font-normal">x{item.quantity}</span></p>
                    <p className="text-sm text-gray-500">Size: {item.size}, Color: {item.color}</p>
                  </div>
                </div>
                <p className="font-semibold">${(item.product.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="border-t mt-6 pt-6">
            <div className="flex justify-between font-bold text-xl">
              <span>Total</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
