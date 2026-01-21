import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Link } from 'react-router-dom';
import { Product } from '../../types';

type FilterType = 'all' | 'Jersey' | 'Accessory' | 'Ball';
type StatusFilter = 'all' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

const Inventory = () => {
    const { products, addProduct, updateProduct, deleteProduct } = useStore();
    const [searchFilter, setSearchFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState<FilterType>('all');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

    // Modal states
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);

    // Form states for editing
    const [editName, setEditName] = useState('');
    const [editSku, setEditSku] = useState('');
    const [editImage, setEditImage] = useState('');
    const [editPrice, setEditPrice] = useState('');
    const [editCost, setEditCost] = useState('');
    const [editStock, setEditStock] = useState('');
    const [editSize, setEditSize] = useState('');
    const [editType, setEditType] = useState<'Jersey' | 'Accessory' | 'Ball'>('Jersey');

    // Filter products
    const filtered = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                p.sku.toLowerCase().includes(searchFilter.toLowerCase());
            const matchesType = typeFilter === 'all' || p.type === typeFilter;
            const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
            return matchesSearch && matchesType && matchesStatus;
        });
    }, [products, searchFilter, typeFilter, statusFilter]);

    // Stats
    const stats = useMemo(() => {
        const total = products.length;
        const inStock = products.filter(p => p.status === 'IN_STOCK').length;
        const lowStock = products.filter(p => p.status === 'LOW_STOCK').length;
        const outOfStock = products.filter(p => p.status === 'OUT_OF_STOCK').length;
        const totalValue = products.reduce((acc, p) => acc + (Number(p.price || 0) * Number(p.stock || 0)), 0);
        return { total, inStock, lowStock, outOfStock, totalValue };
    }, [products]);

    // Open edit modal
    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setEditName(product.name);
        setEditSku(product.sku);
        setEditImage(product.image);
        setEditPrice(product.price.toString());
        setEditCost(product.cost?.toString() || '0');
        setEditStock(product.stock.toString());
        setEditSize(product.size);
        setEditType(product.type);
        setShowEditModal(true);
    };

    // Save edited product
    const handleSaveEdit = () => {
        if (!editingProduct) return;

        const newStock = parseInt(editStock) || 0;
        const updatedProduct: Product = {
            ...editingProduct,
            name: editName,
            sku: editSku,
            image: editImage,
            price: parseFloat(editPrice) || 0,
            cost: parseFloat(editCost) || 0,
            stock: newStock,
            size: editSize,
            type: editType,
            status: newStock === 0 ? 'OUT_OF_STOCK' : newStock < 10 ? 'LOW_STOCK' : 'IN_STOCK',
        };

        updateProduct(updatedProduct);
        setShowEditModal(false);
        setEditingProduct(null);
    };

    // Open delete confirmation
    const handleDeleteClick = (product: Product) => {
        setProductToDelete(product);
        setShowDeleteModal(true);
    };

    // Confirm delete
    const handleConfirmDelete = () => {
        if (productToDelete) {
            deleteProduct(productToDelete.id);
            setShowDeleteModal(false);
            setProductToDelete(null);
        }
    };

    const handleDuplicate = (product: Product) => {
        const duplicatedProduct: Product = {
            ...product,
            id: Date.now().toString(),
            sku: `${product.sku}-copy-${Math.floor(Math.random() * 1000)}`,
            name: `${product.name} (Cópia)`,
        };
        addProduct(duplicatedProduct);
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'Jersey': return 'Camisa';
            case 'Accessory': return 'Acessório';
            case 'Ball': return 'Bola';
            default: return type;
        }
    };

    return (
        <div className="flex-1 overflow-y-auto p-6 md:p-8 h-full">
            <div className="max-w-7xl mx-auto flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Gestão de Estoque</h1>
                        <p className="text-slate-500 dark:text-slate-400">Controle logístico de camisas e acessórios.</p>
                    </div>
                    <Link to="/new-product" className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-slate-900 font-bold text-sm hover:bg-primary-dark transition-colors shadow-sm shadow-primary/20">
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        <span>Adicionar Produto</span>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-white dark:bg-surface-dark rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-slate-500">Total de Produtos</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                    </div>
                    <div className="bg-white dark:bg-surface-dark rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-slate-500">Em Estoque</p>
                        <p className="text-2xl font-bold text-green-600">{stats.inStock}</p>
                    </div>
                    <div className="bg-white dark:bg-surface-dark rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-slate-500">Estoque Crítico</p>
                        <p className="text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
                    </div>
                    <div className="bg-white dark:bg-surface-dark rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-slate-500">Esgotados</p>
                        <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
                    </div>
                    <div className="bg-white dark:bg-surface-dark rounded-xl p-4 border border-slate-200 dark:border-slate-700 col-span-2 md:col-span-1">
                        <p className="text-sm text-slate-500">Valor em Estoque</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">R$ {stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-col lg:flex-row gap-4 items-center bg-white dark:bg-surface-dark p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    {/* Search */}
                    <div className="w-full lg:max-w-md relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Buscar camisa, time ou SKU..."
                            value={searchFilter}
                            onChange={(e) => setSearchFilter(e.target.value)}
                        />
                    </div>

                    {/* Type Filter */}
                    <div className="flex gap-2 flex-wrap">
                        {(['all', 'Jersey', 'Accessory', 'Ball'] as FilterType[]).map((type) => (
                            <button
                                key={type}
                                onClick={() => setTypeFilter(type)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${typeFilter === type
                                    ? 'bg-primary text-slate-900'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                    }`}
                            >
                                {type === 'all' ? 'Todos' : getTypeLabel(type)}
                            </button>
                        ))}
                    </div>

                    {/* Status Filter */}
                    <div className="flex gap-2 flex-wrap">
                        {([
                            { value: 'all', label: 'Todos Status', color: 'slate' },
                            { value: 'IN_STOCK', label: 'Em Estoque', color: 'green' },
                            { value: 'LOW_STOCK', label: 'Crítico', color: 'yellow' },
                            { value: 'OUT_OF_STOCK', label: 'Esgotado', color: 'red' },
                        ] as { value: StatusFilter; label: string; color: string }[]).map((status) => (
                            <button
                                key={status.value}
                                onClick={() => setStatusFilter(status.value)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === status.value
                                    ? `bg-${status.color}-100 text-${status.color}-800 ring-2 ring-${status.color}-500`
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                                    }`}
                            >
                                {status.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results count */}
                <div className="text-sm text-slate-500">
                    Exibindo {filtered.length} de {products.length} produtos
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-dark shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Produto</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Modelo</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Tamanho</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-right">Qtd.</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-right">Custo</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-right">Preço</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-center">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                                            <span className="material-symbols-outlined text-4xl mb-2 block">inventory_2</span>
                                            Nenhum produto encontrado com os filtros selecionados.
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map(product => (
                                        <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-full bg-slate-200 bg-cover bg-center" style={{ backgroundImage: `url('${product.image}')` }}></div>
                                                    <div>
                                                        <div className="text-sm font-bold text-slate-900 dark:text-white">{product.name}</div>
                                                        <div className="text-xs text-slate-500">{product.sku}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                                {getTypeLabel(product.type)}
                                            </td>
                                            <td className="px-6 py-4"><span className="inline-flex items-center justify-center h-7 w-7 rounded bg-slate-100 dark:bg-slate-700 text-xs font-bold">{product.size}</span></td>
                                            <td className="px-6 py-4 text-sm text-right font-medium">{product.stock}</td>
                                            <td className="px-6 py-4 text-sm text-right text-slate-500">R$ {Number(product.cost || 0).toFixed(2)}</td>
                                            <td className="px-6 py-4 text-sm text-right font-medium">R$ {Number(product.price || 0).toFixed(2)}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                                ${product.status === 'IN_STOCK' ? 'bg-green-100 text-green-800' :
                                                        product.status === 'LOW_STOCK' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                                    {product.status === 'IN_STOCK' ? 'Em Estoque' : product.status === 'LOW_STOCK' ? 'Crítico' : 'Esgotado'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDuplicate(product)}
                                                    className="text-slate-400 hover:text-emerald-500 transition-colors p-1"
                                                    title="Duplicar produto"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">content_copy</span>
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    className="text-slate-400 hover:text-primary transition-colors p-1"
                                                    title="Editar produto"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(product)}
                                                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                                    title="Excluir produto"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && editingProduct && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-2xl max-w-md w-full">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">edit</span>
                            Editar Produto
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">SKU</label>
                                <input
                                    type="text"
                                    value={editSku}
                                    onChange={(e) => setEditSku(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">URL da Imagem</label>
                                <input
                                    type="text"
                                    value={editImage}
                                    onChange={(e) => setEditImage(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo</label>
                                    <select
                                        value={editType}
                                        onChange={(e) => setEditType(e.target.value as 'Jersey' | 'Accessory' | 'Ball')}
                                        className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none"
                                    >
                                        <option value="Jersey">Camisa</option>
                                        <option value="Accessory">Acessório</option>
                                        <option value="Ball">Bola</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tamanho</label>
                                    <input
                                        type="text"
                                        value={editSize}
                                        onChange={(e) => setEditSize(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Custo (R$)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={editCost}
                                        onChange={(e) => setEditCost(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Preço (R$)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={editPrice}
                                        onChange={(e) => setEditPrice(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Estoque</label>
                                    <input
                                        type="number"
                                        value={editStock}
                                        onChange={(e) => setEditStock(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className="flex-1 px-4 py-2.5 bg-primary text-slate-900 rounded-lg font-bold hover:bg-primary-hover transition-colors"
                            >
                                Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && productToDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-2xl max-w-sm w-full">
                        <div className="text-center">
                            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-3xl text-red-600">delete_forever</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Excluir Produto?</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-2">
                                Tem certeza que deseja excluir
                            </p>
                            <p className="font-bold text-slate-900 dark:text-white mb-4">
                                "{productToDelete.name}"
                            </p>
                            <p className="text-xs text-red-500 mb-6">
                                Esta ação não pode ser desfeita.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
                            >
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;