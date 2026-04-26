-- ============================================================================
-- FINAL OPTIMIZED SCHEMA
-- ============================================================================
-- This schema integrates:
-- - performance optimizations (indexes and selective denormalization)
-- - edge-case handling (cascade behavior and historical snapshots)
--
-- 1) Keep financial/order history durable.
-- 2) Allow soft-delete behavior for users/products.
-- 3) Keep query performance practical with targeted indexes.
-- 4) Preserve historical truth when mutable source data changes.
-- ============================================================================

-- 1. USERS
-- - Email stays unique (Oracle auto-indexes UNIQUE columns).
-- - is_active enables soft-delete semantics for accounts.
CREATE TABLE users (
  id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  first_name VARCHAR2(60) NOT NULL,
  last_name VARCHAR2(60) NOT NULL,
  email VARCHAR2(190) NOT NULL UNIQUE,
  password VARCHAR2(255) NOT NULL,
  role VARCHAR2(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  is_active VARCHAR2(5) DEFAULT 'true' CHECK (is_active IN ('true', 'false')),
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP
);

-- 2. PRODUCTS
-- - price stores current product price.
-- - is_active enables product soft-delete/hide behavior.
CREATE TABLE products (
  id VARCHAR2(20) PRIMARY KEY,
  name VARCHAR2(255) NOT NULL,
  description VARCHAR2(500),
  price NUMBER(10) NOT NULL,
  image VARCHAR2(500) NOT NULL,
  calories NUMBER(6) NOT NULL,
  sale_type VARCHAR2(20) NOT NULL CHECK (sale_type IN ('fixed', 'variable')),
  unit VARCHAR2(50) NOT NULL,
  unit_weight NUMBER(3),
  recommended VARCHAR2(5) DEFAULT 'false' CHECK (recommended IN ('true', 'false')),
  is_active VARCHAR2(5) DEFAULT 'true' CHECK (is_active IN ('true', 'false')),
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP,
  CONSTRAINT check_unit_by_sale CHECK (
    (sale_type = 'variable' AND unit IN ('kg', 'l', 'g', 'ml')) OR
    (sale_type = 'fixed' AND unit = 'unit')
  ),
  CONSTRAINT check_unit_weight_null CHECK (
    (sale_type = 'fixed') OR (sale_type = 'variable' AND unit_weight IS NULL)
  )
);

-- 3. CATEGORIES
CREATE TABLE categories (
  id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR2(20) NOT NULL
);

-- 4. PRODUCT_CATEGORIES (RELATIONSHIP TABLE)
-- Cascade cleanup is intentional: deleting a product/category removes join rows.
CREATE TABLE product_categories (
  product_id VARCHAR2(20) NOT NULL,
  category_id NUMBER NOT NULL,
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP,
  PRIMARY KEY (product_id, category_id),
  CONSTRAINT fk_pc_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_pc_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 5. ADDRESSES
-- Cascade cleanup is intentional: deleting a user removes their address book.
CREATE TABLE addresses (
  id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id NUMBER NOT NULL,
  label VARCHAR2(100),
  type VARCHAR2(20) CHECK (type IN ('home', 'work', 'other')),
  address VARCHAR2(255) NOT NULL,
  city VARCHAR2(100) NOT NULL,
  province VARCHAR2(100) NOT NULL,
  postal_code VARCHAR2(20) NOT NULL,
  phone_number VARCHAR2(30),
  delivery_instructions VARCHAR2(500),
  latitude NUMBER(10, 8),
  longitude NUMBER(11, 8),
  is_default VARCHAR(5) DEFAULT 'false' CHECK (is_default IN ('true', 'false')),
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP,
  CONSTRAINT fk_address_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. CART_ITEMS
-- Cascade cleanup is intentional: carts should not survive deleted users/products.
CREATE TABLE cart_items (
  user_id NUMBER NOT NULL,
  product_id VARCHAR2(20) NOT NULL,
  quantity NUMBER(4) NOT NULL,
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP,
  PRIMARY KEY (user_id, product_id),
  CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_cart_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 7. ORDERS
-- Denormalized total_price is stored for fast reads.
-- delivery_address_snapshot preserves historical readability if addresses change.
-- No cascade on fk_order_user to avoid accidental loss of financial records.
CREATE TABLE orders (
  id NUMBER(10) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id NUMBER NOT NULL,
  order_number VARCHAR2(10) UNIQUE NOT NULL,
  status VARCHAR2(10) DEFAULT 'placed' NOT NULL CHECK (status IN ('placed', 'packaged', 'enroute', 'arrived')),
  subtotal NUMBER(10) NOT NULL,
  shipping NUMBER(10) DEFAULT 100 NOT NULL,
  tax_rate NUMBER(5,2) NOT NULL,
  total_price NUMBER(10) NOT NULL,
  payment_method VARCHAR2(10) NOT NULL CHECK (payment_method IN ('cash', 'card', 'digital')),
  notes VARCHAR2(500),
  address_id NUMBER,
  delivery_address_snapshot VARCHAR2(500),
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP,
  CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_order_address FOREIGN KEY (address_id) REFERENCES addresses(id)
);

-- 8. ORDER_ITEMS
-- price_at_purchase preserves historical truth when product price changes.
-- Cascade on order header is intentional for order-level cleanup consistency.
CREATE TABLE order_items (
  order_id NUMBER(10) NOT NULL,
  product_id VARCHAR2(20) NOT NULL,
  quantity NUMBER(4) NOT NULL,
  price_at_purchase NUMBER(10) NOT NULL,
  PRIMARY KEY (order_id, product_id),
  CONSTRAINT fk_OrItems_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_OrItems_product FOREIGN KEY (product_id) REFERENCES products(id)
);

-- PERFORMANCE INDEXES
-- Foreign-key indexes improve join performance and referential operations.
CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_items_prod ON order_items(product_id);
CREATE INDEX idx_prod_cat_cat_id ON product_categories(category_id);

-- Common search/filter indexes.
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_orders_status ON orders(status);


CREATE UNIQUE INDEX ux_one_default_address
ON addresses (CASE WHEN is_default = 'true' THEN user_id END);