import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/apiConfig';
import { useTranslation } from 'react-i18next';

import dayjs from 'dayjs'; 
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/es';

import { 
  FileText, 
  FileBarChart, 
  MessageSquareQuote, 
  Eye, 
  X, 
  Loader2, 
  Plus,
  Search,
  ChevronLeft,   // Importado
  ChevronRight   // Importado
} from 'lucide-react';

dayjs.extend(relativeTime);
dayjs.locale('es');

const Escenarios = () => {
  const { t } = useTranslation('scenario');
  const navigate = useNavigate();

  // Estados de Datos
  const [escenarios, setEscenarios] = useState([]);
  
  // Estados de Paginación (Nuevos)
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Estados de UI
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState('');
  const [loadingAction, setLoadingAction] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  
  // Efecto para cargar datos al montar o cambiar página
  useEffect(() => {
    fetchEscenarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]); // Dependencia clave: currentPage

  // Limpieza de memoria del PDF
  useEffect(() => {
    return () => {
      if (currentPdfUrl) URL.revokeObjectURL(currentPdfUrl);
    };
  }, [currentPdfUrl]);

  const fetchEscenarios = async () => {
    try {
      // Usamos el endpoint paginado (asegúrate de que sea /listar o /mis-escenarios según tu backend)
      const res = await api.get(`/escenarios/listar?page=${currentPage}&size=10&direction=desc`);
      
      // Mapeo seguro: Spring Data devuelve el array en la propiedad 'content'
      setEscenarios(res.data.content || []); 
      setTotalPages(res.data.totalPages || 0);
      
    } catch (err) {
      console.error("Error cargando escenarios:", err);
    }
  };

  const abrirVisor = async (id, tipo) => {
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
        // Fallback simple si no hay traducción cargada aún
        alert(t('errors.load_pdf') || "El archivo solicitado aún no ha sido generado.");
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

  // Filtrado del lado del cliente (Solo filtra lo que se ve en la página actual)
  const escenariosFiltrados = escenarios.filter(esc => 
    esc.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Manejadores de Paginación
  const handlePrevPage = () => {
    if (currentPage > 0) setCurrentPage(prev => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage(prev => prev + 1);
  };

  const btnGlassClass = "flex items-center gap-2 px-4 py-2 bg-white/50 border border-white/80 rounded-2xl text-[13px] font-extrabold text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">{t('title')}</h1>
          <p className="text-slate-500 font-medium text-sm">{t('subtitle')}</p>
        </div>

        <button 
          onClick={() => navigate('/crear-escenario')}
          className="flex items-center gap-2 px-6 py-3 bg-brand-indigo text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-brand-dark transition-all hover:scale-105 active:scale-95"
        >
          <Plus size={20} />
          <span>{t('btn_new')}</span>
        </button>
      </div>

      {/* Buscador */}
      <div className="relative group">
        <Search className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-brand-indigo transition-colors" size={20} />
        <input 
          type="text"
          placeholder={t('search_placeholder')}
          className="w-full pl-12 pr-4 py-3.5 bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-brand-indigo/20 transition-all font-medium text-slate-700"
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Grid de Escenarios */}
      <div className="grid grid-cols-1 gap-4">
        {escenariosFiltrados.map((esc) => (
          <div key={esc.id} className="bg-white/30 backdrop-blur-md border border-white/50 p-5 rounded-3xl shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-white/50 transition-all group">
            
            {/* Info Escenario */}
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/80 text-brand-indigo rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                <FileText size={24} />
              </div>
              <div>
                <h3 className="font-black text-slate-800 leading-tight">{esc.nombre || 'Sin nombre'}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {t('card.id')}: {esc.id} • {dayjs(esc.creadoEn).format('DD/MM/YYYY')} • {esc.nombreUsuario}
                </p>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex flex-wrap gap-2">
              {/* Botón 1: Ver PDF - Tono Índigo Suave */}
              <button 
                onClick={() => abrirVisor(esc.id, 'escenario')}
                // Agregamos hover:bg-indigo-50 y hover:text-indigo-600
                className={`${btnGlassClass} hover:bg-indigo-50 hover:text-indigo-600`}
                disabled={loadingAction === esc.id + '_view_escenario'}
              >
                {loadingAction === esc.id + '_view_escenario' ? <Loader2 className="animate-spin" size={16}/> : <Eye size={16} />}
                {t('card.view_pdf')}
              </button>
              
              <div className="flex gap-1">
                {/* Botón 2: Reporte - Tono Esmeralda Suave */}
                <button 
                  onClick={() => abrirVisor(esc.id, 'reporte')}
                  disabled={loadingAction === esc.id + '_view_reporte'}
                  // Cambiamos el hover sólido por hover:bg-emerald-50
                  className={`${btnGlassClass} text-emerald-700 border-emerald-100 hover:bg-emerald-50`}
                >
                  {loadingAction === esc.id + '_view_reporte' ? <Loader2 className="animate-spin" size={16}/> : <FileBarChart size={16} />}
                  {t('card.report')}
                </button>
              </div>

              <div className="flex gap-1">
                {/* Botón 3: Diálogos - Tono Púrpura Suave */}
                <button 
                  onClick={() => navigate(`/escenarios/${esc.id}/testeo-dialogos`)}
                  // Cambiamos el hover sólido por hover:bg-purple-50
                  className={`${btnGlassClass} text-purple-700 border-purple-200/50 hover:bg-purple-50`}
                >
                  <MessageSquareQuote size={16} />
                  {t('card.dialogs')}
                </button>                 
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer de Paginación */}
      {escenarios.length > 0 && (
          <div className="p-4 flex items-center justify-between bg-white/20 backdrop-blur-sm rounded-2xl border border-white/40 mt-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-2">
              Página {currentPage + 1} de {totalPages + 1}
            </span>
            
            <div className="flex gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 0}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-brand-indigo hover:text-white disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-slate-600 transition-all shadow-sm"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages - 1}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-brand-indigo hover:text-white disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-slate-600 transition-all shadow-sm"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
      )}

      {/* Modal Visor PDF */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white/80 backdrop-blur-2xl w-full max-w-5xl h-[90vh] rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl border border-white">
            <div className="p-6 border-b border-white/50 flex justify-between items-center">
              <span className="font-black text-slate-800 flex items-center gap-2">
                <FileText size={20} className="text-brand-indigo" /> {t('modal.title')}
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

export default Escenarios;