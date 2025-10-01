# Cart API Documentation

## Tổng Quan

API Cart cung cấp các chức năng quản lý giỏ hàng cho người dùng, bao gồm thêm, sửa, xóa sản phẩm và tính toán tổng giá trị.

## Authentication

Tất cả các endpoint Cart yêu cầu JWT authentication.

### Header yêu cầu:

```
Authorization: Bearer your-jwt-token
```

## Endpoints

### 1. Lấy thông tin giỏ hàng

```
GET /cart
```

**Response:**

```json
{
  "cart": {
    "id": 1,
    "userId": 1,
    "quantity": 3,
    "items": [
      {
        "id": 1,
        "cartId": 1,
        "productId": 1,
        "quantity": 2,
        "price": 999.0,
        "product": {
          "id": 1,
          "name": "iPhone 15",
          "price": 999.0,
          "discount": 10
        }
      }
    ],
    "createdAt": "2025-10-01T10:00:00Z",
    "updatedAt": "2025-10-01T10:30:00Z"
  },
  "totalItems": 3,
  "totalPrice": 2997.0,
  "totalDiscount": 299.7,
  "finalPrice": 2697.3
}
```

### 2. Thêm sản phẩm vào giỏ hàng

```
POST /cart/add
```

**Request Body:**

```json
{
  "productId": 1,
  "quantity": 2
}
```

**Response:** Giống như GET /cart

### 3. Cập nhật số lượng sản phẩm trong giỏ hàng

```
PUT /cart/items/{cartItemId}
```

**Path Parameters:**

- `cartItemId`: ID của cart item cần cập nhật

**Request Body:**

```json
{
  "quantity": 5
}
```

**Response:** Giống như GET /cart

### 4. Xóa sản phẩm khỏi giỏ hàng

```
DELETE /cart/items/{cartItemId}
```

**Path Parameters:**

- `cartItemId`: ID của cart item cần xóa

**Response:** Giống như GET /cart

### 5. Xóa toàn bộ giỏ hàng

```
DELETE /cart/clear
```

**Response:**

```json
{
  "message": "Cart cleared successfully"
}
```

## GraphQL Endpoints

### 1. Lấy thông tin giỏ hàng

```graphql
query GetCart {
  getCart {
    id
    userId
    quantity
    items {
      id
      productId
      quantity
      price
      product {
        id
        name
        price
        discount
      }
    }
    createdAt
    updatedAt
  }
}
```

### 2. Thêm sản phẩm vào giỏ hàng

```graphql
mutation AddToCart($productId: Float!, $quantity: Float!) {
  addToCart(productId: $productId, quantity: $quantity) {
    id
    userId
    quantity
    items {
      id
      productId
      quantity
      price
    }
  }
}
```

### 3. Cập nhật cart item

```graphql
mutation UpdateCartItem($cartItemId: Float!, $quantity: Float!) {
  updateCartItem(cartItemId: $cartItemId, quantity: $quantity) {
    id
    quantity
    items {
      id
      quantity
    }
  }
}
```

### 4. Xóa cart item

```graphql
mutation RemoveFromCart($cartItemId: Float!) {
  removeFromCart(cartItemId: $cartItemId) {
    id
    quantity
  }
}
```

### 5. Xóa toàn bộ giỏ hàng

```graphql
mutation ClearCart {
  clearCart
}
```

## Error Responses

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Cart item does not belong to this user",
  "error": "Bad Request"
}
```

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Product with ID 1 not found",
  "error": "Not Found"
}
```

## Business Logic

### 1. Thêm sản phẩm vào giỏ hàng

- Nếu sản phẩm đã có trong giỏ hàng, cộng thêm số lượng
- Nếu chưa có, tạo cart item mới
- Giá được lưu tại thời điểm thêm vào giỏ hàng

### 2. Tính toán giá

- `totalPrice`: Tổng giá gốc (price × quantity)
- `totalDiscount`: Tổng tiền giảm giá dựa trên % discount của sản phẩm
- `finalPrice`: Giá cuối cùng sau khi trừ discount

### 3. Unique Constraint

- Một sản phẩm chỉ có thể xuất hiện một lần trong giỏ hàng
- Database có constraint UNIQUE(cartId, productId)

### 4. Cascade Delete

- Khi xóa user → xóa tất cả cart của user
- Khi xóa cart → xóa tất cả cart items
- Khi xóa product → xóa tất cả cart items liên quan

## Testing với Swagger

Truy cập `http://localhost:3000/api` để test các API endpoints với Swagger UI.

## Files Structure

```
src/modules/cart/
├── dto/
│   ├── add-to-cart.dto.ts
│   ├── update-cart-item.dto.ts
│   └── cart-response.dto.ts
├── entities/
│   ├── cart.entity.ts
│   └── cart-item.entity.ts
├── cart.controller.ts
├── cart.service.ts
├── cart.resolver.ts
└── cart.module.ts
```
