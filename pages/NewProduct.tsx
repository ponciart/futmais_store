import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { Product } from '../../types';

const NewProduct = () => {
    const { addProduct } = useStore();
    const navigate = useNavigate();

    const [formData, setFormData] = useState<Partial<Product>>({
        name: '',
        team: '',
        league: '',
        size: 'M',
        price: 0,
        cost: 0,
        stock: 0,
        type: 'Jersey',
        status: 'IN_STOCK',
        image: 'https://picsum.photos/200'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name && formData.price) {
            const productData: Product = {
                ...formData,
                id: Date.now().toString(),
                sku: formData.sku || `SKU-${Math.floor(Math.random() * 10000)}`,
                description: 'New Product',
                price: Number(formData.price),
                cost: Number(formData.cost || 0),
                stock: Number(formData.stock || 0),
            } as Product;

            addProduct(productData);
            navigate('/inventory');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="flex-1 overflow-y-auto p-6 md:p-8 h-full">
            <div className="max-w-4xl mx-auto flex flex-col gap-8">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white">Cadastro de Novo Produto</h1>
                </div>

                <form onSubmit={handleSubmit} className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-slate-200 dark:border-slate-700">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">info</span> Informações Básicas
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <label className="flex flex-col w-full">
                                <span className="text-sm font-medium pb-2 text-slate-700 dark:text-slate-300">Nome do Produto</span>
                                <input name="name" onChange={handleChange} className="form-input w-full rounded-xl border-slate-300 bg-slate-50 dark:bg-slate-800 h-12 px-4 focus:ring-primary focus:border-primary" placeholder="Ex: Camisa Flamengo 2024" required />
                            </label>
                            <label className="flex flex-col w-full">
                                <span className="text-sm font-medium pb-2 text-slate-700 dark:text-slate-300">SKU (Código)</span>
                                <input name="sku" onChange={handleChange} className="form-input w-full rounded-xl border-slate-300 bg-slate-50 dark:bg-slate-800 h-12 px-4 focus:ring-primary focus:border-primary" placeholder="Gerado automaticamente se vazio" />
                            </label>
                            <label className="flex flex-col w-full">
                                <span className="text-sm font-medium pb-2 text-slate-700 dark:text-slate-300">Time</span>
                                <input name="team" onChange={handleChange} className="form-input w-full rounded-xl border-slate-300 bg-slate-50 dark:bg-slate-800 h-12 px-4 focus:ring-primary focus:border-primary" placeholder="Ex: Flamengo" />
                            </label>
                            <label className="flex flex-col w-full">
                                <span className="text-sm font-medium pb-2 text-slate-700 dark:text-slate-300">Tamanho</span>
                                <select name="size" onChange={handleChange} className="form-select w-full rounded-xl border-slate-300 bg-slate-50 dark:bg-slate-800 h-12 px-4 focus:ring-primary focus:border-primary">
                                    <option value="P">P</option>
                                    <option value="M">M</option>
                                    <option value="G">G</option>
                                    <option value="GG">GG</option>
                                </select>
                            </label>
                            <label className="flex flex-col w-full">
                                <span className="text-sm font-medium pb-2 text-slate-700 dark:text-slate-300">Tipo</span>
                                <select name="type" onChange={handleChange} className="form-select w-full rounded-xl border-slate-300 bg-slate-50 dark:bg-slate-800 h-12 px-4 focus:ring-primary focus:border-primary">
                                    <option value="Jersey">Camisa</option>
                                    <option value="Accessory">Acessório</option>
                                    <option value="Ball">Bola</option>
                                </select>
                            </label>
                        </div>
                    </div>

                    <div className="p-6 md:p-8">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">attach_money</span> Financeiro e Estoque
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <label className="flex flex-col w-full">
                                <span className="text-sm font-medium pb-2 text-slate-700 dark:text-slate-300">Preço de Venda</span>
                                <input type="number" name="price" onChange={handleChange} className="form-input w-full rounded-xl border-slate-300 bg-slate-50 dark:bg-slate-800 h-12 px-4 focus:ring-primary focus:border-primary" placeholder="0.00" required />
                            </label>
                            <label className="flex flex-col w-full">
                                <span className="text-sm font-medium pb-2 text-slate-700 dark:text-slate-300">Custo</span>
                                <input type="number" name="cost" onChange={handleChange} className="form-input w-full rounded-xl border-slate-300 bg-slate-50 dark:bg-slate-800 h-12 px-4 focus:ring-primary focus:border-primary" placeholder="0.00" />
                            </label>
                            <label className="flex flex-col w-full">
                                <span className="text-sm font-medium pb-2 text-slate-700 dark:text-slate-300">Quantidade Inicial</span>
                                <input type="number" name="stock" onChange={handleChange} className="form-input w-full rounded-xl border-slate-300 bg-slate-50 dark:bg-slate-800 h-12 px-4 focus:ring-primary focus:border-primary" placeholder="0" required />
                            </label>
                        </div>
                    </div>

                    <div className="p-6 md:p-8 border-b border-slate-200 dark:border-slate-700">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">image</span> Fotos do Produto
                        </h2>
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="w-full md:w-64 aspect-square rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden relative group">
                                {formData.image && formData.image !== 'https://picsum.photos/200' ? (
                                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center text-slate-400">
                                        <span className="material-symbols-outlined text-4xl">add_a_photo</span>
                                        <span className="text-xs mt-2 uppercase font-bold">Adicionar Foto</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setFormData({ ...formData, image: reader.result as string });
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                            </div>
                            <div className="flex-1 space-y-4">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Selecione uma foto nítida do produto. Formatos aceitos: JPG, PNG. Tamanho máximo recomendado: 2MB.
                                </p>
                                {formData.image && formData.image !== 'https://picsum.photos/200' && (
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, image: 'https://picsum.photos/200' })}
                                        className="text-xs font-bold text-red-500 uppercase flex items-center gap-1 hover:underline"
                                    >
                                        <span className="material-symbols-outlined text-sm">delete</span> Remover Foto
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 md:p-8 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-4">
                        <button type="button" onClick={() => navigate('/inventory')} className="px-6 h-12 rounded-xl text-slate-600 font-bold hover:bg-slate-200 transition-colors">Cancelar</button>
                        <button type="submit" className="px-6 h-12 rounded-xl bg-primary text-slate-900 font-bold hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20 flex items-center gap-2">
                            <span className="material-symbols-outlined">save</span> Salvar Produto
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewProduct;