import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/apiConfig';
import { useTranslation } from 'react-i18next';
import { 
  MessageSquareQuote, 
  ArrowLeft, 
  Download, 
  Wand2, 
  Loader2, 
  FileCheck,
  AlertCircle
} from 'lucide-react';

const VistaPreviaDialogos = () => {
  const { id } = useParams(); // ID del Escenario
  const { t } = useTranslation('scenario');
  const navigate = useNavigate();
  
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Cargar el PDF inicial desde el endpoint solicitado
  const fetchDialogo = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await api.get(`/escenarios/detalleDialogo/${id}`, {
        responseType: 'blob'
      });
      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      setPdfUrl(fileURL);
    } catch (err) {
      console.error("Error cargando diálogo:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDialogo();
    return () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl); };
  }, [id]);

  // Función para "Testear" (Regenerar y sobreescribir según tu nueva lógica)
  const testearNuevaVersion = async () => {
    setIsRegenerating(true);
    try {
      await api.get(`/escenarios/generarYGuardarDialogo/${id}`);
      // Una vez regenerado en el servidor, refrescamos el visor
      await fetchDialogo();
    } catch (err) {
      alert("Error al regenerar diálogos");
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Header de la Vista de Testeo */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/40 backdrop-blur-md p-6 rounded-[2rem] border border-white/60 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/escenarios')}
            className="p-3 bg-white text-slate-500 rounded-2xl hover:text-brand-indigo shadow-sm transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              {t('test_dialogs_title') || "Laboratorio de Diálogos"}
            </h1>
            <p className="text-slate-500 text-sm font-medium">Escenario ID: #{id}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={testearNuevaVersion}
            disabled={isRegenerating || loading}
            className="flex items-center gap-2 px-6 py-3 bg-white text-brand-indigo border border-brand-indigo/20 rounded-2xl font-bold hover:bg-brand-indigo/5 transition-all disabled:opacity-50"
          >
            {isRegenerating ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
            {t('btn_regenerate') || "Testear otra versión"}
          </button>

          <a 
            href={pdfUrl} 
            download={`Dialogos_Escenario_${id}.pdf`}
            className="flex items-center gap-2 px-6 py-3 bg-brand-indigo text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-brand-dark transition-all"
          >
            <Download size={18} />
            {t('btn_download') || "Descargar Oficial"}
          </a>
        </div>
      </div>

      {/* Área del Visor PDF */}
      <div className="bg-slate-900/5 rounded-[2.5rem] border-4 border-dashed border-white/60 h-[75vh] relative overflow-hidden flex items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-brand-indigo" size={48} />
            <p className="font-bold text-slate-500">Cargando Guion Técnico...</p>
          </div>
        ) : error ? (
          <div className="text-center space-y-4 p-8">
            <div className="bg-red-100 text-red-500 p-4 rounded-full w-fit mx-auto">
              <AlertCircle size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No se encontró el Diálogo</h3>
            <p className="text-slate-500 max-w-xs">Aún no has generado una versión para este escenario. Usa el botón superior para crear una.</p>
            <button onClick={testearNuevaVersion} className="px-8 py-3 bg-brand-indigo text-white rounded-xl font-bold">Generar Ahora</button>
          </div>
        ) : (
          <iframe 
            src={`${pdfUrl}#toolbar=0`} 
            className="w-full h-full rounded-[2rem]" 
            title="Visor de Diálogos IA"
          />
        )}
      </div>

      {/* Info de Tesis / Ayuda */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-indigo-600 rounded-[2rem] text-white flex items-center gap-6 shadow-xl shadow-indigo-100">
          <MessageSquareQuote size={40} className="opacity-50" />
          <p className="text-sm font-medium leading-relaxed">
            <b>Nota Pedagógica:</b> Los diálogos son generados basándose en el "Prompt Maestro". Si los resultados no son los esperados, puedes regenerar la versión para obtener variaciones en la actitud de los avatares.
          </p>
        </div>
        <div className="p-6 bg-white rounded-[2rem] border border-slate-100 flex items-center gap-6 shadow-sm">
          <FileCheck size={40} className="text-emerald-500 opacity-50" />
          <p className="text-sm text-slate-600 font-medium">
            Esta versión de diálogos es <b>idempotente</b>. Al guardar una nueva versión, el archivo anterior será reemplazado para mantener la integridad del escenario.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VistaPreviaDialogos;