import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Order } from '../../types';

const CustomerDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { customers, orders } = useStore();

    const customer = useMemo(() => customers.find(c => c.id === id), [customers, id]);

    // Filtra pedidos vinculados a este cliente (por ID ou Nome como fallback)
    const customerOrders = useMemo(() => {
        if (!customer) return [];
        return orders.filter(o => o.customerId === customer.id || o.customerName === customer.name);
    }, [orders, customer]);

    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    if (!customer) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                <span className="material-symbols-outlined text-6xl mb-4">person_off</span>
                <p className="text-xl font-bold">Cliente não encontrado</p>
                <button onClick={() => navigate('/customers')} className="mt-4 text-primary hover:underline font-bold">Voltar para Clientes</button>
            </div>
        );
    }

    const totalOrders = customerOrders.length;
    const averageOrderValue = totalOrders > 0 ? customer.totalSpent / totalOrders : 0;

    return (
        <div className="flex-1 overflow-y-auto p-6 md:p-8 h-full bg-background-light dark:bg-background-dark custom-scrollbar">
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

                        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
                            <div className="space-y-4">
                                {selectedOrder.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-50 dark:border-slate-800 pb-3 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <div className="size-12 rounded bg-slate-100 bg-cover bg-center" style={{ backgroundImage: `url('${item.product.image}')` }}></div>
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-white">{item.product.name}</p>
                                                <p className="text-xs text-slate-500">{item.quantity}x • R$ {Number(item.product.price || 0).toFixed(2)}</p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-slate-900 dark:text-white">R$ {(item.product.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-slate-100 dark:border-slate-700 pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Pagamento</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{selectedOrder.paymentMethod}</span>
                                </div>
                                <div className="flex justify-between text-xl font-black pt-2">
                                    <span className="text-slate-900 dark:text-white">Total</span>
                                    <span className="text-primary">R$ {selectedOrder.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50">
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="w-full py-3 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Perfil */}
                    <div className="w-full md:w-80 space-y-6 shrink-0">
                        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center relative overflow-hidden">
                            <div className="size-32 rounded-full mx-auto mb-4 border-4 border-slate-50 dark:border-slate-800 shadow-lg bg-cover bg-center" style={{ backgroundImage: `url('${customer.image}')` }}></div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white">{customer.name}</h2>
                            <p className="text-sm text-slate-500 font-medium">Desde {customer.memberSince}</p>

                            <div className="grid grid-cols-1 gap-4 mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3 text-left">
                                    <span className="material-symbols-outlined text-slate-400">mail</span>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">E-mail</p>
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{customer.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-left">
                                    <span className="material-symbols-outlined text-slate-400">call</span>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Telefone</p>
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{customer.phone}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                            <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-4">Resumo Comercial</h4>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Total Investido</p>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white">R$ {customer.totalSpent.toFixed(2)}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">Pedidos</p>
                                        <p className="text-lg font-bold text-slate-900 dark:text-white">{totalOrders}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">Ticket Médio</p>
                                        <p className="text-lg font-bold text-slate-900 dark:text-white">R$ {averageOrderValue.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Histórico */}
                    <div className="flex-1 space-y-6 w-full">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Histórico de Pedidos</h3>
                            <button onClick={() => navigate('/orders')} className="text-xs font-bold text-primary hover:underline uppercase tracking-wider">Ver Todos</button>
                        </div>

                        <div className="space-y-4">
                            {customerOrders.length > 0 ? [...customerOrders].reverse().map(order => (
                                <div
                                    key={order.id}
                                    onClick={() => setSelectedOrder(order)}
                                    className="bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:border-primary transition-all cursor-pointer group flex flex-col sm:flex-row justify-between items-center gap-4"
                                >
                                    <div className="flex items-center gap-4 w-full sm:w-auto">
                                        <div className="size-12 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                            <span className="material-symbols-outlined">receipt_long</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{order.id}</p>
                                            <p className="text-xs text-slate-500">{order.date} • {order.items.length} item(ns)</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between w-full sm:w-auto sm:gap-8">
                                        <div className="text-right">
                                            <p className="font-black text-slate-900 dark:text-white">R$ {order.total.toFixed(2)}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">{order.paymentMethod}</p>
                                        </div>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' :
                                            order.status === 'Processing' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                                            }`}>
                                            {order.status === 'Delivered' ? 'Entregue' : order.status === 'Processing' ? 'Pendente' : 'Cancelado'}
                                        </span>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 italic">
                                    Nenhum pedido registrado para este cliente.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDetails;