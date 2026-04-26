DELETE FROM product_categories;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM cart_items;
DELETE FROM products;
DELETE FROM categories;

INSERT INTO categories (name) VALUES ('Pantry');
INSERT INTO categories (name) VALUES ('Dairy');
INSERT INTO categories (name) VALUES ('Bakery');
INSERT INTO categories (name) VALUES ('Fresh Produce');

INSERT INTO products (id, name, description, price, image, calories, sale_type, unit, unit_weight, recommended)
VALUES ('prod-1', 'Wildflower Honey', 'Smooth honey with a warm floral taste', 12.9, 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=900&q=80', 320, 'fixed', 'g', 500, 'true');

INSERT INTO products (id, name, description, price, image, calories, sale_type, unit, unit_weight, recommended)
VALUES ('prod-2', 'Greek Yogurt Bowl', 'Creamy yogurt for breakfast or snacks', 5.5, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80', 180, 'fixed', 'kg', 1, 'true');

INSERT INTO products (id, name, description, price, image, calories, sale_type, unit, unit_weight, recommended)
VALUES ('prod-3', 'Fresh Sourdough', 'Soft loaf with a crisp crust', 4.75, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80', 250, 'fixed', 'l', 1.5, 'true');

INSERT INTO products (id, name, description, price, image, calories, sale_type, unit, unit_weight, recommended)
VALUES ('prod-4', 'Crisp Tomatoes', 'Juicy tomatoes for salads and cooking', 3.25, 'https://images.unsplash.com/photo-1546470427-e0f5f8c4d7ad?auto=format&fit=crop&w=900&q=80', 25, 'fixed', 'ml', 150, 'false');

INSERT INTO product_categories (product_id, category_id)
SELECT 'prod-1', id FROM categories WHERE name = 'Pantry';

INSERT INTO product_categories (product_id, category_id)
SELECT 'prod-1', id FROM categories WHERE name = 'Dairy';

INSERT INTO product_categories (product_id, category_id)
SELECT 'prod-1', id FROM categories WHERE name = 'Bakery';

INSERT INTO product_categories (product_id, category_id)
SELECT 'prod-1', id FROM categories WHERE name = 'Fresh Produce';

INSERT INTO product_categories (product_id, category_id)
SELECT 'prod-2', id FROM categories WHERE name = 'Pantry';

INSERT INTO product_categories (product_id, category_id)
SELECT 'prod-2', id FROM categories WHERE name = 'Dairy';

INSERT INTO product_categories (product_id, category_id)
SELECT 'prod-2', id FROM categories WHERE name = 'Bakery';

INSERT INTO product_categories (product_id, category_id)
SELECT 'prod-2', id FROM categories WHERE name = 'Fresh Produce';

INSERT INTO product_categories (product_id, category_id)
SELECT 'prod-3', id FROM categories WHERE name = 'Pantry';

INSERT INTO product_categories (product_id, category_id)
SELECT 'prod-3', id FROM categories WHERE name = 'Dairy';

INSERT INTO product_categories (product_id, category_id)
SELECT 'prod-3', id FROM categories WHERE name = 'Bakery';

INSERT INTO product_categories (product_id, category_id)
SELECT 'prod-3', id FROM categories WHERE name = 'Fresh Produce';

INSERT INTO product_categories (product_id, category_id)
SELECT 'prod-4', id FROM categories WHERE name = 'Pantry';

INSERT INTO product_categories (product_id, category_id)
SELECT 'prod-4', id FROM categories WHERE name = 'Dairy';

INSERT INTO product_categories (product_id, category_id)
SELECT 'prod-4', id FROM categories WHERE name = 'Bakery';

INSERT INTO product_categories (product_id, category_id)
SELECT 'prod-4', id FROM categories WHERE name = 'Fresh Produce';
