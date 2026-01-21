import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Supplier } from '../../types';

const Suppliers = () => {
    const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [categoryFilter, setCategoryFilter] = useState('Todas');

    // New Supplier Form State
    const [newSupplier, setNewSupplier] = useState({
        name: '',
        contact: '',
        email: '',
        phone: '',
        category: '',
    });

    // Categories extraction
    const categories = useMemo(() => {
        const cats = new Set<string>();
        suppliers.forEach(s => s.category.forEach(c => cats.add(c)));
        return ['Todas', ...Array.from(cats)];
    }, [suppliers]);

    // Filtering logic
    const filteredSuppliers = useMemo(() => {
        return suppliers.filter(s => {
            const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.email.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory = categoryFilter === 'Todas' || s.category.includes(categoryFilter);

            return matchesSearch && matchesCategory;
        });
    }, [suppliers, searchTerm, categoryFilter]);

    // Stats
    const stats = useMemo(() => {
        return {
            total: suppliers.length,
            active: suppliers.filter(s => s.status === 'Active').length,
            topRated: suppliers.filter(s => s.rating === 5).length
        };
    }, [suppliers]);

    // Handlers
    const handleAddSupplier = () => {
        if (!newSupplier.name || !newSupplier.phone) {
            alert('Nome e Telefone são obrigatórios');
            return;
        }
        const supplier: Supplier = {
            id: `SUP-${Math.floor(Math.random() * 1000)}`,
            name: newSupplier.name,
            contact: newSupplier.contact,
            email: newSupplier.email,
            phone: newSupplier.phone,
            category: newSupplier.category ? newSupplier.category.split(',').map(c => c.trim()) : [],
            rating: 5,
            status: 'Active',
            image: `https://ui-avatars.com/api/?name=${encodeURIComponent(newSupplier.name)}&background=random`,
        };
        addSupplier(supplier);
        setShowAddModal(false);
        setNewSupplier({ name: '', contact: '', email: '', phone: '', category: '' });
    };

    const handleUpdateSupplier = () => {
        if (editingSupplier) {
            updateSupplier(editingSupplier);
            setShowEditModal(false);
            setEditingSupplier(null);
        }
    };

    const handleDeleteSupplier = (id: string, name: string) => {
        if (confirm(`Excluir fornecedor ${name}?`)) {
            deleteSupplier(id);
        }
    };

    const formatWhatsApp = (phone: string) => {
        return `https://wa.me/${phone.replace(/\D/g, '')}`;
    };

    const exportToCSV = () => {
        const headers = ['ID', 'Empresa', 'Contato', 'Email', 'Telefone', 'Categorias', 'Status', 'Rating'];
        const rows = suppliers.map(s => [
            s.id, s.name, s.contact, s.email, s.phone, s.category.join(' | '), s.status, s.rating
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `fornecedores_futmais_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex-1 overflow-y-auto p-6 md:p-8 h-full">
            <div className="max-w-7xl mx-auto flex flex-col gap-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Gestão de Fornecedores</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Gerencie seus parceiros e contratos ativos.</p>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <button
                            onClick={exportToCSV}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
                        >
                            <span className="material-symbols-outlined text-[20px]">download</span>
                            Exportar
                        </button>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-slate-900 font-bold text-sm hover:bg-primary-dark transition-colors shadow-sm"
                        >
                            <span className="material-symbols-outlined text-[20px]">person_add</span>
                            <span>Novo Fornecedor</span>
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between mb-4">
                            <span className="text-slate-500 font-bold uppercase text-xs">Total</span>
                            <span className="material-symbols-outlined text-primary bg-primary/10 p-1 rounded">inventory_2</span>
                        </div>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
                    </div>
                    <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between mb-4">
                            <span className="text-slate-500 font-bold uppercase text-xs">Ativos</span>
                            <span className="material-symbols-outlined text-green-500 bg-green-500/10 p-1 rounded">verified_user</span>
                        </div>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.active}</div>
                    </div>
                    <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between mb-4">
                            <span className="text-slate-500 font-bold uppercase text-xs">Excelência (5★)</span>
                            <span className="material-symbols-outlined text-yellow-500 bg-yellow-500/10 p-1 rounded">star</span>
                        </div>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.topRated}</div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">search</span>
                        <input
                            type="text"
                            placeholder="Buscar empresa, contato ou email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary text-slate-600 dark:text-slate-300"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategoryFilter(cat)}
                                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all whitespace-nowrap
                                    ${categoryFilter === cat
                                        ? 'bg-primary border-primary text-slate-900'
                                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-surface-light dark:bg-surface-dark shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Empresa</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Contato</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Categorias</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Avaliação</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {filteredSuppliers.length > 0 ? filteredSuppliers.map(supplier => (
                                    <tr key={supplier.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-lg bg-slate-100 dark:bg-slate-800 bg-cover bg-center border border-slate-200 dark:border-slate-700" style={{ backgroundImage: `url('${supplier.image}')` }}></div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900 dark:text-white">{supplier.name}</span>
                                                    <span className="text-xs text-slate-400">{supplier.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                            <div className="flex flex-col">
                                                <span>{supplier.contact}</span>
                                                <span className="text-xs text-slate-400">{supplier.phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {supplier.category.map((cat, idx) => (
                                                    <span key={idx} className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 text-[10px] font-bold border border-blue-100 dark:border-blue-800">
                                                        {cat}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex text-yellow-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <span key={i} className={`material-symbols-outlined text-[16px] ${i < supplier.rating ? 'icon-filled' : 'text-slate-200 dark:text-slate-700'}`}>
                                                        star
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase
                                                ${supplier.status === 'Active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}`}>
                                                <span className={`size-1.5 rounded-full ${supplier.status === 'Active' ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                                                {supplier.status === 'Active' ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                <a
                                                    href={formatWhatsApp(supplier.phone)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 p-2 rounded-lg transition-colors"
                                                    title="WhatsApp"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">chat</span>
                                                </a>
                                                <button
                                                    onClick={() => { setEditingSupplier(supplier); setShowEditModal(true); }}
                                                    className="text-slate-400 hover:text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSupplier(supplier.id, supplier.name)}
                                                    className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors"
                                                    title="Excluir"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">Nenhum fornecedor encontrado</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Add */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined">person_add</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Novo Fornecedor</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Empresa *</label>
                                <input
                                    type="text"
                                    placeholder="Nome da empresa"
                                    value={newSupplier.name}
                                    onChange={e => setNewSupplier({ ...newSupplier, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Contato</label>
                                <input
                                    type="text"
                                    placeholder="Nome do vendedor/contato"
                                    value={newSupplier.contact}
                                    onChange={e => setNewSupplier({ ...newSupplier, contact: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary dark:text-white"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">WhatsApp *</label>
                                    <input
                                        type="tel"
                                        placeholder="(00) 00000-0000"
                                        value={newSupplier.phone}
                                        onChange={e => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Categorias</label>
                                    <input
                                        type="text"
                                        placeholder="EX: Chuteiras, Camisas"
                                        value={newSupplier.category}
                                        onChange={e => setNewSupplier({ ...newSupplier, category: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary dark:text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                                <input
                                    type="email"
                                    placeholder="vendas@fornecedor.com"
                                    value={newSupplier.email}
                                    onChange={e => setNewSupplier({ ...newSupplier, email: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary dark:text-white"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAddSupplier}
                                className="flex-1 px-4 py-3 bg-primary text-slate-900 rounded-xl font-bold hover:bg-primary-dark transition-all transform active:scale-95 shadow-lg shadow-primary/20"
                            >
                                Criar Fornecedor
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Edit */}
            {showEditModal && editingSupplier && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-200 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined">edit</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Editar Fornecedor</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Empresa</label>
                                <input
                                    type="text"
                                    value={editingSupplier.name}
                                    onChange={e => setEditingSupplier({ ...editingSupplier, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary dark:text-white"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                                    <select
                                        value={editingSupplier.status}
                                        onChange={e => setEditingSupplier({ ...editingSupplier, status: e.target.value as 'Active' | 'Inactive' })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary dark:text-white"
                                    >
                                        <option value="Active">Ativo</option>
                                        <option value="Inactive">Inativo</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Rating (1-5)</label>
                                    <select
                                        value={editingSupplier.rating}
                                        onChange={e => setEditingSupplier({ ...editingSupplier, rating: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary dark:text-white"
                                    >
                                        {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Estrelas</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">WhatsApp</label>
                                <input
                                    type="tel"
                                    value={editingSupplier.phone}
                                    onChange={e => setEditingSupplier({ ...editingSupplier, phone: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={editingSupplier.email}
                                    onChange={e => setEditingSupplier({ ...editingSupplier, email: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary dark:text-white"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => { setShowEditModal(false); setEditingSupplier(null); }}
                                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleUpdateSupplier}
                                className="flex-1 px-4 py-3 bg-primary text-slate-900 rounded-xl font-bold hover:bg-primary-dark transition-all transform active:scale-95 shadow-lg shadow-primary/20"
                            >
                                Salvar Alterações
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Suppliers;