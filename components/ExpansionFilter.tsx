'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight, Check } from 'lucide-react';

// setOrder: newest first within each era (lowercase substrings to match)
const ERA_ORDER = [
    {
        label: 'Mega Evolution',
        keywords: ['mega evolution', 'chaos rising', 'perfect order', 'ascended heroes', 'phantasmal flames', 'me black star', 'blooming waters'],
        setOrder: ['perfect order', 'chaos rising', 'ascended heroes', 'phantasmal flames', 'blooming waters', 'mega evolution', 'me black star'],
    },
    {
        label: 'Scarlet & Violet',
        keywords: ['scarlet & violet', 'scarlet violet', 'paldea', 'obsidian', 'paradox rift', 'temporal forces', 'twilight masquerade', 'surging sparks', 'stellar crown', 'prismatic', 'shrouded fable', 'journey together', '151', 'wild force', 'collect 151', 'black bolt', 'white flare', 'destined rivals'],
        setOrder: ['destined rivals', 'black bolt', 'white flare', 'prismatic', 'journey together', 'surging sparks', 'stellar crown', 'shrouded fable', 'twilight masquerade', 'paradox rift', 'obsidian', 'collect 151', '151', 'temporal forces', 'wild force', 'paldea', 'scarlet & violet', 'scarlet violet'],
    },
    {
        label: 'Sword & Shield',
        keywords: ['sword & shield', 'brilliant stars', 'astral radiance', 'lost origin', 'silver tempest', 'crown zenith', 'chilling reign', 'evolving skies', 'fusion strike', 'battle styles', 'shining fates', 'vivid voltage', 'darkness ablaze', 'rebel clash', 'pokemon go', 'celebrations', 'champions path'],
        setOrder: ['crown zenith', 'silver tempest', 'lost origin', 'pokemon go', 'astral radiance', 'brilliant stars', 'celebrations', 'evolving skies', 'fusion strike', 'chilling reign', 'shining fates', 'battle styles', 'vivid voltage', 'champions path', 'darkness ablaze', 'rebel clash', 'sword & shield'],
    },
    {
        label: 'Sun & Moon',
        keywords: ['sun & moon', 'ultra prism', 'forbidden light', 'celestial storm', 'dragon majesty', 'lost thunder', 'team up', 'unbroken bonds', 'unified minds', 'hidden fates', 'cosmic eclipse', 'burning shadows', 'guardians rising', 'crimson invasion'],
        setOrder: ['cosmic eclipse', 'hidden fates', 'unified minds', 'unbroken bonds', 'team up', 'lost thunder', 'dragon majesty', 'celestial storm', 'forbidden light', 'ultra prism', 'crimson invasion', 'burning shadows', 'guardians rising', 'sun & moon'],
    },
    {
        label: 'XY',
        keywords: [' xy', 'flashfire', 'furious fists', 'phantom forces', 'primal clash', 'double crisis', 'roaring skies', 'ancient origins', 'breakthrough', 'breakpoint', 'generations', 'fates collide', 'steam siege', 'evolutions'],
        setOrder: ['evolutions', 'steam siege', 'fates collide', 'generations', 'breakpoint', 'breakthrough', 'ancient origins', 'roaring skies', 'double crisis', 'primal clash', 'phantom forces', 'furious fists', 'flashfire', 'xy'],
    },
    {
        label: 'Black & White',
        keywords: ['black & white', 'emerging powers', 'noble victories', 'next destinies', 'dark explorers', 'dragons exalted', 'dragon vault', 'boundaries crossed', 'plasma storm', 'plasma freeze', 'plasma blast', 'legendary treasures'],
        setOrder: ['legendary treasures', 'plasma blast', 'plasma freeze', 'plasma storm', 'boundaries crossed', 'dragon vault', 'dragons exalted', 'dark explorers', 'next destinies', 'noble victories', 'emerging powers', 'black & white'],
    },
    {
        label: 'HeartGold & SoulSilver',
        keywords: ['heartgold', 'soulsilver', 'unleashed', 'undaunted', 'triumphant', 'call of legends'],
        setOrder: ['call of legends', 'triumphant', 'undaunted', 'unleashed', 'heartgold', 'soulsilver'],
    },
    {
        label: 'Platinum',
        keywords: ['platinum', 'rising rivals', 'supreme victors', 'arceus'],
        setOrder: ['arceus', 'supreme victors', 'rising rivals', 'platinum'],
    },
    {
        label: 'Diamond & Pearl',
        keywords: ['diamond', 'pearl', 'mysterious treasures', 'secret wonders', 'great encounters', 'majestic dawn', 'legends awakened', 'stormfront'],
        setOrder: ['stormfront', 'legends awakened', 'majestic dawn', 'great encounters', 'secret wonders', 'mysterious treasures', 'diamond', 'pearl'],
    },
];

function assignEra(expansion: string): string {
    const lower = expansion.toLowerCase();
    for (const era of ERA_ORDER) {
        if (era.keywords.some(kw => lower.includes(kw))) return era.label;
    }
    return 'Other';
}

interface Props {
    value: string;
    onChange: (v: string) => void;
    expansions: { main: string[]; other: string[] };
}

export function ExpansionFilter({ value, onChange, expansions }: Props) {
    const [open, setOpen] = useState(false);
    const [expandedEras, setExpandedEras] = useState<Set<string>>(new Set());
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Auto-expand the era of the currently selected expansion
    useEffect(() => {
        if (value !== 'all') {
            const era = assignEra(value);
            setExpandedEras(prev => new Set([...prev, era]));
        }
    }, [value]);

    const allExpansions = [...expansions.main, ...expansions.other];

    const eraMap = new Map<string, string[]>();
    for (const exp of allExpansions) {
        const era = assignEra(exp);
        if (!eraMap.has(era)) eraMap.set(era, []);
        eraMap.get(era)!.push(exp);
    }

    // Sort sets within each era by predefined newest-first order
    for (const eraDef of ERA_ORDER) {
        const sets = eraMap.get(eraDef.label);
        if (!sets || !eraDef.setOrder) continue;
        sets.sort((a, b) => {
            const ai = eraDef.setOrder.findIndex(kw => a.toLowerCase().includes(kw));
            const bi = eraDef.setOrder.findIndex(kw => b.toLowerCase().includes(kw));
            return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
        });
    }

    const sortedEras = [
        ...ERA_ORDER.map(e => e.label).filter(l => eraMap.has(l)),
        ...(eraMap.has('Other') ? ['Other'] : []),
    ];

    const toggleEra = (era: string) => {
        setExpandedEras(prev => {
            const next = new Set(prev);
            if (next.has(era)) next.delete(era);
            else next.add(era);
            return next;
        });
    };

    const selectedLabel = value === 'all' ? 'All Sets' : value;

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full bg-[#151A21] border border-[rgba(255,255,255,0.06)] rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-primary flex items-center justify-between gap-2 cursor-pointer"
            >
                <span className="truncate text-left">{selectedLabel}</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 bg-[#151A21] border border-[rgba(255,255,255,0.08)] rounded-xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto">
                    {/* View All */}
                    <button
                        onClick={() => { onChange('all'); setOpen(false); }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-white/[0.04] ${value === 'all' ? 'text-primary' : 'text-gray-200'}`}
                    >
                        <span>View All</span>
                        {value === 'all' && <Check className="w-4 h-4 shrink-0" />}
                    </button>

                    <div className="border-t border-white/[0.06]">
                        {sortedEras.map(era => {
                            const sets = eraMap.get(era) || [];
                            const isExpanded = expandedEras.has(era);
                            const hasSelected = sets.includes(value);
                            return (
                                <div key={era}>
                                    <button
                                        onClick={() => toggleEra(era)}
                                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/[0.04] ${hasSelected ? 'text-primary' : 'text-gray-400'}`}
                                    >
                                        <span>{era}</span>
                                        <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform duration-150 ${isExpanded ? 'rotate-90' : ''}`} />
                                    </button>

                                    {isExpanded && (
                                        <div className="bg-black/20">
                                            {sets.map(set => (
                                                <button
                                                    key={set}
                                                    onClick={() => { onChange(set); setOpen(false); }}
                                                    className={`w-full flex items-center justify-between pl-8 pr-4 py-2 text-sm transition-colors hover:bg-white/[0.04] ${value === set ? 'text-primary font-medium' : 'text-gray-400'}`}
                                                >
                                                    <span className="text-left">{set}</span>
                                                    {value === set && <Check className="w-3.5 h-3.5 shrink-0" />}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
