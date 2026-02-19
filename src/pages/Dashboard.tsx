import { useEffect, useState } from 'react';
import { Package, AlertTriangle, FolderOpen, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { DashboardStats, ProductWithCategory } from '../types/database';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    lowStockCount: 0,
    totalCategories: 0,
    outOfStockCount: 0,
  });
  const [recentProducts, setRecentProducts] = useState<ProductWithCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [productsRes, categoriesRes, recentRes] = await Promise.all([
        supabase.from('products').select('status'),
        supabase.from('categories').select('id'),
        supabase
          .from('products')
          .select('*, categories(*)')
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      if (productsRes.data) {
        const lowStock = productsRes.data.filter((p) => p.status === 'low_stock').length;
        const outOfStock = productsRes.data.filter((p) => p.status === 'out_of_stock').length;

        setStats({
          totalProducts: productsRes.data.length,
          lowStockCount: lowStock,
          totalCategories: categoriesRes.data?.length || 0,
          outOfStockCount: outOfStock,
        });
      }

      if (recentRes.data) {
        setRecentProducts(recentRes.data);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">Overview of your inventory system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={<Package className="w-8 h-8 text-blue-600" />}
          bgColor="bg-blue-50"
        />
        <StatCard
          title="Low Stock Items"
          value={stats.lowStockCount}
          icon={<AlertTriangle className="w-8 h-8 text-amber-600" />}
          bgColor="bg-amber-50"
        />
        <StatCard
          title="Total Categories"
          value={stats.totalCategories}
          icon={<FolderOpen className="w-8 h-8 text-green-600" />}
          bgColor="bg-green-50"
        />
        <StatCard
          title="Out of Stock"
          value={stats.outOfStockCount}
          icon={<XCircle className="w-8 h-8 text-red-600" />}
          bgColor="bg-red-50"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Recent Products</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {recentProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No products yet
                  </td>
                </tr>
              ) : (
                recentProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {product.categories?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {product.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={product.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  bgColor,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  bgColor: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`${bgColor} p-3 rounded-lg`}>{icon}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    in_stock: 'bg-green-100 text-green-800',
    low_stock: 'bg-amber-100 text-amber-800',
    out_of_stock: 'bg-red-100 text-red-800',
  };

  const labels = {
    in_stock: 'In Stock',
    low_stock: 'Low Stock',
    out_of_stock: 'Out of Stock',
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        colors[status as keyof typeof colors]
      }`}
    >
      {labels[status as keyof typeof labels]}
    </span>
  );
}
