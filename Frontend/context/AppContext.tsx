
import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { Product, CartItem, Order, Customer, OrderStatus, User } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { graphqlApi } from '../graphql/api';
import { userService } from '../graphql/userService';
import { cartService } from '../graphql/cartService';
import { orderService } from '../graphql/orderService';
import { inventoryService } from '../graphql/inventoryService';
import { AuthTokenManager } from '../utils/authToken';
import { useNotifications } from '../hooks/useNotifications';

interface AppContextType {
  // Loading state
  isLoading: boolean;

  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  findProduct: (productId: string) => Product | undefined;
  seedProducts: () => Promise<void>;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity: number, size: string, color: string) => Promise<void>;
  updateCartItemQuantity: (productId: string, size: string, color: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string, size: string, color: string) => Promise<void>;
  clearCart: () => Promise<void>;
  cartTotal: number;

  // Orders
  orders: Order[];
  placeOrder: (customer: Customer) => Promise<{ success: boolean; message: string; orderId?: string } | null>;
  updateOrderStatus: (orderId: string, status: OrderStatus, trackingNumber?: string) => Promise<void>;

  // Auth
  currentUser: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  login: (email: string, password_DO_NOT_USE_IN_PRODUCTION: string) => Promise<User | null>;
  logout: () => void;
  register: (name: string, email: string, password_DO_NOT_USE_IN_PRODUCTION: string) => Promise<User | null>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Listen for WebSocket notifications
  const { notifications } = useNotifications({ userId: currentUser?.id });

  const fetchProducts = useCallback(async () => {
      try {
        const products = await inventoryService.getAllProducts();
        setProducts(products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      }
  }, []);

  const fetchOrders = useCallback(async () => {
      if (currentUser) {
        try {
          // Admin users get all orders, regular users get only their orders
          const fetchedOrders = currentUser.role === 'admin'
            ? await orderService.getAllOrders()
            : await orderService.getOrdersByUser(currentUser.id);
          setOrders(fetchedOrders || []);
        } catch (error) {
          console.error('Error fetching orders:', error);
          setOrders([]);
        }
      } else {
        setOrders([]);
      }
  }, [currentUser]);

  const fetchCart = useCallback(async () => {
      if (currentUser) {
          try {
            const cartItems = await cartService.getCart(currentUser.id);
            const transformedCart: CartItem[] = cartItems.map(item => ({
              product: {
                id: item.productId,
                name: item.productName || '',
                price: item.productPrice || 0,
                image: item.productImage || '',
                description: '',
                category: '',
                stock: 0,
                sizes: [item.size],
                colors: [item.color],
                isNewArrival: false,
              },
              quantity: item.quantity,
              size: item.size,
              color: item.color,
            }));
            setCart(transformedCart);
          } catch (error) {
            console.error('Error fetching cart:', error);
            setCart([]);
          }
      } else {
          setCart([]);
      }
  }, [currentUser]);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      await Promise.all([fetchProducts(), fetchOrders(), fetchCart()]);
      setIsLoading(false);
    };
    fetchInitialData();
  }, [fetchProducts, fetchOrders, fetchCart]);
  
  useEffect(() => {
    fetchCart();
  }, [currentUser, fetchCart]);

  // Listen for order success notification and refresh cart
  useEffect(() => {
    const orderSuccessNotification = notifications.find(
      n => n.type === 'success' && n.title === 'Order Placed Successfully'
    );

    if (orderSuccessNotification) {
      console.log('Order success detected, refreshing cart and orders...');
      fetchCart();
      fetchOrders();
    }
  }, [notifications, fetchCart, fetchOrders]);

  const findProduct = useCallback((productId: string) => {
    return products.find(p => p.id === productId);
  }, [products]);

  const addProduct = useCallback(async (productData: Omit<Product, 'id'>) => {
    try {
      // Generate a unique ID for the product
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const input = {
        id,
        ...productData,
      };
      await inventoryService.addProduct(input);
      await fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  }, [fetchProducts]);

  const updateProduct = useCallback(async (updatedProduct: Product) => {
    try {
      const input = {
        id: updatedProduct.id,
        name: updatedProduct.name,
        description: updatedProduct.description,
        price: updatedProduct.price,
        image: updatedProduct.image,
        category: updatedProduct.category,
        stock: updatedProduct.stock,
        sizes: updatedProduct.sizes,
        colors: updatedProduct.colors,
        isNewArrival: updatedProduct.isNewArrival,
      };
      await inventoryService.updateProduct(input);
      await fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }, [fetchProducts]);

  const deleteProduct = useCallback(async (productId: string) => {
    try {
      await inventoryService.deleteProduct(productId);
      await fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }, [fetchProducts]);

  const seedProducts = useCallback(async () => {
    try {
      // Import db products data
      const { db } = await import('../graphql/db');
      const productsToSeed = db.products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        image: p.image,
        category: p.category,
        stock: p.stock,
        sizes: p.sizes,
        colors: p.colors,
        isNewArrival: p.isNewArrival,
      }));
      
      await inventoryService.seedProducts(productsToSeed);
      await fetchProducts();
      console.log('Products seeded successfully!');
    } catch (error) {
      console.error('Error seeding products:', error);
      throw error;
    }
  }, [fetchProducts]);

  const addToCart = useCallback(async (product: Product, quantity: number, size: string, color: string) => {
     if (!currentUser) {
       console.error('Cannot add to cart: User is not logged in');
       return;
     }
   
     try {
       console.log('Adding to cart:', { userId: currentUser.id, productId: product.id, quantity, size, color });
       
       // Call real backend cart service
       await cartService.addToCart({
         userId: currentUser.id,
         productId: product.id,
         quantity,
         size,
         color,
         productName: product.name,
         productPrice: product.price,
         productImage: product.image,
       });
       
       await fetchCart();
       console.log('Successfully added to cart');
     } catch (error) {
       console.error('Error adding to cart:', error);
       throw error;
     }
  }, [currentUser, fetchCart]);

  const updateCartItemQuantity = useCallback(async (productId: string, size: string, color: string, quantity: number) => {
    if (!currentUser) return;
    
    try {
      await cartService.updateCartItem({
        userId: currentUser.id,
        productId,
        size,
        color,
        quantity,
      });
      await fetchCart();
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  }, [currentUser, fetchCart]);

  const removeFromCart = useCallback(async (productId: string, size: string, color: string) => {
    if (!currentUser) return;
    
    try {
      await cartService.removeFromCart({
        userId: currentUser.id,
        productId,
        size,
        color,
      });
      await fetchCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }, [currentUser, fetchCart]);

  const clearCart = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      await cartService.clearCart(currentUser.id);
      await fetchCart();
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }, [currentUser, fetchCart]);

  const cartTotal = useMemo(() => cart.reduce((total, item) => total + item.product.price * item.quantity, 0), [cart]);

  const placeOrder = useCallback(async (customer: Customer) => {
    if (!currentUser) return null;
    try {
        // Get cart items
        const cartItems = cart.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          productPrice: item.product.price,
          productImage: item.product.image,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        }));

        const orderInput = {
          userId: currentUser.id,
          customerName: customer.name,
          customerEmail: customer.email,
          customerAddress: customer.address,
        };

        console.debug('placeOrder: currentUser', currentUser?.id, 'cartLength', cart.length, 'cartItemsPrepared', cartItems);

        if (!cartItems || cartItems.length === 0) {
          console.error('placeOrder aborted: cartItems is empty', { currentUser, cart });
          return null;
        }

        const newOrder = await orderService.createOrder(orderInput, cartItems);
        
        await fetchCart();
        await fetchOrders();
        
        return newOrder;
    } catch(e) {
        console.error("Failed to place order", e);
        return null;
    }
  }, [currentUser, cart, fetchCart, fetchOrders]);
    
  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus, trackingNumber?: string) => {
    await graphqlApi('updateOrderStatus', { orderId, status, trackingNumber });
    await fetchOrders();
  }, [fetchOrders]);

  const login = useCallback(async (email: string, password_DO_NOT_USE_IN_PRODUCTION: string): Promise<User | null> => {
    try {
      const signInResponse = await userService.signIn(email, password_DO_NOT_USE_IN_PRODUCTION);
      
      AuthTokenManager.setToken(signInResponse.accessToken, signInResponse.expiresIn);
      
      const user: User = {
        id: signInResponse.user.id.toString(),
        name: signInResponse.user.userId,
        email: signInResponse.user.userId,
        role: (signInResponse.user.role === 'admin' ? 'admin' : 'user') as 'user' | 'admin',
      };

      setCurrentUser(user);
      
      return user;
    } catch (e) {
      console.error('Login error:', e);
      return null;
    }
  }, [setCurrentUser]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    AuthTokenManager.clearToken();
  }, [setCurrentUser]);
    
  const register = useCallback(async (name: string, email: string, password_DO_NOT_USE_IN_PRODUCTION: string): Promise<User | null> => {
      try {
        const userResponse = await userService.createUser({
          userId: email,
          password: password_DO_NOT_USE_IN_PRODUCTION,
          role: 'user',
          contactNo: null,
          isActive: 1,
        });

        const user: User = {
          id: userResponse.id.toString(),
          name: name,
          email: userResponse.userId,
          role: (userResponse.role === 'admin' ? 'admin' : 'user') as 'user' | 'admin',
        };

        setCurrentUser(user);
        return user;
      } catch(e) {
          console.error('Registration error:', e);
          return null;
      }
  }, [setCurrentUser]);

  const value = useMemo(() => {
    const isLoggedIn = !!currentUser;
    const isAdmin = currentUser?.role === 'admin';
    
    return {
        isLoading,
        products, addProduct, updateProduct, deleteProduct, findProduct, seedProducts,
        cart, addToCart, updateCartItemQuantity, removeFromCart, clearCart, cartTotal,
        orders, placeOrder, updateOrderStatus,
        currentUser, isLoggedIn, isAdmin, login, logout, register,
    };
}, [
    isLoading,
    products, addProduct, updateProduct, deleteProduct, findProduct, seedProducts,
    cart, addToCart, updateCartItemQuantity, removeFromCart, clearCart, cartTotal,
    orders, placeOrder, updateOrderStatus,
    currentUser, login, logout, register,
]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
