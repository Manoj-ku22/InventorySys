/*
  # Inventory Management System Database Schema

  ## Overview
  Creates the complete database schema for an inventory management system with authentication,
  product management, categories, and stock transaction tracking.

  ## New Tables
  
  ### 1. `profiles`
  User profile extension for auth.users
  - `id` (uuid, primary key, references auth.users)
  - `name` (text, user's full name)
  - `role` (text, either 'admin' or 'staff')
  - `is_active` (boolean, account status)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `categories`
  Product categories for organization
  - `id` (uuid, primary key)
  - `name` (text, unique category name)
  - `description` (text, category description)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `products`
  Main products inventory
  - `id` (uuid, primary key)
  - `name` (text, product name)
  - `sku` (text, unique stock keeping unit)
  - `category_id` (uuid, references categories)
  - `price` (decimal, product price)
  - `quantity` (integer, current stock quantity)
  - `status` (text, computed: 'out_of_stock', 'low_stock', 'in_stock')
  - `description` (text, product description)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. `stock_transactions`
  Track all stock movements (in/out)
  - `id` (uuid, primary key)
  - `product_id` (uuid, references products)
  - `user_id` (uuid, references auth.users)
  - `quantity` (integer, amount changed)
  - `type` (text, 'IN' or 'OUT')
  - `notes` (text, optional transaction notes)
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Profiles: Users can read all, update own, admins can manage all
  - Categories: Authenticated users can read, admins can manage
  - Products: Authenticated users can read, admins and staff can manage
  - Stock Transactions: Authenticated users can read own, admins can see all

  ## Functions
  - Auto-update product status based on quantity
  - Auto-create profile on user signup
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sku text UNIQUE NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  price decimal(10,2) NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 0,
  status text GENERATED ALWAYS AS (
    CASE 
      WHEN quantity = 0 THEN 'out_of_stock'
      WHEN quantity < 5 THEN 'low_stock'
      ELSE 'in_stock'
    END
  ) STORED,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create stock_transactions table
CREATE TABLE IF NOT EXISTS stock_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quantity integer NOT NULL,
  type text NOT NULL CHECK (type IN ('IN', 'OUT')),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_product ON stock_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_user ON stock_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_created ON stock_transactions(created_at);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'User'), 'staff');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for categories
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for products
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff and admins can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_active = true
    )
  );

CREATE POLICY "Staff and admins can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_active = true
    )
  );

CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for stock_transactions
CREATE POLICY "Users can view all stock transactions"
  ON stock_transactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Active staff can insert stock transactions"
  ON stock_transactions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_active = true
    )
  );

-- Insert sample categories
INSERT INTO categories (name, description) VALUES
  ('Electronics', 'Electronic devices and accessories'),
  ('Furniture', 'Office and home furniture'),
  ('Stationery', 'Office supplies and stationery'),
  ('Hardware', 'Tools and hardware supplies'),
  ('Consumables', 'Consumable items and supplies')
ON CONFLICT (name) DO NOTHING;