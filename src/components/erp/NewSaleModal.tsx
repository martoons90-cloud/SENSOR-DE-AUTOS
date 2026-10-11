import React, { useState } from 'react';
import { X, ShoppingCart, Plus, Trash2, DollarSign, CreditCard } from 'lucide-react';
import { Sale, Product, PaymentMethod } from '../../types/erp';

interface NewSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSaveSale: (sale: Sale) => void;
}

export const NewSaleModal: React.FC<NewSaleModalProps> = ({
  isOpen,
  onClose,
  products,
  onSaveSale,
}) => {
  const [customerName, setCustomerName] = useState('Cliente Mostrador');
  const [customerPlate, setCustomerPlate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [items, setItems] = useState<Array<{ productId?: string; description: string; quantity: number; unitPrice: number }>>([
    { productId: products[0]?.id, description: products[0]?.name || 'Aceite YPF Elaion 10W40 (Litro)', quantity: 4, unitPrice: products[0]?.salePrice || 12200 }
  ]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    const firstProd = products[0];
    setItems([...items, {
      productId: firstProd?.id,
      description: firstProd?.name || 'Producto General',
      quantity: 1,
      unitPrice: firstProd?.salePrice || 10000
    }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleProductSelect = (index: number, productId: string) => {
    const selected = products.find(p => p.id === productId);
    if (!selected) return;
    const updated = [...items];
    updated[index] = {
      productId: selected.id,
      description: selected.name,
      quantity: updated[index].quantity || 1,
      unitPrice: selected.salePrice
    };
    setItems(updated);
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const updated = [...items];
    updated[index].quantity = qty;
    setItems(updated);
  };

  const handlePriceChange = (index: number, price: number) => {
    const updated = [...items];
    updated[index].unitPrice = price;
    setItems(updated);
  };

  const total = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || total <= 0) {
      alert('Debe agregar al menos un ítem con precio válido');
      return;
    }

    const newSale: Sale = {
      id: `VTA-${Math.floor(4030 + Math.random() * 900)}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      customerName: customerName.trim() || 'Cliente Mostrador',
      customerPlate: customerPlate.trim().toUpperCase() || undefined,
      items: items.map(it => ({
        ...it,
        subtotal: it.quantity * it.unitPrice
      })),
      total,
      paymentMethod,
      status: paymentMethod === 'cuenta_corriente' ? 'pendiente_cuenta_corriente' : 'cobrado',
      type: 'mostrador'
    };

    onSaveSale(newSale);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Nueva Venta de Mostrador</h2>
              <p className="text-xs text-slate-400">Despacho de lubricantes, filtros, aditivos y baterías</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Cliente / Destinatario</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nombre o Razón Social"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Patente Vehículo (Opcional)</label>
              <input
                type="text"
                value={customerPlate}
                onChange={(e) => setCustomerPlate(e.target.value)}
                placeholder="Ej: AG 302 LP"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono uppercase focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">Productos / Artículos</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar Producto
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <select
                    value={item.productId}
                    onChange={(e) => handleProductSelect(idx, e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white truncate focus:outline-none"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Stock: {p.stock} {p.unit}) - ${p.salePrice.toLocaleString('es-AR')}
                      </option>
                    ))}
                  </select>
                  <div className="w-20">
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-white font-mono text-right"
                    />
                  </div>
                  <div className="w-28 text-right font-mono text-emerald-400 font-bold px-2">
                    ${(item.quantity * item.unitPrice).toLocaleString('es-AR')}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="p-1 text-slate-500 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="border-t border-slate-800 pt-3">
            <label className="block text-slate-400 mb-1.5 font-semibold">Medio de Pago</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'efectivo', label: 'Efectivo (-5%)' },
                { id: 'transferencia', label: 'Transferencia / QR' },
                { id: 'tarjeta_debito', label: 'Tarjeta Débito' },
                { id: 'cuenta_corriente', label: 'Cta. Corriente (30d)' }
              ].map(pm => (
                <button
                  type="button"
                  key={pm.id}
                  onClick={() => setPaymentMethod(pm.id as any)}
                  className={`py-2 px-2.5 rounded-lg border text-center transition-all ${
                    paymentMethod === pm.id
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {pm.label}
                </button>
              ))}
            </div>
          </div>

          {/* Total Bar */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 font-medium">Total de la Venta:</span>
            <span className="text-2xl font-bold text-emerald-400 font-mono">
              ${total.toLocaleString('es-AR')}
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg shadow-md shadow-emerald-500/20 transition-all"
            >
              Cobrar e Imprimir Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
