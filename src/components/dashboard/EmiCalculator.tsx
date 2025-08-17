'use client';
import React, { useState, useMemo } from 'react';
import { Calculator, Send, RefreshCw } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { useCustomer } from '@/hooks/useCustomer';

function formatINR(n: number) {
  if (!isFinite(n)) return '-';
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export const EmiCalculator: React.FC = () => {
  const { customer } = useCustomer();
  const { sendMessage } = useChat(customer);
  const [principal, setPrincipal] = useState('');
  const [annualRate, setAnnualRate] = useState('12');
  const [months, setMonths] = useState('24');
  const [processingFeePct, setProcessingFeePct] = useState('1.5');

  const parsed = {
    p: parseFloat(principal),
    r: parseFloat(annualRate),
    n: parseInt(months),
    f: parseFloat(processingFeePct)
  };

  const { emi, totalInterest, totalPayable, fee } = useMemo(() => {
    const p = parsed.p;
    const rMonthly = (parsed.r / 100) / 12;
    const n = parsed.n;
    if (!p || !rMonthly || !n) return { emi: 0, totalInterest: 0, totalPayable: 0, fee: 0 };
    const pow = Math.pow(1 + rMonthly, n);
    const emiVal = p * rMonthly * pow / (pow - 1);
    const total = emiVal * n;
    const interest = total - p;
    const feeVal = p * (parsed.f / 100);
    return { emi: emiVal, totalInterest: interest, totalPayable: total + feeVal, fee: feeVal };
  }, [principal, annualRate, months, processingFeePct]);

  const disabled = !principal || !annualRate || !months;

  const pushToChat = async () => {
    if (disabled) return;
    const summary = `EMI Calculation:
Principal: ${formatINR(parsed.p)}
Tenure: ${parsed.n} months
Annual Rate: ${parsed.r}%
Processing Fee: ${processingFeePct}%
Monthly EMI: ${formatINR(Math.round(emi))}
Total Interest: ${formatINR(Math.round(totalInterest))}
Processing Fee (approx): ${formatINR(Math.round(fee))}
Total Payable (incl fee): ${formatINR(Math.round(totalPayable))}

Please confirm if you would like alternative tenures or lower EMI options.`;
    await sendMessage(summary);
  };

  const reset = () => {
    setPrincipal('');
    setAnnualRate('12');
    setMonths('24');
    setProcessingFeePct('1.5');
  };

  return (
    <div className="relative glass-panel p-5 overflow-hidden">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white">
          <Calculator size={18} />
        </div>
        <h3 className="font-semibold text-gray-800 text-sm tracking-wide">EMI Calculator</h3>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); pushToChat(); }}
        className="space-y-3"
      >
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Principal (₹)</span>
            <input
              type="number"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={principal}
              onChange={e => setPrincipal(e.target.value)}
              placeholder="60000"
              min={1000}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Annual Rate (%)</span>
            <input
              type="number"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={annualRate}
              onChange={e => setAnnualRate(e.target.value)}
              placeholder="12"
              step="0.1"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Tenure (Months)</span>
            <input
              type="number"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={months}
              onChange={e => setMonths(e.target.value)}
              placeholder="24"
              min={1}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Proc. Fee (%)</span>
            <input
              type="number"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={processingFeePct}
              onChange={e => setProcessingFeePct(e.target.value)}
              step="0.1"
            />
          </label>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-md bg-gray-100">
            <p className="text-gray-500 font-medium">Monthly EMI</p>
            <p className="text-sm font-semibold text-gray-800">{formatINR(Math.round(emi))}</p>
          </div>
          <div className="p-3 rounded-md bg-gray-100">
            <p className="text-gray-500 font-medium">Interest</p>
            <p className="text-sm font-semibold text-gray-800">{formatINR(Math.round(totalInterest))}</p>
          </div>
          <div className="p-3 rounded-md bg-gray-100">
            <p className="text-gray-500 font-medium">Proc. Fee</p>
            <p className="text-sm font-semibold text-gray-800">{formatINR(Math.round(fee))}</p>
          </div>
            <div className="p-3 rounded-md bg-gray-100">
              <p className="text-gray-500 font-medium">Total Payable</p>
              <p className="text-sm font-semibold text-gray-800">{formatINR(Math.round(totalPayable))}</p>
            </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="submit"
            disabled={disabled}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
            title="Send summary to chat"
          >
            <Send size={16} /> To Chat
          </button>
          <button
            type="button"
            onClick={reset}
            className="px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium transition-colors"
            title="Reset fields"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </form>

      <p className="mt-3 text-[10px] text-gray-500 leading-relaxed">
        Approximate values. Actual EMI may vary based on final rate & processing policies.
      </p>
    </div>
  );
};

export default EmiCalculator;