USE grocery_app;

INSERT INTO products (id, name, description, price, image, calories, sale_type, unit, unit_weight, recommended, tags)
VALUES
  ('prod-1', 'Manuka Honey Gold', '500+ MGO Certified', 68.00, 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZ5o6qHbTB7Hx-EbGgTICkPrfNozyqUB31PaCmZU9ZMGVk24MMoFazdYeWmrKi_ewpNiRS2w1owHtnMithUNas4cigt-7mGXcI_Rycfq91uL4lZ_Xjj6Qfpr2sBzPaL-2uydmJvaj4v_7lLSyE9ee8t6Qjz_GsD6CXjCctfqOKf5SVh41fENAh_nX77_1oSuenvJok0IYHb_YXLfo-YUpQvZmVG-OZ0GFtESKAGJI9GTpLdx-m8Y1iLZ2Dzgu86hOyxJgrt9eFelTe', 300, 'fixed', 'g', 500, 1, '["Organic","Premium"]'),
  ('prod-2', 'Raw Almond Bliss', 'Sprouted, Organic', 15.00, 'https://lh3.googleusercontent.com/aida-public/AB6AXuAIpLJ3B5I3c9epJDKyGCxqU0AT9p_5G_0-vMMDSEapbUTMPPAsurnND6shcU8AJ46yp8O7uk6mMPEqVFRHD_uRGQHunKfhCBMv9or_IUEmgrKPn9wPmpRqXQxQgJWx0ZEc2C_ScbWPkXSwBaYgvnoL2afh1lyy6ApsNiDa9G-SNUeQsjc58dI-lBSrr1FhLeMmr9idoqbEcEJTDQKpztdWlXLsNszxrPXPX--JmNeim7ZIDD4pI6FL4G-Wn_08Kp5aDUkaSjVWfNZV', 450, 'variable', 'kg', NULL, 0, '["Fresh","Keto"]'),
  ('prod-3', 'Greek Silk Yogurt', 'A2 Cultured Dairy', 9.50, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCg7eBQw3CinRkiGlp9Vmf8Sj8W6uRo6jkLhZ83iJYO48Ew7QVVIidIts2gs_G-t26kqP-Zh_XeFI9el4fLd17lRifqAJuTmogZmHRhCK9QqxFcywV26U-9VtLXdHhM0V8CDvfY4iMyDF4dsqTLOgrW_peZ2Y0TmUAvMo33phEhAA-Y46U2ttJJ_iNTvQpF_SBuJEXjbEyRy4PQbaINesMB6czopDy6zbqBHPXOt-QNx96JQuaZPKjWLxKlXAAfxxCpSAa2tzUG773d', 120, 'fixed', 'g', 200, 1, '["Local","Pure"]'),
  ('prod-4', 'Kyoto Matcha Reserve', 'Shaded First Harvest', 34.00, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmmRfnN9SR-x-_gblA5rIscykT7kLmI9nVKF12KubxhcTOHahkaVAMHoNh5eIJNL6asrOJSiVxxYBcRkYooafRpE1osk6InyRlZNFOxCeAfukMObbAMZH--yUi3ExdrI8-xzEUgbDQQyuYiq2LAxg3Hoqh3XEMNv0vdYxBXoVsHgtDarAjPK4SfvDI0AEd1_lOqSBfM0T1rFzIYSxR1vkcwPBs0J6tQhMk7c-TXMrTE1Hy_Frypqlq5NHW0eqFiaD48ABNyGdUvyra', 5, 'fixed', 'g', 50, 1, '["Japanese","Premium"]'),
  ('prod-5', 'Pure Stevia Leaves', 'Sun-dried organic stevia', 8.50, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCg7eBQw3CinRkiGlp9Vmf8Sj8W6uRo6jkLhZ83iJYO48Ew7QVVIidIts2gs_G-t26kqP-Zh_XeFI9el4fLd17lRifqAJuTmogZmHRhCK9QqxFcywV26U-9VtLXdHhM0V8CDvfY4iMyDF4dsqTLOgrW_peZ2Y0TmUAvMo33phEhAA-Y46U2ttJJ_iNTvQpF_SBuJEXjbEyRy4PQbaINesMB6czopDy6zbqBHPXOt-QNx96JQuaZPKjWLxKlXAAfxxCpSAa2tzUG773d', 0, 'fixed', 'g', 100, 0, '["Natural","Sugar-Free"]'),
  ('prod-6', 'Hearth Sourdough loaf', '36-hour Fermentation', 7.50, 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZ5o6qHbTB7Hx-EbGgTICkPrfNozyqUB31PaCmZU9ZMGVk24MMoFazdYeWmrKi_ewpNiRS2w1owHtnMithUNas4cigt-7mGXcI_Rycfq91uL4lZ_Xjj6Qfpr2sBzPaL-2uydmJvaj4v_7lLSyE9ee8t6Qjz_GsD6CXjCctfqOKf5SVh41fENAh_nX77_1oSuenvJok0IYHb_YXLfo-YUpQvZmVG-OZ0GFtESKAGJI9GTpLdx-m8Y1iLZ2Dzgu86hOyxJgrt9eFelTe', 250, 'fixed', 'g', 100, 1, '["Artisanal","Freshly Baked"]'),
  ('prod-7', 'Whole Milk', 'Creamy dairy milk with a rich finish.', 24.00, 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZ5o6qHbTB7Hx-EbGgTICkPrfNozyqUB31PaCmZU9ZMGVk24MMoFazdYeWmrKi_ewpNiRS2w1owHtnMithUNas4cigt-7mGXcI_Rycfq91uL4lZ_Xjj6Qfpr2sBzPaL-2uydmJvaj4v_7lLSyE9ee8t6Qjz_GsD6CXjCctfqOKf5SVh41fENAh_nX77_1oSuenvJok0IYHb_YXLfo-YUpQvZmVG-OZ0GFtESKAGJI9GTpLdx-m8Y1iLZ2Dzgu86hOyxJgrt9eFelTe', 220, 'variable', 'L', NULL, 1, '["Fresh","High Protein"]'),
  ('prod-8', 'Garden Roma Tomatoes', 'Sweet, firm tomatoes for daily cooking.', 4.25, 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZ5o6qHbTB7Hx-EbGgTICkPrfNozyqUB31PaCmZU9ZMGVk24MMoFazdYeWmrKi_ewpNiRS2w1owHtnMithUNas4cigt-7mGXcI_Rycfq91uL4lZ_Xjj6Qfpr2sBzPaL-2uydmJvaj4v_7lLSyE9ee8t6Qjz_GsD6CXjCctfqOKf5SVh41fENAh_nX77_1oSuenvJok0IYHb_YXLfo-YUpQvZmVG-OZ0GFtESKAGJI9GTpLdx-m8Y1iLZ2Dzgu86hOyxJgrt9eFelTe', 18, 'fixed', 'g', 500, 0, '["Fresh","Produce"]'),
  ('prod-9', 'Crisp Bell Peppers', 'Mixed peppers for salads and stir fry.', 5.50, 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZ5o6qHbTB7Hx-EbGgTICkPrfNozyqUB31PaCmZU9ZMGVk24MMoFazdYeWmrKi_ewpNiRS2w1owHtnMithUNas4cigt-7mGXcI_Rycfq91uL4lZ_Xjj6Qfpr2sBzPaL-2uydmJvaj4v_7lLSyE9ee8t6Qjz_GsD6CXjCctfqOKf5SVh41fENAh_nX77_1oSuenvJok0IYHb_YXLfo-YUpQvZmVG-OZ0GFtESKAGJI9GTpLdx-m8Y1iLZ2Dzgu86hOyxJgrt9eFelTe', 30, 'fixed', 'g', 300, 0, '["Fresh","Vegetables"]')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  price = VALUES(price),
  image = VALUES(image),
  calories = VALUES(calories),
  sale_type = VALUES(sale_type),
  unit = VALUES(unit),
  unit_weight = VALUES(unit_weight),
  recommended = VALUES(recommended),
  tags = VALUES(tags);

INSERT INTO categories (name)
VALUES
  ('Artisanal Bakery'),
  ('The Pantry'),
  ('Dairy & Eggs'),
  ('Meat & Seafood'),
  ('Sugar Free'),
  ('Protein Rich'),
  ('Fruits & Veggies')
ON DUPLICATE KEY UPDATE
  name = VALUES(name);

DELETE FROM product_categories;

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id
FROM products p
JOIN categories c ON c.name = 'Artisanal Bakery'
WHERE p.id = 'prod-6';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id
FROM products p
JOIN categories c ON c.name = 'The Pantry'
WHERE p.id IN ('prod-1', 'prod-2', 'prod-4', 'prod-5');

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id
FROM products p
JOIN categories c ON c.name = 'Dairy & Eggs'
WHERE p.id = 'prod-3';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id
FROM products p
JOIN categories c ON c.name = 'Meat & Seafood'
WHERE p.id = 'prod-7';

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id
FROM products p
JOIN categories c ON c.name = 'Sugar Free'
WHERE p.id IN ('prod-1', 'prod-4', 'prod-5');

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id
FROM products p
JOIN categories c ON c.name = 'Protein Rich'
WHERE p.id IN ('prod-2', 'prod-3', 'prod-7');

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id
FROM products p
JOIN categories c ON c.name = 'Fruits & Veggies'
WHERE p.id IN ('prod-8', 'prod-9');
