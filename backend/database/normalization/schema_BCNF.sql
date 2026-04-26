

-- ============================================================================
-- BOYCE-CODD NORMAL FORM (BCNF) VIOLATION ANALYSIS
-- ============================================================================
--
-- BCNF Definition: A relation is in BCNF if and only if for every non-trivial
-- functional dependency X → Y (where Y is not a subset of X), X is a SUPERKEY.
--
-- Analysis Scope: Only PURE functional dependencies (data dependencies) are considered.
-- Constraint-based validations (CHECK constraints) are excluded as they are 
-- enforcement rules, not actual data dependencies.
--
-- TABLE-BY-TABLE ANALYSIS:
-- ============================================================================
--
-- 1. USERS TABLE: BCNF COMPLIANT
--    Primary Key: id
--    Candidate Key: email (UNIQUE)
--    Pure Functional Dependencies:
--      - id → {all other attributes} [KEY, TRIVIAL]
--      - email → {all other attributes} [SUPERKEY (candidate key), TRIVIAL]
--    Analysis: All determinants are superkeys. BCNF SATISFIED.
--
-- 2. PRODUCTS TABLE:  BCNF COMPLIANT
--    Primary Key: id
--    Candidate Keys: None
--    Pure Functional Dependencies:
--      - id → {name, description, price, image, calories, sale_type, unit, unit_weight, recommended, created_at} [KEY, TRIVIAL]
--    Note: CHECK constraints (sale_type → unit, sale_type → unit_weight) are validation rules, not data dependencies.
--    Analysis: Only trivial dependencies. BCNF SATISFIED.
--
-- 3. CATEGORIES TABLE:  BCNF COMPLIANT
--    Primary Key: id
--    Pure Functional Dependencies:
--      - id → {name} [KEY, TRIVIAL]
--    Analysis: Only trivial dependencies. BCNF SATISFIED.
--
-- 4. PRODUCT_CATEGORIES TABLE:  BCNF COMPLIANT
--    Primary Key: (product_id, category_id)
--    Pure Functional Dependencies:
--      - (product_id, category_id) → {created_at} [KEY, TRIVIAL]
--    Analysis: Only trivial dependencies. BCNF SATISFIED.
--
-- 5. ADDRESSES TABLE:  BCNF COMPLIANT
--    Primary Key: id
--    Pure Functional Dependencies:
--      - id → {all other attributes} [KEY, TRIVIAL]
--    Analysis: Only trivial dependencies. BCNF SATISFIED.
--
-- 6. CART_ITEMS TABLE:  BCNF COMPLIANT
--    Primary Key: (user_id, product_id)
--    Pure Functional Dependencies:
--      - (user_id, product_id) → {quantity, created_at} [KEY, TRIVIAL]
--    Analysis: Only trivial dependencies. BCNF SATISFIED.
--
-- 7. ORDERS TABLE: BCNF COMPLIANT
--    Primary Key: id
--    Candidate Key: order_number (UNIQUE)
--    Pure Functional Dependencies:
--      - id → {all other attributes} [KEY, TRIVIAL]
--      - order_number → {all other attributes} [SUPERKEY (candidate key), TRIVIAL]
--    Analysis: All determinants are superkeys. BCNF SATISFIED.
--
-- 8. ORDER_ITEMS TABLE: BCNF COMPLIANT
--    Primary Key: (order_id, product_id)
--    Pure Functional Dependencies:
--      - (order_id, product_id) → {quantity} [KEY, TRIVIAL]
--    Analysis: Only trivial dependencies. BCNF SATISFIED.
--
-- ============================================================================
-- SUMMARY: NO PURE BCNF VIOLATIONS FOUND
-- ============================================================================
-- This schema is BCNF compliant when considering only pure functional dependencies.
-- All non-trivial FD determinants are superkeys.
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

CREATE TABLE categories ( 
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR2(20) NOT NULL
);

CREATE TABLE product_categories (
  product_id VARCHAR2(20) NOT NULL,
  category_id NUMBER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (product_id, category_id),
  CONSTRAINT fk_pc_product FOREIGN KEY (product_id) REFERENCES products(id),
  CONSTRAINT fk_pc_category FOREIGN KEY (category_id) REFERENCES categories(id)
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
  quantity NUMBER(4) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, product_id),
  CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_cart_product FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE orders (
  id NUMBER(10) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id NUMBER NOT NULL,
  order_number VARCHAR2(10) UNIQUE NOT NULL,
  status VARCHAR2(10) DEFAULT 'placed' NOT NULL CHECK (status IN ('placed', 'packaged', 'enroute', 'arrived')),
  subtotal NUMBER(10) NOT NULL,
  shipping NUMBER(10) NOT NULL DEFAULT 100,
  tax_rate NUMBER(10) NOT NULL,
  payment_method VARCHAR2(10) NOT NULL CHECK (payment_method IN ('cash', 'card', 'digital')),
  notes VARCHAR2(500),
  address_id NUMBER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_order_address FOREIGN KEY (address_id) REFERENCES addresses(id)
);


CREATE TABLE order_items (
  order_id NUMBER(10) NOT NULL,
  product_id VARCHAR2(20) NOT NULL,
  quantity NUMBER(4) NOT NULL,
  PRIMARY KEY(order_id, product_id),
  CONSTRAINT fk_OrItems_order FOREIGN KEY (order_id) REFERENCES orders(id),
  CONSTRAINT fk_OrItems_product FOREIGN KEY (product_id) REFERENCES products(id)
);

