import React from 'react';
import { Bot } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-50/50 backdrop-blur-2xl">
      <div className="relative">
        {/* Círculos de pulso decorativos */}
        <div className="absolute inset-0 bg-brand-indigo/20 rounded-full animate-ping scale-150 opacity-20"></div>
        <div className="absolute inset-0 bg-brand-indigo/10 rounded-full animate-pulse scale-125"></div>
        
        {/* Icono Central */}
        <div className="relative bg-white/40 backdrop-blur-md border border-white p-6 rounded-[2rem] shadow-2xl text-brand-indigo">
          <Bot size={48} className="animate-bounce" />
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <h2 className="text-xl font-black text-slate-800 tracking-tight animate-pulse">Iniciando GlorIA 2.0</h2>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">Cargando ecosistema de simulación...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;