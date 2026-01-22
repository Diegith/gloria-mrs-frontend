import React, { useState, useEffect } from 'react';
import { Wand2, Users, BookOpen, MessageSquare, Loader2, FileDown, Plus, Trash2, RefreshCw, CheckCircle2, CloudUpload } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next'; 
import { useNavigate } from 'react-router-dom';

const CrearEscenario = () => {
  const [paso, setPaso] = useState(1);
  const [loading, setLoading] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [vistaPrevia, setVistaPrevia] = useState(false);
  const [escenarioData, setEscenarioData] = useState(null);
  const [escenarios, setEscenarios] = useState([]);
  const navigate = useNavigate();
  
  const { t } = useTranslation('scenario');
  
  const api = axios.create({
    baseURL: "/api/",
    timeout: 120000, 
  });


  useEffect(() => {
    fetchEscenarios();
  }, []);

  const fetchEscenarios = async () => {
    try {
        const token = localStorage.getItem('token'); // Recuperar el token
        const response = await api.get('escenarios/listar', {
            headers: {
                'Authorization': `Bearer ${token}` // ¡Esto es lo que falta!
            }
        });
        setEscenarios(response.data);
    } catch (error) {
        console.error("Error al cargar escenarios", error);
    }
};

  const [formData, setFormData] = useState({
    titulo: '',
    autores: '', 
    area: '',
    duracion: '',
    idioma: '',
    rolParticipante: '', 
    descripcionEscenario: '', 
    objetivos: [{ objetivo: '', resultado: '' }],
    avatares: [{ nombre: '', actitud: '', secreto: '' }],
    logica: { disparador: '', reaccion: '' }
  });

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleObjetivoChange = (index, e) => {
    const { name, value } = e.target;
    const nuevosObjetivos = [...formData.objetivos];
    nuevosObjetivos[index][name] = value;
    setFormData({ ...formData, objetivos: nuevosObjetivos });
  };

  const handleAvatarChange = (index, e) => {
    const { name, value } = e.target;
    const nuevosAvatares = [...formData.avatares];
    nuevosAvatares[index][name] = value;
    setFormData({ ...formData, avatares: nuevosAvatares });
  };

  const handleLogicaChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, logica: { ...formData.logica, [name]: value } });
  };

  const agregarAvatar = () => {
    setFormData({ ...formData, avatares: [...formData.avatares, { nombre: '', actitud: '', secreto: '' }] });
  };

  const eliminarAvatar = (index) => {
    if (formData.avatares.length > 1) {
      setFormData({ ...formData, avatares: formData.avatares.filter((_, i) => i !== index) });
    }
  };

  const enviarAGlorIA = async () => {
    if (!formData.titulo.trim() || !formData.descripcionEscenario.trim()) {
      Swal.fire(
        t('alerts.validation_error_title'), 
        t('alerts.validation_error_text'), 
        'warning'
      );
      return; // Detiene la ejecución si el formulario no es válido
    }

    const token = localStorage.getItem('token');
    setLoading(true);
    setProgreso(0);
    const intervalo = setInterval(() => setProgreso((p) => (p >= 95 ? p : p + 1)), 800);

    try {
      const response = await api.post('escenarios/generar-ia-json', formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setEscenarioData(response.data);
      setVistaPrevia(true);
      clearInterval(intervalo);
      setProgreso(100);
      Swal.fire(t('alerts.generation_success_title'), t('alerts.generation_success_text'), 'success');
    } catch (error) {
      clearInterval(intervalo);
      Swal.fire(t('alerts.generation_error_title'), t('alerts.generation_error_text'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const procesarFinalizarGuardar = async () => {
    const token = localStorage.getItem('token');
    if (!escenarioData) return;

    const nuevoTitulo = escenarioData.formData.titulo.trim();

    let escenariosFrescos = [];

    try {
        const res = await api.get('escenarios/listar', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        escenariosFrescos = res.data; 
    } catch (err) {
        console.error("Error consultando duplicados", err);
        escenariosFrescos = [];
    }

    const existeDuplicado = escenariosFrescos.some(
      (esc) => esc && esc.nombre && esc.nombre.trim().toLowerCase() === nuevoTitulo.toLowerCase()
    );

    if (existeDuplicado) {
      return Swal.fire({
        title: t('alerts.duplicate_title'),
        text: t('alerts.duplicate_text'),
        icon: 'warning',
        confirmButtonColor: '#4f46e5'
      });
    }

    // 2. INICIAR SWAL CON BARRA DE PROGRESO
    Swal.fire({
      title: t('alerts.saving_title'),
      html: `
        <div class="mt-4">
          <div class="flex justify-between text-[10px] font-black text-indigo-600 uppercase mb-1">
            <span id="progress-text">${t('alerts.preparing_pdf')}</span>
            <span id="progress-percent">0%</span>
          </div>
          <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div id="progress-bar" class="h-full bg-indigo-600 transition-all duration-500" style="width: 0%"></div>
          </div>
        </div>
      `,
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Función auxiliar para actualizar la UI del Swal
    const updateProgress = (percent, text) => {
      const bar = document.getElementById('progress-bar');
      const txt = document.getElementById('progress-text');
      const per = document.getElementById('progress-percent');
      if (bar) bar.style.width = `${percent}%`;
      if (txt) txt.innerText = text;
      if (per) per.innerText = `${percent}%`;
    };

    try {
      // FASE 1: Generación del PDF en el Backend
      updateProgress(20, t('alerts.generating_pdf_file'));
      const response = await api.post('escenarios/generar-pdf-desde-json', escenarioData, {
        headers: { 'Authorization': `Bearer ${token}` },
        responseType: 'blob'
      });

      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      
      // FASE 2: Descarga Local
      updateProgress(50, t('alerts.downloading_local'));
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Escenario_${nuevoTitulo}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // FASE 3: Subida al servidor (Guardado en DB y Carpeta)
      updateProgress(75, t('alerts.uploading_server'));
      const formDataUpload = new FormData();
      const pdfFile = new File([pdfBlob], `${nuevoTitulo}.pdf`, { type: 'application/pdf' });
      formDataUpload.append('file', pdfFile);
      
      const metadata = { 
        nombre: nuevoTitulo, 
        idioma: escenarioData.formData.idioma
      };
      formDataUpload.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));

      await api.post('escenarios/crear/upload', formDataUpload, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' 
        }
      });

      // ÉXITO FINAL
      updateProgress(100, t('alerts.completed'));
      
      // Refrescamos la lista global de escenarios para que el nuevo aparezca
      if (typeof fetchEscenarios === 'function') {
        await fetchEscenarios();
      }

      setTimeout(() => {
        Swal.fire({
          title: t('alerts.process_completed_title'),
          text: t('alerts.process_completed_text'),
          icon: 'success',
          confirmButtonColor: '#4f46e5'
        }).then((result) => {
          // Si el usuario presiona el botón o cierra la alerta
          if (result.isConfirmed || result.isDismissed) {
            navigate('/escenarios'); // Redirección a la vista de escenarios
          }
        });
      }, 600);

    } catch (error) {
      console.error("Error en el proceso de guardado:", error);
      Swal.fire({
        title: t('alerts.error_title'),
        text: t('alerts.save_error_text'), // Asegúrate de tener esta llave
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      });
    }
  };

  // --- VISTA PREVIA (RESULTADO IA) ---
  if (vistaPrevia && escenarioData) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
        {/* Cabecera Principal */}
        <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl flex justify-between items-center border-b-4 border-indigo-500">
          <div>
            <h2 className="text-3xl font-black italic">{escenarioData.formData.titulo}</h2>
            <p className="text-indigo-300 text-xs font-bold mt-1">{t('preview.generated_by')}</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setVistaPrevia(false)} disabled={loading} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-xs font-bold transition-all flex items-center gap-2">
              <RefreshCw size={16} /> {t('preview.buttons.adjust')}
            </button>
            <button onClick={procesarFinalizarGuardar} disabled={loading} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-xs font-black shadow-lg flex items-center gap-2 transition-all">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <CloudUpload size={18} />}
              {t('preview.buttons.finish_save')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Narrativa y Objetivos */}
            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h3 className="text-indigo-600 font-black text-xs uppercase mb-4 tracking-widest">{t('preview.sections.description')}</h3>
              <p className="text-slate-600 leading-relaxed italic mb-6">"{escenarioData.formData.descripcionEscenario}"</p>

              <h3 className="text-indigo-600 font-black text-xs uppercase mb-4 tracking-widest">{t('preview.sections.objectives')}</h3>
              <div className="grid grid-cols-1 gap-3">
                {escenarioData.formData.objetivos.map((obj, i) => (
                  <div key={i} className="flex gap-3 items-start p-3 bg-slate-50 rounded-xl">
                    <CheckCircle2 className="text-indigo-500 mt-1" size={16} />
                    <div>
                      <p className="text-sm font-bold text-slate-700">{obj.objetivo}</p>
                      <p className="text-xs text-slate-500">{obj.resultado}</p>
                    </div>
                  </div>
                ))}
                <h3 className="text-indigo-600 font-black text-xs uppercase mb-4 tracking-widest">{t('preview.sections.behaviors_knowledge_title')}</h3>
                <p className="text-s text-gray-700 mt-1">{t('preview.sections.behaviors_knowledge_desc')}</p>
                <p className="text-xs text-gray-700 mt-1 italic">{escenarioData.formData.comportamientosYConocimientos}</p>
              </div>
            </section>

            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h3 className="text-green-600 font-black text-xs uppercase mb-4 tracking-widest">{t('preview.sections.content_title')}</h3>
              <p className="text-s text-gray-700 mt-1">{t('preview.sections.content_desc')}</p>
              <div className="space-y-4"> 
                  <div className="p-4 bg-green-50/50 rounded-2xl border-l-4 border-green-500">
                    <p className="text-sm font-bold text-slate-800">{escenarioData.formData.contenido}</p>
                  </div>
              </div>
            </section>

            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h3 className="text-green-600 font-black text-xs uppercase mb-4 tracking-widest">{t('preview.sections.environment_title')}</h3>
              <div className="space-y-4">
                {escenarioData.formData.escenarios.map((e, i) => (
                  <div key={i} className="p-4 bg-green-50/50 rounded-2xl border-l-4 border-green-500">
                    <p className="text-sm font-bold text-slate-800">{e.escenario}</p>
                  </div>
                ))}
                <p className="text-xs text-gray-700 mt-1 italic">{t('preview.questions.pre_simulation')}</p>
                <p className="text-xs text-green-700 mt-1 italic">{escenarioData.formData.preSimulacion}</p>

                <p className="text-xs text-gray-700 mt-1 italic">{t('preview.questions.previous_knowledge')}</p>
                <p className="text-xs text-green-700 mt-1 italic">{escenarioData.formData.conocimientosPrevios}</p>

                <p className="text-xs text-gray-700 mt-1 italic">{t('preview.questions.during_simulation')}</p>
                <p className="text-xs text-green-700 mt-1 italic">{escenarioData.formData.comportamientosSimulacion}</p>
                
                <p className="text-xs text-gray-700 mt-1 italic">{t('preview.questions.end_simulation')}</p>
                <p className="text-xs text-green-700 mt-1 italic">{escenarioData.formData.finalSimulacion}</p>
              </div>
            </section>

            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h3 className="text-green-600 font-black text-xs uppercase mb-4 tracking-widest">{t('preview.sections.characters_title')}</h3>
              <div className="space-y-4">
                <p className="text-xs text-gray-700 mt-1 italic">{t('preview.labels.adults')}</p>
                <p className="text-xs text-green-700 mt-1 italic">{escenarioData.formData.personajesAdultos}</p>

                <p className="text-xs text-gray-700 mt-1 italic">{t('preview.labels.children_youth')}</p>
                <p className="text-xs text-green-700 mt-1 italic">{escenarioData.formData.personajesNinosJovenes}</p>

                <p className="text-xs text-gray-700 mt-1 italic">{t('preview.labels.difficulty')}</p>
                <p className="text-xs text-green-700 mt-1 italic">{escenarioData.formData.dificultad}</p> 
              </div>
            </section>
            
            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h3 className="text-green-600 font-black text-xs uppercase mb-4 tracking-widest">{t('preview.sections.feedback_alignment')}</h3>
              <div className="space-y-4">
                <p className="text-xs text-gray-700 mt-1 italic">{t('preview.questions.feedback_type')}</p>
                <p className="text-xs text-green-700 mt-1 italic">{escenarioData.formData.retroalimentacionDocente}</p>

                <p className="text-xs text-gray-700 mt-1 italic">{t('preview.questions.post_simulation')}</p>
                <p className="text-xs text-green-700 mt-1 italic">{escenarioData.formData.accionesPostSimulacion}</p>
              </div>
            </section>

            {/* MATRIZ POSITIVA */}
            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                  <CheckCircle2 size={20} />
                </div>
                <h3 className="text-slate-800 font-black text-sm uppercase tracking-widest">
                  {t('preview.matrix.embedded_actions')}
                </h3>
              </div>
              <p className="text-xs text-green-700 mb-6 italic">{t('preview.matrix.embedded_desc')}</p>
              
              <h3 className="text-slate-800 font-black text-sm uppercase tracking-widest mb-4">{t('preview.matrix.positive_title')}</h3>
              <div className="overflow-x-auto -mx-4 md:mx-0">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-green-600 text-white font-bold uppercase text-[10px] tracking-tighter">
                      <th className="p-4 rounded-tl-2xl">{t('preview.matrix.table.objective')}</th>
                      <th className="p-4">{t('preview.matrix.table.trigger_student')}</th>
                      <th className="p-4">{t('preview.matrix.table.pos_response')}</th>
                      <th className="p-4">{t('preview.matrix.table.neg_response')}</th>
                      <th className="p-4 rounded-tr-2xl">{t('preview.matrix.table.example')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {escenarioData.positivos && escenarioData.positivos.length > 0 ? (
                      escenarioData.positivos.map((item, index) => (
                        <tr key={index} className="hover:bg-green-50/40 transition-colors duration-200">
                          <td className="p-4 text-xs font-bold text-slate-700 align-top w-[15%]">
                            {item.objetivo || t('preview.labels.general')}
                          </td>
                          <td className="p-4 text-[11px] text-slate-600 italic align-top w-[20%]">
                            {item.activador}
                          </td>
                          <td className="p-4 text-[11px] text-green-700 font-medium align-top w-[25%] bg-green-50/20">
                            {item.respuestaPositiva}
                          </td>
                          <td className="p-4 text-[11px] text-red-600 align-top w-[20%]">
                            {item.respuestaNegativa || "N/A"}
                          </td>
                          <td className="p-4 text-[10px] text-slate-500 leading-relaxed align-top w-[20%]">
                            <span className="bg-slate-100 px-2 py-1 rounded-md block mb-1 font-bold text-[9px] w-fit">{t('preview.labels.example_tag')}</span>
                            {item.ejemplo}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-slate-400 italic">{t('preview.matrix.no_data')}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* MATRIZ NEGATIVA */}
            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                  <MessageSquare size={20} />
                </div>
                <h3 className="text-slate-800 font-black text-sm uppercase tracking-widest">
                  {t('preview.matrix.negative_title')}
                </h3>
              </div>

              <div className="overflow-x-auto -mx-4 md:mx-0">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-red-600 text-white font-bold uppercase text-[10px] tracking-tighter">
                      <th className="p-4 rounded-tl-2xl">{t('preview.matrix.table.objective')}</th>
                      <th className="p-4">{t('preview.matrix.table.trigger_error')}</th>
                      <th className="p-4">{t('preview.matrix.table.hostile_reaction')}</th>
                      <th className="p-4">{t('preview.matrix.table.recovery_plan')}</th>
                      <th className="p-4 rounded-tr-2xl">{t('preview.matrix.table.example_fail')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {escenarioData.negativos && escenarioData.negativos.length > 0 ? (
                      escenarioData.negativos.map((item, index) => (
                        <tr key={index} className="hover:bg-red-50/40 transition-colors duration-200">
                          <td className="p-4 text-xs font-bold text-slate-700 align-top w-[15%]">
                            {item.objetivo || t('preview.labels.general')}
                          </td>
                          <td className="p-4 text-[11px] text-red-700 italic align-top w-[20%]">
                            {item.activador}
                          </td>
                          <td className="p-4 text-[11px] text-slate-600 align-top w-[20%] bg-red-50/10">
                            {item.respuestaNegativa}
                          </td>
                          <td className="p-4 text-[11px] text-indigo-700 font-semibold align-top w-[25%] bg-indigo-50/30">
                            <div className="flex gap-1 items-start">
                              <RefreshCw size={12} className="mt-0.5 shrink-0" />
                              {item.recuperacion || t('preview.labels.no_plan')}
                            </div>
                          </td>
                          <td className="p-4 text-[10px] text-slate-500 leading-relaxed align-top w-[20%]">
                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-md block mb-1 font-bold text-[9px] w-fit">{t('preview.labels.alert_tag')}</span>
                            {item.ejemplo}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-slate-400 italic">{t('preview.matrix.no_error_data')}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Sidebar: Avatares y Feedback */}
          <div className="space-y-6">
            <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl">
              <h3 className="font-black text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
                <Users size={18}/> {t('preview.sidebar.avatar_profiles')}
              </h3>
              <div className="space-y-6 text-xs leading-relaxed opacity-90">
                {escenarioData.formData.comportamientosSimulacion.split('\n').map((parrafo, i) => (
                  <p key={i}>{parrafo}</p>
                ))}
              </div>
            </div>

            <div className="bg-slate-100 p-8 rounded-[2.5rem] border border-slate-200">
              <h3 className="text-slate-400 font-black text-[10px] uppercase mb-4 tracking-widest">{t('preview.sidebar.feedback_guide')}</h3>
              <p className="text-xs text-slate-600 leading-tight italic">
                {escenarioData.formData.retroalimentacionDocente}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- VISTA FORMULARIO ---
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-800 italic tracking-tight">{t('create.main_title')}</h1>
          <p className="text-slate-500 font-medium">{t('create.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map((num) => (
            <div key={num} className={`w-10 h-2 rounded-full transition-all ${paso >= num ? 'bg-indigo-600' : 'bg-slate-200'}`} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6 bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl">
          
          {paso === 1 && (
            <div className="space-y-5 animate-in slide-in-from-right-4">
              <div className="flex items-center gap-2 text-indigo-600 mb-2 font-bold uppercase text-[10px] tracking-widest">
                <BookOpen size={18} /> {t('create.step1.label')}
              </div>
              <input name="titulo" value={formData.titulo} onChange={handleInputChange} type="text" placeholder={t('create.step1.placeholders.title')} className="w-full p-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none" />
              <div className="grid grid-cols-2 gap-4">
                <input name="autores" value={formData.autores} onChange={handleInputChange} type="text" placeholder={t('create.step1.placeholders.authors')} className="p-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-200 outline-none" />
                <input name="area" value={formData.area} onChange={handleInputChange} type="text" placeholder={t('create.step1.placeholders.area')} className="p-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-200 outline-none" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <select name="idioma" value={formData.idioma} onChange={handleInputChange} className="p-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-200 outline-none">
                  <option value="Español">{t('languages.spanish')}</option>
                  <option value="Inglés">{t('languages.english')}</option>
                </select>
                <input name="duracion" value={formData.duracion} onChange={handleInputChange} type="number" placeholder={t('create.step1.placeholders.minutes')} className="p-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-200 outline-none" />
                <input name="rolParticipante" value={formData.rolParticipante} onChange={handleInputChange} type="text" placeholder={t('create.step1.placeholders.role')} className="p-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-200 outline-none" />
              </div>
              <textarea name="descripcionEscenario" value={formData.descripcionEscenario} onChange={handleInputChange} placeholder={t('create.step1.placeholders.description')} className="w-full p-4 h-28 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-200 outline-none" />
            <div className="space-y-3 pt-4">

            <div className="flex justify-between items-center">
              <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">{t('create.step1.pedagogical_objectives')}</p>
              <button 
                onClick={() => setFormData({...formData, objetivos: [...formData.objetivos, {objetivo: '', resultado: ''}]})}
                className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200"
              >
                <Plus size={16}/>
              </button>
            </div>
            {formData.objetivos.map((obj, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in">
                <input 
                  value={obj.objetivo} 
                  onChange={(e) => handleObjetivoChange(i, e)} 
                  name="objetivo"
                  placeholder={t('create.step1.placeholders.objective')} 
                  className="p-3 bg-slate-50 rounded-xl text-sm ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-indigo-600" 
                />
                <input 
                  value={obj.resultado} 
                  onChange={(e) => handleObjetivoChange(i, e)} 
                  name="resultado"
                  placeholder={t('create.step1.placeholders.result')} 
                  className="p-3 bg-slate-50 rounded-xl text-sm ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-indigo-600" 
                />
              </div>
            ))}
          </div>
            
            </div>
            
          )}

          {paso === 2 && (
            <div className="space-y-4 animate-in slide-in-from-right-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-indigo-600 font-bold uppercase text-[10px] tracking-widest">{t('create.step2.label')}</span>
                <button onClick={agregarAvatar} className="text-xs bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold shadow-md">{t('create.step2.add_btn')}</button>
              </div>
              {formData.avatares.map((avatar, index) => (
                <div key={index} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-200 relative group transition-all hover:shadow-md">
                  <button onClick={() => eliminarAvatar(index)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500"><Trash2 size={18}/></button>
                  <input name="nombre" value={avatar.nombre} onChange={(e) => handleAvatarChange(index, e)} placeholder={t('create.step2.placeholders.name')} className="w-full bg-transparent border-b border-slate-200 text-sm py-2 outline-none font-bold" />
                  <input name="actitud" value={avatar.actitud} onChange={(e) => handleAvatarChange(index, e)} placeholder={t('create.step2.placeholders.attitude')} className="w-full bg-transparent border-b border-slate-200 text-xs py-2 outline-none italic" />
                  <textarea name="secreto" value={avatar.secreto} onChange={(e) => handleAvatarChange(index, e)} placeholder={t('create.step2.placeholders.secret')} className="w-full bg-transparent text-xs py-2 outline-none h-16 resize-none" />
                </div>
              ))}
            </div>
          )}

          {paso === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
                <div className="text-indigo-600 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2"><MessageSquare size={16}/> {t('create.step3.label')}</div>
                <div className="bg-indigo-50 p-6 rounded-3xl">
                  <label className="text-[10px] font-black text-indigo-400 uppercase ml-1">{t('create.step3.input_label')}</label>
                  <input name="disparador" value={formData.logica.disparador} onChange={handleLogicaChange} placeholder={t('create.step3.placeholders.trigger')} className="w-full bg-transparent border-b border-indigo-200 p-2 outline-none text-slate-700 font-medium" />
                </div>
                <textarea name="reaccion" value={formData.logica.reaccion} onChange={handleLogicaChange} placeholder={t('create.step3.placeholders.reaction')} className="w-full p-4 h-40 rounded-3xl bg-slate-50 border-none ring-1 ring-slate-200 outline-none" />
            </div>
          )}

          {loading && (
            <div className="py-6 space-y-3">
              <div className="flex justify-between text-[10px] font-black text-indigo-600 uppercase tracking-tighter">
                <span>{t('create.loading.text')}</span>
                <span>{progreso}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div className="h-full bg-indigo-600 transition-all duration-500 ease-out" style={{ width: `${progreso}%` }} />
              </div>
            </div>
          )}

          <div className="flex justify-between pt-8 border-t border-slate-100 mt-6">
            <button onClick={() => setPaso(prev => prev - 1)} className={`px-6 py-2 font-bold text-slate-400 ${paso === 1 ? 'invisible' : ''}`}>{t('common.back')}</button>
            <button 
              onClick={() => paso === 3 ? enviarAGlorIA() : setPaso(prev => prev + 1)}
              disabled={loading}
              className="px-10 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl disabled:opacity-50 hover:bg-indigo-700 transition-all"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (paso === 3 ? t('create.buttons.design_proposal') : t('common.next'))}
            </button>
          </div>
        </div>

        <div className="bg-slate-900 rounded-[3rem] p-10 text-white h-fit shadow-2xl relative overflow-hidden border border-slate-800">
            <Wand2 className="text-indigo-400 mb-6" size={40} />
            <h3 className="font-bold text-xl italic mb-3">{t('create.sidebar.title')}</h3>
            <p className="text-slate-400 text-xs leading-relaxed italic opacity-80">
              {t('create.sidebar.description')}
            </p>
            <div className="mt-10 pt-6 border-t border-slate-800">
              <div className="flex items-center gap-3 text-indigo-300">
                <CheckCircle2 size={16}/>
                <span className="text-[10px] font-bold uppercase">{t('create.sidebar.footer')}</span>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CrearEscenario;