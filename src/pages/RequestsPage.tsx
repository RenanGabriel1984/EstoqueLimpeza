import React, { useState } from 'react';
import { useApp, StockRequest } from '../context/AppContext';
import { Plus, Check, X, Clock, Package, AlertTriangle, Search, Filter } from 'lucide-react';

export const RequestsPage = () => {
  const { stockRequests, addStockRequest, updateStockRequest, products, currentUser } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formData, setFormData] = useState({ productId: '', quantity: 1, notes: '' });

  const canRequest = currentUser && ['secretario', 'diretor', 'tecnico', 'copa'].includes(currentUser.role);
  const canApprove = currentUser && ['secretario', 'diretor'].includes(currentUser.role);

  const filteredRequests = stockRequests.filter(r => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productId || formData.quantity <= 0) return;

    const product = products.find(p => p.id === formData.productId);
    if (!product) return;

    const request: StockRequest = {
      id: Date.now().toString(),
      productId: formData.productId,
      quantity: formData.quantity,
      date: new Date().toISOString(),
      requestedBy: currentUser?.name || 'Usuário',
      status: 'pending',
      notes: formData.notes,
    };

    addStockRequest(request);
    setShowModal(false);
    setFormData({ productId: '', quantity: 1, notes: '' });
  };

  const handleApprove = (request: StockRequest) => {
    const product = products.find(p => p.id === request.productId);
    if (product && product.quantity < request.quantity) {
      alert(`Estoque insuficiente! Disponível: ${product.quantity} ${product.unit}(s)`);
      return;
    }
    updateStockRequest({ ...request, status: 'approved', approvedBy: currentUser?.name });
  };

  const handleDeliver = (request: StockRequest) => {
    updateStockRequest({ ...request, status: 'delivered' });
  };

  const handleReject = (request: StockRequest) => {
    updateStockRequest({ ...request, status: 'rejected', approvedBy: currentUser?.name });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; class: string; icon: React.ReactNode }> = {
      pending: { label: 'Pendente', class: 'badge-warning', icon: <Clock className="w-3 h-3" /> },
      approved: { label: 'Aprovado', class: 'badge-info', icon: <Check className="w-3 h-3" /> },
      delivered: { label: 'Entregue', class: 'badge-success', icon: <Check className="w-3 h-3" /> },
      rejected: { label: 'Rejeitado', class: 'badge-danger', icon: <X className="w-3 h-3" /> },
    };
    const badge = badges[status];
    return (
      <span className={`badge ${badge.class} flex items-center gap-1 w-fit`}>
        {badge.icon} {badge.label}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Requisições de Material</h2>
          <p className="text-sm text-gray-500">Solicite e gerencie materiais do estoque</p>
        </div>
        {canRequest && (
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nova Requisição
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: 'Todos' },
            { value: 'pending', label: 'Pendentes' },
            { value: 'approved', label: 'Aprovados' },
            { value: 'delivered', label: 'Entregues' },
            { value: 'rejected', label: 'Rejeitados' },
          ].map(filter => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                statusFilter === filter.value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="card text-center py-12 text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma requisição encontrada</p>
            {canRequest && <p className="text-xs mt-1">Clique em "Nova Requisição" para solicitar materiais</p>}
          </div>
        ) : (
          filteredRequests.map(request => {
            const product = products.find(p => p.id === request.productId);
            const isLowStock = product && product.quantity <= product.minQuantity;
            return (
              <div key={request.id} className="card hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      request.status === 'pending' ? 'bg-amber-100' :
                      request.status === 'approved' ? 'bg-blue-100' :
                      request.status === 'delivered' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <Package className={`w-5 h-5 ${
                        request.status === 'pending' ? 'text-amber-600' :
                        request.status === 'approved' ? 'text-blue-600' :
                        request.status === 'delivered' ? 'text-green-600' : 'text-red-600'
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{product?.name || 'Produto'}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Quantidade: <span className="font-semibold">{request.quantity} {product?.unit}(s)</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        Solicitado por: {request.requestedBy} • {new Date(request.date).toLocaleDateString('pt-BR')}
                      </p>
                      {isLowStock && (
                        <div className="flex items-center gap-1 mt-1">
                          <AlertTriangle className="w-3 h-3 text-amber-500" />
                          <span className="text-xs text-amber-600">Estoque baixo ({product?.quantity} em estoque)</span>
                        </div>
                      )}
                      {request.notes && (
                        <p className="text-xs text-gray-400 mt-1 italic">"{request.notes}"</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                    {getStatusBadge(request.status)}
                    {request.status === 'pending' && canApprove && (
                      <div className="flex gap-1 mt-2">
                        <button
                          onClick={() => handleApprove(request)}
                          className="p-1.5 bg-green-100 text-green-600 hover:bg-green-200 rounded-lg transition-colors"
                          title="Aprovar"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleReject(request)}
                          className="p-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors"
                          title="Rejeitar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {request.status === 'approved' && canApprove && (
                      <button
                        onClick={() => handleDeliver(request)}
                        className="btn-success text-xs py-1.5 px-3 mt-2"
                      >
                        Confirmar Entrega
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Nova Requisição</h3>
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
                  {products.filter(p => p.quantity > 0).map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.quantity} {product.unit}(s) disponível)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                  className="input-field"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações (opcional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="Descreva o motivo ou detalhes da requisição..."
                />
              </div>
              {formData.productId && (() => {
                const product = products.find(p => p.id === formData.productId);
                if (product && formData.quantity > product.quantity) {
                  return (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-700">
                        <AlertTriangle className="w-4 h-4 inline mr-1" />
                        Quantidade solicitada maior que o estoque disponível ({product.quantity})
                      </p>
                    </div>
                  );
                }
                return null;
              })()}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Solicitar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
