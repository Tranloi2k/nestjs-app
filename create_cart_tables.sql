-- Tạo bảng carts (giỏ hàng)
CREATE TABLE IF NOT EXISTS carts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Tạo index cho userId trong bảng carts
CREATE INDEX IF NOT EXISTS IDX_CART_USER_ID ON carts(userId);

-- Tạo bảng cart_items (chi tiết giỏ hàng)
CREATE TABLE IF NOT EXISTS cart_items (
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

-- Tạo index cho cartId và productId trong bảng cart_items
CREATE INDEX IF NOT EXISTS IDX_CART_ITEM_CART_ID ON cart_items(cartId);
CREATE INDEX IF NOT EXISTS IDX_CART_ITEM_PRODUCT_ID ON cart_items(productId);

-- Tạo index unique cho cặp cartId và productId để tránh trùng lặp sản phẩm trong cùng một giỏ hàng
CREATE UNIQUE INDEX IF NOT EXISTS IDX_CART_ITEM_UNIQUE ON cart_items(cartId, productId);