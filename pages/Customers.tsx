import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Customer } from '../../types';

const Customers = () => {
    const { customers, addCustomer, updateCustomer, deleteCustomer } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

    // New Customer Form State
    const [newCustomer, setNewCustomer] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
    });

    // Filtering logic
    const filteredCustomers = useMemo(() => {
        return customers
            .filter(c =>
                c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                c.phone.includes(searchTerm)
            )
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [customers, searchTerm]);

    // Statistics logic
    const stats = useMemo(() => {
        const total = customers.length;
        const active = customers.filter(c => c.status === 'Active').length;
        const best = customers.length > 0
            ? [...customers].sort((a, b) => b.totalSpent - a.totalSpent)[0]
            : null;
        return { total, active, best };
    }, [customers]);

    // Handlers
    const handleAddCustomer = () => {
        if (!newCustomer.name || !newCustomer.phone) {
            alert('Nome e Telefone são obrigatórios');
            return;
        }
        const customer: Customer = {
            id: `CUST-${Date.now()}`,
            name: newCustomer.name,
            email: newCustomer.email,
            phone: newCustomer.phone,
            address: newCustomer.address,
            image: `https://ui-avatars.com/api/?name=${encodeURIComponent(newCustomer.name)}&background=random`,
            totalSpent: 0,
            status: 'Active',
            memberSince: new Date().toLocaleDateString('pt-BR'),
        };
        addCustomer(customer);
        setShowAddModal(false);
        setNewCustomer({ name: '', email: '', phone: '', address: '' });
    };

    const handleUpdateCustomer = () => {
        if (editingCustomer) {
            updateCustomer(editingCustomer);
            setShowEditModal(false);
            setEditingCustomer(null);
        }
    };

    const handleDeleteCustomer = (id: string, name: string) => {
        if (confirm(`Tem certeza que deseja excluir o cliente ${name}?`)) {
            deleteCustomer(id);
        }
    };

    const exportToCSV = () => {
        const headers = ['ID', 'Nome', 'Email', 'Telefone', 'Gasto Total', 'Status', 'Membro Desde', 'Endereço'];
        const rows = customers.map(c => [
            c.id, c.name, c.email, c.phone, c.totalSpent.toFixed(2), c.status, c.memberSince, c.address
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `clientes_futmais_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatWhatsApp = (phone: string) => {
        return `https://wa.me/${phone.replace(/\D/g, '')}`;
    };

    return (
        <div className="flex-1 overflow-y-auto p-6 md:p-8 h-full">
            <div className="max-w-7xl mx-auto flex flex-col gap-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white">Gestão de Clientes</h1>
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
                            <span className="material-symbols-outlined text-[20px]">add</span>
                            <span>Novo Cliente</span>
                        </button>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">search</span>
                        <input
                            type="text"
                            placeholder="Buscar por nome, email ou telefone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary transition-all text-slate-600 dark:text-slate-300"
                        />
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between mb-4">
                            <span className="text-slate-500 font-bold uppercase text-xs">Total de Clientes</span>
                            <span className="material-symbols-outlined text-primary bg-primary/10 p-1 rounded">groups</span>
                        </div>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
                    </div>
                    <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between mb-4">
                            <span className="text-slate-500 font-bold uppercase text-xs">Ativos</span>
                            <span className="material-symbols-outlined text-primary bg-primary/10 p-1 rounded">verified_user</span>
                        </div>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.active}</div>
                    </div>
                    <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between mb-4">
                            <span className="text-slate-500 font-bold uppercase text-xs">Melhor Cliente</span>
                            <span className="material-symbols-outlined text-primary bg-primary/10 p-1 rounded">emoji_events</span>
                        </div>
                        {stats.best ? (
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-full bg-cover bg-center border-2 border-primary" style={{ backgroundImage: `url('${stats.best.image}')` }}></div>
                                <div>
                                    <div className="font-bold text-slate-900 dark:text-white truncate max-w-[150px]">{stats.best.name}</div>
                                    <div className="text-sm text-primary font-bold">R$ {stats.best.totalSpent.toFixed(2)}</div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-slate-400 italic text-sm">Nenhum cliente</div>
                        )}
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-surface-light dark:bg-surface-dark shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Nome</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Email</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Telefone</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-right">Gasto Total</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-center">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {filteredCustomers.length > 0 ? filteredCustomers.map(customer => (
                                    <tr key={customer.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-9 rounded-full bg-slate-200 bg-cover bg-center shadow-sm" style={{ backgroundImage: `url('${customer.image}')` }}></div>
                                                <span className="font-medium text-slate-900 dark:text-white">{customer.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{customer.email || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{customer.phone}</td>
                                        <td className="px-6 py-4 text-sm text-right font-bold text-slate-900 dark:text-white">R$ {customer.totalSpent.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                                ${customer.status === 'Active' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                                                {customer.status === 'Active' ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                <a
                                                    href={formatWhatsApp(customer.phone)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 p-1.5 rounded-lg transition-colors"
                                                    title="WhatsApp"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">chat</span>
                                                </a>
                                                <button
                                                    onClick={() => { setEditingCustomer(customer); setShowEditModal(true); }}
                                                    className="text-slate-400 hover:text-primary hover:bg-primary/10 p-1.5 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCustomer(customer.id, customer.name)}
                                                    className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg transition-colors"
                                                    title="Excluir"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                                            Nenhum cliente encontrado
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">person_add</span>
                            Novo Cliente
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome Completo *</label>
                                <input
                                    type="text"
                                    value={newCustomer.name}
                                    onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Ex: Pedro Silva"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telefone (WhatsApp) *</label>
                                <input
                                    type="text"
                                    value={newCustomer.phone}
                                    onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="(11) 99999-9999"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={newCustomer.email}
                                    onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="cliente@email.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Endereço</label>
                                <textarea
                                    value={newCustomer.address}
                                    onChange={e => setNewCustomer({ ...newCustomer, address: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                                    placeholder="Nome da rua, número, bairro..."
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAddCustomer}
                                className="flex-1 px-4 py-2.5 bg-primary text-slate-900 rounded-lg font-bold hover:bg-primary-dark transition-colors"
                            >
                                Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showEditModal && editingCustomer && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">edit</span>
                            Editar Cliente
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome Completo</label>
                                <input
                                    type="text"
                                    value={editingCustomer.name}
                                    onChange={e => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telefone</label>
                                    <input
                                        type="text"
                                        value={editingCustomer.phone}
                                        onChange={e => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                                    <select
                                        value={editingCustomer.status}
                                        onChange={e => setEditingCustomer({ ...editingCustomer, status: e.target.value as 'Active' | 'Inactive' })}
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="Active">Ativo</option>
                                        <option value="Inactive">Inativo</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={editingCustomer.email}
                                    onChange={e => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Endereço</label>
                                <textarea
                                    value={editingCustomer.address}
                                    onChange={e => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => { setShowEditModal(false); setEditingCustomer(null); }}
                                className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleUpdateCustomer}
                                className="flex-1 px-4 py-2.5 bg-primary text-slate-900 rounded-lg font-bold hover:bg-primary-dark transition-colors"
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

export default Customers;