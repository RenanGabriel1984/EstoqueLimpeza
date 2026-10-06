import React from 'react';
import { useApp } from '../context/AppContext';
import { AlertTriangle, Package, TrendingDown, ShoppingCart, Bell } from 'lucide-react';

export const AlertsPage = () => {
  const { products, getStockAlerts, stockRequests } = useApp();
  const alerts = getStockAlerts();
  const pendingRequests = stockRequests.filter(r => r.status === 'pending');

  const criticalItems = alerts.filter(p => p.quantity === 0);
  const lowItems = alerts.filter(p => p.quantity > 0 && p.quantity <= p.minQuantity);

  const getPercentage = (product: typeof products[0]) => {
    return Math.min(100, (product.quantity / (product.minQuantity * 2)) * 100);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-800">Alertas e Notificações</h2>
        <p className="text-sm text-gray-500">Acompanhe itens com estoque baixo e pendências</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card border-l-4 border-l-red-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{criticalItems.length}</p>
              <p className="text-xs text-gray-500">Sem estoque</p>
            </div>
          </div>
        </div>
        <div className="card border-l-4 border-l-amber-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{lowItems.length}</p>
              <p className="text-xs text-gray-500">Estoque baixo</p>
            </div>
          </div>
        </div>
        <div className="card border-l-4 border-l-blue-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{pendingRequests.length}</p>
              <p className="text-xs text-gray-500">Requisições pendentes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Items */}
      {criticalItems.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="text-base font-semibold text-gray-800">Itens Sem Estoque</h3>
          </div>
          <div className="space-y-3">
            {criticalItems.map(product => (
              <div key={product.id} className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-200 rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 text-red-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.location} • Mín: {product.minQuantity} {product.unit}(s)</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="badge badge-danger">ESGOTADO</span>
                  <p className="text-xs text-gray-500 mt-1">Comprar urgente</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Low Stock Items */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-amber-500" />
          <h3 className="text-base font-semibold text-gray-800">Estoque Abaixo do Mínimo</h3>
        </div>
        {lowItems.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Todos os itens estão com estoque adequado</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lowItems.map(product => {
              const percentage = getPercentage(product);
              return (
                <div key={product.id} className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-200 rounded-xl flex items-center justify-center">
                        <Package className="w-5 h-5 text-amber-700" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-amber-700">{product.quantity}</p>
                      <p className="text-xs text-gray-500">de {product.minQuantity} mín.</p>
                    </div>
                  </div>
                  <div className="w-full bg-amber-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${percentage < 30 ? 'bg-red-500' : percentage < 60 ? 'bg-amber-500' : 'bg-green-500'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">Necessário comprar: {product.minQuantity - product.quantity} {product.unit}(s)</span>
                    <span className="text-xs text-gray-500">{percentage.toFixed(0)}% do ideal</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="w-5 h-5 text-blue-500" />
            <h3 className="text-base font-semibold text-gray-800">Requisições Pendentes</h3>
          </div>
          <div className="space-y-3">
            {pendingRequests.map(request => {
              const product = products.find(p => p.id === request.productId);
              return (
                <div key={request.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{product?.name}</p>
                    <p className="text-xs text-gray-500">
                      {request.quantity} {product?.unit}(s) • Solicitado por: {request.requestedBy}
                    </p>
                  </div>
                  <span className="badge badge-warning">Pendente</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
