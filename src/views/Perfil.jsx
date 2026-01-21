import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // Necesario para capturar el ID de la URL
import { User, Mail, Shield, Phone, Calendar, Camera, CheckCircle, FileText, Video, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BackButon from '../components/BackButton';
import api from '../api/apiConfig';

const Perfil = () => {
  const { t } = useTranslation('user');
  const { id } = useParams(); // Captura el {id} definido en tu App.js (ej: /perfil/:id)
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        // Adaptado al endpoint /usuarios/detalle/{id} que definiste en el controlador
        const res = await api.get(`/usuarios/detalle/${id}`);
        setPerfil(res.data);
      } catch (err) {
        console.error("Error al cargar detalle del usuario", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPerfil();
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">
          {t('placeholders.loading_text') || 'Cargando Detalles...'}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6 animate-in fade-in duration-700">
      <div className="flex justify-start mb-2">
        <BackButon />
      </div>
      
      {/* Banner Superior con Datos del Endpoint */}
      <div className="relative h-48 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.5rem] shadow-lg">
        <div className="absolute -bottom-12 left-10 flex items-end gap-6 w-full pr-20">
          <div className="relative group flex-shrink-0">
            <div className="h-36 w-36 rounded-[2.5rem] bg-white p-1 shadow-2xl border-4 border-white/80 overflow-hidden backdrop-blur-md">
              <div className="h-full w-full rounded-[2.2rem] bg-slate-100 flex items-center justify-center text-slate-400">
                <User size={70} strokeWidth={1.5} />
              </div>
            </div>
          </div>
          <div className="pb-4 overflow-hidden">
            {/* nombreCompleto mapeado desde DatosDetalleUsuario */}
            <h1 className="text-3xl font-black text-slate-800 drop-shadow-sm leading-tight truncate">
              {perfil?.nombreCompleto || perfil?.nombre}
            </h1>
            <div className="flex gap-2 mt-1">
               <span className="px-4 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-black uppercase tracking-widest border border-indigo-200">
                {perfil?.rol || 'USER'}
              </span>
              <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest border ${perfil?.activo !== false ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-rose-100 text-rose-700 border-rose-200'}`}>
                {perfil?.activo !== false ? t('table.status_active') : t('table.status_inactive')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-16">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-8 shadow-xl">
            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
              <FileText className="text-indigo-500" /> {t('profile.sections.user_info')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <InfoGroup icon={<Mail />} label={t('profile.labels.email')} value={perfil?.nombre} />
              <InfoGroup icon={<Phone />} label={t('profile.labels.phone')} value={perfil?.telefono || '---'} />
              <InfoGroup icon={<Shield />} label={t('profile.labels.access_level')} value={perfil?.rol} />
            </div>
          </div>
        </div>

        {/* Estadísticas basadas en la respuesta del DTO */}
        <div className="space-y-6">
          <StatCard title={t('profile.stats.scenarios_title')} value="---" subtitle={t('profile.stats.scenarios_sub')} color="bg-slate-900" />
          </div>
      </div>
    </div>
  );
};


const InfoGroup = ({ icon, label, value }) => (
  <div className="flex gap-4 items-start group">
    <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-all">
      {React.cloneElement(icon, { size: 20 })}
    </div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="font-bold text-slate-700">{value}</p>
    </div>
  </div>
);

const StatCard = ({ title, value, subtitle, color }) => {
  return (
    <div className={`${color} rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group`}>
      <div className="relative z-10">
        <p className="text-4xl font-black mb-1">{value}</p>
        <p className="font-bold text-lg leading-tight">{title}</p>
        <p className="text-white/60 text-xs mt-2 font-medium italic">{subtitle}</p>
      </div>
      <div className="absolute -bottom-4 -right-4 text-white/10 group-hover:scale-110 transition-transform">
         <Shield size={120} strokeWidth={1} />
      </div>
    </div>
  );
};

export default Perfil;