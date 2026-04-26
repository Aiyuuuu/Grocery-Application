

-- PURE TRANSITIVE DEPENDENCIES ANALYSIS FOR 3NF SCHEMA
--
-- 3NF Compliance: Only pure transitive dependencies (where non-key attributes' VALUES depend on 
-- other non-key attributes) are eliminated. Constraint-based dependencies (CHECK rules validating 
-- allowed combinations) are retained as they don't violate 3NF in practice.
--
-- CONSTRAINTS RETAINED (not pure transitive dependencies):
-- 1. unit/unit_weight validation via CHECK (sale_type): These constraints validate which unit 
--    values are allowed for each sale_type, but unit and unit_weight don't functionally depend 
--    on sale_type for their existence. They're just enforcement rules, not data dependencies.
--
-- PURE TRANSITIVE DEPENDENCY ELIMINATED:
-- 1. Orders Table - Total Cost Field
--    The total column violates 3NF because its VALUE is derived from non-key attributes:
--    total = subtotal + tax_rate + shipping
--    This is a true transitive dependency: total --> {subtotal, tax_rate, shipping} --> id
--    Solution: Remove stored total; calculate at application layer instead.
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
  -- RETAINED (not a pure transitive dependency - this is constraint-based validation):
  CONSTRAINT check_unit_by_sale CHECK (
    (sale_type = 'variable' AND unit IN ('kg', 'l', 'g', 'ml')) OR
    (sale_type = 'fixed' AND unit = 'unit')
  ),
  -- RETAINED (not a pure transitive dependency - this is constraint-based validation):
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
  -- REMOVED: total NUMBER(10) NOT NULL
  -- REASON: Pure transitive dependency - total's value is derived from subtotal + tax_rate + shipping
  -- RESOLUTION: Calculate at application layer as (subtotal + shipping + (subtotal * tax_rate))
  --
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

