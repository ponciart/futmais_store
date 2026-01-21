import React, { useMemo, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { FinancialTransaction } from '../../types';

const parseDate = (dateStr: string): Date | null => {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day);
    }
    return null;
};

const Financial = () => {
    const { transactions, addTransaction, orders, customers } = useStore();
    const [filter, setFilter] = useState<'Tudo' | 'Entradas' | 'Saídas'>('Tudo');
    const [periodType, setPeriodType] = useState<'today' | 'yesterday' | '7days' | 'total' | 'custom'>('total');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [showPeriodPicker, setShowPeriodPicker] = useState(false);
    const [showCustomDateModal, setShowCustomDateModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<FinancialTransaction | null>(null);

    // Filtered Transactions
    const filteredTransactions = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        return transactions.filter(t => {
            // Filter by Type
            const matchesType = (filter === 'Tudo') ||
                (filter === 'Entradas' && t.type === 'Income') ||
                (filter === 'Saídas' && t.type === 'Expense');

            if (!matchesType) return false;

            // Filter by Date
            const tDate = parseDate(t.date);
            if (!tDate) return true; // Fallback
            tDate.setHours(0, 0, 0, 0);

            switch (periodType) {
                case 'today': return tDate.getTime() === today.getTime();
                case 'yesterday': return tDate.getTime() === yesterday.getTime();
                case '7days': return tDate >= sevenDaysAgo && tDate <= today;
                case 'custom': {
                    if (!customStartDate || !customEndDate) return true;
                    const start = new Date(customStartDate);
                    const end = new Date(customEndDate);
                    start.setHours(0, 0, 0, 0);
                    end.setHours(23, 59, 59, 999);
                    return tDate >= start && tDate <= end;
                }
                default: return true;
            }
        });
    }, [transactions, filter, periodType, customStartDate, customEndDate]);

    // Format Currency
    const formatBRL = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    const exportFinanceToCSV = () => {
        const headers = ['ID', 'Data', 'Descrição', 'Categoria', 'Tipo', 'Valor', 'Status'];
        const rows = transactions.map(t => [
            t.id, t.date, t.description, t.category, t.type, t.amount, t.status
        ]);
        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `financeiro_futmais_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Calculate Stats based on Filtered Transactions
    const filteredStats = useMemo(() => {
        let totalIncome = 0;
        let totalExpenses = 0;
        let operationalCosts = 0; // Custos Operacionais (inclui COGS)
        let investmentVal = 0; // Valor investido (produtos comprados/estoque) - Approximated by Operacional (COGS) type expenses

        filteredTransactions.forEach(t => {
            if (t.type === 'Income') {
                totalIncome += t.amount;
            } else {
                totalExpenses += t.amount;
                if (t.category === 'Operacional') {
                    operationalCosts += t.amount;
                    investmentVal += t.amount;
                }
            }
        });

        // Profit logic: Revenue - All Expenses
        const netProfit = totalIncome - totalExpenses;

        return { totalIncome, totalExpenses, netProfit, operationalCosts, investmentVal };
    }, [filteredTransactions]);

    // Calculate Weekly Data for Chart
    const weeklyData = useMemo(() => {
        const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const data = new Array(7).fill(0).map((_, i) => ({ day: days[i], income: 0, expense: 0 }));

        filteredTransactions.forEach(t => {
            const date = parseDate(t.date);
            if (date) {
                const dayIdx = date.getDay();
                if (t.type === 'Income') data[dayIdx].income += t.amount;
                else data[dayIdx].expense += t.amount;
            }
        });
        return data;
    }, [filteredTransactions]);


    // Find max value for Chart Scaling
    const maxChartValue = useMemo(() => {
        return Math.max(...weeklyData.map(d => Math.max(d.income, d.expense))) || 1;
    }, [weeklyData]);

    return (
        <div className="flex-1 overflow-y-auto p-6 md:p-8 h-full bg-background-light dark:bg-background-dark custom-scrollbar">
            {/* Modal de Detalhes da Transação */}
            {selectedTransaction && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    {/* ... (Existing Modal Content) ... */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Detalhes da Transação</h3>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{selectedTransaction.id}</p>
                            </div>
                            <button onClick={() => setSelectedTransaction(null)} className="size-10 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
                            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                                <div className={`size-12 rounded-full flex items-center justify-center font-bold ${selectedTransaction.type === 'Income' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                    {selectedTransaction.type === 'Income' ? '+' : '-'}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white">{selectedTransaction.description}</h4>
                                    <p className="text-xs text-slate-500">{selectedTransaction.date} • {selectedTransaction.category}</p>
                                </div>
                                <div className="ml-auto text-right">
                                    <p className={`font-black ${selectedTransaction.type === 'Income' ? 'text-emerald-600' : 'text-red-500'}`}>
                                        {formatBRL(selectedTransaction.amount)}
                                    </p>
                                    <p className="text-[10px] font-bold uppercase text-slate-400">{selectedTransaction.status}</p>
                                </div>
                            </div>

                            {/* Se for venda, mostrar vinculo do pedido */}
                            {selectedTransaction.category === 'Vendas' && (
                                <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-700">
                                    <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">Informações da Venda</h5>
                                    {orders.filter(o => selectedTransaction.description.includes(o.id)).map(order => (
                                        <div key={order.id} className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                    <span className="material-symbols-outlined text-sm">person</span>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{order.customerName}</p>
                                                    <p className="text-[10px] text-slate-500">Cliente Principal</p>
                                                </div>
                                            </div>
                                            <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg space-y-2">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between text-xs">
                                                        <span>{item.quantity}x {item.product.name}</span>
                                                        <span className="font-bold">{formatBRL(item.product.price * item.quantity)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 flex gap-3">
                            <button
                                onClick={() => setSelectedTransaction(null)}
                                className="flex-1 py-3 font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
                            >
                                Fechar
                            </button>
                            <button className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-sm">download</span> Recibo
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Período Personalizado */}
            {showCustomDateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-2xl max-w-md w-full">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Filtrar Período Personalizado</h3>
                        <div className="space-y-4">
                            <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none" />
                            <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none" />
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowCustomDateModal(false)} className="flex-1 p-3 font-bold text-slate-500">Cancelar</button>
                            <button onClick={() => { setPeriodType('custom'); setShowCustomDateModal(false); setShowPeriodPicker(false); }} className="flex-1 p-3 bg-primary text-slate-900 font-bold rounded-lg">Aplicar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">Painel Financeiro</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Visão consolidada de caixa e resultados.</p>
                </div>
                <div className="flex items-center gap-4 relative">
                    <button
                        onClick={() => setShowPeriodPicker(!showPeriodPicker)}
                        className="flex items-center bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 shadow-sm gap-2 text-slate-600 dark:text-slate-300 hover:border-primary transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                        <span className="text-sm font-medium">{
                            periodType === 'today' ? 'Hoje' :
                                periodType === 'yesterday' ? 'Ontem' :
                                    periodType === '7days' ? 'Últimos 7 dias' :
                                        periodType === 'custom' ? 'Personalizado' : 'Período Total'
                        }</span>
                        <span className="material-symbols-outlined text-[20px]">expand_more</span>
                    </button>

                    {showPeriodPicker && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 py-2 overflow-hidden">
                            {[
                                { id: 'today', label: 'Hoje', icon: 'event' },
                                { id: 'yesterday', label: 'Ontem', icon: 'history' },
                                { id: '7days', label: 'Últimos 7 dias', icon: 'date_range' },
                                { id: 'total', label: 'Período Total', icon: 'all_inclusive' },
                                { id: 'custom', label: 'Personalizado', icon: 'edit_calendar' }
                            ].map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => p.id === 'custom' ? setShowCustomDateModal(true) : (setPeriodType(p.id as any), setShowPeriodPicker(false))}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${periodType === p.id ? 'bg-primary/10 text-primary font-bold' : 'text-slate-600 dark:text-slate-300'}`}
                                >
                                    <span className="material-symbols-outlined text-lg">{p.icon}</span>
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* KPI Stats - Comparativo Investimento x Lucro */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">inventory_2</span>
                        </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Investimento (Custo)</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatBRL(filteredStats.investmentVal)}</h3>
                </div>

                <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <span className="material-symbols-outlined text-primary">payments</span>
                        </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Vendas Brutas</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatBRL(filteredStats.totalIncome)}</h3>
                </div>

                <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <span className="material-symbols-outlined text-red-500">trending_down</span>
                        </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Despesas Totais</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatBRL(filteredStats.totalExpenses)}</h3>
                </div>

                <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                        <span className="material-symbols-outlined text-8xl">savings</span>
                    </div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                            <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">savings</span>
                        </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Lucro Líquido</p>
                    <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{formatBRL(filteredStats.netProfit)}</h3>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Fluxo da Semana</h3>
                    <div className="h-64 flex items-end justify-between gap-4 px-2">
                        {weeklyData.map((d, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-2 w-full group relative">
                                <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10">
                                    Ent: {formatBRL(d.income)} <br /> Sai: {formatBRL(d.expense)}
                                </div>
                                <div className="relative w-full h-full flex items-end justify-center gap-1">
                                    <div
                                        className="w-4 bg-emerald-500 rounded-t-sm transition-all duration-500"
                                        style={{ height: `${(d.income / maxChartValue) * 85}%`, minHeight: d.income > 0 ? '4px' : '0' }}
                                    ></div>
                                    <div
                                        className="w-4 bg-red-400 rounded-t-sm transition-all duration-500"
                                        style={{ height: `${(d.expense / maxChartValue) * 85}%`, minHeight: d.expense > 0 ? '4px' : '0' }}
                                    ></div>
                                </div>
                                <span className="text-xs text-slate-500">{d.day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-[#102218] to-[#1a2c24] text-white p-6 rounded-2xl shadow-lg border border-[#2a4034] flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-4 text-primary">
                            <span className="material-symbols-outlined animate-pulse">auto_awesome</span>
                            <h3 className="text-sm font-bold uppercase tracking-wider">FutMantos AI</h3>
                        </div>
                        <h4 className="text-xl font-bold mb-3 leading-snug">Resumo de Performance</h4>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Neste período, você investiu <strong className="text-white">{formatBRL(filteredStats.investmentVal)}</strong> em mercadoria e faturou <strong className="text-primary">{formatBRL(filteredStats.totalIncome)}</strong>.
                            {filteredStats.netProfit > 0 ? (
                                <span className="block mt-2 text-emerald-400">Excelente! Você está no lucro.</span>
                            ) : (
                                <span className="block mt-2 text-red-400">Atenção! Suas despesas superaram as receitas.</span>
                            )}
                        </p>
                    </div>
                    <button className="w-full py-3 mt-6 bg-primary text-background-dark font-bold rounded-lg hover:bg-white transition-colors">
                        Gerar Relatório Completo
                    </button>
                </div>
            </div>

            {/* Cash Flow Table */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Fluxo de Caixa Detalhado</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Histórico de entradas e saídas</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                            {(['Tudo', 'Entradas', 'Saídas'] as const).map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${filter === f ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={exportFinanceToCSV}
                            className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary-dark dark:text-primary text-xs font-bold rounded-lg hover:bg-primary/20"
                        >
                            <span className="material-symbols-outlined text-[16px]">download</span>
                            Exportar
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Data</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Descrição</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Categoria</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Valor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredTransactions.map(t => (
                                <tr
                                    key={t.id}
                                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                                    onClick={() => setSelectedTransaction(t)}
                                >
                                    <td className="p-4 text-sm text-slate-500 dark:text-slate-400">{t.date}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            {t.image ? (
                                                <div className="size-8 rounded bg-cover bg-center" style={{ backgroundImage: `url('${t.image}')` }}></div>
                                            ) : (
                                                <div className={`size-8 rounded flex items-center justify-center font-bold text-[10px] ${t.type === 'Income' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                                    {t.category.charAt(0)}
                                                </div>
                                            )}
                                            <span className="text-sm font-medium text-slate-900 dark:text-white">{t.description}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                            {t.category}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase
                                            ${t.type === 'Income' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className={`p-4 text-right text-sm font-bold ${t.type === 'Income' ? 'text-emerald-600' : 'text-red-500'}`}>
                                        {t.type === 'Income' ? '+' : '-'} {formatBRL(t.amount)}
                                    </td>
                                </tr>
                            ))}
                            {filteredTransactions.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-slate-400 italic">Nenhuma transação encontrada</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Financial;