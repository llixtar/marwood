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
    <div className={`bg-bottle text-milky p-6 rounded-none space-y-6 shadow-xl ${className}`}>
      <div className="space-y-1 border-b border-milky/10 pb-4">
        <h3 className="text-xs font-bold uppercase tracking-widest">Реквізити для оплати</h3>
        <p className="text-[10px] opacity-60 leading-tight">
          Будь ласка, вкажіть номер замовлення <span className="font-bold underline">{orderNumber}</span> у коментарі до платежу.
        </p>
      </div>

      <div className="space-y-5">
        {/* Отримувач */}
        <div>
          <p className="opacity-40 text-[9px] uppercase tracking-tighter mb-1 font-sans">Отримувач</p>
          <div className="flex items-center justify-between gap-4 bg-white/5 p-3 border border-milky/10">
            <p className="text-xs font-bold font-mono">ФОП [Ваше Ім&apos;я]</p>
            <CopyButton value="ФОП [Ваше Ім'я]" label="отримувача" />
          </div>
        </div>

        {/* IBAN */}
        <div>
          <p className="opacity-40 text-[9px] uppercase tracking-tighter mb-1 font-sans">IBAN</p>
          <div className="flex items-center justify-between gap-4 bg-white/5 p-3 border border-milky/10">
            <p className="text-[11px] font-bold font-mono break-all leading-tight">UA000000000000000000000000000</p>
            <CopyButton value="UA000000000000000000000000000" label="IBAN" />
          </div>
        </div>

        {/* ЄДРПОУ */}
        <div>
          <p className="opacity-40 text-[9px] uppercase tracking-tighter mb-1 font-sans">ЄДРПОУ</p>
          <div className="flex items-center justify-between gap-4 bg-white/5 p-3 border border-milky/10 w-full sm:w-1/2">
            <p className="text-xs font-bold font-mono">12345678</p>
            <CopyButton value="12345678" label="ЄДРПОУ" />
          </div>
        </div>

        {/* Сума до сплати (Editable) */}
        <div className="pt-2 border-t border-milky/10">
          <p className="opacity-40 text-[9px] uppercase tracking-tighter mb-2 font-sans">Сума до сплати (₴)</p>
          <div className="flex items-center gap-3">
            <div className="relative flex-grow">
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                className="w-full bg-white/10 border border-milky/20 px-4 py-3 text-lg font-bold font-mono focus:bg-white/20 focus:outline-none transition-all"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-milky/40 text-xs pointer-events-none">
                {isCod ? 'Предоплата' : 'Повна сума'}
              </div>
            </div>
            <div className="flex-shrink-0">
              <CopyButton value={amount} label="суму" />
            </div>
          </div>
          {isCod && (
            <p className="text-[9px] mt-2 text-milky/50 italic leading-tight">
              * Для наложеного платежу необхідно внести передоплату 200 ₴ для підтвердження замовлення.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
