import React, { useEffect, useState } from 'react';
import { User, Mail, Shield, Phone, Calendar, Camera, CheckCircle, FileText, Video } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BackButton from '../components/BackButton';

const Perfil = () => {
  const { t } = useTranslation('user');
  const [perfil, setPerfil] = useState(null);

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6 animate-in fade-in duration-700">
      <div className="flex justify-start mb-2">
        <BackButton />
      </div>
      {/* Banner Superior con Avatar Mejorado */}
      <div className="relative h-48 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.5rem] shadow-lg">
        <div className="absolute -bottom-12 left-10 flex items-end gap-6">
          <div className="relative group">
            <div className="h-36 w-36 rounded-[2.5rem] bg-white p-1 shadow-2xl border-4 border-white/80 overflow-hidden backdrop-blur-md">
              <div className="h-full w-full rounded-[2.2rem] bg-slate-100 flex items-center justify-center text-slate-400">
                <User size={70} strokeWidth={1.5} />
              </div>
            </div>
            <button className="absolute bottom-2 right-2 p-2.5 bg-indigo-600 text-white rounded-2xl shadow-xl hover:scale-110 transition-all border-2 border-white">
              <Camera size={18} />
            </button>
          </div>
          <div className="pb-4">
            <h1 className="text-3xl font-black text-slate-800 drop-shadow-sm leading-tight">
              correo@unab.edu.co
            </h1>
            <div className="flex gap-2 mt-1">
               <span className="px-4 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-black uppercase tracking-widest border border-indigo-200">
                {t('profile.role_admin')}
              </span>
              <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest border ${perfil?.activo ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-rose-100 text-rose-700 border-rose-200'}`}>
                {perfil?.activo ? t('profile.status_active') : t('profile.status_inactive')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-16">
        {/* Panel de Información Personal */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-8 shadow-xl">
            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
              <FileText className="text-indigo-500" /> {t('profile.sections.user_info')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <InfoGroup icon={<Mail />} label={t('profile.labels.email')} value="admin1@unab.edu.co" />
              <InfoGroup icon={<Phone />} label={t('profile.labels.phone')} value="314 230 3026" />
              <InfoGroup icon={<Calendar />} label={t('profile.labels.member_since')} value={t('profile.values.member_date')} />
              <InfoGroup icon={<Shield />} label={t('profile.labels.access_level')} value={t('profile.values.access_type')} />
            </div>
          </div>

          {/* Nueva Sección: Preferencias de Simulación */}
          <div className="bg-white/40 backdrop-blur-md border border-white/20 rounded-[2.5rem] p-8 shadow-lg">
            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3 text-opacity-80">
              <Video className="text-purple-500" /> {t('profile.sections.scenario_preferences')}
            </h3>
            <div className="flex flex-wrap gap-4">
               <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-2xl border border-white/60">
                  <CheckCircle size={16} className="text-emerald-500" />
                  <span className="text-sm font-bold text-slate-600">{t('profile.preferences.recording')}</span> 
               </div>
               <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-2xl border border-white/60">
                  <CheckCircle size={16} className="text-emerald-500" />
                  <span className="text-sm font-bold text-slate-600">{t('profile.preferences.sharing')}</span>
               </div>
            </div>
          </div>
        </div>

        {/* Columna de Estadísticas */}
        <div className="space-y-6">
          <StatCard title={t('profile.stats.scenarios_title')} value="12" subtitle={t('profile.stats.scenarios_sub')} color="bg-slate-900" />
          <StatCard title={t('profile.stats.simulations_title')} value="45" subtitle={t('profile.stats.simulations_sub')} color="bg-indigo-600" />
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
  const { t } = useTranslation();
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