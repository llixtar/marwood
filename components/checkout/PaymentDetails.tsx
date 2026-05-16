'use client';

import { useState } from 'react';
import { CopyButton } from './CopyButton';

interface PaymentDetailsProps {
  orderNumber: string;
  totalAmount: number;
  paymentMethod: string;
  className?: string;
}

export function PaymentDetails({ orderNumber, totalAmount, paymentMethod, className = '' }: PaymentDetailsProps) {
  const isCod = paymentMethod === 'details_cod';
  const defaultAmount = isCod ? 200 : totalAmount / 100;
  const [amount, setAmount] = useState(defaultAmount.toString());

  return (
    <div className={`bg-white border border-bottle/10 p-6 space-y-6 ${className}`}>
      <div className="space-y-1 border-b border-bottle/5 pb-4">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-bottle">Реквізити для оплати</h3>
        <p className="text-[10px] text-bottle/50 leading-tight">
          Будь ласка, вкажіть номер замовлення <span className="font-bold text-bottle">{orderNumber}</span> у коментарі до платежу.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Отримувач */}
        <div>
          <p className="text-bottle/40 text-[9px] uppercase tracking-widest mb-1.5 font-bold">Отримувач</p>
          <div className="flex items-center justify-between gap-3 group">
            <p className="text-[11px] font-bold text-bottle border-b border-bottle/10 pb-0.5">ФОП [Ваше Ім&apos;я]</p>
            <CopyButton value="ФОП [Ваше Ім'я]" label="отримувача" />
          </div>
        </div>

        {/* ЄДРПОУ */}
        <div>
          <p className="text-bottle/40 text-[9px] uppercase tracking-widest mb-1.5 font-bold">ЄДРПОУ</p>
          <div className="flex items-center justify-between gap-3 group">
            <p className="text-[11px] font-bold text-bottle border-b border-bottle/10 pb-0.5">12345678</p>
            <CopyButton value="12345678" label="ЄДРПОУ" />
          </div>
        </div>

        {/* IBAN */}
        <div className="md:col-span-2">
          <p className="text-bottle/40 text-[9px] uppercase tracking-widest mb-1.5 font-bold">IBAN</p>
          <div className="flex items-center justify-between gap-4 group">
            <p className="text-[11px] font-mono font-bold text-bottle break-all leading-tight border-b border-bottle/10 pb-0.5">UA000000000000000000000000000</p>
            <CopyButton value="UA000000000000000000000000000" label="IBAN" />
          </div>
        </div>
      </div>

      {/* Сума до сплати */}
      <div className="pt-6 border-t border-bottle/5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-bottle/40 text-[9px] uppercase tracking-widest font-bold">Сума до сплати (₴)</p>
            <div className="flex items-baseline gap-2">
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                className="bg-transparent border-b-2 border-bottle/20 text-2xl font-bold text-bottle w-24 focus:border-bottle focus:outline-none transition-all pb-1"
              />
              <span className="text-bottle/40 text-xs font-bold uppercase">{isCod ? 'Предоплата' : 'Повна сума'}</span>
            </div>
          </div>
          <div className="flex-shrink-0">
            <button 
              onClick={() => {
                navigator.clipboard.writeText(amount);
                const event = new CustomEvent('toast', { detail: { message: 'Суму скопійовано', type: 'success' } });
                window.dispatchEvent(event);
              }}
              className="px-6 py-3 bg-bottle/5 hover:bg-bottle/10 text-bottle text-[10px] font-bold uppercase tracking-widest transition-all rounded-sm border border-bottle/10"
            >
              Скопіювати суму
            </button>
          </div>
        </div>
        {isCod && (
          <p className="text-[9px] mt-4 text-amber-700 bg-amber-50 px-3 py-2 rounded-sm border border-amber-100/50 italic leading-tight">
            * Для наложеного платежу необхідно внести передоплату 200 ₴ для підтвердження замовлення.
          </p>
        )}
      </div>
    </div>
  );
}
