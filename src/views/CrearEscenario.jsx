import React, { useState } from 'react';
import { Save, Wand2, Users, BookOpen, MessageSquare, Play, Loader2, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { ejecutarGenerarPDF } from '../utils/pdfGenerator';
import { crearFormDataEscenario } from '../utils/apiHelpers';

const CrearEscenario = () => {
  const [paso, setPaso] = useState(1);
  const [loading, setLoading] = useState(false);
  const [progreso, setProgreso] = useState(0);

  const api = axios.create({
    baseURL: "/api/", // Ajusta según tu puerto
    timeout: 55000,
  });

  const [formData, setFormData] = useState({
    titulo: '',
    area: '',
    idioma: 'Español',
    duracion: '',
    narrativa: '',
    avatares: [{ nombre: '', actitud: 'Colaborador', secreto: '' }],
    logica: { disparador: '', reaccion: '' }
  });

  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
  
  const [escenarioGenerado, setEscenarioGenerado] = useState(null);
  
  const enviarAGlorIA = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);
    setProgreso(0);

    // Temporizador de 50 segundos
    const intervalo = setInterval(() => {
      setProgreso((prev) => {
        if (prev >= 95) return prev;
        return prev + 1;
      });
    }, 500);

    try {
      const response = await api.post('escenarios/generar-ia', formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      clearInterval(intervalo);
      setProgreso(100);

      // Importante: response.data ya es un objeto si usas Axios correctamente
      const resIA = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
      setEscenarioGenerado(resIA); 
      clearInterval(intervalo);
      setProgreso(100);

      // ejecutarGenerarPDF(resIA.formData, resIA.positivos, resIA.negativos);

      Swal.fire('¡Propuesta Lista!', 'Revisa el guion generado antes de exportar.', 'info');
    } catch (error) {
      clearInterval(intervalo);
      setProgreso(0);
      Swal.fire('Error', 'No se pudo conectar con la IA. Revisa el servidor.', 'error');
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };
  const manejarGuardadoFinal = async () => {
      // 1. Generamos el PDF (para tener el objeto 'doc')
      const doc = ejecutarGenerarPDF(
          escenarioGenerado.formData, 
          escenarioGenerado.positivos, 
          escenarioGenerado.negativos
      );

      // 2. Preguntamos al usuario
      const result = await Swal.fire({
          title: '¿Confirmar Guardado?',
          text: "Se descargará el PDF y se subirá al servidor para generar diálogos.",
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Sí, guardar todo'
      });

      if (result.isConfirmed) {
          setLoading(true);
          try {
              // USAMOS LA FUNCIÓN AUXILIAR
              const data = crearFormDataEscenario(doc, escenarioGenerado);
              const token = localStorage.getItem('token');

              // Enviamos al endpoint que definiste: /crear/upload
              const response = await axios.post('/api/escenarios/crear/upload', data, {
                  headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'multipart/form-data' // Necesario para enviar archivos
                  }
              });

              Swal.fire('¡Éxito!', 'PDF guardado y diálogos en proceso.', 'success');
              console.log("Servidor respondió con DTO:", response.data);
              
          } catch (error) {
              console.error(error);
              Swal.fire('Error', 'No se pudo subir el archivo al servidor.', 'error');
          } finally {
              setLoading(false);
          }
      }
  };
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Diseño de Escenario</h1>
          <p className="text-slate-500 font-medium">Configura los parámetros para la IA</p>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map((num) => (
            <div key={num} className={`w-10 h-2 rounded-full transition-all ${paso >= num ? 'bg-indigo-600' : 'bg-slate-200'}`} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6 bg-white/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/60 shadow-xl">
          
          {/* Renderizado de Pasos */}
          {paso === 1 && (
            <div className="space-y-4 animate-in slide-in-from-right-4">
              <div className="flex items-center gap-2 text-indigo-600 mb-4 font-bold uppercase tracking-wider text-sm">
                <BookOpen size={20} /> Información Básica
              </div>
              <input name="titulo" value={formData.titulo} onChange={handleInputChange} type="text" placeholder="Nombre del escenario..." className="w-full p-4 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none" />
              <div className="grid grid-cols-2 gap-4">
                <select name="idioma" value={formData.idioma} onChange={handleInputChange} className="p-4 rounded-2xl border-none ring-1 ring-slate-200 bg-white">
                  <option value="Español">Español</option>
                  <option value="Inglés">Inglés</option>
                </select>
                <input name="duracion" value={formData.duracion} onChange={handleInputChange} type="number" placeholder="Minutos" className="p-4 rounded-2xl border-none ring-1 ring-slate-200" />
              </div>
              <textarea name="narrativa" value={formData.narrativa} onChange={handleInputChange} placeholder="Narrativa corta..." className="w-full p-4 h-32 rounded-2xl border-none ring-1 ring-slate-200" />
            </div>
          )}

          {paso === 2 && (
            <div className="space-y-4">
               {/* Campos de Avatares similares a tu código original */}
               {formData.avatares.map((avatar, index) => (
                <div key={index} className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-3">
                  <input name="nombre" value={avatar.nombre} onChange={(e) => handleAvatarChange(index, e)} placeholder="Nombre Avatar" className="w-full bg-transparent border-b border-indigo-200 p-2 outline-none" />
                  <textarea name="secreto" value={avatar.secreto} onChange={(e) => handleAvatarChange(index, e)} placeholder="Secreto/Información oculta" className="w-full bg-transparent p-2 outline-none text-sm" />
                </div>
              ))}
              <button onClick={() => setFormData({...formData, avatares: [...formData.avatares, {nombre: '', actitud: 'Colaborador', secreto: ''}]})} className="text-indigo-600 font-bold">+ Agregar Avatar</button>
            </div>
          )}

          {paso === 3 && (
            <div className="space-y-4">
              <input name="disparador" value={formData.logica.disparador} onChange={handleLogicaChange} placeholder="Input del participante..." className="w-full p-4 rounded-2xl ring-1 ring-slate-200" />
              <textarea name="reaccion" value={formData.logica.reaccion} onChange={handleLogicaChange} placeholder="Reacción inicial..." className="w-full p-4 rounded-2xl ring-1 ring-slate-200" />
            </div>
          )}

          {/* BARRA DE PROGRESO INSTITUCIONAL */}
          {loading && (
            <div className="py-4 space-y-2 animate-pulse">
              <div className="flex justify-between text-[10px] font-black text-[#005696] uppercase">
                <span>GlorIA está redactando el PDF...</span>
                <span>{progreso}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#005696] transition-all duration-500 ease-out" 
                  style={{ width: `${progreso}%` }} 
                />
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6 border-t border-slate-100">
            <button onClick={() => setPaso(prev => prev - 1)} className={`px-6 py-2 font-bold ${paso === 1 ? 'invisible' : ''}`}>Anterior</button>
            <button 
              onClick={() => paso === 3 ? enviarAGlorIA() : setPaso(prev => prev + 1)}
              disabled={loading}
              className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : (paso === 3 ? 'Generar con IA' : 'Siguiente')}
            </button>
          </div>
        </div>

        {/* Panel Lateral */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white h-fit space-y-4 shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <Wand2 className="text-indigo-400 mb-4" size={32} />
            <h3 className="font-bold text-lg italic">Asistente GlorIA</h3>
            <p className="text-slate-400 text-xs leading-relaxed mt-2">
              Analizaré tu narrativa básica para construir los objetivos pedagógicos y las tablas de comportamiento exigidas por la UNAB.
            </p>
          </div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
        </div>
      </div>
      {escenarioGenerado && (
        <div className="mt-12 space-y-8 animate-in slide-in-from-bottom-10 duration-1000">
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden">
            
            {/* HEADER INSTITUCIONAL */}
            <div className="bg-[#003366] p-8 text-white flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 text-indigo-300 mb-2">
                  <CheckCircle2 size={20} />
                  <span className="text-xs font-black uppercase tracking-widest">Guion Técnico Oficial - UNAB</span>
                </div>
                <h2 className="text-2xl font-bold">{escenarioGenerado.formData.nombreEscenario}</h2>
              </div>
              <div className="flex gap-4">
                <button onClick={enviarAGlorIA} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl font-bold text-sm transition-all flex items-center gap-2">
                  <Wand2 size={18} /> Regenerar
                </button>
                <button 
                  onClick={manejarGuardadoFinal} // <--- AQUÍ USAMOS LA FUNCIÓN AUXILIAR
                  disabled={loading}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-bold text-sm transition-all shadow-lg flex items-center gap-2"
              >
                  {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Guardar y Exportar PDF</>}
              </button>
              </div>
            </div>

            <div className="p-10 space-y-10 text-sm">

              {/* INFORMACIÓN GENERAL */}
              <section className="bg-slate-50 p-6 rounded-3xl">
                <h3 className="text-[#003366] font-black uppercase text-xs mb-4 border-b pb-2">Información General</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div><p className="text-slate-400 font-bold text-[10px] uppercase">Autores</p><p>{escenarioGenerado.formData.autores}</p></div>
                  <div><p className="text-slate-400 font-bold text-[10px] uppercase">Áreas</p><p>{escenarioGenerado.formData.areasConocimiento}</p></div>
                  <div><p className="text-slate-400 font-bold text-[10px] uppercase">Duración</p><p>{escenarioGenerado.formData.duracion} min</p></div>
                  <div><p className="text-slate-400 font-bold text-[10px] uppercase">Idioma</p><p>{escenarioGenerado.formData.lenguaje}</p></div>
                </div>
              </section>

              {/* SECCIÓN 1: EL PARTICIPANTE */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                  <h3 className="text-[#005696] font-black uppercase text-xs mb-4">Sección 1: El Participante</h3>
                  <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <p className="text-indigo-900 font-bold text-[10px] uppercase">Rol</p>
                    <p>{escenarioGenerado.formData.rolParticipante}</p>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <p className="text-slate-400 font-bold text-[10px] uppercase mb-2">Escenario (Narrativa Técnica)</p>
                  <p className="italic text-slate-600 leading-relaxed">"{escenarioGenerado.formData.descripcionEscenario}"</p>
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* SECCIÓN 2: CONTENIDO */}
                <section className="space-y-4">
                  <h3 className="text-[#005696] font-black uppercase text-xs mb-2">Sección 2: Contenido</h3>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-slate-600 whitespace-pre-line">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Descripción de Avatares</p>
                    {escenarioGenerado.formData.contenidoAcademico}
                  </div>
                </section>

                {/* SECCIÓN 3: ESCENARIO */}
                <section className="space-y-4">
                  <h3 className="text-[#005696] font-black uppercase text-xs mb-2">Sección 3: Escenario</h3>
                  <div className="grid grid-cols-1 gap-4 text-[13px]">
                    <p><span className="font-bold">Ambientes:</span> {escenarioGenerado.formData.escenario1} / {escenarioGenerado.formData.escenario2}</p>
                    <p><span className="font-bold">Pre-Simulación:</span> {escenarioGenerado.formData.preSimulacion}</p>
                    <p><span className="font-bold">Conocimientos Previos:</span> {escenarioGenerado.formData.conocimientosPrevios}</p>
                    <p><span className="font-bold">Dinámica:</span> {escenarioGenerado.formData.comportamientosSimulacion}</p>
                  </div>
                </section>
              </div>

              {/* SECCIÓN 4 Y 5: PERSONAJES Y RETROALIMENTACIÓN */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t pt-10">
                <section>
                  <h3 className="text-[#005696] font-black uppercase text-xs mb-4">Sección 4: Personajes y Dificultad</h3>
                  <div className="flex gap-10">
                    <div><p className="text-slate-400 font-bold text-[10px] uppercase">Adultos</p><p>{escenarioGenerado.formData.personajesAdultos}</p></div>
                    <div><p className="text-slate-400 font-bold text-[10px] uppercase">Dificultad</p><p className="font-black text-indigo-600 uppercase italic">{escenarioGenerado.formData.dificultad}</p></div>
                  </div>
                </section>
                <section>
                  <h3 className="text-[#005696] font-black uppercase text-xs mb-4">Sección 5: Retroalimentación</h3>
                  <p className="text-slate-600 leading-relaxed text-[13px]">{escenarioGenerado.formData.retroalimentacion}</p>
                </section>
              </div>

              {/* TABLAS DE COMPORTAMIENTO (ACCIONES EMBEBIDAS) */}
              <div className="space-y-6 pt-10 border-t">
                <h3 className="text-[#003366] font-black uppercase text-xs">Tablas de Comportamiento</h3>
                
                <div className="overflow-hidden rounded-3xl border border-green-100">
                  <table className="w-full text-left">
                    <thead className="bg-green-600 text-white text-[10px] uppercase">
                      <tr><th className="p-4">Objetivo / Activador Positivo</th><th className="p-4">Respuesta Avatar</th><th className="p-4">Ejemplo Diálogo</th></tr>
                    </thead>
                    <tbody className="bg-green-50/20 text-[12px]">
                      {escenarioGenerado.positivos.map((p, i) => (
                        <tr key={i} className="border-t border-green-100">
                          <td className="p-4 font-bold text-green-900">{p.activador}</td>
                          <td className="p-4">{p.respuestaPositiva}</td>
                          <td className="p-4 italic text-slate-500">"{p.ejemplo}"</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="overflow-hidden rounded-3xl border border-red-100">
                  <table className="w-full text-left">
                    <thead className="bg-red-600 text-white text-[10px] uppercase">
                      <tr><th className="p-4">Comportamiento Problemático</th><th className="p-4">Reacción Negativa</th><th className="p-4">Plan de Recuperación</th></tr>
                    </thead>
                    <tbody className="bg-red-50/20 text-[12px]">
                      {escenarioGenerado.negativos.map((n, i) => (
                        <tr key={i} className="border-t border-red-100">
                          <td className="p-4 font-bold text-red-900">{n.activador}</td>
                          <td className="p-4">{n.respuestaNegativa}</td>
                          <td className="p-4 font-medium text-slate-600">{n.recuperacion}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CONSENTIMIENTO */}
              <section className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex justify-between items-center">
                <div>
                  <h3 className="text-indigo-400 font-black uppercase text-[10px] tracking-[0.2em] mb-2">Consentimiento Informado</h3>
                  <p className="text-xs text-slate-400">Firmado por: {escenarioGenerado.formData.nombreConsentimiento} • {escenarioGenerado.formData.fechaConsentimiento}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase text-slate-500">Documento</p>
                  <p className="font-mono">{escenarioGenerado.formData.documentoConsentimiento}</p>
                </div>
              </section>

            </div>
          </div>
        </div>
      )}
    </div>
    
  );
};

export default CrearEscenario;