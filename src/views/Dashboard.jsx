import React, { useEffect, useState } from 'react';
import api from '../api/apiConfig';
import { 
  FilePlus, 
  Search, 
  FileText, 
  Sparkles, 
  Calendar, 
  ChevronRight,
  ArrowRight,
  FileBarChart, // Icono para reporte
  Eye,          // Icono para ver escenario
  Loader2,      // Icono de carga
  X             // Icono cerrar modal
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  // Usamos el namespace 'dashboard' definido previamente
  const { t } = useTranslation('dashboard');
  
  const [escenarios, setEscenarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const navigate = useNavigate();

  // Estados para el Modal (Visor de PDF)
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState('');
  const [loadingAction, setLoadingAction] = useState(null);

  useEffect(() => {
    fetchRecientes();
  }, []);

  // Limpieza de memoria del PDF al cerrar o desmontar
  useEffect(() => {
    return () => {
      if (currentPdfUrl) URL.revokeObjectURL(currentPdfUrl);
    };
  }, [currentPdfUrl]);

  const fetchRecientes = async () => {
    try {
      const res = await api.get('/escenarios/listar?page=0&size=6&direction=desc');
      setEscenarios(res.data.content || []);
    } catch (err) {
      console.error("Error al cargar escenarios recientes", err);
    }
  };

  // Función para abrir los reportes
  const abrirVisor = async (id, tipo, e) => {
    e.stopPropagation(); // Evita que el click se propague
    setLoadingAction(id + '_view_' + tipo);
    
    try {
        let endpoint = `/escenarios/detalle/${id}`;
        if (tipo === 'reporte') endpoint = `/escenarios/${id}/reporte-pdf`;
        
        const response = await api.get(endpoint, { responseType: 'blob' });
        const file = new Blob([response.data], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        
        setCurrentPdfUrl(fileURL);
        setModalOpen(true);
    } catch (err) {
        console.error("Error al recuperar el PDF", err);
        // Traducción del mensaje de error
        alert(t('errors.file_not_available') || "El archivo solicitado no está disponible.");
    } finally {
        setLoadingAction(null);
    }
  };

  const cerrarVisor = () => {
    setModalOpen(false);
    if (currentPdfUrl) {
        URL.revokeObjectURL(currentPdfUrl);
        setCurrentPdfUrl('');
    }
  };

  const escenariosFiltrados = escenarios.filter(esc => 
    esc.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="animate-in fade-in duration-700 pb-10">
      {/* Header del Dashboard */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            {t('title') || 'Repositorio de Escenarios'}
          </h1>
          <p className="text-slate-500 font-medium">
            {t('subtitle') || 'Gestiona tus simulaciones recientes'}
          </p>
        </div>
        
        <button 
          onClick={() => navigate('/crear-escenario')}
          className="bg-brand-indigo hover:bg-brand-dark text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95 font-bold"
        >
          <FilePlus size={20} />
          <span>{t('btn_new') || 'Nuevo Escenario'}</span>
        </button>
      </div>

      {/* Barra de Búsqueda */}
      <div className="relative mb-8 group">
        <Search className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-brand-indigo transition-colors" size={20} />
        <input 
          type="text"
          placeholder={t('search_placeholder') || 'Buscar en recientes...'}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-brand-indigo/20 transition-all font-medium text-slate-700 placeholder:text-slate-400"
        />
      </div>

      {/* Subtítulo */}
      <div className="flex justify-between items-end mb-4 px-2">
        <h2 className="text-lg font-bold text-slate-700 uppercase tracking-wider">
          {t('recent_scenarios') || 'Agregados Recientemente'}
        </h2>
        <button 
          onClick={() => navigate('/escenarios')}
          className="text-brand-indigo font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all"
        >
          {t('view_all') || 'Ver biblioteca completa'} <ArrowRight size={16}/>
        </button>
      </div>

      {/* Grid de Escenarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {escenariosFiltrados.length > 0 ? (
          escenariosFiltrados.map((esc) => (
            <div 
              key={esc.id} 
              // Quitamos el onClick del contenedor principal para evitar conflictos
              className="group bg-white/30 backdrop-blur-md border border-white/50 p-6 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:bg-white/60 transition-all duration-500 relative overflow-hidden"
            >
              {/* Fondo decorativo */}
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-indigo/5 rounded-full blur-2xl group-hover:bg-brand-indigo/10 transition-colors"></div>
              
              {/* Cabecera Tarjeta: Icono y Nombre */}
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-white/80 rounded-2xl shadow-sm text-brand-indigo group-hover:scale-110 transition-transform flex-shrink-0">
                  <FileText size={24} />
                </div>
                <div>
                   <h3 className="text-lg font-black text-slate-800 leading-tight mb-1 group-hover:text-brand-indigo transition-colors line-clamp-2">
                    {esc.nombre || t('card.no_title') || "Sin título"}
                  </h3>
                   <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <Calendar size={12} />
                    <span>{new Date(esc.creadoEn).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Cuerpo: Estado IA */}
              <div className="mb-6 pl-1">
                 <div className="flex items-center gap-1.5 text-brand-indigo font-bold text-[10px] bg-indigo-50/80 px-2.5 py-1 rounded-lg w-fit">
                  <Sparkles size={12} />
                  <span>{t('card.ia_ready') || 'IA LISTA'}</span>
                </div>
              </div>

              {/* Footer: Acciones */}
              <div className="flex items-center justify-between pt-4 border-t border-white/40">
                
                {/* Grupo de Reportes (Izquierda) */}
                <div className="flex gap-2">
                    {/* Botón 1: Ver Escenario PDF */}
                    <button 
                        onClick={(e) => abrirVisor(esc.id, 'escenario', e)}
                        className="p-2 bg-white/60 hover:bg-white text-slate-600 hover:text-brand-indigo rounded-xl transition-all shadow-sm border border-transparent hover:border-indigo-100"
                        title={t('card.view_pdf_tooltip') || "Ver PDF Escenario"}
                        disabled={loadingAction === esc.id + '_view_escenario'}
                    >
                        {loadingAction === esc.id + '_view_escenario' ? <Loader2 className="animate-spin" size={18}/> : <Eye size={18} />}
                    </button>

                    {/* Botón 2: Ver Reporte Analítico */}
                    <button 
                        onClick={(e) => abrirVisor(esc.id, 'reporte', e)}
                        className="p-2 bg-white/60 hover:bg-white text-slate-600 hover:text-emerald-600 rounded-xl transition-all shadow-sm border border-transparent hover:border-emerald-100"
                        title={t('card.view_report_tooltip') || "Ver Reporte Analítico"}
                        disabled={loadingAction === esc.id + '_view_reporte'}
                    >
                        {loadingAction === esc.id + '_view_reporte' ? <Loader2 className="animate-spin" size={18}/> : <FileBarChart size={18} />}
                    </button>
                </div>
                
                {/* Botón Navegación (Derecha) */}
                <button 
                  onClick={() => navigate(`/escenarios/${esc.id}/testeo-dialogos`)}
                  className="p-2 bg-brand-indigo text-white rounded-xl shadow-md shadow-indigo-200 hover:bg-brand-dark hover:scale-105 active:scale-95 transition-all flex items-center gap-1 pl-3"
                  title={t('card.go_to_lab_tooltip') || "Ir al Laboratorio de Diálogos"}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">
                    {t('card.manage') || 'Gestionar'}
                  </span>
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white/20 backdrop-blur-sm rounded-[3rem] border border-dashed border-white/60">
            <p className="text-slate-400 font-bold">
              {t('no_data') || 'No hay escenarios recientes'}
            </p>
          </div>
        )}
      </div>

      {/* Modal Visor PDF */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white/80 backdrop-blur-2xl w-full max-w-5xl h-[90vh] rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl border border-white">
            <div className="p-6 border-b border-white/50 flex justify-between items-center">
              <span className="font-black text-slate-800 flex items-center gap-2">
                <FileText size={20} className="text-brand-indigo" /> 
                {t('modal.title') || 'Visor de Documentos'}
              </span>
              <button onClick={cerrarVisor} className="p-2 hover:bg-red-50 text-red-500 rounded-xl transition-all">
                <X size={24} />
              </button>
            </div>
            <iframe src={currentPdfUrl} className="flex-1 w-full h-full bg-white/50" title="Visor PDF" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;