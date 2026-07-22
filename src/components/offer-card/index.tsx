"use client";

import React, { useState, useRef } from 'react';
import type { OfferCardData } from './types';
import { Header } from './header';
import { Content } from './content';
import { Sentiment } from './sentiment';
import { Footer } from './footer';
import { Smartphone, Check, X, Loader2, AlertCircle } from 'lucide-react';

interface OfferCardProps {
  data: OfferCardData;
  onRefreshData?: () => void;
  onAccept?: () => void;
  onCounter?: (price: number) => void;
  onDecline?: () => void;
  onCounterToggle?: () => void;
  activeAction?: 'view' | 'counter' | null;
}

export default function OfferCard({ data, onRefreshData, onAccept, onCounter, onDecline, onCounterToggle, activeAction: externalActiveAction }: OfferCardProps) {
  const [customStatus, setCustomStatus] = useState<string | undefined>(undefined);
  const [previousStatus, setPreviousStatus] = useState<string | undefined>(undefined);
  const [isCounterOpen, setIsCounterOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [counterInput, setCounterInput] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [overpaymentMessage, setOverpaymentMessage] = useState<string | null>(null);
  const [counterCount, setCounterCount] = useState(0);
  const [activeAction, setActiveAction] = useState<'decline' | 'counter' | 'accept' | null>(null);

  const verificationTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [priceState, setPriceState] = useState<{
    isCountered?: boolean;
    buyerOriginalOffer?: number;
    sellerCounterOffer?: number;
    productPrice?: number;
  }>({
    isCountered: data.isCountered,
    buyerOriginalOffer: data.buyerOriginalOffer,
    sellerCounterOffer: data.sellerCounterOffer,
    productPrice: data.productPrice,
  });

  const activeData = {
    ...data,
    isCountered: priceState.isCountered,
    buyerOriginalOffer: priceState.buyerOriginalOffer,
    sellerCounterOffer: priceState.sellerCounterOffer,
    productPrice: priceState.productPrice,
    customStatus: customStatus,
  } as OfferCardData & { customStatus?: string };

  // Parse the raw target base price
  const baselinePriceRaw = priceState.productPrice ?? 0;
  const activeSellerPriceRaw = priceState.sellerCounterOffer ?? 0;
  const currentTargetPrice = priceState.isCountered ? activeSellerPriceRaw : baselinePriceRaw;

  // Real-time listener inside the counter input to handle UI messages
  const handleInputChange = (value: string) => {
    setCounterInput(value);
    setValidationError(null);
    setOverpaymentMessage(null);

    if (!value.trim()) return;
    const enteredVal = parseFloat(value);
    if (isNaN(enteredVal)) return;

    // 1. Check Floor limits
    const nextCount = counterCount + 1;
    let minimumFloorLimit = 0;
    let ruleLabel = '';

    if (nextCount === 1) {
      minimumFloorLimit = baselinePriceRaw * 0.4;
      ruleLabel = '40%';
    } else if (nextCount === 2) {
      minimumFloorLimit = activeSellerPriceRaw * 0.25;
      ruleLabel = '25%';
    } else {
      minimumFloorLimit = activeSellerPriceRaw * 0.1;
      ruleLabel = '10%';
    }

    if (enteredVal < minimumFloorLimit) {
      setValidationError(`Minimum offer $${minimumFloorLimit.toFixed(2)} (${ruleLabel})`);
      return;
    }

    // 2. Check Overpayment threshold if it exceeds the target price
    if (enteredVal > currentTargetPrice && currentTargetPrice > 0) {
      const extraDiff = enteredVal - currentTargetPrice;
      const percentageIncrease = (extraDiff / currentTargetPrice) * 100;
      setOverpaymentMessage(
        `Overpayment to ${data.sellerName || 'Seller'}: $${enteredVal.toFixed(2)} (+${percentageIncrease.toFixed(1)}%)`
      );
    }
  };

  const handleDeclineAction = () => {
    if (verificationTimerRef.current) {
      clearTimeout(verificationTimerRef.current);
      verificationTimerRef.current = null;
    }
    setIsVerifying(false);
    setIsCounterOpen(false);
    setIsPaymentOpen(false);
    setCounterInput('');
    setValidationError(null);
    setOverpaymentMessage(null);
    setActiveAction('decline');
    setCustomStatus('Lapsed');
    if (onDecline) onDecline();
  };

  const handleCounterActivation = () => {
    if (
      customStatus === 'Overpayment' ||
      customStatus === 'Pending' ||
      customStatus === 'Processing' ||
      customStatus === 'Lapsed' ||
      isVerifying
    )
      return;
    setIsPaymentOpen(false);
    setValidationError(null);
    setOverpaymentMessage(null);
    setActiveAction('counter');
    setIsCounterOpen(true);
    if (onCounterToggle) onCounterToggle();
  };

  const handleAcceptAction = () => {
    if (
      customStatus === 'Overpayment' ||
      customStatus === 'Pending' ||
      customStatus === 'Processing' ||
      customStatus === 'Lapsed' ||
      isVerifying
    )
      return;
    setIsCounterOpen(false);
    setCounterInput('');
    setValidationError(null);
    setOverpaymentMessage(null);
    setActiveAction('accept');

    const currentActiveStatus = customStatus || (priceState.isCountered ? 'Counter Offer' : 'Standard');
    setPreviousStatus(currentActiveStatus);
    setCustomStatus('Processing');
    setIsPaymentOpen(true);
    if (onAccept) onAccept();
  };

  const handlePaymentSubmitVerification = () => {
    if (isVerifying) return;
    setIsVerifying(true);
    setCustomStatus('Processing...');

    verificationTimerRef.current = setTimeout(() => {
      setIsVerifying(false);
      setIsPaymentOpen(false);
      setCustomStatus('Finalized');
      if (onRefreshData) {
        onRefreshData();
      }
    }, 4000);
  };

  const handlePaymentDismiss = () => {
    if (isVerifying) {
      if (verificationTimerRef.current) {
        clearTimeout(verificationTimerRef.current);
        verificationTimerRef.current = null;
      }
      setIsVerifying(false);
    }
    setCustomStatus(previousStatus);
    setIsPaymentOpen(false);
  };

  const handleCounterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!counterInput.trim() || validationError) return;

    const enteredPriceNumeric = parseFloat(counterInput);
    const formattedPrice = `$${enteredPriceNumeric.toFixed(2)}`;

    // If it is submitted as an overpayment, map it simply to 'Overpayment'
    if (enteredPriceNumeric > currentTargetPrice && currentTargetPrice > 0) {
      setCustomStatus('Overpayment');
    } else {
      setCustomStatus('Pending');
    }

    setPriceState((prev) => {
      const oldBaselinePrice = prev.isCountered ? prev.sellerCounterOffer : prev.productPrice;
      return {
        ...prev,
        isCountered: true,
        buyerOriginalOffer: oldBaselinePrice,
        sellerCounterOffer: enteredPriceNumeric,
      };
    });

    setCounterCount((prev) => prev + 1);
    setIsCounterOpen(false);
    setCounterInput('');
    setOverpaymentMessage(null);

    if (onRefreshData) {
      onRefreshData();
    }
    if (onCounter) {
      onCounter(enteredPriceNumeric);
    }
  };

  const finalPayableAmount = priceState.isCountered ? priceState.sellerCounterOffer : priceState.productPrice;
  const isInactive = customStatus === 'Lapsed' || customStatus === 'Finalized';
  const isCounterActive = externalActiveAction === 'counter' || activeAction === 'counter';

  return (
    <div className={`w-full max-w-[420px] bg-black border border-zinc-800/80 rounded-[28px] p-5 flex flex-col gap-5 shadow-2xl tracking-tight select-none transition-all duration-300 ease-in-out ${isInactive ? 'opacity-70 grayscale-[0.25]' : ''}`}>
      <Header data={activeData} isInactive={isInactive} />
      <Content data={activeData} isInactive={isInactive} />
      <Sentiment data={activeData} isInactive={isInactive} />

      {/* A. INTEGRATED COUNTER FORM */}
      {isCounterOpen && (
        <form
          onSubmit={handleCounterSubmit}
          className="w-full bg-transparent border border-neutral-900 rounded-2xl p-4 flex flex-col gap-3.5 animate-in slide-in-from-top-4 duration-200"
        >
          <div className="flex flex-col text-left">
            <h4 className="text-xs font-black text-white tracking-tight">
              Make Counter Offer (Attempt #{counterCount + 1})
            </h4>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="relative flex items-center">
              <span className="absolute left-4 text-xs font-black font-mono text-zinc-500">
                $
              </span>
              <input
                type="number"
                required
                autoFocus
                step="0.01"
                placeholder="0.00"
                value={counterInput}
                onChange={(e) => handleInputChange(e.target.value)}
                className={`w-full bg-transparent border text-white font-mono font-black text-sm pl-8 pr-4 py-2 rounded-xl focus:outline-none transition-colors placeholder:text-zinc-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                  validationError
                    ? 'border-red-500/50 focus:border-red-500'
                    : 'border-neutral-900 focus:border-amber-500/40'
                }`}
              />
            </div>

            {/* Minimum Price Validation Error Alert */}
            {validationError && (
              <span className="text-[10px] font-bold text-red-500 font-mono tracking-wide px-1">
                {validationError}
              </span>
            )}

            {/* Real-time Overpayment Calculations Warning Box */}
            {overpaymentMessage && !validationError && (
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 font-mono tracking-wide bg-emerald-500/[0.03] px-2 py-1 mt-0.5 animate-in fade-in duration-200">
                <AlertCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>{overpaymentMessage}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setIsCounterOpen(false);
                setCounterInput('');
                setValidationError(null);
                setOverpaymentMessage(null);
              }}
              className="py-2 px-4 bg-transparent text-zinc-500 border border-neutral-900 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all hover:bg-neutral-950 active:scale-[0.97]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!!validationError}
              className="py-2 px-4 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all hover:bg-amber-500 hover:text-black active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none"
            >
              Submit Offer
            </button>
          </div>
        </form>
      )}

      {/* B. SITE MERCHANT CHECKOUT PANEL */}
      {isPaymentOpen && (
        <div className="w-full bg-transparent border border-neutral-900 rounded-2xl p-4 flex flex-col gap-3.5 animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-start justify-between">
            <div className="flex flex-col text-left">
              <h4 className="text-xs font-black text-white tracking-tight flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                Site Mobile Money Pay
              </h4>
            </div>
            <button
              onClick={handlePaymentDismiss}
              className="p-1 rounded-md bg-transparent border border-neutral-900 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-transparent border border-neutral-900 font-mono text-[11px]">
            <span className="text-zinc-500 font-bold uppercase tracking-wider text-[9px]">
              Total Due
            </span>
            <span className="text-xs font-black text-emerald-400">
              ${finalPayableAmount?.toFixed(2) ?? '0.00'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handlePaymentDismiss}
              className="py-2 px-4 bg-transparent text-zinc-500 border border-neutral-900 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all hover:bg-neutral-950 active:scale-[0.97]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isVerifying}
              onClick={handlePaymentSubmitVerification}
              className="py-2 px-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all hover:bg-emerald-500 hover:text-black flex items-center justify-center gap-1.5 min-h-[34px] active:scale-[0.97] disabled:opacity-80 disabled:pointer-events-none"
            >
              {isVerifying ? (
                <>
                  <Loader2
                    className="w-3 h-3 animate-spin"
                    strokeWidth={3}
                  />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Check className="w-3 h-3" strokeWidth={3} />
                  <span>Pay Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <Footer
        data={activeData}
        onDecline={handleDeclineAction}
        onCounter={handleCounterActivation}
        onAccept={handleAcceptAction}
        isInactive={isInactive}
        activeAction={activeAction}
      />
    </div>
  );
}
