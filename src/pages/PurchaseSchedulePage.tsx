import React, { useState } from 'react';
import { useApp, PurchaseSchedule } from '../context/AppContext';
import { Calendar, Plus, Edit2, Trash2, CheckCircle, Clock, AlertTriangle, X, FileText } from 'lucide-react';

export const PurchaseSchedulePage = () => {
  const { products, purchaseSchedule, addPurchaseSchedule, updatePurchaseSchedule, suppliers } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<PurchaseSchedule | null>(null);
  const [filter, setFilter] = useState<'all' | 'planned' | 'in_progress' | 'completed' | 'cancelled'>('all');
  const [formData, setFormData] = useState({
    productId: '',
    estimatedDate: '',
    estimatedQuantity: 0,
    status: 'planned' as PurchaseSchedule['status'],
    biddingProcess: '',
    notes: '',
  });

  const openAddModal = () => {
    setEditingSchedule(null);
    setFormData({
      productId: '',
      estimatedDate: '',
      estimatedQuantity: 0,
      status: 'planned',
      biddingProcess: '',
      notes: '',
    });
    setShowModal(true);
  };

  const openEditModal = (schedule: PurchaseSchedule) => {
    setEditingSchedule(schedule);
    setFormData({
      productId: schedule.productId,
      estimatedDate: schedule.estimatedDate,
      estimatedQuantity: schedule.estimatedQuantity,
      status: schedule.status,
      biddingProcess: schedule.biddingProcess || '',
      notes: schedule.notes || '',
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSchedule) {
      updatePurchaseSchedule({ ...editingSchedule, ...formData });
    } else {
      addPurchaseSchedule({
        id: Date.now().toString(),
        ...formData,
      });
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este agendamento?')) {
      updatePurchaseSchedule({
        ...purchaseSchedule.find(s => s.id === id)!,
        status: 'cancelled',
      });
    }
  };

  const filteredSchedules = purchaseSchedule
    .filter(s => filter === 'all' || s.status === filter)
    .sort((a, b) => new Date(a.estimatedDate).getTime() - new Date(b.estimatedDate).getTime());

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; class: string; icon: React.ReactNode }> = {
      planned: { label: 'Planejado', class: 'bg-blue-100 text-blue-800', icon: <Calendar className="w-3 h-3" /> },
      in_progress: { label: 'Em Andamento', class: 'bg-amber-100 text-amber-800', icon: <Clock className="w-3 h-3" /> },
      completed: { label: 'Concluído', class: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-3 h-3" /> },
      cancelled: { label: 'Cancelado', class: 'bg-red-100 text-red-800', icon: <X className="w-3 h-3" /> },
    };
    const badge = badges[status];
    return (
      <span className={`badge ${badge.class} flex items-center gap-1`}>
        {badge.icon} {badge.label}
      </span>
    );
  };

  const getDaysUntil = (date: string) => {
    const now = new Date();
    const targetDate = new Date(date);
    return Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Calendário de Compras</h2>
          <p className="text-gray-600">Planejamento de aquisições e processos licitatórios</p>
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Novo Agendamento
        </button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700">Planejados</p>
              <p className="text-2xl font-bold text-blue-900">
                {purchaseSchedule.filter(s => s.status === 'planned').length}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-700">Em Andamento</p>
              <p className="text-2xl font-bold text-amber-900">
                {purchaseSchedule.filter(s => s.status === 'in_progress').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-amber-500" />
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">Concluídos</p>
              <p className="text-2xl font-bold text-green-900">
                {purchaseSchedule.filter(s => s.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700">Urgentes (7 dias)</p>
              <p className="text-2xl font-bold text-red-900">
                {purchaseSchedule.filter(s => {
                  const days = getDaysUntil(s.estimatedDate);
                  return days <= 7 && days >= 0 && s.status !== 'completed' && s.status !== 'cancelled';
                }).length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFilter('planned')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'planned' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Planejados
        </button>
        <button
          onClick={() => setFilter('in_progress')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'in_progress' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Em Andamento
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Concluídos
        </button>
        <button
          onClick={() => setFilter('cancelled')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'cancelled' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Cancelados
        </button>
      </div>

      {/* Lista de Agendamentos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produto
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Prevista
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantidade
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Processo Licitatório
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prazo
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSchedules.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Nenhum agendamento encontrado
                  </td>
                </tr>
              ) : (
                filteredSchedules.map(schedule => {
                  const product = products.find(p => p.id === schedule.productId);
                  const daysUntil = getDaysUntil(schedule.estimatedDate);
                  const isUrgent = daysUntil <= 7 && daysUntil >= 0 && schedule.status !== 'completed' && schedule.status !== 'cancelled';
                  
                  return (
                    <tr key={schedule.id} className={`hover:bg-gray-50 ${isUrgent ? 'bg-red-50' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{product?.name || 'N/A'}</div>
                        {schedule.notes && (
                          <div className="text-sm text-gray-500 mt-1">{schedule.notes}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(schedule.estimatedDate).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {schedule.estimatedQuantity} {product?.unit || 'un'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {schedule.biddingProcess ? (
                          <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            {schedule.biddingProcess}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(schedule.status)}
                      </td>
                      <td className="px-6 py-4">
                        {schedule.status !== 'completed' && schedule.status !== 'cancelled' ? (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            isUrgent ? 'bg-red-100 text-red-800' :
                            daysUntil <= 30 ? 'bg-amber-100 text-amber-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {daysUntil < 0 ? `Atrasado ${Math.abs(daysUntil)} dias` :
                             daysUntil === 0 ? 'Hoje' :
                             `${daysUntil} dias`}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(schedule)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(schedule.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingSchedule ? 'Editar Agendamento' : 'Novo Agendamento'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Produto</label>
                <select
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Selecione um produto</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Prevista</label>
                <input
                  type="date"
                  value={formData.estimatedDate}
                  onChange={(e) => setFormData({ ...formData, estimatedDate: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade Estimada</label>
                <input
                  type="number"
                  value={formData.estimatedQuantity}
                  onChange={(e) => setFormData({ ...formData, estimatedQuantity: parseInt(e.target.value) || 0 })}
                  className="input-field"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="input-field"
                >
                  <option value="planned">Planejado</option>
                  <option value="in_progress">Em Andamento</option>
                  <option value="completed">Concluído</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Processo Licitatório</label>
                <input
                  type="text"
                  value={formData.biddingProcess}
                  onChange={(e) => setFormData({ ...formData, biddingProcess: e.target.value })}
                  className="input-field"
                  placeholder="Ex: PE 001/2024"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="Detalhes adicionais..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingSchedule ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
