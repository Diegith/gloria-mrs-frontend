import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Ghost, Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="bg-white/30 backdrop-blur-xl border border-white/60 p-12 rounded-[3rem] shadow-2xl max-w-lg w-full text-center space-y-8 animate-in zoom-in-95 duration-500">
        
        <div className="relative inline-block">
          <div className="text-9xl font-black text-brand-indigo/10 select-none">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Ghost size={80} className="text-brand-indigo animate-bounce" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">¡Vaya! Ruta perdida</h1>
          <p className="text-slate-500 font-medium leading-relaxed">
            Parece que el escenario que buscas no existe o ha sido movido por la IA.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white/50 hover:bg-white text-slate-700 rounded-2xl font-bold border border-white/80 transition-all active:scale-95"
          >
            <ArrowLeft size={18} />
            Volver
          </button>
          
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-indigo hover:bg-brand-dark text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95"
          >
            <Home size={18} />
            Ir al Inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;