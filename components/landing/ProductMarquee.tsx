'use client';

import { useEffect, useState } from 'react';

interface Product {
    id: string;
    name: string;
    imageUrl: string;
    price: number;
}

function MarqueeRow({ items, reverse = false }: { items: Product[]; reverse?: boolean }) {
    // Duplicate for seamless loop
    const doubled = [...items, ...items];

    return (
        <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <div
                className={`flex gap-4 ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'}`}
                style={{ width: 'max-content' }}
            >
                {doubled.map((p, i) => (
                    <div
                        key={`${p.id}-${i}`}
                        className="flex-shrink-0 w-28 h-36 rounded-xl bg-[#151A21] border border-white/5 overflow-hidden flex items-center justify-center p-2 group hover:border-white/20 transition-colors"
                        title={p.name}
                    >
                        <img
                            src={`/api/proxy-image?url=${encodeURIComponent(p.imageUrl)}`}
                            alt={p.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function ProductMarquee() {
    const [row1, setRow1] = useState<Product[]>([]);
    const [row2, setRow2] = useState<Product[]>([]);

    useEffect(() => {
        fetch('/api/public/featured-products')
            .then(r => r.ok ? r.json() : [])
            .then((data: Product[]) => {
                if (!Array.isArray(data) || data.length === 0) return;
                const mid = Math.floor(data.length / 2);
                setRow1(data.slice(0, mid));
                setRow2(data.slice(mid));
            })
            .catch(() => {});
    }, []);

    if (row1.length === 0) return null;

    return (
        <section className="py-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00E599]/[0.02] to-transparent pointer-events-none" />

            <div className="mb-4 text-center">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest">
                    Products we track
                </p>
            </div>

            <div className="space-y-4">
                <MarqueeRow items={row1} />
                <MarqueeRow items={row2} reverse />
            </div>
        </section>
    );
}
