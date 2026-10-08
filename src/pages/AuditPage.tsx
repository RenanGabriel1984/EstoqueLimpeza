import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Search, Filter, Clock, User, Package, FileText, ClipboardList, MapPin } from 'lucide-react';

export const AuditPage = () => {
  const { auditLogs } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const filteredLogs = auditLogs.filter(log => {
    const matchSearch = log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       log.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchAction = actionFilter === 'all' || log.action === actionFilter;
    return matchSearch && matchAction;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create': return <Package className="w-4 h-4 text-green-500" />;
      case 'update': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'delete': return <Package className="w-4 h-4 text-red-500" />;
      case 'entry': return <Package className="w-4 h-4 text-green-500" />;
      case 'request': return <ClipboardList className="w-4 h-4 text-amber-500" />;
      case 'approve': return <ClipboardList className="w-4 h-4 text-green-500" />;
      case 'reject': return <ClipboardList className="w-4 h-4 text-red-500" />;
      case 'inventory': return <MapPin className="w-4 h-4 text-purple-500" />;
      default: return <Shield className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      create: 'Criação',
      update: 'Atualização',
      delete: 'Exclusão',
      entry: 'Entrada',
      request: 'Requisição',
      approve: 'Aprovação',
      reject: 'Rejeição',
      inventory: 'Inventário',
    };
    return labels[action] || action;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-800">Log de Auditoria</h2>
        <p className="text-sm text-gray-500">Histórico completo de todas as ações no sistema</p>
      </div>

      {/* Info */}
      <div className="card bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-indigo-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-indigo-800">Rastreabilidade Completa</p>
            <p className="text-xs text-indigo-600 mt-1">
              Todas as ações realizadas no sistema são registradas com data, hora e usuário responsável.
              Isso garante transparência e segurança no controle do estoque.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por usuário ou ação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">Todas as Ações</option>
            <option value="create">Criação</option>
            <option value="update">Atualização</option>
            <option value="delete">Exclusão</option>
            <option value="entry">Entrada</option>
            <option value="request">Requisição</option>
            <option value="approve">Aprovação</option>
            <option value="reject">Rejeição</option>
            <option value="inventory">Inventário</option>
          </select>
        </div>
      </div>

      {/* Logs */}
      <div className="card overflow-hidden p-0">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma ação registrada ainda</p>
            <p className="text-xs mt-1">As ações aparecerão aqui conforme o uso do sistema</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredLogs.map(log => (
              <div key={log.id} className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors">
                <div className="mt-0.5">
                  {getActionIcon(log.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800">{log.details}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {log.userName}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </span>
                    <span className="badge badge-info text-[10px]">
                      {getActionLabel(log.action)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
