'use client';

import React, { useState } from 'react';
import Header from './header';
import Content from './content';
import Sentiment from './sentiment';
import Footer from './footer';
import type { SalesCardData } from '@/types';
import { formatToUGX } from '@/lib/currency';

interface SalesCardProps {
    cardData: SalesCardData;
    hideFooter?: boolean;
    hideBorder?: boolean;
    onBuyClick?: () => void;
    onCounterSubmit?: (price: number) => void;
}

export default function SalesCard({ cardData, hideFooter = false, hideBorder = false, onBuyClick, onCounterSubmit }: SalesCardProps) {
    const productPrice = cardData.productPriceRaw;
    const minPrice = productPrice * 0.6;
    const maxPrice = productPrice * 1.5;

    const [liveOffers, setLiveOffers] = useState(cardData.offersCount ?? 0);
    const [counterAttempts, setCounterAttempts] = useState(0);
    const [showPriceInput, setShowPriceInput] = useState(false);
    const [userOffer, setUserOffer] = useState("");
    const [costlyVotes, setCostlyVotes] = useState(cardData.sentimentRate ?? 0);
    const [hasVotedCostly, setHasVotedCostly] = useState(false);

    // Tracks if this user has an active negotiation on THIS specific product ID
    const [hasActiveOffer, setHasActiveOffer] = useState(false);

    const isMaxed = liveOffers >= 12;

    const numericOffer = parseFloat(userOffer);
    const isError = userOffer !== "" && (numericOffer < minPrice || numericOffer > maxPrice);

    const handleCounterInitiate = () => {
        if (counterAttempts < 2 && !isMaxed) setShowPriceInput(true);
    };

    const confirmCounterOffer = (price: string) => {
        if (isError || !price || isMaxed) return;
        setLiveOffers((prev) => prev + 1);
        setCounterAttempts((prev) => prev + 1);
        setHasActiveOffer(true);
        setShowPriceInput(false);
        const numPrice = parseFloat(price);
        onCounterSubmit?.(numPrice);
        setUserOffer("");
    };

    return (
        <div className={`w-full max-w-[350px] mx-auto bg-black p-4 flex flex-col gap-4 ${hideBorder ? '' : 'rounded-2xl border border-neutral-800'}`}>
            <Header
                name={cardData.sellerName}
                username={cardData.sellerUsername}
                avatar={cardData.sellerAvatar}
                sellerBuys={cardData.sellerBuys}
                sellerSells={cardData.sellerSells}
                sellerStars={cardData.sellerStars}
                isAdminVerified={cardData.isAdminVerified}
                createdAt={cardData.createdAt}
                offersCount={liveOffers}
                hasActiveOffer={hasActiveOffer}
                onExpire={() => { }}
            />

            <Content cardData={cardData} />

            {showPriceInput && !isMaxed && (
                <div className="p-4 bg-zinc-950/80 border border-zinc-700 rounded-2xl flex flex-col gap-3">
                    <h2 className="font-bold text-xs text-white">Suggest a bid ({counterAttempts}/2)</h2>
                    <input
                        type="number"
                        placeholder={`Min: ${formatToUGX(minPrice)}`}
                        value={userOffer}
                        className={`w-full bg-transparent text-sm outline-none border rounded-xl p-3 ${isError ? 'text-red-500 border-red-500' : 'text-white border-zinc-700'}`}
                        onChange={(e) => setUserOffer(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setShowPriceInput(false)} className="py-2 text-[10px] font-black uppercase border border-amber-900/40 text-amber-500 rounded-xl">Cancel</button>
                        <button onClick={() => confirmCounterOffer(userOffer)} disabled={isError || userOffer === ""} className="py-2 text-[10px] font-black uppercase border border-emerald-900/40 text-emerald-500 rounded-xl">Submit</button>
                    </div>
                </div>
            )}

            <Sentiment costlyVotes={costlyVotes} />

            {!hideFooter && (
                <Footer
                    onBuyClick={onBuyClick}
                    onCounterClick={handleCounterInitiate}
                    counterAttempts={counterAttempts}
                    onCostlyClick={() => {
                        if (!hasVotedCostly && costlyVotes < 100 && !isMaxed) {
                            setCostlyVotes((prev) => prev + 1);
                            setHasVotedCostly(true);
                        }
                    }}
                    hasVotedCostly={hasVotedCostly}
                    isCostlyMaxed={costlyVotes >= 100 || isMaxed}
                    offersCount={liveOffers}
                    hasActiveOffer={hasActiveOffer}
                />
            )}
        </div>
    );
}