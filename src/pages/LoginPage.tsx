import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, Mail, Eye, EyeOff, Shield } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Preencha todos os campos');
      return;
    }
    const success = login(email, password);
    if (!success) {
      setError('Email ou senha incorretos');
    }
  };

  const handleRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoverySent(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">SGGD</h1>
          <p className="text-blue-200 text-sm mt-1">Secretaria de Gestão e Governo Digital</p>
          <p className="text-blue-300 text-xs mt-1">Sistema de Gestão de Estoque</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {!showRecovery ? (
            <>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Acessar Sistema</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field pl-10"
                      placeholder="seu@email.gov.br"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field pl-10 pr-10"
                      placeholder="••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                <button type="submit" className="btn-primary w-full py-3 text-base">
                  Entrar
                </button>
              </form>
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowRecovery(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Esqueci minha senha
                </button>
              </div>
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 font-medium mb-2">Contas de demonstração:</p>
                <div className="space-y-1 text-xs text-gray-600">
                  <p><span className="font-medium">Secretário:</span> secretario@sggd.gov.br</p>
                  <p><span className="font-medium">Diretor:</span> diretor@sggd.gov.br</p>
                  <p><span className="font-medium">Técnico:</span> tecnico@sggd.gov.br</p>
                  <p><span className="font-medium">Copa:</span> copa@sggd.gov.br</p>
                  <p className="text-gray-400 mt-1">Senha: 123456</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Recuperar Senha</h2>
              <p className="text-sm text-gray-500 mb-6">Informe seu email para receber as instruções de recuperação.</p>
              {recoverySent ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-gray-700 font-medium">Email enviado!</p>
                  <p className="text-sm text-gray-500 mt-2">Verifique sua caixa de entrada.</p>
                  <button
                    onClick={() => { setShowRecovery(false); setRecoverySent(false); }}
                    className="btn-primary mt-4"
                  >
                    Voltar ao Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRecovery} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        className="input-field pl-10"
                        placeholder="seu@email.gov.br"
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary w-full py-3">
                    Enviar Instruções
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRecovery(false)}
                    className="btn-secondary w-full py-3"
                  >
                    Voltar ao Login
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
