

-- ============================================================================
-- PURE FUNCTIONAL DEPENDENCIES - SCHEMA BASE (DENORMALIZED)
-- ============================================================================
--
-- TABLE: USERS
-- Functional Dependencies:
--   id → {first_name, last_name, email, password, role, created_at}
--   email → {id, first_name, last_name, password, role, created_at}
--
-- TABLE: PRODUCTS
-- Functional Dependencies:
--   id → {name, description, price, image, calories, sale_type, unit, unit_weight, recommended, created_at}
--
-- TABLE: PRODUCT_CATEGORIES
-- Functional Dependencies:
--   (product_id, category_id) → {category_name, created_at}
--   category_id → category_name
--
-- TABLE: ADDRESSES
-- Functional Dependencies:
--   id → {user_id, label, type, address, city, province, postal_code, phone_number, delivery_instructions, latitude, longitude, is_default, created_at}
--
-- TABLE: CART_ITEMS
-- Functional Dependencies:
--   (user_id, product_id) → {product_name, quantity, created_at}
--   product_id → product_name
--
-- TABLE: ORDERS
-- Functional Dependencies:
--   id → {user_id, order_number, status, subtotal, shipping, tax_rate, total, payment_method, notes, address_id, items, quantities, prices, created_at}
--   order_number → {user_id, status, subtotal, shipping, tax_rate, total, payment_method, notes, address_id, items, quantities, prices, created_at}
--   {subtotal, shipping, tax_rate} → total
--   {order_id values} → items
--   {quantity values} → quantities
--   {price values} → prices
--

CREATE TABLE users (
  id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  first_name VARCHAR2(60) NOT NULL,
  last_name VARCHAR2(60) NOT NULL,
  email VARCHAR2(190) NOT NULL UNIQUE,
  password VARCHAR2(255) NOT NULL,
  role VARCHAR2(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT check_unit_by_sale CHECK (
    (sale_type = 'variable' AND unit IN ('kg', 'l', 'g', 'ml')) OR
    (sale_type = 'fixed' AND unit = 'unit')
  ),
  CONSTRAINT check_unit_weight_null CHECK (
    (sale_type = 'fixed') OR (sale_type = 'variable' AND unit_weight IS NULL)
  )
);

CREATE TABLE product_categories (
  product_id VARCHAR2(20) NOT NULL,
  category_id NUMBER NOT NULL,
  category_name VARCHAR2(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (product_id, category_id),
  CONSTRAINT fk_pc_product FOREIGN KEY (product_id) REFERENCES products(id)
);

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
  is_default CHAR(1) DEFAULT 'n' CHECK (is_default IN ('n', 'y')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_address_user FOREIGN KEY (user_id) REFERENCES users(id)
);


CREATE TABLE cart_items (
  user_id NUMBER NOT NULL,
  product_id VARCHAR2(20) NOT NULL,
  product_name VARCHAR2(255) NOT NULL,
  quantity NUMBER(4) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, product_id),
  CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_cart_product FOREIGN KEY (product_id) REFERENCES products(id),
);

CREATE TABLE orders (
  id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id NUMBER NOT NULL,
  order_number VARCHAR2(10) UNIQUE NOT NULL,
  status VARCHAR2(10) DEFAULT 'placed' NOT NULL CHECK (status IN ('placed', 'packaged', 'enroute', 'arrived')),
  subtotal NUMBER(10) NOT NULL,
  shipping NUMBER(10) NOT NULL DEFAULT 100,
  tax_rate NUMBER(10) NOT NULL,
  total NUMBER(10) NOT NULL,
  payment_method VARCHAR2(10) NOT NULL CHECK (payment_method IN ('cash', 'card', 'digital')),
  notes VARCHAR2(500),
  address_id NUMBER NOT NULL,
  items VARCHAR2(2000) NOT NULL,
  quantities VARCHAR2(2000) NOT NULL,
  prices VARCHAR2(2000) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_order_address FOREIGN KEY (address_id) REFERENCES addresses(id)
);



