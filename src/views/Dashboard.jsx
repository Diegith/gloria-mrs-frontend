import React, { useEffect, useState } from 'react';
import api from '../api/apiConfig';
import { 
  FilePlus, 
  Search, 
  MoreVertical, 
  FileText, 
  Sparkles, 
  Calendar, 
  ChevronRight 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // 1. Importar Hook

const Dashboard = () => {
  const { t } = useTranslation('scenario'); // 2. Inicializar Namespace 'scenario'
  const [escenarios, setEscenarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchEscenarios();
  }, []);

  const fetchEscenarios = async () => {
    try {
      const res = await api.get('/escenarios/listar');
      setEscenarios(res.data);
    } catch (err) {
      console.error("Error al cargar escenarios", err);
    }
  };

  const escenariosFiltrados = escenarios.filter(esc => 
    esc.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="animate-in fade-in duration-700">
      {/* Header del Dashboard */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            {t('title')} {/* 3. Traducción: Repositorio de Escenarios / Scenario Repository */}
          </h1>
          <p className="text-slate-500 font-medium">
            {t('subtitle')} {/* 4. Traducción: Gestiona... / Manage... */}
          </p>
        </div>
        
        <button 
          onClick={() => navigate('/crear-escenario')}
          className="bg-brand-indigo hover:bg-brand-dark text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95 font-bold"
        >
          <FilePlus size={20} />
          <span>{t('btn_new')}</span> {/* 5. Traducción: Nuevo Escenario / New Scenario */}
        </button>
      </div>

      {/* Barra de Búsqueda Glass */}
      <div className="relative mb-8 group">
        <Search className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-brand-indigo transition-colors" size={20} />
        <input 
          type="text"
          placeholder={t('search_placeholder')} // 6. Traducción dinámica del placeholder
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-brand-indigo/20 transition-all font-medium text-slate-700 placeholder:text-slate-400"
        />
      </div>

      {/* Grid de Escenarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {escenariosFiltrados.length > 0 ? (
          escenariosFiltrados.map((esc) => (
            <div 
              key={esc.id} 
              className="group bg-white/30 backdrop-blur-md border border-white/50 p-6 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:bg-white/50 transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-indigo/5 rounded-full blur-2xl group-hover:bg-brand-indigo/10 transition-colors"></div>
              
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-white/80 rounded-2xl shadow-sm text-brand-indigo">
                  <FileText size={24} />
                </div>
                <button className="text-slate-400 hover:text-slate-600 p-1">
                  <MoreVertical size={20} />
                </button>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-black text-slate-800 leading-tight mb-1 group-hover:text-brand-indigo transition-colors">
                  {esc.nombre || "Sin título"}
                </h3>
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <Calendar size={12} />
                  <span>{new Date(esc.creadoEn).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/40">
                <div className="flex items-center gap-1.5 text-brand-indigo font-bold text-xs bg-indigo-50/50 px-2.5 py-1 rounded-lg">
                  <Sparkles size={14} />
                  <span>{t('card.ia_ready')}</span> {/* 7. Traducción: IA Lista / AI Ready */}
                </div>
                
                <button 
                  onClick={() => navigate('/escenarios')}
                  className="p-2 bg-brand-indigo text-white rounded-xl shadow-md shadow-indigo-100 hover:bg-brand-dark transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white/20 backdrop-blur-sm rounded-[3rem] border border-dashed border-white/60">
            <p className="text-slate-400 font-bold">No data found...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;