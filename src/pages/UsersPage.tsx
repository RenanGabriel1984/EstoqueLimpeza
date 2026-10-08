import React, { useState } from 'react';
import { useApp, User } from '../context/AppContext';
import { Users, Plus, Edit2, Trash2, Shield, X, UserPlus } from 'lucide-react';

export const UsersPage = () => {
  const { users, addUser, currentUser } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '', email: '', role: 'tecnico' as User['role'], password: ''
  });

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', role: 'tecnico', password: '' });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      // Update would go here
    } else {
      addUser({ id: Date.now().toString(), ...formData });
    }
    setShowModal(false);
  };

  const getRoleBadge = (role: string) => {
    const badges: Record<string, { label: string; class: string; icon: string }> = {
      secretario: { label: 'Secretário', class: 'bg-purple-100 text-purple-800', icon: '👑' },
      diretor: { label: 'Diretor', class: 'bg-blue-100 text-blue-800', icon: '📋' },
      tecnico: { label: 'Técnico', class: 'bg-green-100 text-green-800', icon: '🔧' },
      copa: { label: 'Copa', class: 'bg-amber-100 text-amber-800', icon: '☕' },
    };
    const badge = badges[role];
    return (
      <span className={`badge ${badge.class} flex items-center gap-1`}>
        <span>{badge.icon}</span> {badge.label}
      </span>
    );
  };

  const getPermissions = (role: string) => {
    const perms: Record<string, string[]> = {
      secretario: ['Acesso total', 'Gerenciar usuários', 'Aprovar requisições', 'Ver relatórios', 'Configurações'],
      diretor: ['Gerenciar estoque', 'Aprovar requisições', 'Importar NF', 'Ver relatórios', 'Gerenciar usuários'],
      tecnico: ['Gerenciar estoque', 'Importar NF', 'Ver relatórios', 'Aprovar requisições'],
      copa: ['Solicitar materiais', 'Ver alertas', 'Ver estoque'],
    };
    return perms[role] || [];
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Gerenciar Usuários</h2>
          <p className="text-sm text-gray-500">Controle de acesso e permissões do sistema</p>
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Novo Usuário
        </button>
      </div>

      {/* Hierarchy Info */}
      <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800">Hierarquia de Acesso</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="badge bg-purple-100 text-purple-700">👑 Secretário - Acesso Total</span>
              <span className="badge bg-blue-100 text-blue-700">📋 Diretor - Gestão de Estoque</span>
              <span className="badge bg-green-100 text-green-700">🔧 Técnico - Operacional</span>
              <span className="badge bg-amber-100 text-amber-700">☕ Copa - Solicitações</span>
            </div>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {users.map(user => (
          <div key={user.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg font-bold">{user.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                  <div className="mt-1">{getRoleBadge(user.role)}</div>
                </div>
              </div>
              {user.id !== currentUser?.id && (
                <div className="flex gap-1">
                  <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Permissões:</p>
              <div className="flex flex-wrap gap-1">
                {getPermissions(user.role).map((perm, i) => (
                  <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Novo Usuário</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                  placeholder="Nome do usuário"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  required
                  placeholder="usuario@sggd.gov.br"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nível de Acesso</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                  className="input-field"
                >
                  <option value="copa">Copa - Solicitações e Alertas</option>
                  <option value="tecnico">Técnico - Operacional</option>
                  <option value="diretor">Diretor - Gestão de Estoque</option>
                  <option value="secretario">Secretário - Acesso Total</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha Inicial</label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field"
                  required
                  placeholder="Senha temporária"
                />
                <p className="text-xs text-gray-500 mt-1">O usuário poderá alterar após o primeiro acesso</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Cadastrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
