import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/apiConfig';
import { useTranslation } from 'react-i18next';
import { 
  FileText, 
  FileBarChart, 
  MessageSquareQuote, 
  Eye, 
  X, 
  Loader2, 
  Plus,
  Search,
  RefreshCw 
} from 'lucide-react';

const Escenarios = () => {
  const { t } = useTranslation('scenario');
  const [escenarios, setEscenarios] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState('');
  const [loadingAction, setLoadingAction] = useState(null);
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

  const abrirVisor = async (id, tipo) => {
    setLoadingAction(id + '_view_' + tipo);
    try {
        let endpoint = `/escenarios/detalle/${id}`;
        // El reporte sigue abriéndose en el modal para visualización rápida
        if (tipo === 'reporte') endpoint = `/escenarios/${id}/reporte-pdf`;
        
        const response = await api.get(endpoint, {
          responseType: 'blob' 
        });

        const file = new Blob([response.data], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        
        setCurrentPdfUrl(fileURL);
        setModalOpen(true);
    } catch (err) {
        console.error("Error al recuperar el PDF", err);
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

  const ejecutarAccionIA = async (id, tipo) => {
    setLoadingAction(id + tipo);
    try {
      const endpoint = tipo === 'reporte' 
        ? `/escenarios/generarYGuardarReporteGeneral/${id}`
        : `/escenarios/generarYGuardarDialogo/${id}`;

      await api.get(endpoint);
      alert(t('card.ia_ready'));
      fetchEscenarios();
    } catch (err) {
      alert(t('errors.ia_process') || "Error al procesar con IA");
    } finally {
      setLoadingAction(null);
    }
  };

  const escenariosFiltrados = escenarios.filter(esc => 
    esc.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
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

      <div className="relative group">
        <Search className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-brand-indigo transition-colors" size={20} />
        <input 
          type="text"
          placeholder={t('search_placeholder')}
          className="w-full pl-12 pr-4 py-3.5 bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-brand-indigo/20 transition-all font-medium text-slate-700"
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {escenariosFiltrados.map((esc) => (
          <div key={esc.id} className="bg-white/30 backdrop-blur-md border border-white/50 p-5 rounded-3xl shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-white/50 transition-all group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/80 text-brand-indigo rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                <FileText size={24} />
              </div>
              <div>
                <h3 className="font-black text-slate-800 leading-tight">{esc.nombre || 'Sin nombre'}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {t('card.id')}: {esc.id} • {new Date(esc.creadoEn).toLocaleDateString()} • {esc.nombreUsuario}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => abrirVisor(esc.id, 'escenario')}
                className="btn-glass"
                disabled={loadingAction === esc.id + '_view_escenario'}
              >
                {loadingAction === esc.id + '_view_escenario' ? <Loader2 className="animate-spin" size={16}/> : <Eye size={16} />}
                {t('card.view_pdf')}
              </button>
              
              <div className="flex gap-1">
                <button 
                  onClick={() => abrirVisor(esc.id, 'reporte')}
                  disabled={loadingAction === esc.id + '_view_reporte'}
                  className="btn-glass text-emerald-700 hover:bg-emerald-500 hover:text-white"
                >
                  {loadingAction === esc.id + '_view_reporte' ? <Loader2 className="animate-spin" size={16}/> : <FileBarChart size={16} />}
                  {t('card.report')}
                </button>
              </div>

              <div className="flex gap-1">
                <button 
                  /* ADAPTACIÓN: Navegación a la vista de Laboratorio/Testeo.
                     Asegúrate de que la ruta en App.js sea '/escenarios/:id/testeo-dialogos'
                  */
                  onClick={() => navigate(`/escenarios/${esc.id}/testeo-dialogos`)}
                 className="btn-glass text-purple-700 border-purple-200/50 hover:bg-purple-600 hover:text-white"
                >
                  <MessageSquareQuote size={16} />
                  {t('card.dialogs')}
                </button>                
                
              </div>
            </div>
          </div>
        ))}
      </div>

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

const style = document.createElement('style');
style.innerHTML = `
  .btn-glass {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    background: rgba(255, 255, 255, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.8);
    border-radius: 16px;
    font-size: 13px;
    font-weight: 800;
    color: #475569;
    transition: all 0.3s ease;
  }
  .btn-glass:hover {
    background: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }
  .btn-glass:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
document.head.appendChild(style);

export default Escenarios;