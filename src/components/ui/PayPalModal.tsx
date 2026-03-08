
"use client";

import { X, ShieldCheck, Loader2 } from 'lucide-react';
import { StoreProduct } from '@/types';
import { useState } from 'react';

export const PayPalModal = ({ product, onSuccess, onClose }: { 
  product: StoreProduct; 
  onSuccess: () => void; 
  onClose: () => void;
}) => {
  const [loading, setLoading] = useState(false);

  const simulatePayment = () => {
    setLoading(true);
    setTimeout(() => {
      onSuccess();
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 pointer-events-auto">
      <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        <div className="bg-[#003087] p-6 flex justify-between items-center">
          <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg" alt="PayPal" className="h-8" />
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-gray-900">Authorize Payment</h3>
            <p className="text-sm text-gray-500">Secure transaction for {product.name}</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Amount</p>
              <p className="text-2xl font-black text-gray-900">€{product.priceEUR.toFixed(2)}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <ShieldCheck size={24} />
            </div>
          </div>

          <button
            onClick={simulatePayment}
            disabled={loading}
            className="w-full py-4 bg-[#0070ba] hover:bg-[#005ea6] text-white font-bold rounded-full transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Pay with PayPal"}
          </button>

          <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest">
            Encryption Active: 256-bit SSL
          </p>
        </div>
      </div>
    </div>
  );
};
