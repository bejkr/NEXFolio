'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { ExternalLink, Loader2, ShoppingCart } from "lucide-react";

interface StoreOffer {
    id: string;
    storeName: string;
    storeLogo?: string;
    url: string;
    price: number;
    currency: string;
    title: string;
    imageUrl?: string;
}

export function StoreOffers({ productId }: { productId: string }) {
    const [offers, setOffers] = useState<StoreOffer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const res = await fetch(`/api/products/${productId}/offers`);
                const data = await res.json();
                if (data.offers) {
                    setOffers(data.offers);
                }
            } catch (error) {
                console.error("Failed to fetch offers:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOffers();
    }, [productId]);

    if (loading) {
        return (
            <div className="flex items-center gap-3 text-gray-500 py-4">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-xs font-medium uppercase tracking-widest">Searching across stores...</span>
            </div>
        );
    }

    if (offers.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest flex items-center">
                    <ShoppingCart className="w-4 h-4 mr-2 text-primary" />
                    Shop Related Products
                </h3>
                <span className="text-[10px] text-gray-600 bg-white/5 px-2 py-0.5 rounded border border-white/10 uppercase font-bold">Automatic Discovery</span>
            </div>

            <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar -mx-1 px-1">
                {offers.map((offer) => (
                    <a
                        key={offer.id}
                        href={offer.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-w-[200px] max-w-[200px] group transition-all"
                    >
                        <Card className="bg-[#151A21] border border-[rgba(255,255,255,0.06)] hover:border-primary/40 p-4 transition-all h-full flex flex-col shadow-lg hover:shadow-primary/5">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center overflow-hidden shrink-0 border border-white/10">
                                    {offer.storeLogo ? (
                                        <img src={offer.storeLogo} alt={offer.storeName} className="w-4 h-4 object-contain" />
                                    ) : (
                                        <ShoppingCart className="w-3 h-3 text-gray-500" />
                                    )}
                                </div>
                                <span className="text-xs font-bold text-gray-300 truncate">{offer.storeName}</span>
                            </div>

                            <h4 className="text-sm font-medium text-white line-clamp-2 mb-3 h-10 group-hover:text-primary transition-colors">
                                {offer.title}
                            </h4>

                            <div className="mt-auto flex items-end justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-gray-500 uppercase font-bold">Price</span>
                                    {offer.price > 0 ? (
                                        <span className="text-lg font-bold text-white tracking-tight">
                                            {offer.price.toLocaleString(undefined, { minimumFractionDigits: 2 })} {offer.currency}
                                        </span>
                                    ) : (
                                        <span className="text-sm font-bold text-primary tracking-tight mt-1">
                                            Zobraziť v e-shope
                                        </span>
                                    )}
                                </div>
                                <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                    <ExternalLink className="w-4 h-4" />
                                </div>
                            </div>
                        </Card>
                    </a>
                ))}
            </div>
        </div>
    );
}
