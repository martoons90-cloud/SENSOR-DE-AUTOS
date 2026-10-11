import React, { useState } from 'react';
import { X, WalletCards, DollarSign, CheckCircle2 } from 'lucide-react';
import { CustomerAccount, PaymentMethod } from '../../types/erp';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: CustomerAccount[];
  onRecordPayment: (accountId: string, amount: number, paymentMethod: PaymentMethod, notes: string) => void;
  preselectedAccountId?: string;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  accounts,
  onRecordPayment,
  preselectedAccountId
}) => {
  const [selectedAccountId, setSelectedAccountId] = useState(preselectedAccountId || accounts[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transferencia');
  const [receiptNumber, setReceiptNumber] = useState(`REC-${Math.floor(1000 + Math.random() * 9000)}`);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const currentAccount = accounts.find(a => a.id === selectedAccountId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!selectedAccountId || numAmount <= 0) {
      alert('Por favor ingrese un monto válido a cobrar');
      return;
    }

    onRecordPayment(selectedAccountId, numAmount, paymentMethod, `Recibo N° ${receiptNumber}. ${notes}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <WalletCards className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Registrar Cobranza / Recibo</h2>
              <p className="text-xs text-slate-400">Imputación de pago a Cuenta Corriente</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Cliente / Cuenta a Imputar</label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.customerName} - Saldo Deudor: ${acc.totalDebt.toLocaleString('es-AR')}
                </option>
              ))}
            </select>
          </div>

          {currentAccount && (
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500 block">Deuda Actual:</span>
                <span className="text-base font-bold text-red-400 font-mono">
                  ${currentAccount.totalDebt.toLocaleString('es-AR')}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Límite de Crédito:</span>
                <span className="text-white font-mono font-medium">
                  ${currentAccount.creditLimit.toLocaleString('es-AR')}
                </span>
              </div>
              <div className="col-span-2 text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                {currentAccount.pendingInvoices.filter(i => i.isOverdue).length > 0 ? (
                  <span className="text-amber-400 font-medium">
                    ⚠️ Posee {currentAccount.pendingInvoices.filter(i => i.isOverdue).length} factura(s) con fecha de vencimiento superada.
                  </span>
                ) : (
                  <span className="text-emerald-400 font-medium">
                    ✓ Sin facturas vencidas fuera de término.
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Monto a Cobrar ($) *</label>
              <input
                type="number"
                required
                placeholder="Ej: 150000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-base font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">N° de Recibo</label>
              <input
                type="text"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Medio de Pago</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="transferencia">Transferencia Bancaria / CBU</option>
              <option value="efectivo">Efectivo en Caja</option>
              <option value="tarjeta_debito">Tarjeta de Débito</option>
              <option value="tarjeta_credito">Tarjeta de Crédito</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Notas / Referencia de Transferencia</label>
            <input
              type="text"
              placeholder="Ej: Comprobante Banco Santander #98213"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
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
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              Confirmar e Imputar Pago
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
