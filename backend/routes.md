# Backend API Routes

Base URL: `http://<host>:<port>`

Authentication for protected routes:
- Header: `Authorization: Bearer <JWT_TOKEN>`
- Missing token response:
```json
{
  "success": false,
  "message": "Authorization token is required"
}
```
- Invalid/expired token response:
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

Global error formats:
- Unknown route:
```json
{
  "success": false,
  "message": "Route not found: <METHOD> <PATH>"
}
```
- Unhandled server error:
```json
{
  "success": false,
  "message": "Internal Server Error"
}
```

## System Routes

### GET /
Description: API root check.
Auth: Not required.
Request body: none.
Success 200:
```json
{
  "success": true,
  "message": "Grocery backend API is running"
}
```
Failure: 500 global error format.

### GET /api/health
Description: server and DB health check.
Auth: Not required.
Request body: none.
Success 200:
```json
{
  "success": true,
  "message": "Server and database are healthy",
  "timestamp": "2026-04-26T12:34:56.000Z"
}
```
Failure: 500 global error format.

## Auth Routes

### POST /api/auth/register
Description: register new user.
Auth: Not required.
Request body:
```json
{
  "firstName": "Ayan",
  "lastName": "Khan",
  "email": "ayan@example.com",
  "password": "your-password"
}
```
Success 201:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "<jwt>",
    "user": {
      "id": 1,
      "firstName": "Ayan",
      "lastName": "Khan",
      "email": "ayan@example.com",
      "role": "customer"
    }
  }
}
```
Failure examples:
- 400 missing required fields:
```json
{
  "success": false,
  "message": "firstName, lastName, email and password are required"
}
```
- 409 duplicate email:
```json
{
  "success": false,
  "message": "Email is already registered"
}
```

### POST /api/auth/login
Description: authenticate existing user.
Auth: Not required.
Request body:
```json
{
  "email": "ayan@example.com",
  "password": "your-password"
}
```
Success 200:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "<jwt>",
    "user": {
      "id": 1,
      "firstName": "Ayan",
      "lastName": "Khan",
      "email": "ayan@example.com",
      "role": "customer"
    }
  }
}
```
Failure examples:
- 400 missing fields
- 401 invalid credentials
- 403 inactive account

### GET /api/auth/me
Description: return current active user from token.
Auth: Required.
Request body: none.
Success 200:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "firstName": "Ayan",
      "lastName": "Khan",
      "email": "ayan@example.com",
      "role": "customer"
    }
  }
}
```
Failure examples:
- 401 auth failures
- 404 user not found

## Product Routes

### GET /api/products
Description: list all products (active and inactive).
Auth: Not required.
Request body: none.
Success 200:
```json
[
  {
    "id": "prod-1",
    "name": "Wildflower Honey",
    "description": "Smooth honey",
    "price": 12.9,
    "image": "https://...",
    "calories": 320,
    "sale_type": "fixed",
    "unit": "unit",
    "unit_weight": null,
    "recommended": "true",
    "is_active": "true",
    "created_at": "2026-04-26T12:34:56.000Z"
  }
]
```
Failure: 500 global error format.

### GET /api/products/active
Description: list only active products.
Auth: Not required.
Request body: none.
Success: same shape as GET /api/products.
Failure: 500 global error format.

### GET /api/products/:id
Description: get single product by id.
Auth: Not required.
Request body: none.
Success 200:
```json
{
  "id": "prod-1",
  "name": "Wildflower Honey",
  "description": "Smooth honey",
  "price": 12.9,
  "image": "https://...",
  "calories": 320,
  "sale_type": "fixed",
  "unit": "unit",
  "unit_weight": null,
  "recommended": "true",
  "is_active": "true",
  "created_at": "2026-04-26T12:34:56.000Z"
}
```
Failure example:
- 404 `{ "message": "Product not found" }`

### POST /api/products
Description: create product.
Auth: Not required.
Request body:
```json
{
  "id": "prod-999",
  "name": "Sample Product",
  "description": "Optional",
  "price": 10.5,
  "image": "https://...",
  "calories": 120,
  "sale_type": "fixed",
  "unit": "g",
  "unit_weight": 500
}
```
Rules:
- Required: id, name, price, image, calories, sale_type, unit
- sale_type: fixed | variable
- unit must be one of kg, l, g, ml
- if sale_type=variable, unit_weight must be null/empty
- price > 0, calories >= 0
Success 201: created product object (same shape as GET by id).
Failure examples:
- 400 validation error `{ "message": "..." }`
- 409 duplicate id `{ "message": "Product with this id already exists" }`

### DELETE /api/products/:id
Description: soft-delete product by setting is_active=false.
Auth: Not required.
Request body: none.
Success 200:
```json
{
  "message": "Product deactivated successfully"
}
```
Failure example:
- 404 `{ "message": "Product not found" }`

## Category Routes

### GET /api/categories
Description: list categories with product id mappings.
Auth: Not required.
Request body: none.
Success 200:
```json
[
  {
    "id": 1,
    "name": "Pantry",
    "productIds": ["prod-1", "prod-2"]
  }
]
```
Failure: 500 global error format.

### GET /api/categories/:id
Description: get category by id with product id mappings.
Auth: Not required.
Request body: none.
Success 200: same object shape as list item.
Failure:
- 404 `{ "message": "Category not found" }`

### POST /api/categories
Description: create category.
Auth: Not required.
Request body:
```json
{
  "name": "Frozen"
}
```
Success 201:
```json
{
  "id": 5,
  "name": "Frozen",
  "productIds": []
}
```
Failure examples:
- 400 name missing
- 409 duplicate name

### PUT /api/categories/:id
Description: update category name.
Auth: Not required.
Request body:
```json
{
  "name": "Fresh Produce"
}
```
Success 200:
```json
{
  "id": 4,
  "name": "Fresh Produce"
}
```
Failure examples:
- 400 invalid name
- 404 category not found
- 409 duplicate name

### DELETE /api/categories/:id
Description: delete category.
Auth: Not required.
Request body: none.
Success 200:
```json
{
  "message": "Category deleted successfully"
}
```
Failure:
- 404 category not found

## Category-Product Mapping Routes

### GET /api/categories/:categoryId/products
Description: get product ids mapped to a category.
Auth: Required.
Request body: none.
Success 200:
```json
{
  "categoryId": 1,
  "categoryName": "Pantry",
  "productIds": ["prod-1", "prod-2"]
}
```
Failure examples:
- 401 auth failure
- 404 category not found

### PUT /api/categories/:categoryId/products
Description: replace category-product mappings in bulk.
Auth: Required.
Request body:
```json
{
  "productIds": ["prod-1", "prod-3"]
}
```
Success 200:
```json
{
  "categoryId": 1,
  "categoryName": "Pantry",
  "productIds": ["prod-1", "prod-3"]
}
```
Failure examples:
- 400 `productIds` is not an array
- 400 unknown product ids:
```json
{
  "message": "Some product IDs do not exist",
  "missingProductIds": ["prod-x"]
}
```
- 401 auth failure
- 404 category not found

### GET /api/products/:productId/categories
Description: get category ids for a product.
Auth: Not required.
Request body: none.
Success 200:
```json
{
  "productId": "prod-1",
  "categoryIds": [1, 2]
}
```
Failure:
- 404 product not found

## Cart Routes

### GET /api/cart
Description: list current user cart items.
Auth: Required.
Request body: none.
Success 200:
```json
{
  "items": [
    {
      "id": "prod-1",
      "name": "Wildflower Honey",
      "price": 12.9,
      "image": "https://...",
      "sale_type": "fixed",
      "unit": "unit",
      "unit_weight": null,
      "description": "Smooth honey",
      "quantity": 2,
      "unitWeight": null
    }
  ]
}
```
Failure: 401 auth failure.

### POST /api/cart
Description: add item or overwrite quantity for item in cart.
Auth: Required.
Request body:
```json
{
  "id": "prod-1",
  "quantity": 2
}
```
Rules: quantity must be integer > 0.
Success 201: cart item object (same shape as item in GET /api/cart).
Failure examples:
- 400 invalid quantity/body
- 401 auth failure
- 404 product not found

### PUT /api/cart/:id
Description: update quantity of one cart item.
Auth: Required.
Path param id: product id.
Request body:
```json
{
  "quantity": 3
}
```
Rules: quantity must be integer >= 0.
Behavior: quantity=0 removes item.
Success 200:
- for update: cart item object
- for quantity=0:
```json
{
  "message": "Item removed from cart"
}
```
Failure examples:
- 400 invalid quantity
- 401 auth failure
- 404 cart item not found

### DELETE /api/cart/:id
Description: delete cart item by product id.
Auth: Required.
Success 200:
```json
{
  "message": "Item removed from cart"
}
```
Failure:
- 404 cart item not found

### DELETE /api/cart/product/:productId
Description: delete cart item by productId route variant.
Auth: Required.
Success 200:
```json
{
  "message": "Product removed from cart"
}
```
Failure:
- 404 product not found in cart

### POST /api/cart/clear
Description: clear entire cart for current user.
Auth: Required.
Request body: none.
Success 200:
```json
{
  "message": "Cart cleared successfully"
}
```
Failure: 401 auth failure.

## Address Routes

### GET /api/addresses
Description: list current user addresses.
Auth: Required.
Request body: none.
Success 200:
```json
[
  {
    "id": 10,
    "label": "Home",
    "type": "home",
    "address": "123 Main Street",
    "city": "Karachi",
    "province": "Sindh",
    "postal_code": "75500",
    "phone_number": "+923001234567",
    "delivery_instructions": "Ring bell",
    "latitude": 24.86,
    "longitude": 67.01,
    "is_default": "true",
    "created_at": "2026-04-26T12:34:56.000Z",
    "isDefault": true
  }
]
```
Failure: 401 auth failure.

### GET /api/addresses/:id
Description: get one address for current user.
Auth: Required.
Success 200: same object shape as list item.
Failure examples:
- 401 auth failure
- 404 address not found

### POST /api/addresses
Description: create address.
Auth: Required.
Request body:
```json
{
  "label": "Home",
  "type": "home",
  "address": "123 Main Street",
  "city": "Karachi",
  "province": "Sindh",
  "postal_code": "75500",
  "phone_number": "+923001234567",
  "delivery_instructions": "Ring bell",
  "latitude": 24.86,
  "longitude": 67.01,
  "isDefault": true
}
```
Rules:
- Required: address, city, province, postal_code
- type (if provided): home | work | other
Success 201: created address object (same shape as GET).
Failure examples:
- 400 validation message
- 401 auth failure

### PUT /api/addresses/:id
Description: update address for current user.
Auth: Required.
Request body: any subset of fields from POST body.
Rules:
- type (if provided): home | work | other
- isDefault supports boolean or string true/false
Success 200: updated address object.
Failure examples:
- 400 invalid type
- 401 auth failure
- 404 address not found

### DELETE /api/addresses/:id
Description: delete address for current user.
Auth: Required.
Request body: none.
Success 200:
```json
{
  "message": "Address deleted successfully"
}
```
Failure:
- 401 auth failure
- 404 address not found

## Order Routes

### GET /api/orders
Description: list current user orders with items and parsed address snapshot.
Auth: Required.
Request body: none.
Success 200:
```json
{
  "orders": [
    {
      "id": 101,
      "orderNumber": "O123456789",
      "status": "placed",
      "subtotal": 25.8,
      "shipping": 5.99,
      "taxes": 1.29,
      "total": 33.08,
      "paymentMethod": "cash",
      "notes": "Leave at door",
      "addressId": 10,
      "addressSnapshot": {
        "id": 10,
        "label": "Home",
        "type": "home",
        "address": "123 Main Street",
        "city": "Karachi",
        "province": "Sindh",
        "postalCode": "75500",
        "phoneNumber": "+923001234567",
        "deliveryInstructions": "Ring bell",
        "latitude": 24.86,
        "longitude": 67.01,
        "isDefault": true
      },
      "createdAt": "2026-04-26T12:34:56.000Z",
      "items": [
        {
          "productId": "prod-1",
          "productName": "Wildflower Honey",
          "quantity": 2,
          "priceAtPurchase": 12.9,
          "saleType": "fixed",
          "unit": "unit",
          "unitWeight": null,
          "image": "https://..."
        }
      ],
      "itemCount": 2
    }
  ]
}
```
Failure: 401 auth failure.

### POST /api/orders
Description: place order from current cart and selected address.
Auth: Required.
Request body:
```json
{
  "addressId": 10,
  "paymentMethod": "cash",
  "deliveryNotes": "Leave at door"
}
```
Rules:
- addressId required
- paymentMethod required and one of cash, card, digital
- cart must not be empty
- cart must not contain inactive products
Success 201:
```json
{
  "id": 101,
  "orderNumber": "O123456789",
  "status": "placed",
  "subtotal": 25.8,
  "shipping": 5.99,
  "taxes": 1.29,
  "total": 33.08,
  "paymentMethod": "cash",
  "notes": "Leave at door",
  "createdAt": "2026-04-26T12:34:56.000Z"
}
```
Failure examples:
- 400 invalid request/payment method
- 400 cart empty/inactive products
- 401 auth failure
- 404 selected address not found

## Admin Routes

### POST /api/admin/query
Description: run arbitrary SQL for admin dashboard operations.
Auth: Required.
Server check: token role must be `admin`.
Request body:
```json
{
  "sql": "SELECT COUNT(*) AS users_count FROM users",
  "params": []
}
```
Success 200 for SELECT:
```json
{
  "success": true,
  "rows": [
    {
      "users_count": 42
    }
  ]
}
```
Success 200 for non-SELECT:
```json
{
  "success": true,
  "result": {
    "affectedRows": 3
  }
}
```
Failure examples:
- 400 missing/invalid `sql` or invalid `params`
- 401 auth failure
- 403 non-admin role
