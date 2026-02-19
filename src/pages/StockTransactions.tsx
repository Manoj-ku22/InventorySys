import { useEffect, useState } from 'react';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { StockTransactionWithDetails, Product } from '../types/database';
import StockModal from '../components/StockModal';
import { useAuth } from '../contexts/AuthContext';

export default function StockTransactions() {
  const [transactions, setTransactions] = useState<StockTransactionWithDetails[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadTransactions();
    loadProducts();
  }, []);

  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('stock_transactions')
        .select('*, products(*), profiles(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    loadTransactions();
    loadProducts();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-600">Loading transactions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Stock Transactions</h1>
          <p className="text-slate-600 mt-1">Track all stock movements</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Add Transaction
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No transactions yet
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {transaction.products.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <TypeBadge type={transaction.type} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {transaction.type === 'IN' ? '+' : '-'}
                      {transaction.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {transaction.profiles.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {transaction.notes || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && user && (
        <StockModal products={products} userId={user.id} onClose={handleModalClose} />
      )}
    </div>
  );
}

function TypeBadge({ type }: { type: 'IN' | 'OUT' }) {
  if (type === 'IN') {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
        <TrendingUp className="w-3 h-3" />
        Stock In
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
      <TrendingDown className="w-3 h-3" />
      Stock Out
    </span>
  );
}
