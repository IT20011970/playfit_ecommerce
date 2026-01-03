
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  sizes: string[];
  colors: string[];
  isNewArrival: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

export interface Customer {
  name: string;
  email: string;
  address: string;
}

export enum OrderStatus {
  Placed = 'Placed',
  Shipped = 'Shipped',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

export interface Order {
  id: string;
  customer: Customer;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  date: string;
  trackingNumber?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

// This interface is only for mock data and should not be used in production client-side code
export interface MockUser extends User {
    password_DO_NOT_USE_IN_PRODUCTION: string;
}
