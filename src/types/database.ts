export interface Profile {
  id: string;
  name: string;
  role: 'admin' | 'staff';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category_id: string | null;
  price: number;
  quantity: number;
  status: 'out_of_stock' | 'low_stock' | 'in_stock';
  description: string;
  created_at: string;
  updated_at: string;
}

export interface ProductWithCategory extends Product {
  categories: Category | null;
}

export interface StockTransaction {
  id: string;
  product_id: string;
  user_id: string;
  quantity: number;
  type: 'IN' | 'OUT';
  notes: string;
  created_at: string;
}

export interface StockTransactionWithDetails extends StockTransaction {
  products: Product;
  profiles: Profile;
}

export interface DashboardStats {
  totalProducts: number;
  lowStockCount: number;
  totalCategories: number;
  outOfStockCount: number;
}
