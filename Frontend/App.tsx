
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { NotificationProvider } from './context/NotificationContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import LoginPage from './pages/LoginPage';
import AdminLayout from './components/AdminLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminProductFormPage from './pages/admin/AdminProductFormPage';
import RegisterPage from './pages/RegisterPage';
import UserOrdersPage from './pages/UserOrdersPage';
import { NotificationToastContainer } from './components/NotificationToast';
import CategoryPage from './pages/CategoryPage';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};


function App() {
  const userId = localStorage.getItem('userId') || undefined;

  return (
    <AppProvider>
      <NotificationProvider userId={userId}>
        <HashRouter>
          <ScrollToTop />
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="products/new" element={<AdminProductFormPage />} />
              <Route path="products/edit/:id" element={<AdminProductFormPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
            </Route>
          </Route>
          
          {/* Public Routes */}
          <Route path="/*" element={<PublicApp />} />
        </Routes>
        {/* Global notification toast - renders on all pages */}
        <NotificationToastContainer />
      </HashRouter>
      </NotificationProvider>
    </AppProvider>
  );
}

const PublicApp = () => (
    <>
        <Header />
        <main>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/men" element={<CategoryPage category="Men" />} />
                <Route path="/women" element={<CategoryPage category="Women" />} />
                <Route path="/kids" element={<CategoryPage category="Kids" />} />
                <Route path="/accessories" element={<CategoryPage category="Accessories" />} />
                <Route path="/product/:id" element={<ProductDetailsPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/orders" element={<UserOrdersPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/confirmation/:id" element={<OrderConfirmationPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
            </Routes>
        </main>
    </>
);


export default App;
