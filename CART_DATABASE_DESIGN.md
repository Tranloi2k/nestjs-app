# Cấu Trúc Bảng Giỏ Hàng (Cart)

## Tổng Quan

Hệ thống giỏ hàng được thiết kế với 2 bảng chính:

- `carts`: Lưu thông tin giỏ hàng của từng người dùng
- `cart_items`: Lưu chi tiết các sản phẩm trong giỏ hàng

## Bảng: carts

```sql
CREATE TABLE carts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

### Mô tả các cột:

- `id`: ID duy nhất của giỏ hàng (Primary Key)
- `userId`: ID của người dùng sở hữu giỏ hàng (Foreign Key -> users.id)
- `createdAt`: Thời gian tạo giỏ hàng
- `updatedAt`: Thời gian cập nhật cuối cùng

### Index:

- `IDX_CART_USER_ID`: Index trên cột userId để tối ưu truy vấn

## Bảng: cart_items

```sql
CREATE TABLE cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cartId INTEGER NOT NULL,
    productId INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cartId) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES Products(id) ON DELETE CASCADE
);
```

### Mô tả các cột:

- `id`: ID duy nhất của item trong giỏ hàng (Primary Key)
- `cartId`: ID của giỏ hàng chứa item này (Foreign Key -> carts.id)
- `productId`: ID của sản phẩm (Foreign Key -> Products.id)
- `quantity`: Số lượng sản phẩm trong giỏ hàng
- `price`: Giá của sản phẩm tại thời điểm thêm vào giỏ hàng
- `createdAt`: Thời gian thêm vào giỏ hàng
- `updatedAt`: Thời gian cập nhật cuối cùng

### Index:

- `IDX_CART_ITEM_CART_ID`: Index trên cột cartId
- `IDX_CART_ITEM_PRODUCT_ID`: Index trên cột productId
- `IDX_CART_ITEM_UNIQUE`: Unique index trên cặp (cartId, productId) để tránh trùng lặp

## Quan Hệ (Relationships)

### 1. User ↔ Cart (1:N)

- Một người dùng có thể có nhiều giỏ hàng
- Khi xóa user, tất cả giỏ hàng của user đó cũng bị xóa (CASCADE)

### 2. Cart ↔ CartItem (1:N)

- Một giỏ hàng có thể chứa nhiều item
- Khi xóa cart, tất cả cart_items trong đó cũng bị xóa (CASCADE)

### 3. Product ↔ CartItem (1:N)

- Một sản phẩm có thể xuất hiện trong nhiều giỏ hàng khác nhau
- Khi xóa product, tất cả cart_items liên quan cũng bị xóa (CASCADE)

## Ràng Buộc (Constraints)

### 1. Unique Cart Item

```sql
CREATE UNIQUE INDEX IDX_CART_ITEM_UNIQUE ON cart_items(cartId, productId);
```

- Đảm bảo một sản phẩm chỉ xuất hiện một lần trong mỗi giỏ hàng
- Nếu muốn thêm cùng sản phẩm, phải cập nhật quantity thay vì tạo record mới

### 2. Foreign Key Constraints

- Tất cả foreign key đều có ON DELETE CASCADE
- Đảm bảo tính toàn vẹn dữ liệu khi xóa các record cha

## Câu Lệnh Tạo Bảng

Để tạo các bảng này, chạy file SQL: `create_cart_tables.sql`

```bash
sqlite3 database.sqlite ".read create_cart_tables.sql"
```

## Entities TypeORM

- `Cart Entity`: `src/modules/cart/entities/cart.entity.ts`
- `CartItem Entity`: `src/modules/cart/entities/cart-item.entity.ts`

## Next Steps

1. Tạo Cart Module, Service, Controller
2. Implement CRUD operations cho giỏ hàng
3. Tạo API endpoints cho:
   - Thêm sản phẩm vào giỏ hàng
   - Cập nhật số lượng sản phẩm
   - Xóa sản phẩm khỏi giỏ hàng
   - Lấy danh sách giỏ hàng
   - Tính tổng giá trị giỏ hàng
