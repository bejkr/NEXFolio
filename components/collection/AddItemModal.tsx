'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Search, Loader2, Image as ImageIcon } from 'lucide-react';
import { CollectionItem } from '@/lib/mockData';

interface ProductSuggestion {
    id: string;
    name: string;
    expansion: string;
    releaseYear: number | null;
    imageUrl: string | null;
    price: number | null;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (item: CollectionItem) => void;
}

export function AddItemModal({ isOpen, onClose, onAdd }: Props) {
    const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState({
        name: '',
        set: '',
        category: 'Sealed',
        costBasis: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        imageUrl: '',
        currentValue: 0, 
        productId: null as string | null,
        quantity: 1
    });

    // Handle clicking outside of suggestions
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced search for products
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (formData.name.length >= 2 && showSuggestions) {
                setIsSearching(true);
                try {
                    const res = await fetch(`/api/products?q=${encodeURIComponent(formData.name)}`);
                    const data = await res.json();
                    setSuggestions(data.products || []);
                } catch (error) {
                    console.error('Error fetching suggestions:', error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSuggestions([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [formData.name, showSuggestions]);

    if (!isOpen) return null;

    const handleSelectSuggestion = (product: ProductSuggestion) => {
        setFormData(prev => ({
            ...prev,
            name: product.name,
            set: product.expansion,
            imageUrl: product.imageUrl || '',
            currentValue: product.price || 0,
            productId: product.id
        }));
        setShowSuggestions(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newItem: CollectionItem = {
            id: `new-${Date.now()}`,
            userId: '', // Will be set by API
            name: formData.name,
            set: formData.set,
            category: formData.category as 'Sealed' | 'Graded' | 'Raw',
            condition: '',
            costBasis: Number(formData.costBasis),
            currentValue: formData.currentValue,
            purchaseDate: formData.purchaseDate,
            imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?q=80&w=100&auto=format&fit=crop',
            productId: formData.productId,
            quantity: formData.quantity
        };

        try {
            const response = await fetch('/api/collection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newItem.name,
                    set: newItem.set,
                    category: newItem.category,
                    costBasis: newItem.costBasis,
                    currentValue: newItem.currentValue,
                    purchaseDate: newItem.purchaseDate,
                    imageUrl: newItem.imageUrl,
                    productId: newItem.productId,
                    quantity: newItem.quantity
                }),
            });

            if (!response.ok) throw new Error('Failed to save asset');

            const savedAsset = await response.json();
            onAdd(savedAsset);

            setFormData({
                name: '', set: '', category: 'Sealed', costBasis: '', currentValue: 0, purchaseDate: new Date().toISOString().split('T')[0], imageUrl: '', productId: null, quantity: 1
            });
            onClose();
        } catch (error) {
            console.error('Error saving asset:', error);
            alert('Failed to save asset. Please try again.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 h-full w-full">
            <div className="bg-[#151A21] border border-[rgba(255,255,255,0.06)] rounded-xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-[rgba(255,255,255,0.06)] shrink-0">
                    <h2 className="text-xl font-bold text-white">Add New Asset</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto custom-scrollbar p-6">
                    <form id="add-item-form" onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 relative">
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Asset Name</label>
                                <div className="relative">
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={e => {
                                            setFormData({ ...formData, name: e.target.value });
                                            setShowSuggestions(true);
                                        }}
                                        onFocus={() => setShowSuggestions(true)}
                                        placeholder="e.g. Charizard Base Set"
                                        className="w-full bg-[#0E1116] border border-[rgba(255,255,255,0.06)] rounded-lg pl-10 pr-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-primary"
                                    />
                                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                                    {isSearching && (
                                        <Loader2 className="absolute right-3 top-2.5 w-4 h-4 text-primary animate-spin" />
                                    )}
                                </div>

                                {showSuggestions && suggestions.length > 0 && (
                                    <div
                                        ref={dropdownRef}
                                        className="absolute z-[60] left-0 right-0 top-[calc(100%+4px)] bg-[#1A1F26] border border-[rgba(255,255,255,0.06)] rounded-lg shadow-2xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar"
                                    >
                                        {suggestions.map((product) => (
                                            <button
                                                key={product.id}
                                                type="button"
                                                onClick={() => handleSelectSuggestion(product)}
                                                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-[#252B35] transition-colors border-b border-[rgba(255,255,255,0.04)] last:border-0"
                                            >
                                                <div className="w-10 h-10 rounded shrink-0 bg-[#0E1116] overflow-hidden flex items-center justify-center border border-white/5">
                                                    {product.imageUrl ? (
                                                        <img
                                                            src={`/api/proxy-image?url=${encodeURIComponent(product.imageUrl)}`}
                                                            alt={product.name}
                                                            className="w-full h-full object-contain"
                                                        />
                                                    ) : (
                                                        <div className="w-4 h-4 text-gray-700">?</div>
                                                    )}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <div className="text-sm font-medium text-white truncate">{product.name}</div>
                                                    <div className="text-xs text-gray-400 truncate">{product.expansion} {product.releaseYear ? `(${product.releaseYear})` : ''}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Set / Expansion</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.set}
                                    onChange={e => setFormData({ ...formData, set: e.target.value })}
                                    placeholder="e.g. Base Set"
                                    className="w-full bg-[#0E1116] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full bg-[#0E1116] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary appearance-none"
                                >
                                    <option value="Sealed">Sealed</option>
                                    <option value="Graded">Graded</option>
                                    <option value="Raw">Raw</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Purchase Date</label>
                                <input
                                    required
                                    type="date"
                                    value={formData.purchaseDate}
                                    onChange={e => setFormData({ ...formData, purchaseDate: e.target.value })}
                                    className="w-full bg-[#0E1116] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-primary appearance-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Cost Basis (€)</label>
                                <input
                                    required
                                    type="number"
                                    step="0.01"
                                    value={formData.costBasis}
                                    onChange={e => setFormData({ ...formData, costBasis: e.target.value })}
                                    placeholder="0.00"
                                    className="w-full bg-[#0E1116] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Quantity</label>
                                <input
                                    required
                                    type="number"
                                    min="1"
                                    value={formData.quantity}
                                    onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                                    className="w-full bg-[#0E1116] border border-[rgba(255,255,255,0.06)] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                                />
                            </div>

                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-[rgba(255,255,255,0.06)] flex justify-end space-x-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        form="add-item-form"
                        type="submit"
                        className="bg-primary text-[#0E1116] hover:bg-[#00c885] transition-all shadow-[0_0_15px_rgba(0,229,153,0.3)] rounded-md px-6 py-2 text-sm font-bold"
                    >
                        Save Asset
                    </button>
                </div>
            </div>
        </div>
    );
}
