import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DollarSign, TrendingUp, TrendingDown, Minus, Calendar, Package } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const PriceHistoryPage = () => {
  const { products, priceHistory, suppliers } = useApp();
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [period, setPeriod] = useState<'3m' | '6m' | '1y' | 'all'>('6m');

  const getProductPriceHistory = () => {
    if (!selectedProduct) return [];
    
    const history = priceHistory
      .filter(h => h.productId === selectedProduct)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Filter by period
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '3m':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case '6m':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case '1y':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        startDate = new Date(2000, 0, 1);
    }

    return history.filter(h => new Date(h.date) >= startDate);
  };

  const priceData = getProductPriceHistory();
  const selectedProductData = products.find(p => p.id === selectedProduct);

  const calculateVariation = () => {
    if (priceData.length < 2) return { value: 0, trend: 'stable' };
    
    const firstPrice = priceData[0].price;
    const lastPrice = priceData[priceData.length - 1].price;
    const variation = ((lastPrice - firstPrice) / firstPrice) * 100;
    
    return {
      value: variation,
      trend: variation > 0 ? 'up' : variation < 0 ? 'down' : 'stable'
    };
  };

  const variation = calculateVariation();

  const chartData = priceData.map(entry => ({
    date: new Date(entry.date).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
    preco: entry.price,
    quantidade: entry.quantity,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Histórico de Preços</h2>
        <p className="text-gray-600">Análise de variação de preços e tendências de mercado</p>
      </div>

      {/* Seleção de Produto */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Selecione um Produto
        </label>
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Escolha um produto...</option>
          {products.map(product => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
      </div>

      {selectedProduct && selectedProductData && (
        <>
          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Preço Atual</p>
                <DollarSign className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                R$ {selectedProductData.lastPurchasePrice?.toFixed(2) || '0.00'}
              </p>
              <p className="text-xs text-gray-500 mt-1">Última compra</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Preço Médio</p>
                <Package className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                R$ {selectedProductData.averagePrice?.toFixed(2) || '0.00'}
              </p>
              <p className="text-xs text-gray-500 mt-1">CMVP</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Variação</p>
                {variation.trend === 'up' && <TrendingUp className="w-5 h-5 text-red-500" />}
                {variation.trend === 'down' && <TrendingDown className="w-5 h-5 text-green-500" />}
                {variation.trend === 'stable' && <Minus className="w-5 h-5 text-gray-500" />}
              </div>
              <p className={`text-2xl font-bold ${
                variation.trend === 'up' ? 'text-red-600' : 
                variation.trend === 'down' ? 'text-green-600' : 'text-gray-600'
              }`}>
                {variation.value > 0 ? '+' : ''}{variation.value.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">Período selecionado</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Total de Compras</p>
                <Calendar className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{priceData.length}</p>
              <p className="text-xs text-gray-500 mt-1">Registros</p>
            </div>
          </div>

          {/* Filtro de Período */}
          <div className="flex gap-2">
            <button
              onClick={() => setPeriod('3m')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                period === '3m' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              3 meses
            </button>
            <button
              onClick={() => setPeriod('6m')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                period === '6m' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              6 meses
            </button>
            <button
              onClick={() => setPeriod('1y')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                period === '1y' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              1 ano
            </button>
            <button
              onClick={() => setPeriod('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                period === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todo histórico
            </button>
          </div>

          {/* Gráfico de Preços */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Evolução de Preços - {selectedProductData.name}
            </h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Preço']}
                    labelFormatter={(label) => `Data: ${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="preco" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    name="Preço Unitário"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                Nenhum dado disponível para o período selecionado
              </div>
            )}
          </div>

          {/* Tabela de Histórico */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Histórico de Compras</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fornecedor
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantidade
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Preço Unitário
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Total
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NF
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {priceData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        Nenhum registro de preço encontrado
                      </td>
                    </tr>
                  ) : (
                    priceData.slice().reverse().map((entry, index) => {
                      const supplier = suppliers.find(s => s.id === entry.supplierId);
                      return (
                        <tr key={entry.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(entry.date).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {supplier?.name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {entry.quantity}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            R$ {entry.price.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            R$ {(entry.price * entry.quantity).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {entry.invoiceNumber}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
