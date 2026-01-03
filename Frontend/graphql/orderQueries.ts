export const CREATE_ORDER = `
  mutation CreateOrder($input: CreateOrderInput!, $cartItems: [CartItemInput!]!) {
    createOrder(input: $input, cartItems: $cartItems) {
      success
      message
      orderId
    }
  }
`;

export const GET_ORDERS_BY_USER = `
  query GetOrdersByUser($userId: String!) {
    ordersByUser(userId: $userId) {
      id
      userId
      customerName
      customerEmail
      customerAddress
      totalAmount
      status
      trackingId
      shippedBy
      createdAt
      items {
        id
        productId
        productName
        productPrice
        productImage
        quantity
        size
        color
      }
    }
  }
`;

export const GET_ALL_ORDERS = `
  query GetAllOrders {
    allOrders {
      id
      userId
      customerName
      customerEmail
      customerAddress
      totalAmount
      status
      trackingId
      shippedBy
      createdAt
      items {
        id
        productId
        productName
        productPrice
        productImage
        quantity
        size
        color
      }
    }
  }
`;

export const GET_ORDER_BY_ID = `
  query GetOrderById($orderId: Int!) {
    order(id: $orderId) {
      id
      userId
      customerName
      customerEmail
      customerAddress
      totalAmount
      status
      trackingId
      shippedBy
      createdAt
      items {
        id
        productId
        productName
        productPrice
        productImage
        quantity
        size
        color
      }
    }
  }
`;

export const SHIP_ORDER = `
  mutation ShipOrder($input: ShipOrderInput!) {
    shipOrder(input: $input) {
      id
      status
      trackingId
      shippedBy
      updatedAt
    }
  }
`;

export const UPDATE_ORDER_STATUS = `
  mutation UpdateOrderStatus($orderId: Int!, $status: String!) {
    updateOrderStatus(orderId: $orderId, status: $status) {
      id
      status
      updatedAt
    }
  }
`;
