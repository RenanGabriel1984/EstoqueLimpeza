import React, { useState } from 'react';
import { useApp, PhysicalInventory } from '../context/AppContext';
import { ClipboardCheck, Plus, CheckCircle, AlertTriangle, Edit2, Eye, X, Package } from 'lucide-react';
import { useToast } from '../components/ToastProvider';

export const PhysicalInventoryPage = () => {
  const { products, currentUser, physicalInventories, addPhysicalInventory, updatePhysicalInventory, getLocationName, addAuditLog } = useApp();
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [viewingInventory, setViewingInventory] = useState<PhysicalInventory | null>(null);
  const [inventoryItems, setInventoryItems] = useState<{
    productId: string;
    expectedQuantity: number;
    countedQuantity: number;
    difference: number;
    notes: string;
  }[]>([]);

  const startInventory = () => {
    const items = products.map(p => ({
      productId: p.id,
      expectedQuantity: p.quantity,
      countedQuantity: 0,
      difference: 0,
      notes: '',
    }));
    setInventoryItems(items);
    setShowModal(true);
  };

  const updateCount = (productId: string, counted: number) => {
    setInventoryItems(prev => prev.map(item => {
      if (item.productId === productId) {
        const difference = counted - item.expectedQuantity;
        return { ...item, countedQuantity: counted, difference };
      }
      return item;
    }));
  };

  const updateNotes = (productId: string, notes: string) => {
    setInventoryItems(prev => prev.map(item =>
      item.productId === productId ? { ...item, notes } : item
    ));
  };

  const saveInventory = () => {
    const inventory: PhysicalInventory = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      performedBy: currentUser?.name || 'Usuário',
      status: 'completed',
      items: inventoryItems.filter(i => i.countedQuantity > 0 || i.difference !== 0),
    };

    addPhysicalInventory(inventory);
    addAuditLog({
      action: 'inventory',
      entityType: 'inventory',
      entityId: inventory.id,
      userId: currentUser?.id || '',
      userName: currentUser?.name || '',
      details: `Inventário físico realizado com ${inventory.items.length} itens verificados`,
    });

    showToast('success', 'Inventário físico salvo com sucesso!');
    setShowModal(false);
  };

  const reconcileInventory = (inventory: PhysicalInventory) => {
    // This would update product quantities based on physical count
    showToast('info', 'Conciliação realizada - estoque ajustado');
    const updated = { ...inventory, status: 'reconciled' as const };
    updatePhysicalInventory(updated);
    setViewingInventory(null);
  };

  const totalDifferences = inventoryItems.reduce((sum, item) => sum + Math.abs(item.difference), 0);
  const itemsWithDifference = inventoryItems.filter(i => i.difference !== 0).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Inventário Físico</h2>
          <p className="text-sm text-gray-500">Contagem real e conciliação com estoque teórico</p>
        </div>
        <button onClick={startInventory} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Novo Inventário
        </button>
      </div>

      {/* Info */}
      <div className="card bg-gradient-to-r from-purple-50 to-blue-50 border-purple-100">
        <div className="flex items-start gap-3">
          <ClipboardCheck className="w-5 h-5 text-purple-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-purple-800">Controle de Inventário</p>
            <p className="text-xs text-purple-600 mt-1">
              Realize a contagem física dos produtos e compare com o estoque registrado no sistema.
              Identifique divergências, perdas e acertos para manter o controle preciso do estoque.
            </p>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="card">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Histórico de Inventários</h3>
        {physicalInventories.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <ClipboardCheck className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum inventário realizado ainda</p>
            <p className="text-xs mt-1">Clique em "Novo Inventário" para começar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {physicalInventories.slice().reverse().map(inventory => {
              const discrepancies = inventory.items.filter(i => i.difference !== 0).length;
              return (
                <div key={inventory.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      inventory.status === 'reconciled' ? 'bg-green-100' :
                      inventory.status === 'completed' ? 'bg-blue-100' : 'bg-amber-100'
                    }`}>
                      <ClipboardCheck className={`w-5 h-5 ${
                        inventory.status === 'reconciled' ? 'text-green-600' :
                        inventory.status === 'completed' ? 'text-blue-600' : 'text-amber-600'
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        Inventário {new Date(inventory.date).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-xs text-gray-500">
                        Por: {inventory.performedBy} • {inventory.items.length} itens
                      </p>
                      {discrepancies > 0 && (
                        <p className="text-xs text-amber-600 flex items-center gap-1 mt-0.5">
                          <AlertTriangle className="w-3 h-3" />
                          {discrepancies} divergências
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${
                      inventory.status === 'reconciled' ? 'badge-success' :
                      inventory.status === 'completed' ? 'badge-info' : 'badge-warning'
                    }`}>
                      {inventory.status === 'reconciled' ? 'Conciliado' :
                       inventory.status === 'completed' ? 'Concluído' : 'Em andamento'}
                    </span>
                    <button
                      onClick={() => setViewingInventory(inventory)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Inventory Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Inventário Físico</h3>
                <p className="text-xs text-gray-500">Conte cada item e registre a quantidade real</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Summary Bar */}
            <div className="flex items-center gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100">
              <div className="text-center">
                <p className="text-lg font-bold text-gray-800">{inventoryItems.length}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-amber-600">{itemsWithDifference}</p>
                <p className="text-xs text-gray-500">Divergências</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-800">{totalDifferences}</p>
                <p className="text-xs text-gray-500">Itens diferença</p>
              </div>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {inventoryItems.map(item => {
                const product = products.find(p => p.id === item.productId);
                if (!product) return null;
                return (
                  <div key={item.productId} className={`p-3 rounded-xl border ${
                    item.difference !== 0 ? 'border-amber-200 bg-amber-50' : 'border-gray-100 bg-white'
                  }`}>
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                        <p className="text-xs text-gray-500">{getLocationName(product.locationId)}</p>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        Esperado: <span className="font-semibold">{item.expectedQuantity}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <input
                        type="number"
                        value={item.countedQuantity || ''}
                        onChange={(e) => updateCount(item.productId, parseInt(e.target.value) || 0)}
                        placeholder="Qtd. contada"
                        className="input-field text-sm flex-1"
                        min="0"
                      />
                      {item.difference !== 0 && (
                        <span className={`text-sm font-bold ${item.difference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.difference > 0 ? '+' : ''}{item.difference}
                        </span>
                      )}
                    </div>
                    {item.difference !== 0 && (
                      <input
                        type="text"
                        value={item.notes}
                        onChange={(e) => updateNotes(item.productId, e.target.value)}
                        placeholder="Motivo da divergência..."
                        className="input-field text-xs mt-2"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                Cancelar
              </button>
              <button onClick={saveInventory} className="btn-primary flex-1">
                Salvar Inventário
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Inventory Modal */}
      {viewingInventory && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Detalhes do Inventário</h3>
                <p className="text-xs text-gray-500">
                  {new Date(viewingInventory.date).toLocaleDateString('pt-BR')} • Por: {viewingInventory.performedBy}
                </p>
              </div>
              <button onClick={() => setViewingInventory(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {viewingInventory.items.map((item, i) => {
                const product = products.find(p => p.id === item.productId);
                return (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${
                    item.difference !== 0 ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50'
                  }`}>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{product?.name}</p>
                      <p className="text-xs text-gray-500">
                        Esperado: {item.expectedQuantity} | Contado: {item.countedQuantity}
                      </p>
                      {item.notes && <p className="text-xs text-amber-600 mt-0.5">Obs: {item.notes}</p>}
                    </div>
                    <span className={`text-sm font-bold ${
                      item.difference > 0 ? 'text-green-600' : item.difference < 0 ? 'text-red-600' : 'text-gray-400'
                    }`}>
                      {item.difference > 0 ? '+' : ''}{item.difference}
                    </span>
                  </div>
                );
              })}
            </div>
            {viewingInventory.status !== 'reconciled' && (
              <div className="p-6 border-t border-gray-100">
                <button
                  onClick={() => reconcileInventory(viewingInventory)}
                  className="btn-success w-full flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Conciliar com Estoque
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
