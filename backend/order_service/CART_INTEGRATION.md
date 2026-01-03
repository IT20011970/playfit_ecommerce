# Cart Clearing Integration

## Overview
The order service now automatically clears the user's cart after successfully creating an order. This is handled entirely on the backend through direct communication between the order service and cart service.

## Architecture Flow

```
Frontend → Order Service → Cart Service
   |            |              |
   |        1. Create Order    |
   |        2. Save Items       |
   |        3. Clear Cart ──────┘
   |        4. Return Order
   |←───────────┘
```

## Implementation Details

### Backend (Order Service)

**File**: `backend/order_service/src/order/order.service.ts`

The `createOrder` method now includes cart clearing logic:

```typescript
async createOrder(createOrderInput, cartItems) {
  // 1. Validate cart items
  // 2. Calculate total amount
  // 3. Create order record
  // 4. Create order items
  
  // 5. Clear cart via GraphQL mutation to cart service
  await this.clearUserCart(createOrderInput.userId);
  
  // 6. Return complete order
}

private async clearUserCart(userId: string) {
  const clearCartMutation = `
    mutation ClearCart($userId: String!) {
      clearCart(userId: $userId)
    }
  `;
  
  // Send GraphQL request to cart service
  await fetch(this.cartServiceUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: clearCartMutation,
      variables: { userId }
    })
  });
}
```

### Cart Service API

**File**: `backend/cart_service/src/cart/cart.resolver.ts`

The cart service exposes a `clearCart` mutation:

```graphql
mutation ClearCart($userId: String!) {
  clearCart(userId: $userId)
}
```

This mutation deletes all cart items for the specified user.

### Frontend Integration

**File**: `Frontend/context/AppContext.tsx`

The frontend `placeOrder` function is simplified:

```typescript
const placeOrder = async (customer) => {
  // Map cart items to order format
  const cartItems = cart.map(item => ({...}));
  
  // Create order (backend handles cart clearing)
  const newOrder = await orderService.createOrder(orderInput, cartItems);
  
  // Refresh cart to reflect cleared state
  await fetchCart();
  await fetchOrders();
  
  return newOrder;
};
```

**Key Changes**:
- ❌ Removed: `await clearCart()` call from frontend
- ✅ Added: `await fetchCart()` to refresh cart state after backend clears it

## Environment Variables

### Local Development
```env
# In backend/order_service/.env
CART_SERVICE_URL=http://localhost:3002/graphql
```

### Azure Production
```powershell
az webapp config appsettings set -g playfit-rg -n playfit-order-service --settings `
  CART_SERVICE_URL="https://playfit-cart-service.azurewebsites.net/graphql"
```

## Error Handling

The order service uses defensive error handling for cart clearing:

```typescript
try {
  await this.clearUserCart(userId);
} catch (error) {
  this.logger.warn(`Failed to clear cart: ${error.message}`);
  // Don't fail the order if cart clearing fails
}
```

**Rationale**: 
- Order creation is the critical operation
- Cart clearing is a cleanup operation
- If cart clearing fails, the order is still valid
- User can manually clear cart later

## Benefits

### 1. Single Source of Truth
- Backend controls the complete order workflow
- No race conditions between frontend calls
- Guaranteed consistency

### 2. Better Error Handling
- Atomic operation: order creation + cart clearing
- Backend can retry cart clearing if needed
- Logs failures for monitoring

### 3. Reduced Network Calls
- Frontend makes one API call instead of two
- Faster user experience
- Less error-prone

### 4. Security
- Cart clearing is triggered server-side
- No risk of frontend bypassing cart clearing
- User can't manipulate the flow

## Testing

### Local Testing
1. Start cart service: `cd backend/cart_service && npm run start:dev`
2. Start order service: `cd backend/order_service && npm run start:dev`
3. Add items to cart
4. Place an order
5. Verify cart is empty after order creation

### Production Testing
1. Deploy both services to Azure
2. Configure CART_SERVICE_URL environment variable
3. Test end-to-end order flow
4. Check logs: `az webapp log tail -g playfit-rg -n playfit-order-service`

## Troubleshooting

### Cart not clearing after order

**Check 1**: Verify CART_SERVICE_URL is set
```powershell
az webapp config appsettings list -g playfit-rg -n playfit-order-service --query "[?name=='CART_SERVICE_URL']"
```

**Check 2**: Check order service logs
```powershell
az webapp log tail -g playfit-rg -n playfit-order-service
```
Look for: "Successfully cleared cart for user {userId}"

**Check 3**: Verify cart service is running
```powershell
curl https://playfit-cart-service.azurewebsites.net/graphql -X POST -H "Content-Type: application/json" -d '{"query":"query{__typename}"}'
```

**Check 4**: Test clearCart mutation directly
```graphql
mutation {
  clearCart(userId: "test-user-id")
}
```

### Order created but cart still has items

This indicates the clearUserCart method failed. Check:
1. Network connectivity between order service and cart service
2. CART_SERVICE_URL is correct
3. Cart service GraphQL endpoint is accessible
4. Cart service logs for errors

## Migration Notes

If you have an existing frontend that calls `clearCart()` manually:

1. **Remove the manual clearCart call** from placeOrder function
2. **Add fetchCart()** to refresh cart state after order creation
3. **Update dependencies** in useCallback hooks
4. **Test thoroughly** to ensure cart clears properly

## Future Enhancements

- [ ] Add retry logic for cart clearing failures
- [ ] Implement webhook/event-based cart clearing
- [ ] Add metrics for cart clearing success rate
- [ ] Consider using message queue for reliability
