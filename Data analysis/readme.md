1️⃣ Database Connection

The project uses an Oracle Database as the backend for storing customer, product, and order data. Python communicates with the database using SQLAlchemy and the OracleDB driver.

Connection Parameters:
User: system
Password: oracle123
Host: localhost
Port: 1522
Service Name: XEXDB

Connection Code:
from sqlalchemy import create_engine
engine = create_engine(
  f"oracle+oracledb://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/?service_name={DB_SERVICE}"
)
This connection is used for all database operations: inserting, updating, and retrieving data.

Database Tables:

customers	->Stores customer information

products->	Stores product details

orders->	Stores purchase transactions

2️⃣ Data Collection

Data collection happens in three main areas:

Signup Page – Collects customer information

Admin Panel – Manages products

Checkout Page – Records orders

Supporting functions clean, validate, and store data efficiently into Excel files and the Oracle database.

2.1 Customer Data – Signup Page

Function: register_customer(name, email, address, phone)

Purpose: Collects information from new customers or updates returning customers.

Input Fields:

name – Customer’s full name

email – Customer’s email address

address – Delivery address

phone – Contact number

Process Steps:

Check Existing Customer:

Updates information if the email exists.

Generate Unique Customer ID:

Uses existing IDs from Excel and the database.

Data Cleaning:

Numeric fields cleaned (customer_id, phone)

Strings standardized to proper case

Mandatory fields validated

Validation:

Email format checked (abc@domain.com
)

Phone number length checked (10–12 digits)

Empty records blocked

Storage:

Saves to customers.xlsx

Updates customers table in Oracle DB

Extra Functionality:

Updates last_login for returning customers

Outcome: Clean, validated customer records stored in Excel and the database.

2.2 Product Data – Admin Panel

Function: add_or_update_product(product_id, product_name, price, category, supplier, stock=None)

Purpose: Allows admin to add or update products and ensures consistency in orders.

Input Fields:

product_id – Unique product identifier

product_name – Product name

price – Price per unit

category – Product category

supplier – Supplier name

stock – Available quantity (default 0)

Process Steps:

Check Existing Product:

Updates existing product or adds new.

Data Cleaning:

Numeric and string fields cleaned

Standardized text formats

Price Updates Cascade:

Updates all related orders automatically

Storage:

Saves to products.xlsx

Updates products table in the database

Outcome: Product data remains clean, accurate, and synchronized with orders.

2.3 Order Data – Checkout Page

Function: register_order(customer_id, product_id, quantity, payment_method, price)

Purpose: Records customer purchases and updates stock automatically.

Input Fields:

customer_id – Customer placing the order(Get the Same customer_id if same customer login)

product_id – Product purchased(Get from Products database table)

quantity – Number of units

payment_method – Payment type

price – Total price (calculated automatically)

Process Steps:

Check Product Availability – Prevents overselling

Calculate Total Price – Multiplies product price by quantity

Check Existing Orders – Updates if exists, else creates new

Data Cleaning – Validates numeric and string fields

Update Stock – Deducts purchased quantity

Storage – Saves to orders.xlsx and database

Outcome: Accurate order records, adjusted stock, stored in Excel and DB.

3️⃣ Data Cleaning

Data cleaning ensures accuracy, completeness, and consistency across all records.

Functions Used:

is_row_empty(row, cols) – Checks for empty or invalid fields

advanced_clean_row() – Cleans numeric and string fields, standardizes text

save_to_db_append_or_update() – Saves data to DB/Excel, avoids duplicates

auto_adjust_excel_columns() – Adjusts Excel columns for readability

Purpose: Clean data is essential for proper storage, order processing, stock management, and analysis.

4️⃣ Data Analysis

Analyzes collected data to extract insights and trends.

Key Analyses:

Total Sales Revenue – Overall income from all orders

Most Sold Products – Items purchased most frequently

Revenue by Product – Income contribution per product

Top Customers – Highest spending customers

Payment Method Analysis – Distribution of payment types

Sales by Category – Revenue per product category

Low Stock Products – Products running low on inventory

Customer Location Analysis – Orders per city

Outcome: Provides actionable insights for inventory, marketing, and sales strategies.

5️⃣ Data Visualization

Visualizations help understand data quickly:

Revenue by Product – Bar chart of income per product

Payment Method Distribution – Pie chart of payment preferences

Orders by City – Bar chart of orders per location

Sales by Category – Bar chart of revenue per category

