import React, { useState } from 'react';
import { LogIn } from 'lucide-react';

export const LoginPage: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6">Iniciar Sesión</h2>
        <div className="space-y-4">
          <input type="text" placeholder="Usuario" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white" />
          <input type="password" placeholder="Contraseña" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white" />
          <button 
            onClick={onLogin}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5"/> Entrar
          </button>
        </div>
      </div>
    </div>
  );
};
