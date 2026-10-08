import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, AlertTriangle, CheckCircle, Clock, Package } from 'lucide-react';

export const ExpirationPage = () => {
  const { products, getProductsExpiringSoon, getLocationName } = useApp();
  const [filter, setFilter] = useState<'all' | '30' | '60' | '90'>('30');

  const getExpiringProducts = () => {
    const days = filter === 'all' ? 365 : parseInt(filter);
    return getProductsExpiringSoon(days);
  };

  const getExpiredProducts = () => {
    const now = new Date();
    return products.filter(p => {
      if (!p.expirationDate) return false;
      return new Date(p.expirationDate) < now;
    });
  };

  const expiringProducts = getExpiringProducts();
  const expiredProducts = getExpiredProducts();

  const getStatusColor = (expirationDate: string) => {
    const now = new Date();
    const expDate = new Date(expirationDate);
    const daysUntilExpiration = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiration < 0) return 'text-red-600 bg-red-50';
    if (daysUntilExpiration <= 30) return 'text-orange-600 bg-orange-50';
    if (daysUntilExpiration <= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getDaysUntilExpiration = (expirationDate: string) => {
    const now = new Date();
    const expDate = new Date(expirationDate);
    return Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Controle de Validade</h2>
        <p className="text-gray-600">Monitoramento de produtos próximos ao vencimento</p>
      </div>

      {/* Alertas */}
      {expiredProducts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="w-6 h-6 text-red-600 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-800">Produtos Vencidos</h3>
              <p className="text-red-700 text-sm mt-1">
                {expiredProducts.length} produto(s) vencido(s). Retire imediatamente do estoque.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('30')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === '30' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          30 dias
        </button>
        <button
          onClick={() => setFilter('60')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === '60' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          60 dias
        </button>
        <button
          onClick={() => setFilter('90')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === '90' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          90 dias
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todos
        </button>
      </div>

      {/* Lista de Produtos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produto
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Local
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantidade
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Validade
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {expiringProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-gray-600">Nenhum produto próximo ao vencimento</p>
                  </td>
                </tr>
              ) : (
                expiringProducts.map(product => {
                  const daysLeft = getDaysUntilExpiration(product.expirationDate!);
                  const statusColor = getStatusColor(product.expirationDate!);
                  
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Package className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {getLocationName(product.locationId)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {product.quantity} {product.unit}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(product.expirationDate!).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                          {daysLeft < 0 ? (
                            <>
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Vencido há {Math.abs(daysLeft)} dias
                            </>
                          ) : daysLeft === 0 ? (
                            <>
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Vence hoje
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 mr-1" />
                              {daysLeft} dias
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Produtos Vencidos */}
      {expiredProducts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-red-200 overflow-hidden">
          <div className="bg-red-50 px-6 py-4 border-b border-red-200">
            <h3 className="font-semibold text-red-800 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Produtos Vencidos ({expiredProducts.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Local
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantidade
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vencido em
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dias atrás
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {expiredProducts.map(product => {
                  const daysExpired = Math.abs(getDaysUntilExpiration(product.expirationDate!));
                  
                  return (
                    <tr key={product.id} className="bg-red-50 hover:bg-red-100">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Package className="w-5 h-5 text-red-400 mr-3" />
                          <div>
                            <div className="font-medium text-red-900">{product.name}</div>
                            <div className="text-sm text-red-700">{product.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-red-700">
                        {getLocationName(product.locationId)}
                      </td>
                      <td className="px-6 py-4 text-sm text-red-700">
                        {product.quantity} {product.unit}
                      </td>
                      <td className="px-6 py-4 text-sm text-red-700">
                        {new Date(product.expirationDate!).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {daysExpired} dias
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700">Vencidos</p>
              <p className="text-2xl font-bold text-red-900">{expiredProducts.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-700">Vence em 30 dias</p>
              <p className="text-2xl font-bold text-orange-900">
                {expiringProducts.filter(p => getDaysUntilExpiration(p.expirationDate!) <= 30).length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">Válidos</p>
              <p className="text-2xl font-bold text-green-900">
                {products.filter(p => !p.expirationDate || getDaysUntilExpiration(p.expirationDate) > 30).length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>
    </div>
  );
};
