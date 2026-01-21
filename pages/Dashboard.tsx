import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { Order, FinancialTransaction } from '../../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Tipos de período disponíveis
type PeriodType = 'today' | 'yesterday' | '7days' | 'month' | 'total' | 'custom';

// Dados mensais de exemplo para o gráfico
const monthlyData: Record<string, { name: string; value: number }[]> = {
  '2024-01': [{ name: 'Sem 1', value: 1200 }, { name: 'Sem 2', value: 1800 }, { name: 'Sem 3', value: 1500 }, { name: 'Sem 4', value: 2000 }],
  '2024-02': [{ name: 'Sem 1', value: 1000 }, { name: 'Sem 2', value: 1400 }, { name: 'Sem 3', value: 1600 }, { name: 'Sem 4', value: 1800 }],
  '2024-03': [{ name: 'Sem 1', value: 2000 }, { name: 'Sem 2', value: 2500 }, { name: 'Sem 3', value: 2200 }, { name: 'Sem 4', value: 3000 }],
  '2024-04': [{ name: 'Sem 1', value: 800 }, { name: 'Sem 2', value: 1200 }, { name: 'Sem 3', value: 1100 }, { name: 'Sem 4', value: 1400 }],
  '2024-05': [{ name: 'Sem 1', value: 600 }, { name: 'Sem 2', value: 900 }, { name: 'Sem 3', value: 750 }, { name: 'Sem 4', value: 1000 }],
  '2024-06': [{ name: 'Sem 1', value: 900 }, { name: 'Sem 2', value: 1100 }, { name: 'Sem 3', value: 1300 }, { name: 'Sem 4', value: 1500 }],
  '2024-07': [{ name: 'Sem 1', value: 1400 }, { name: 'Sem 2', value: 1700 }, { name: 'Sem 3', value: 2000 }, { name: 'Sem 4', value: 2300 }],
  '2024-08': [{ name: 'Sem 1', value: 1600 }, { name: 'Sem 2', value: 2100 }, { name: 'Sem 3', value: 1890 }, { name: 'Sem 4', value: 2400 }],
};

const months = [
  { value: '2024-01', label: 'Jan 2024' },
  { value: '2024-02', label: 'Fev 2024' },
  { value: '2024-03', label: 'Mar 2024' },
  { value: '2024-04', label: 'Abr 2024' },
  { value: '2024-05', label: 'Mai 2024' },
  { value: '2024-06', label: 'Jun 2024' },
  { value: '2024-07', label: 'Jul 2024' },
  { value: '2024-08', label: 'Ago 2024' },
];

// Função para converter data dd/mm/yyyy para Date
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

const Dashboard = () => {
  const { orders, products } = useStore();
  const navigate = useNavigate();

  // Estados do filtro de período
  const [periodType, setPeriodType] = useState<PeriodType>('total');
  const [selectedMonth, setSelectedMonth] = useState('2024-08');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showPeriodPicker, setShowPeriodPicker] = useState(false);
  const [showCustomDateModal, setShowCustomDateModal] = useState(false);

  // Filtra os pedidos baseado no período selecionado
  const filteredOrders = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return orders.filter(order => {
      const orderDate = parseDate(order.date);
      if (!orderDate) return false;
      orderDate.setHours(0, 0, 0, 0);

      switch (periodType) {
        case 'today':
          return orderDate.getTime() === today.getTime();
        case 'yesterday':
          return orderDate.getTime() === yesterday.getTime();
        case '7days':
          return orderDate >= sevenDaysAgo && orderDate <= today;
        case 'month': {
          const [year, month] = selectedMonth.split('-');
          return orderDate.getFullYear() === parseInt(year) &&
            orderDate.getMonth() === parseInt(month) - 1;
        }
        case 'custom': {
          if (!customStartDate || !customEndDate) return true;
          const start = new Date(customStartDate);
          const end = new Date(customEndDate);
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          return orderDate >= start && orderDate <= end;
        }
        case 'total':
        default:
          return true;
      }
    });
  }, [orders, periodType, selectedMonth, customStartDate, customEndDate]);

  // Cálculos baseados nos pedidos filtrados
  const totalRevenue = filteredOrders.reduce((acc, order) => acc + order.total, 0);
  const totalOrders = filteredOrders.length;
  const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Calcula margem de lucro baseado nos custos
  const profitMargin = useMemo(() => {
    const totalCost = filteredOrders.reduce((acc, order) => {
      return acc + order.items.reduce((itemAcc, item) => {
        const product = products.find(p => p.id === item.product.id);
        return itemAcc + (product?.cost || 0) * item.quantity;
      }, 0);
    }, 0);
    if (totalRevenue === 0) return 0;
    return ((totalRevenue - totalCost) / totalRevenue) * 100;
  }, [filteredOrders, products, totalRevenue]);

  const topProducts = useMemo(() => {
    return [...products]
      .filter(p => p.type === 'Jersey')
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 4);
  }, [products]);

  // Label do período selecionado
  const getPeriodLabel = () => {
    if (periodType === 'today') return 'Hoje';
    if (periodType === 'yesterday') return 'Ontem';
    if (periodType === '7days') return 'Últimos 7 dias';
    if (periodType === 'total') return 'Período Total';
    if (periodType === 'month') return months.find(m => m.value === selectedMonth)?.label || selectedMonth;
    if (periodType === 'custom' && customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      return `${start.toLocaleDateString('pt-BR')} - ${end.toLocaleDateString('pt-BR')}`;
    }
    return 'Selecionar Período';
  };

  // Dados do gráfico baseados no período
  const chartData = useMemo(() => {
    if (periodType === 'month') {
      return monthlyData[selectedMonth] || [];
    }

    // Para período total ou personalizado, agrupa por mês
    if (periodType === 'total' || periodType === 'custom') {
      const monthlyTotals: Record<string, number> = {};

      filteredOrders.forEach(order => {
        const orderDate = parseDate(order.date);
        if (orderDate) {
          const monthKey = `${orderDate.getMonth() + 1}/${orderDate.getFullYear()}`;
          monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + order.total;
        }
      });

      // Se não houver dados, usa dados de exemplo
      if (Object.keys(monthlyTotals).length === 0) {
        return [
          { name: 'Jan', value: 4000 },
          { name: 'Fev', value: 3000 },
          { name: 'Mar', value: 5000 },
          { name: 'Abr', value: 2780 },
          { name: 'Mai', value: 1890 },
          { name: 'Jun', value: 2390 },
          { name: 'Jul', value: 3490 },
          { name: 'Ago', value: 4200 },
        ];
      }

      return Object.entries(monthlyTotals).map(([month, value]) => ({
        name: month,
        value
      }));
    }

    return [];
  }, [periodType, selectedMonth, filteredOrders]);

  const handleApplyCustomPeriod = () => {
    if (customStartDate && customEndDate) {
      setPeriodType('custom');
      setShowCustomDateModal(false);
      setShowPeriodPicker(false);
    }
  };

  const handleViewAllTransactions = () => {
    navigate('/financial');
  };

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth h-full">
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
              {/* Cliente Info */}
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

              {/* Itens */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Itens do Pedido</h4>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3">
                      <span className="size-6 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-[10px] text-slate-500">{item.quantity}x</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{item.product.name}</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">R$ {(item.product.price * item.quantity).toFixed(2)}</span>
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
                  <span className="text-primary">R$ {selectedOrder.total.toFixed(2)}</span>
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

      <div className="max-w-7xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Visão Geral Financeira</h2>
          <div className="relative">
            <button
              onClick={() => setShowPeriodPicker(!showPeriodPicker)}
              className="h-10 px-4 bg-white border border-slate-300 dark:border-slate-700 dark:bg-slate-800 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">calendar_today</span>
              <span className="max-w-[200px] truncate">{getPeriodLabel()}</span>
              <span className="material-symbols-outlined text-lg">expand_more</span>
            </button>

            {showPeriodPicker && (
              <div className="absolute right-0 top-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 min-w-[200px] py-2">
                {/* Período Personalizado */}
                <button
                  onClick={() => {
                    setPeriodType('today');
                    setShowPeriodPicker(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 ${periodType === 'today' ? 'bg-primary/10 text-primary font-bold' : 'text-slate-700 dark:text-slate-300'}`}
                >
                  <span className="material-symbols-outlined text-lg">event</span>
                  Hoje
                </button>
                <button
                  onClick={() => {
                    setPeriodType('yesterday');
                    setShowPeriodPicker(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 ${periodType === 'yesterday' ? 'bg-primary/10 text-primary font-bold' : 'text-slate-700 dark:text-slate-300'}`}
                >
                  <span className="material-symbols-outlined text-lg">history</span>
                  Ontem
                </button>
                <button
                  onClick={() => {
                    setPeriodType('7days');
                    setShowPeriodPicker(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 ${periodType === '7days' ? 'bg-primary/10 text-primary font-bold' : 'text-slate-700 dark:text-slate-300'}`}
                >
                  <span className="material-symbols-outlined text-lg">date_range</span>
                  Últimos 7 dias
                </button>
                <button
                  onClick={() => {
                    setPeriodType('total');
                    setShowPeriodPicker(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 ${periodType === 'total' ? 'bg-primary/10 text-primary font-bold' : 'text-slate-700 dark:text-slate-300'}`}
                >
                  <span className="material-symbols-outlined text-lg">all_inclusive</span>
                  Período Total
                </button>
                <button
                  onClick={() => {
                    setShowCustomDateModal(true);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 ${periodType === 'custom' ? 'bg-primary/10 text-primary font-bold' : 'text-slate-700 dark:text-slate-300'
                    }`}
                >
                  <span className="material-symbols-outlined text-lg">edit_calendar</span>
                  Período Personalizado
                </button>

                {/* Divisor */}
                <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>

                {/* Meses */}
                <div className="max-h-[200px] overflow-y-auto">
                  {months.map((month) => (
                    <button
                      key={month.value}
                      onClick={() => {
                        setPeriodType('month');
                        setSelectedMonth(month.value);
                        setShowPeriodPicker(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${periodType === 'month' && selectedMonth === month.value
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'text-slate-700 dark:text-slate-300'
                        }`}
                    >
                      {month.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal de Período Personalizado */}
        {showCustomDateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-2xl max-w-md w-full mx-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">date_range</span>
                Período Personalizado
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Data Inicial
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Data Final
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCustomDateModal(false);
                  }}
                  className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleApplyCustomPeriod}
                  disabled={!customStartDate || !customEndDate}
                  className="flex-1 px-4 py-2.5 bg-primary text-slate-900 rounded-lg font-bold hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Receita Total"
            value={`R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            trend="+12%"
            icon="attach_money"
            onClick={() => navigate('/financial')}
          />
          <StatCard
            title="Vendas Totais"
            value={totalOrders.toString()}
            trend="+5%"
            icon="shopping_cart"
            onClick={() => navigate('/pos')}
          />
          <StatCard
            title="Ticket Médio"
            value={`R$ ${averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            trend="-2%"
            isNegative
            icon="receipt_long"
          />
          <StatCard
            title="Margem de Lucro"
            value={`${profitMargin.toFixed(0)}%`}
            trend="+1%"
            icon="percent"
          />
        </div>

        {/* Chart & Top Selling */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Desempenho de Vendas</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {periodType === 'total' ? 'Receita acumulada de todos os períodos' :
                    periodType === 'custom' ? 'Receita no período personalizado' :
                      `Receita semanal em ${getPeriodLabel()}`}
                </p>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#13ec6d" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#13ec6d" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Receita']}
                  />
                  <Area type="monotone" dataKey="value" stroke="#13ec6d" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Camisas Mais Populares</h3>
              <button
                onClick={() => navigate('/inventory')}
                className="text-xs text-primary font-medium hover:underline"
              >
                Ver Estoque
              </button>
            </div>
            <div className="flex flex-col gap-5 flex-1 overflow-y-auto pr-2">
              {topProducts.map(product => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-2 -mx-2 rounded-lg transition-colors"
                  onClick={() => navigate('/inventory')}
                >
                  <div className="size-12 rounded-lg bg-gray-100 bg-center bg-cover border border-slate-200" style={{ backgroundImage: `url('${product.image}')` }}></div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800 dark:text-white">{product.name}</p>
                    <p className="text-xs text-slate-500">{product.stock} unidades em estoque</p>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">R$ {Number(product.price || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Transações Recentes
              {periodType !== 'total' && (
                <span className="text-sm font-normal text-slate-500 ml-2">
                  ({filteredOrders.length} no período)
                </span>
              )}
            </h3>
            <button
              onClick={handleViewAllTransactions}
              className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
            >
              Ver Tudo
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4">ID do Pedido</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Valor</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                      {periodType === 'total'
                        ? 'Nenhuma transação registrada ainda. Faça sua primeira venda no PDV!'
                        : 'Nenhuma transação encontrada neste período.'}
                    </td>
                  </tr>
                ) : (
                  filteredOrders.slice(0, 5).map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer group transition-colors"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{order.id}</td>
                      <td className="px-6 py-4">{order.customerName}</td>
                      <td className="px-6 py-4">{order.date}</td>
                      <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">R$ {order.total.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold 
                                        ${order.status === 'Delivered' ? 'bg-primary/20 text-green-800' :
                            order.status === 'Processing' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                          {order.status === 'Delivered' ? 'Entregue' : order.status === 'Processing' ? 'Em Processamento' : 'Cancelado'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  trend: string;
  isNegative?: boolean;
  icon: string;
  onClick?: () => void;
}

const StatCard = ({ title, value, trend, isNegative = false, icon, onClick }: StatCardProps) => (
  <div
    onClick={onClick}
    className={`bg-white dark:bg-surface-dark rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between h-36 relative overflow-hidden group ${onClick ? 'cursor-pointer hover:border-primary/50 hover:shadow-md transition-all' : ''}`}
  >
    <div className="absolute right-0 top-0 h-full w-24 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
      <span className="material-symbols-outlined text-[100px] text-primary">{icon}</span>
    </div>
    <div className="flex justify-between items-start z-10">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
      </div>
      <div className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1 
        ${isNegative ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
        <span className="material-symbols-outlined text-sm">{isNegative ? 'trending_down' : 'trending_up'}</span>
        <span>{trend}</span>
      </div>
    </div>
    <div className="mt-4 h-8 w-full z-10 opacity-60">
      <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 25">
        <path d="M0 20 L10 15 L20 18 L30 10 L40 12 L50 5 L60 8 L70 15 L80 10 L90 5 L100 0"
          fill="none"
          stroke={isNegative ? "#ef4444" : "#13ec6d"}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  </div>
);

export default Dashboard;