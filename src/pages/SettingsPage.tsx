import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Settings, Building, Bell, Database, Shield, Save, RefreshCw } from 'lucide-react';

export const SettingsPage = () => {
  const { suppliers, addSupplier, darkMode, toggleDarkMode, exportData, importData } = useApp();
  const [activeTab, setActiveTab] = useState<'general' | 'suppliers' | 'notifications' | 'backup'>('general');
  const [orgName, setOrgName] = useState('Secretaria de Gestão e Governo Digital');
  const [orgCnpj, setOrgCnpj] = useState('00.000.000/0001-00');
  const [saved, setSaved] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [supplierForm, setSupplierForm] = useState({ name: '', cnpj: '', phone: '', email: '' });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    addSupplier({ id: Date.now().toString(), ...supplierForm });
    setSupplierForm({ name: '', cnpj: '', phone: '', email: '' });
    setShowSupplierModal(false);
  };

  const handleResetData = () => {
    if (confirm('Tem certeza que deseja resetar todos os dados? Esta ação não pode ser desfeita.')) {
      localStorage.removeItem('sggd-stock-app');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-800">Configurações</h2>
        <p className="text-sm text-gray-500">Configure o sistema e gerencie fornecedores</p>
      </div>

      {/* Tabs */}
      <div className="card p-1 flex gap-1 overflow-x-auto">
        {[
          { id: 'general', label: 'Geral', icon: Building },
          { id: 'suppliers', label: 'Fornecedores', icon: Database },
          { id: 'notifications', label: 'Notificações', icon: Bell },
          { id: 'backup', label: 'Backup', icon: Database },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="card space-y-6">
          <div>
            <h3 className="text-base font-semibold text-gray-800 mb-4">Dados da Organização</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Secretaria</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                <input
                  type="text"
                  value={orgCnpj}
                  onChange={(e) => setOrgCnpj(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Aparência</h3>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-800">Modo Escuro</p>
                <p className="text-xs text-gray-500">Alterne entre tema claro e escuro</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={darkMode}
                  onChange={toggleDarkMode}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Segurança</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-800">Tempo de sessão</p>
                  <p className="text-xs text-gray-500">Logout automático por inatividade</p>
                </div>
                <select className="input-field w-32">
                  <option>30 min</option>
                  <option>1 hora</option>
                  <option>2 horas</option>
                  <option>4 horas</option>
                </select>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-800">Autenticação em dois fatores</p>
                  <p className="text-xs text-gray-500">Adiciona camada extra de segurança</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-base font-semibold text-red-600 mb-4">Zona de Perigo</h3>
            <button
              onClick={handleResetData}
              className="btn-danger flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Resetar Todos os Dados
            </button>
            <p className="text-xs text-gray-500 mt-2">Remove todos os dados e restaura o sistema ao estado inicial</p>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button onClick={handleSave} className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" />
              {saved ? 'Salvo!' : 'Salvar Configurações'}
            </button>
          </div>
        </div>
      )}

      {/* Suppliers */}
      {activeTab === 'suppliers' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowSupplierModal(true)} className="btn-primary flex items-center gap-2">
              <Database className="w-4 h-4" />
              Novo Fornecedor
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suppliers.map(supplier => (
              <div key={supplier.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <Building className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{supplier.name}</p>
                      <p className="text-xs text-gray-500 font-mono">{supplier.cnpj}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
                  <p className="text-xs text-gray-600">📞 {supplier.phone}</p>
                  <p className="text-xs text-gray-600">✉️ {supplier.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Backup */}
      {activeTab === 'backup' && (
        <div className="card space-y-4">
          <h3 className="text-base font-semibold text-gray-800">Backup e Restauração</h3>
          <p className="text-sm text-gray-500">Exporte ou importe dados do sistema</p>
          
          <div className="space-y-3">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="text-sm font-medium text-green-800 mb-2">Exportar Dados</h4>
              <p className="text-xs text-green-600 mb-3">Baixe um arquivo JSON com todos os dados do sistema</p>
              <button
                onClick={() => {
                  const data = exportData();
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `sggd-backup-${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="btn-success text-sm"
              >
                Baixar Backup
              </button>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Importar Dados</h4>
              <p className="text-xs text-blue-600 mb-3">Restaure dados a partir de um arquivo de backup</p>
              <input
                type="file"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const content = event.target?.result as string;
                      if (importData(content)) {
                        alert('Dados importados com sucesso!');
                        window.location.reload();
                      } else {
                        alert('Erro ao importar dados. Verifique o arquivo.');
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
                className="text-sm"
              />
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h4 className="text-sm font-medium text-amber-800 mb-2">Recomendações</h4>
              <ul className="text-xs text-amber-700 space-y-1">
                <li>• Faça backup regularmente (semanalmente recomendado)</li>
                <li>• Armazene os backups em local seguro</li>
                <li>• Teste a restauração periodicamente</li>
                <li>• Mantenha pelo menos 3 backups recentes</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {activeTab === 'notifications' && (
        <div className="card space-y-4">
          <h3 className="text-base font-semibold text-gray-800">Preferências de Notificação</h3>
          <div className="space-y-3">
            {[
              { label: 'Estoque abaixo do mínimo', desc: 'Alerta quando item atinge quantidade mínima', defaultChecked: true },
              { label: 'Item sem estoque', desc: 'Alerta urgente quando estoque zera', defaultChecked: true },
              { label: 'Nova requisição pendente', desc: 'Notifica sobre novas solicitações', defaultChecked: true },
              { label: 'Entrada de nota fiscal', desc: 'Confirma quando NF é registrada', defaultChecked: false },
              { label: 'Relatório semanal', desc: 'Resumo semanal por email', defaultChecked: false },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked={item.defaultChecked} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button onClick={handleSave} className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" />
              {saved ? 'Salvo!' : 'Salvar Preferências'}
            </button>
          </div>
        </div>
      )}

      {/* Supplier Modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Novo Fornecedor</h3>
              <button onClick={() => setShowSupplierModal(false)} className="text-gray-400 hover:text-gray-600">
                <Database className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSupplier} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa</label>
                <input
                  type="text"
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  className="input-field"
                  required
                  placeholder="Nome do fornecedor"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                <input
                  type="text"
                  value={supplierForm.cnpj}
                  onChange={(e) => setSupplierForm({ ...supplierForm, cnpj: e.target.value })}
                  className="input-field"
                  required
                  placeholder="00.000.000/0001-00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input
                  type="text"
                  value={supplierForm.phone}
                  onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                  className="input-field"
                  placeholder="(11) 0000-0000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={supplierForm.email}
                  onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                  className="input-field"
                  placeholder="contato@empresa.com.br"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowSupplierModal(false)} className="btn-secondary flex-1">
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
