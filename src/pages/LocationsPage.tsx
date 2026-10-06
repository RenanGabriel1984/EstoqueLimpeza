import React, { useState } from 'react';
import { useApp, StorageLocation } from '../context/AppContext';
import { MapPin, Plus, Edit2, Trash2, Package, X, Check } from 'lucide-react';

export const LocationsPage = () => {
  const { locations, products, addLocation, updateLocation, deleteLocation } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<StorageLocation | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const openAddModal = () => {
    setEditingLocation(null);
    setFormData({ name: '', description: '' });
    setShowModal(true);
  };

  const openEditModal = (location: StorageLocation) => {
    setEditingLocation(location);
    setFormData({ name: location.name, description: location.description });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLocation) {
      updateLocation({ ...editingLocation, ...formData });
    } else {
      addLocation({ id: Date.now().toString(), ...formData });
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    const productsInLocation = products.filter(p => p.locationId === id);
    if (productsInLocation.length > 0) {
      alert(`Não é possível excluir este local. Existem ${productsInLocation.length} produto(s) vinculados a ele. Mova os produtos para outro local primeiro.`);
      return;
    }
    if (confirm('Tem certeza que deseja excluir este local de armazenamento?')) {
      deleteLocation(id);
    }
  };

  const getProductCount = (locationId: string) => {
    return products.filter(p => p.locationId === locationId).length;
  };

  const getTotalItems = (locationId: string) => {
    return products.filter(p => p.locationId === locationId).reduce((sum, p) => sum + p.quantity, 0);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Locais de Armazenamento</h2>
          <p className="text-sm text-gray-500">Gerencie os locais onde os produtos são armazenados</p>
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Novo Local
        </button>
      </div>

      {/* Info */}
      <div className="card bg-blue-50 border-blue-100">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800">Organização do Estoque</p>
            <p className="text-xs text-blue-600 mt-1">
              Cadastre os locais de armazenamento (armários, prateleiras, depósitos) para que cada produto
              tenha um local definido. Isso facilita a localização rápida dos itens por qualquer pessoa.
            </p>
          </div>
        </div>
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {locations.map(location => {
          const productCount = getProductCount(location.id);
          const totalItems = getTotalItems(location.id);
          return (
            <div key={location.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{location.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{location.description}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEditModal(location)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(location.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{productCount} produtos</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-gray-600">{totalItems} itens</span>
                  </div>
                </div>
              </div>
              {/* Products preview */}
              {productCount > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">Produtos neste local:</p>
                  <div className="flex flex-wrap gap-1">
                    {products.filter(p => p.locationId === location.id).slice(0, 5).map(p => (
                      <span key={p.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {p.name.substring(0, 20)}{p.name.length > 20 ? '...' : ''}
                      </span>
                    ))}
                    {productCount > 5 && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        +{productCount - 5} mais
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingLocation ? 'Editar Local' : 'Novo Local de Armazenamento'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Local</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                  placeholder="Ex: Armário de Limpeza"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="Ex: Armário interno do almoxarifado, prateleira superior"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingLocation ? 'Salvar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
