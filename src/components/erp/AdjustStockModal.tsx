import React, { useState } from 'react';
import { X, PackagePlus, PlusCircle } from 'lucide-react';
import { Product } from '../../types/erp';

interface AdjustStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onAddStock: (productId: string, quantityToAdd: number, newCostPrice?: number) => void;
  preselectedProductId?: string;
}

export const AdjustStockModal: React.FC<AdjustStockModalProps> = ({
  isOpen,
  onClose,
  products,
  onAddStock,
  preselectedProductId
}) => {
  const [selectedProductId, setSelectedProductId] = useState(preselectedProductId || products[0]?.id || '');
  const [quantity, setQuantity] = useState('20');
  const [costPrice, setCostPrice] = useState('');

  if (!isOpen) return null;

  const currentProduct = products.find(p => p.id === selectedProductId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(quantity);
    if (!selectedProductId || qty <= 0) {
      alert('Ingrese una cantidad válida a sumar al stock');
      return;
    }

    onAddStock(selectedProductId, qty, costPrice ? Number(costPrice) : undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Ingreso / Reposición de Stock</h2>
              <p className="text-xs text-slate-400">Carga de mercadería o tambores de lubricante</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Producto / Insumo</label>
            <select
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                const found = products.find(p => p.id === e.target.value);
                if (found) setCostPrice(String(found.costPrice));
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} (Stock: {p.stock} {p.unit})
                </option>
              ))}
            </select>
          </div>

          {currentProduct && (
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500 block">Stock Actual:</span>
                <span className={`text-base font-bold font-mono ${currentProduct.stock <= currentProduct.minStock ? 'text-amber-400' : 'text-white'}`}>
                  {currentProduct.stock} {currentProduct.unit}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Mínimo requerido:</span>
                <span className="text-slate-300 font-mono">
                  {currentProduct.minStock} {currentProduct.unit}
                </span>
              </div>
              <div className="col-span-2 text-[11px] text-slate-400">
                Ubicación física: <span className="text-slate-200">{currentProduct.location}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Cantidad a Ingresar ({currentProduct?.unit}) *</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-base font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Costo Unitario ($) (Opcional)</label>
              <input
                type="number"
                placeholder={currentProduct ? String(currentProduct.costPrice) : ''}
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              Sumar al Inventario
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
