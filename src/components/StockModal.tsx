import { useState, FormEvent } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product } from '../types/database';

interface StockModalProps {
  products: Product[];
  userId: string;
  onClose: () => void;
}

export default function StockModal({ products, userId, onClose }: StockModalProps) {
  const [formData, setFormData] = useState({
    product_id: '',
    type: 'IN' as 'IN' | 'OUT',
    quantity: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const quantity = parseInt(formData.quantity);
      const product = products.find((p) => p.id === formData.product_id);

      if (!product) {
        throw new Error('Product not found');
      }

      if (formData.type === 'OUT' && product.quantity < quantity) {
        throw new Error('Insufficient stock quantity');
      }

      const { error: txError } = await supabase.from('stock_transactions').insert([
        {
          product_id: formData.product_id,
          user_id: userId,
          quantity,
          type: formData.type,
          notes: formData.notes,
        },
      ]);

      if (txError) throw txError;

      const newQuantity =
        formData.type === 'IN' ? product.quantity + quantity : product.quantity - quantity;

      const { error: updateError } = await supabase
        .from('products')
        .update({ quantity: newQuantity })
        .eq('id', formData.product_id);

      if (updateError) throw updateError;

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record transaction');
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = products.find((p) => p.id === formData.product_id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Add Stock Transaction</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="product" className="block text-sm font-medium text-slate-700 mb-2">
              Product *
            </label>
            <select
              id="product"
              value={formData.product_id}
              onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} (Current: {product.quantity})
                </option>
              ))}
            </select>
          </div>

          {selectedProduct && (
            <div className="bg-blue-50 border border-blue-200 px-4 py-3 rounded-lg">
              <p className="text-sm text-blue-900">
                Current Stock: <span className="font-semibold">{selectedProduct.quantity}</span>
              </p>
            </div>
          )}

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-slate-700 mb-2">
              Transaction Type *
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'IN' | 'OUT' })}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="IN">Stock In (Add)</option>
              <option value="OUT">Stock Out (Remove)</option>
            </select>
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-slate-700 mb-2">
              Quantity *
            </label>
            <input
              id="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Enter quantity"
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-2">
              Notes
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              placeholder="Transaction notes..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition"
            >
              {loading ? 'Recording...' : 'Record Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
