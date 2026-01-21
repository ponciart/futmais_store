import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Order } from '../types';

const Orders = () => {
    const { orders } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Todos');

    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const matchesSearch =
                order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.customerName.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'Todos' || order.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [orders, searchTerm, statusFilter]);

    return (
        <div className="flex-1 overflow-y-auto p-6 md:p-8 h-full bg-background-light dark:bg-background-dark">
            {/* Modal de Detalhes do Pedido */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Detalhes do Pedido</h3>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{selectedOrder.id}</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="size-10 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
                            <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
                                <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined text-3xl">person</span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Cliente</p>
                                    <h4 className="font-bold text-slate-900 dark:text-white">{selectedOrder.customerName}</h4>
                                    <p className="text-xs text-slate-500">{selectedOrder.date}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Itens do Pedido</h4>
                                {selectedOrder.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-3">
                                            <span className="size-6 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-[10px] text-slate-500">{item.quantity}x</span>
                                            <span className="font-medium text-slate-700 dark:text-slate-300">{item.product.name}</span>
                                        </div>
                                        <span className="font-bold text-slate-900 dark:text-white">R$ {Number(item.product.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-slate-100 dark:border-slate-700 pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Forma de Pagamento</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{selectedOrder.paymentMethod}</span>
                                </div>
                                <div className="flex justify-between text-lg font-black pt-2 border-t border-slate-50 dark:border-slate-800">
                                    <span className="text-slate-900 dark:text-white">Total</span>
                                    <span className="text-primary">R$ {Number(selectedOrder.total).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 flex gap-3">
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="flex-1 py-3 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
                            >
                                Fechar
                            </button>
                            <button className="flex-1 py-3 bg-primary text-slate-900 font-bold rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-sm">print</span> Comprovante
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="max-w-7xl mx-auto flex flex-col gap-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Pedidos dos Clientes</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie e visualize todo o histórico de vendas.</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[250px] relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            type="text"
                            placeholder="Buscar por ID ou Nome do Cliente..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none cursor-pointer text-sm font-medium"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="Todos">Todos os Status</option>
                        <option value="Delivered">Entregue</option>
                        <option value="Processing">Em Processamento</option>
                        <option value="Cancelled">Cancelado</option>
                    </select>
                </div>

                {/* Table */}
                <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">ID Pedido</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Cliente</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Data</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Pagamento</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Total</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {filteredOrders.length > 0 ? filteredOrders.map(order => (
                                    <tr
                                        key={order.id}
                                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                                        onClick={() => setSelectedOrder(order)}
                                    >
                                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{order.id}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-medium">{order.customerName}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{order.date}</td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-300">
                                                {order.paymentMethod}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">R$ {order.total.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase
                                                ${order.status === 'Delivered' ? 'bg-primary/20 text-green-800' :
                                                    order.status === 'Processing' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                                                {order.status === 'Delivered' ? 'Entregue' : order.status === 'Processing' ? 'Pendente' : 'Cancelado'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="text-primary hover:underline text-xs font-bold flex items-center gap-1 mx-auto"
                                            >
                                                <span className="material-symbols-outlined text-sm">visibility</span> Detalhes
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-slate-500 italic">Nenhum pedido encontrado.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Orders;
