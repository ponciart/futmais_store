import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Shipment } from '../../types';

type StatusFilter = 'Todos' | 'Preparação' | 'Despachado' | 'Em Trânsito' | 'Entregue';
type ShipmentStatus = 'Preparação' | 'Despachado' | 'Em Trânsito' | 'Entregue';

const statusSteps: ShipmentStatus[] = ['Preparação', 'Despachado', 'Em Trânsito', 'Entregue'];

const Logistics = () => {
    const { shipments, orders, addShipment, updateShipment, deleteShipment } = useStore();
    const [searchFilter, setSearchFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('Todos');

    // Modal states
    const [showNewShipmentModal, setShowNewShipmentModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);

    // Form states for new shipment
    const [newOrderId, setNewOrderId] = useState('');
    const [newCustomerName, setNewCustomerName] = useState('');
    const [newCustomerPhone, setNewCustomerPhone] = useState('');
    const [newProductDescription, setNewProductDescription] = useState('');
    const [newCarrier, setNewCarrier] = useState('');
    const [newTrackingCode, setNewTrackingCode] = useState('');
    const [newEstimatedDelivery, setNewEstimatedDelivery] = useState('');
    const [newLastStatus, setNewLastStatus] = useState('');

    // Filter shipments
    const filtered = useMemo(() => {
        return shipments.filter(s => {
            const matchesSearch =
                s.orderId.toLowerCase().includes(searchFilter.toLowerCase()) ||
                s.customerName.toLowerCase().includes(searchFilter.toLowerCase()) ||
                s.trackingCode.toLowerCase().includes(searchFilter.toLowerCase());
            const matchesStatus = statusFilter === 'Todos' || s.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [shipments, searchFilter, statusFilter]);

    // Stats
    const stats = useMemo(() => ({
        total: shipments.length,
        preparacao: shipments.filter(s => s.status === 'Preparação').length,
        despachado: shipments.filter(s => s.status === 'Despachado').length,
        emTransito: shipments.filter(s => s.status === 'Em Trânsito').length,
        entregue: shipments.filter(s => s.status === 'Entregue').length,
    }), [shipments]);

    // Get status step index
    const getStatusIndex = (status: ShipmentStatus) => statusSteps.indexOf(status);

    // Create new shipment
    const handleCreateShipment = () => {
        if (!newOrderId || !newCustomerName || !newCarrier) {
            alert('Preencha os campos obrigatórios');
            return;
        }

        const newShipment: Shipment = {
            id: `SHIP-${Date.now()}`,
            orderId: newOrderId,
            customerName: newCustomerName,
            customerPhone: newCustomerPhone,
            productDescription: newProductDescription,
            purchaseDate: new Date().toLocaleDateString('pt-BR'),
            carrier: newCarrier,
            trackingCode: newTrackingCode || `${newCarrier.substring(0, 2).toUpperCase()}${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            estimatedDelivery: newEstimatedDelivery,
            lastStatus: newLastStatus,
            status: 'Preparação',
            createdAt: new Date().toISOString(),
        };

        addShipment(newShipment);
        resetForm();
        setShowNewShipmentModal(false);
    };

    // Update shipment status
    const handleUpdateStatus = (shipment: Shipment, newStatus: ShipmentStatus) => {
        updateShipment({ ...shipment, status: newStatus });
    };

    // Open edit modal
    const handleEditClick = (shipment: Shipment) => {
        setEditingShipment(shipment);
        setShowEditModal(true);
    };

    // Save edited shipment
    const handleSaveEdit = () => {
        if (editingShipment) {
            updateShipment(editingShipment);
            setShowEditModal(false);
            setEditingShipment(null);
        }
    };

    // Delete shipment
    const handleDelete = (id: string) => {
        if (confirm('Tem certeza que deseja excluir este envio?')) {
            deleteShipment(id);
        }
    };

    // Reset form
    const resetForm = () => {
        setNewOrderId('');
        setNewCustomerName('');
        setNewCustomerPhone('');
        setNewProductDescription('');
        setNewCarrier('');
        setNewTrackingCode('');
        setNewEstimatedDelivery('');
        setNewLastStatus('');
    };

    // Export to CSV
    const handleExport = () => {
        const headers = ['ID', 'Pedido', 'Cliente', 'Telefone', 'Produto', 'Transportadora', 'Rastreio', 'Status', 'Previsão'];
        const rows = shipments.map(s => [
            s.id, s.orderId, s.customerName, s.customerPhone, s.productDescription, s.carrier, s.trackingCode, s.status, s.estimatedDelivery
        ]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `logistica_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Open WhatsApp
    const openWhatsApp = (phone: string, name: string) => {
        const message = encodeURIComponent(`Olá ${name}! Aqui é da Futmais Store. Temos novidades sobre seu pedido!`);
        window.open(`https://wa.me/55${phone.replace(/\D/g, '')}?text=${message}`, '_blank');
    };

    return (
        <div className="flex-1 overflow-y-auto p-6 md:p-8 h-full bg-background-light dark:bg-background-dark">
            <div className="max-w-7xl mx-auto flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Rastreio e Logística</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-base">Gerencie o envio, etiquetas e entrega das camisas de times.</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">file_download</span>
                            Exportar Relatório
                        </button>
                        <button
                            onClick={() => setShowNewShipmentModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-slate-900 rounded-lg text-sm font-bold shadow-lg shadow-primary/30 hover:bg-primary-hover transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">add_box</span>
                            Novo Envio
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-white dark:bg-surface-dark rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-slate-500">Total de Envios</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                    </div>
                    <div className="bg-white dark:bg-surface-dark rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-slate-500">Em Preparação</p>
                        <p className="text-2xl font-bold text-blue-600">{stats.preparacao}</p>
                    </div>
                    <div className="bg-white dark:bg-surface-dark rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-slate-500">Despachado</p>
                        <p className="text-2xl font-bold text-purple-600">{stats.despachado}</p>
                    </div>
                    <div className="bg-white dark:bg-surface-dark rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-slate-500">Em Trânsito</p>
                        <p className="text-2xl font-bold text-amber-600">{stats.emTransito}</p>
                    </div>
                    <div className="bg-white dark:bg-surface-dark rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-slate-500">Entregue</p>
                        <p className="text-2xl font-bold text-green-600">{stats.entregue}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                        <div className="w-full lg:w-1/3">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-slate-400">search</span>
                                </div>
                                <input
                                    className="block w-full pl-10 pr-3 py-2.5 border-none rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all sm:text-sm"
                                    placeholder="Buscar por Número do Pedido ou Cliente"
                                    type="text"
                                    value={searchFilter}
                                    onChange={(e) => setSearchFilter(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0">
                            {(['Todos', 'Preparação', 'Despachado', 'Em Trânsito', 'Entregue'] as StatusFilter[]).map(status => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === status
                                        ? 'bg-primary text-slate-900 font-bold'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Results count */}
                <div className="text-sm text-slate-500">
                    Exibindo {filtered.length} de {shipments.length} envios
                </div>

                {/* Shipments List */}
                <div className="flex flex-col gap-4">
                    {filtered.length === 0 ? (
                        <div className="bg-white dark:bg-surface-dark rounded-xl p-12 border border-slate-200 dark:border-slate-700 text-center">
                            <span className="material-symbols-outlined text-6xl text-slate-300 mb-4 block">local_shipping</span>
                            <p className="text-slate-500 text-lg">Nenhum envio encontrado</p>
                            <p className="text-slate-400 text-sm mt-2">Clique em "Novo Envio" para cadastrar um</p>
                        </div>
                    ) : (
                        filtered.map(shipment => (
                            <div key={shipment.id} className={`bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden ${shipment.status === 'Entregue' ? 'opacity-80' : ''}`}>
                                {/* Card Header */}
                                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex flex-wrap justify-between items-center gap-4 bg-slate-50/50 dark:bg-slate-800/50">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide ${shipment.status === 'Entregue' ? 'bg-green-100 dark:bg-green-900/30 text-green-700' :
                                            shipment.status === 'Em Trânsito' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700' :
                                                shipment.status === 'Despachado' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700' :
                                                    'bg-blue-100 dark:bg-blue-900/30 text-blue-700'
                                            }`}>
                                            Pedido {shipment.orderId}
                                        </span>
                                        <div className="flex flex-col">
                                            <span className="text-slate-900 dark:text-white font-bold text-base">{shipment.customerName}</span>
                                            <span className="text-slate-500 text-xs">{shipment.productDescription} • {shipment.purchaseDate}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`h-2 w-2 rounded-full ${shipment.status === 'Entregue' ? 'bg-green-500' :
                                            shipment.status === 'Em Trânsito' ? 'bg-amber-500 animate-pulse' :
                                                shipment.status === 'Despachado' ? 'bg-purple-500' :
                                                    'bg-blue-500'
                                            }`}></span>
                                        <span className={`text-sm font-semibold ${shipment.status === 'Entregue' ? 'text-green-600 dark:text-green-400' :
                                            shipment.status === 'Em Trânsito' ? 'text-amber-600 dark:text-amber-400' :
                                                shipment.status === 'Despachado' ? 'text-purple-600 dark:text-purple-400' :
                                                    'text-blue-600 dark:text-blue-400'
                                            }`}>{shipment.status}</span>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-6">
                                    {/* Stepper */}
                                    <div className="mb-8">
                                        <div className="relative flex items-center justify-between w-full">
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 dark:bg-slate-700 -z-10 rounded-full"></div>
                                            <div
                                                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 rounded-full transition-all duration-500"
                                                style={{ width: `${(getStatusIndex(shipment.status) / (statusSteps.length - 1)) * 100}%` }}
                                            ></div>
                                            {statusSteps.map((step, idx) => {
                                                const currentIdx = getStatusIndex(shipment.status);
                                                const active = idx <= currentIdx;
                                                const current = idx === currentIdx;
                                                return (
                                                    <div
                                                        key={step}
                                                        className="flex flex-col items-center gap-2 group cursor-pointer"
                                                        onClick={() => handleUpdateStatus(shipment, step)}
                                                        title={`Alterar para: ${step}`}
                                                    >
                                                        <div className={`size-8 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-surface-dark transition-all ${active ? 'bg-primary text-slate-900' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 hover:bg-slate-300'
                                                            } ${current ? 'shadow-[0_0_0_4px_rgba(19,236,109,0.2)]' : ''}`}>
                                                            <span className={`material-symbols-outlined text-sm font-bold ${current && shipment.status !== 'Entregue' ? 'animate-pulse' : ''}`}>
                                                                {shipment.status === 'Entregue' && idx === statusSteps.length - 1 ? 'done_all' : active ? 'check' : 'circle'}
                                                            </span>
                                                        </div>
                                                        <span className={`text-xs hidden md:block ${current ? 'font-bold text-primary' : 'font-medium text-slate-500'}`}>{step}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                                        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-4 gap-4">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
                                                    <span className="material-symbols-outlined">local_shipping</span>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-medium uppercase mb-0.5">Transportadora</p>
                                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{shipment.carrier}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
                                                    <span className="material-symbols-outlined">qr_code_2</span>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-medium uppercase mb-0.5">Rastreio</p>
                                                    <a
                                                        href={`https://www.linkcorreios.com.br/?id=${shipment.trackingCode}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
                                                    >
                                                        {shipment.trackingCode} <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
                                                    <span className="material-symbols-outlined">event</span>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 font-medium uppercase mb-0.5">Previsão</p>
                                                    <p className={`text-sm font-semibold ${shipment.status === 'Entregue' ? 'text-slate-500 line-through' : 'text-green-600 dark:text-green-400'}`}>
                                                        {shipment.estimatedDelivery || '-'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 sm:col-span-1">
                                                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
                                                    <span className="material-symbols-outlined">info</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-slate-500 font-medium uppercase mb-0.5">Último Status</p>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate" title={shipment.lastStatus || 'Nenhuma atualização disponível'}>
                                                        {shipment.lastStatus || 'Pendente'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 justify-end md:justify-end mt-4 md:mt-0">
                                            <button
                                                onClick={() => handleEditClick(shipment)}
                                                className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">edit</span> Editar
                                            </button>
                                            {shipment.customerPhone && (
                                                <button
                                                    onClick={() => openWhatsApp(shipment.customerPhone, shipment.customerName)}
                                                    className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-[#25D366] hover:bg-[#1ebc57] text-white transition-colors text-sm font-medium shadow-md shadow-green-500/20"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">chat</span> WhatsApp
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(shipment.id)}
                                                className="flex items-center justify-center h-10 w-10 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-400 hover:text-red-500 hover:border-red-300 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* New Shipment Modal */}
            {showNewShipmentModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">add_box</span>
                            Novo Envio
                        </h3>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Número do Pedido *</label>
                                    <input
                                        type="text"
                                        value={newOrderId}
                                        onChange={(e) => setNewOrderId(e.target.value)}
                                        placeholder="#PED-1234"
                                        className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Transportadora *</label>
                                    <select
                                        value={newCarrier}
                                        onChange={(e) => setNewCarrier(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none"
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="Correios (Sedex)">Correios (Sedex)</option>
                                        <option value="Correios (PAC)">Correios (PAC)</option>
                                        <option value="Jadlog">Jadlog</option>
                                        <option value="Loggi">Loggi</option>
                                        <option value="Total Express">Total Express</option>
                                        <option value="Motoboy">Motoboy</option>
                                        <option value="Retirada na Loja">Retirada na Loja</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome do Cliente *</label>
                                <input
                                    type="text"
                                    value={newCustomerName}
                                    onChange={(e) => setNewCustomerName(e.target.value)}
                                    placeholder="João Silva"
                                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telefone (WhatsApp)</label>
                                <input
                                    type="text"
                                    value={newCustomerPhone}
                                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                                    placeholder="(11) 99999-9999"
                                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descrição do Produto</label>
                                <input
                                    type="text"
                                    value={newProductDescription}
                                    onChange={(e) => setNewProductDescription(e.target.value)}
                                    placeholder="Camisa Flamengo 2024 (M)"
                                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Código de Rastreio</label>
                                    <input
                                        type="text"
                                        value={newTrackingCode}
                                        onChange={(e) => setNewTrackingCode(e.target.value)}
                                        placeholder="AB123456789BR"
                                        className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Previsão de Entrega</label>
                                    <input
                                        type="date"
                                        value={newEstimatedDelivery}
                                        onChange={(e) => setNewEstimatedDelivery(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Última Atualização (Rastreio)</label>
                                <input
                                    type="text"
                                    value={newLastStatus}
                                    onChange={(e) => setNewLastStatus(e.target.value)}
                                    placeholder="Ex: Objeto postado"
                                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => { setShowNewShipmentModal(false); resetForm(); }}
                                className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreateShipment}
                                className="flex-1 px-4 py-2.5 bg-primary text-slate-900 rounded-lg font-bold hover:bg-primary-hover transition-colors"
                            >
                                Criar Envio
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Shipment Modal */}
            {showEditModal && editingShipment && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-2xl max-w-lg w-full">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">edit</span>
                            Editar Envio
                        </h3>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Transportadora</label>
                                    <input
                                        type="text"
                                        value={editingShipment.carrier}
                                        onChange={(e) => setEditingShipment({ ...editingShipment, carrier: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Código de Rastreio</label>
                                    <input
                                        type="text"
                                        value={editingShipment.trackingCode}
                                        onChange={(e) => setEditingShipment({ ...editingShipment, trackingCode: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                                <select
                                    value={editingShipment.status}
                                    onChange={(e) => setEditingShipment({ ...editingShipment, status: e.target.value as ShipmentStatus })}
                                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none"
                                >
                                    {statusSteps.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Previsão de Entrega</label>
                                <input
                                    type="date"
                                    value={editingShipment.estimatedDelivery}
                                    onChange={(e) => setEditingShipment({ ...editingShipment, estimatedDelivery: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Última Atualização (Rastreio)</label>
                                <textarea
                                    value={editingShipment.lastStatus || ''}
                                    onChange={(e) => setEditingShipment({ ...editingShipment, lastStatus: e.target.value })}
                                    placeholder="Copie e cole aqui a última atualização do site de rastreio"
                                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none min-h-[80px] text-sm"
                                />
                            </div>

                            {/* Tracking Link Section */}
                            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Link de Rastreamento</p>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        readOnly
                                        value={`https://www.linkcorreios.com.br/?id=${editingShipment.trackingCode}`}
                                        className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400"
                                    />
                                    <button
                                        onClick={() => navigator.clipboard.writeText(`https://www.linkcorreios.com.br/?id=${editingShipment.trackingCode}`)}
                                        className="p-2 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                                        title="Copiar link"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">content_copy</span>
                                    </button>
                                </div>
                                <a
                                    href={`https://www.linkcorreios.com.br/?id=${editingShipment.trackingCode}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-3 flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors text-sm"
                                >
                                    <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                                    Verificar Status no Site
                                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                                </a>
                                <p className="mt-2 text-xs text-slate-400 text-center">
                                    Clique acima para ver a última atualização do pedido
                                </p>
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
        </div>
    );
};

export default Logistics;