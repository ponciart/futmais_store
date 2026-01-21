import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Product } from '../../types';

const POS = () => {
    const { products, customers, cart, addToCart, removeFromCart, updateCartQuantity, cartTotal, checkout } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-1 overflow-hidden h-full">
            {/* LEFT PANEL: Catalog */}
            <main className="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark relative">
                {/* Header / Filter */}
                <div className="p-6 pb-2">
                    <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Buscar Produto</label>
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                                <input
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                    placeholder="Nome, SKU ou código..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 pb-1">
                            {['Todos', 'Jersey', 'Accessory', 'Ball'].map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 text-sm font-semibold rounded-lg whitespace-nowrap transition-colors
                                ${selectedCategory === cat ? 'bg-primary text-slate-900 shadow-sm' : 'bg-surface-light border border-slate-200 text-slate-600 hover:border-primary'}`}
                                >
                                    {cat === 'Todos' ? 'Todos' : cat === 'Jersey' ? 'Camisas' : cat === 'Accessory' ? 'Acessórios' : 'Bolas'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-6 pt-2">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filteredProducts
                            .filter(p => selectedCategory === 'Todos' || p.type === selectedCategory)
                            .map(product => (
                                <div
                                    key={product.id}
                                    onClick={() => addToCart(product)}
                                    className={`group bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 p-3 hover:border-primary transition-all cursor-pointer flex flex-col relative overflow-hidden
                            ${product.stock === 0 ? 'opacity-50 pointer-events-none' : ''}`}
                                >
                                    <div className="absolute top-3 right-3 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm z-10">{product.size}</div>
                                    <div className="aspect-[4/3] rounded-lg bg-slate-100 dark:bg-slate-800 mb-3 overflow-hidden">
                                        <div className="w-full h-full bg-contain bg-center bg-no-repeat group-hover:scale-110 transition-transform duration-300" style={{ backgroundImage: `url('${product.image}')` }}></div>
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm leading-tight mb-1">{product.name}</h3>
                                            <p className="text-xs text-slate-500">{product.stock} em estoque</p>
                                        </div>
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="font-bold text-primary text-lg">R$ {Number(product.price || 0).toFixed(2)}</span>
                                            <button className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary group-hover:text-slate-900 transition-colors">
                                                <span className="material-symbols-outlined text-[20px]">add</span>
                                            </button>
                                        </div>
                                    </div>
                                    {product.stock === 0 && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-[1px]">
                                            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">ESGOTADO</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                    </div>
                </div>
            </main>

            {/* RIGHT PANEL: Cart */}
            <aside className="w-[400px] flex flex-col bg-surface-light dark:bg-surface-dark border-l border-slate-200 dark:border-slate-700 shadow-xl z-10 h-full">
                <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">shopping_cart</span>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Carrinho</h2>
                    </div>
                    <span className="bg-primary/20 text-green-700 dark:text-green-300 text-xs font-bold px-2 py-1 rounded-full">{cart.reduce((acc, i) => acc + i.quantity, 0)} Itens</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-background-dark/50">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <span className="material-symbols-outlined text-6xl mb-2">remove_shopping_cart</span>
                            <p>Carrinho vazio</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.product.id} className="bg-surface-light dark:bg-surface-dark p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex gap-3 group">
                                <div className="size-16 rounded-md bg-slate-100 bg-cover bg-center shrink-0" style={{ backgroundImage: `url('${item.product.image}')` }}></div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">{item.product.name}</p>
                                            <p className="text-xs text-slate-500">Tam: {item.product.size}</p>
                                        </div>
                                        <button onClick={() => removeFromCart(item.product.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                        </button>
                                    </div>
                                    <div className="flex justify-between items-end mt-2">
                                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                                            <button onClick={() => updateCartQuantity(item.product.id, -1)} className="size-6 flex items-center justify-center bg-white dark:bg-slate-700 rounded shadow-sm hover:bg-slate-50">
                                                <span className="material-symbols-outlined text-[14px]">remove</span>
                                            </button>
                                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                            <button onClick={() => updateCartQuantity(item.product.id, 1)} className="size-6 flex items-center justify-center bg-white dark:bg-slate-700 rounded shadow-sm hover:bg-slate-50">
                                                <span className="material-symbols-outlined text-[14px]">add</span>
                                            </button>
                                        </div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">R$ {(item.product.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 bg-surface-light dark:bg-surface-dark border-t border-slate-200 dark:border-slate-700 shadow-[0_-5px_15px_rgba(0,0,0,0.02)]">
                    <div className="space-y-4 mb-6">
                        {/* Customer Link */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Vincular Cliente</label>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-slate-400 text-[20px]">person</span>
                                <select
                                    className="flex-1 bg-transparent text-sm font-medium outline-none text-slate-700 dark:text-slate-200"
                                    value={selectedCustomerId}
                                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                                >
                                    <option value="" className="bg-surface-light dark:bg-surface-dark">Cliente Avulso</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id} className="bg-surface-light dark:bg-surface-dark">{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <span className="text-base font-bold text-slate-800 dark:text-slate-100">Total a Pagar</span>
                            <span className="text-2xl font-bold text-slate-900 dark:text-white">R$ {cartTotal.toFixed(2)}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            checkout('Pix', selectedCustomerId || undefined);
                            setSelectedCustomerId('');
                        }}
                        disabled={cart.length === 0}
                        className="w-full bg-primary hover:bg-primary-hover text-slate-900 font-bold text-lg py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span>Finalizar Venda</span>
                    </button>
                </div>
            </aside>
        </div>
    );
};

export default POS;