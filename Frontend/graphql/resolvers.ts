
import { Product, CartItem, Order, Customer, OrderStatus, User, MockUser } from '../types';
import { db } from './db';

// Helper to get a user's cart
const getCartForUser = (userId: string): CartItem[] => {
    if (!db.userCarts[userId]) {
        db.userCarts[userId] = [];
    }
    return db.userCarts[userId];
};

export const resolvers: Record<string, Record<string, Function>> = {
    Query: {
        products: () => db.products,
        product: (_: any, { id }: { id: string }) => db.products.find(p => p.id === id),
        orders: () => db.orders,
        cart: (_: any, { userId }: { userId: string }) => {
            if (!userId) return [];
            return getCartForUser(userId);
        },
    },
    Mutation: {
        addProduct: (_: any, { productData }: { productData: Omit<Product, 'id'> }) => {
            const newProduct = { ...productData, id: Date.now().toString() };
            db.products.push(newProduct);
            return newProduct;
        },
        updateProduct: (_: any, { updatedProduct }: { updatedProduct: Product }) => {
            db.products = db.products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
            return updatedProduct;
        },
        deleteProduct: (_: any, { productId }: { productId: string }) => {
            db.products = db.products.filter(p => p.id !== productId);
            return productId;
        },
        addToCart: (_: any, { userId, productId, quantity, size, color }: { userId: string, productId: string, quantity: number, size: string, color: string }) => {
            const product = db.products.find(p => p.id === productId);
            if (!product) throw new Error("Product not found");
            const cart = getCartForUser(userId);
            
            const existingItem = cart.find(item => item.product.id === productId && item.size === size && item.color === color);
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.push({ product, quantity, size, color });
            }
            return cart;
        },
        updateCartItemQuantity: (_: any, { userId, productId, size, color, quantity }: { userId: string, productId: string, size: string, color: string, quantity: number }) => {
             const cart = getCartForUser(userId);
             if (quantity <= 0) {
                 db.userCarts[userId] = cart.filter(item => !(item.product.id === productId && item.size === size && item.color === color));
             } else {
                const item = cart.find(i => i.product.id === productId && i.size === size && i.color === color);
                if (item) item.quantity = quantity;
             }
             return db.userCarts[userId];
        },
        removeFromCart: (_: any, { userId, productId, size, color }: { userId: string, productId: string, size: string, color: string }) => {
            let cart = getCartForUser(userId);
            db.userCarts[userId] = cart.filter(item => !(item.product.id === productId && item.size === size && item.color === color));
            return db.userCarts[userId];
        },
        clearCart: (_: any, { userId }: { userId: string }) => {
            if (userId) {
                db.userCarts[userId] = [];
            }
            return [];
        },
        placeOrder: (_: any, { userId, customer }: { userId: string, customer: Customer }) => {
            const cart = getCartForUser(userId);
            if(cart.length === 0) throw new Error("Cart is empty");

            const cartTotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
            const newOrder: Order = {
                id: `ORDER-${Date.now()}`,
                customer,
                items: [...cart],
                total: cartTotal,
                status: OrderStatus.Placed,
                date: new Date().toISOString(),
            };
            db.orders.unshift(newOrder);
            
            cart.forEach(cartItem => {
                const product = db.products.find(p => p.id === cartItem.product.id);
                if (product) {
                    product.stock -= cartItem.quantity;
                }
            });
            
            db.userCarts[userId] = [];
            return newOrder;
        },
        updateOrderStatus: (_: any, { orderId, status, trackingNumber }: { orderId: string, status: OrderStatus, trackingNumber?: string }) => {
            const order = db.orders.find(o => o.id === orderId);
            if(order) {
                order.status = status;
                if(trackingNumber) order.trackingNumber = trackingNumber;
            }
            return order;
        },
        // Fix: Renamed the destructured '_' variable to '_password' to avoid a "Duplicate identifier" error with the unused '_' function parameter.
        login: (_: any, { email, password }: { email: string, password: string }) => {
            const user = db.users.find(u => u.email === email && u.password_DO_NOT_USE_IN_PRODUCTION === password);
            if (user) {
              const { password_DO_NOT_USE_IN_PRODUCTION: _password, ...userToReturn } = user;
              return userToReturn;
            }
            throw new Error("Invalid credentials");
        },
        // Fix: Renamed the destructured '_' variable to '_password' to avoid a "Duplicate identifier" error with the unused '_' function parameter.
        register: (_: any, { name, email, password }: { name: string, email: string, password: string }) => {
            if (db.users.find(u => u.email === email)) {
                throw new Error("User already exists");
            }
            const newUser: MockUser = {
                id: `user-${Date.now()}`,
                name,
                email,
                password_DO_NOT_USE_IN_PRODUCTION: password,
                role: 'user',
            };
            db.users.push(newUser);
            const { password_DO_NOT_USE_IN_PRODUCTION: _password, ...userToReturn } = newUser;
            return userToReturn;
        },
    },
};
