// GraphQL Queries and Mutations for Cart operations

// Query to get cart items for a user
export const GET_CART = `
  query GetCart($userId: String!) {
    cart(userId: $userId) {
      userId
      productId
      quantity
      size
      color
      productName
      productPrice
      productImage
      createdAt
      updatedAt
    }
  }
`;

// Query to get cart total
export const GET_CART_TOTAL = `
  query GetCartTotal($userId: String!) {
    cartTotal(userId: $userId)
  }
`;

// Mutation to add item to cart
export const ADD_TO_CART = `
  mutation AddToCart($input: AddToCartInput!) {
    addToCart(input: $input) {
      userId
      productId
      quantity
      size
      color
      productName
      productPrice
      productImage
    }
  }
`;

// Mutation to update cart item quantity
export const UPDATE_CART_ITEM = `
  mutation UpdateCartItem($input: UpdateCartItemInput!) {
    updateCartItem(input: $input) {
      userId
      productId
      quantity
      size
      color
    }
  }
`;

// Mutation to remove item from cart
export const REMOVE_FROM_CART = `
  mutation RemoveFromCart($input: RemoveFromCartInput!) {
    removeFromCart(input: $input)
  }
`;

// Mutation to clear cart
export const CLEAR_CART = `
  mutation ClearCart($userId: String!) {
    clearCart(userId: $userId)
  }
`;
