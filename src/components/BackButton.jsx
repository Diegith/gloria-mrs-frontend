import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button 
      onClick={() => navigate(-1)} // Regresa a la página anterior
      className="flex items-center gap-2 px-4 py-2 bg-white/40 hover:bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl text-slate-600 font-bold text-sm transition-all hover:-translate-x-1 active:scale-95 shadow-sm group"
    >
      <ArrowLeft size={18} className="group-hover:text-brand-indigo transition-colors" />
      <span>Volver</span>
    </button>
  );
};

export default BackButton;