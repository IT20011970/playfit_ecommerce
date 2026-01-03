import { graphqlClient } from './client';
import {
  CREATE_ORDER,
  GET_ORDERS_BY_USER,
  GET_ALL_ORDERS,
  GET_ORDER_BY_ID,
  SHIP_ORDER,
  UPDATE_ORDER_STATUS,
} from './orderQueries';

interface CartItem {
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
  quantity: number;
  size: string;
  color: string;
}

interface CreateOrderInput {
  userId: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
}

interface ShipOrderInput {
  orderId: number;
  trackingId: string;
  shippedByAdmin: string;
}

export const orderService = {
  async createOrder(input: CreateOrderInput, cartItems: CartItem[]) {
    const result = await graphqlClient.mutate(CREATE_ORDER, { input, cartItems });
    return result.createOrder;
  },

  async getOrdersByUser(userId: string) {
    const result = await graphqlClient.query(GET_ORDERS_BY_USER, { userId });
    return result.ordersByUser || [];
  },

  async getAllOrders() {
    const result = await graphqlClient.query(GET_ALL_ORDERS);
    return result.allOrders || [];
  },

  async getOrderById(orderId: number) {
    const result = await graphqlClient.query(GET_ORDER_BY_ID, { orderId });
    return result.order || null;
  },

  async shipOrder(input: ShipOrderInput) {
    const result = await graphqlClient.mutate(SHIP_ORDER, { input });
    return result.shipOrder;
  },

  async updateOrderStatus(orderId: number, status: string) {
    const result = await graphqlClient.mutate(UPDATE_ORDER_STATUS, { orderId, status });
    return result.updateOrderStatus;
  },
};
