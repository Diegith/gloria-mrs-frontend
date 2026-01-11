import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/apiConfig';
import { useTranslation } from 'react-i18next';
import { UserPlus, Edit, Trash2, ShieldCheck, Search, Loader2, UserCheck } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import UserService from '../service/UserService';
import UserProfileButton from '../components/UserProfileButton';

const MySwal = withReactContent(Swal);

const Usuarios = () => {
  const { t } = useTranslation('user');
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  // Un solo useEffect para cargar y verificar el estado inicial
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const res = await api.get('/usuarios/listar?page=0&size=10');
        
        const usersNormalizados = (res.data.users || []).map(u => ({
          ...u,
          // Forzamos que 'activo' sea booleano. 
          // Si el backend devuelve null o undefined, decidimos si por defecto es true o false.

          activo: u.activo === true || String(u.activo).toLowerCase() === 'true'
        }));
        setUsuarios(usersNormalizados);
      } catch (err) {
        console.error("Error al cargar", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsuarios();
  }, []);

  const usuariosFiltrados = usuarios.filter(user =>
    user.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleCambiarEstado = async (user) => {
    // Definimos el cambio basado estrictamente en el estado actual
    const nuevoEstado = !user.activo;

    const result = await MySwal.fire({
      title: nuevoEstado ? t('alerts.confirm_enable') : t('alerts.confirm_disable'),
      text: user.nombre,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: t('btn_confirm'),
      cancelButtonText: t('btn_cancel'),
      confirmButtonColor: nuevoEstado ? '#10b981' : '#f43f5e',
      background: 'rgba(255, 255, 255, 0.9)',
      backdrop: `rgba(15, 23, 42, 0.1) blur(4px)`,
      customClass: { popup: 'rounded-[2rem]' }
    });

    if (result.isConfirmed) {
      try {
        // 1. Llamada al PATCH
        const res = await UserService.cambiarEstado(user.id, nuevoEstado);
        
        // IMPORTANTE: 'res' debe ser el objeto que devuelve tu Spring Boot
        // que contiene el nuevo campo 'activo' guardado en la DB.
        
        setUsuarios(prev => prev.map(u => 
          u.id === user.id ? { ...u, activo: res.activo === true || String(res.activo).toLowerCase() === 'true' } : u
        ));

        // ... (Alerta de éxito)
      } catch (err) {
        MySwal.fire('Error', t('alerts.error_delete'), 'error');
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">{t('title')}</h1>
          <p className="text-slate-500 font-medium text-sm">{t('sub_title')}</p>
        </div>
        <button 
          onClick={() => navigate('/crear-usuario')}
          className="flex items-center gap-2 px-6 py-3 bg-brand-indigo text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-brand-dark transition-all hover:scale-105 active:scale-95"
        >
          <UserPlus size={20} /> 
          <span>{t('btn_new')}</span>
        </button>
      </div>

      {/* Buscador */}
      <div className="relative group">
        <Search className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-brand-indigo transition-colors" size={20} />
        <input 
          type="text"
          placeholder={t('placeholders.search')}
          className="w-full pl-12 pr-4 py-3.5 bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-brand-indigo/20 transition-all font-medium text-slate-700"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Tabla */}
      <div className="bg-white/30 backdrop-blur-md border border-white/50 rounded-[2.5rem] shadow-xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-brand-indigo" size={40} />
            <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">{t('placeholders.loading_text')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/20 border-b border-white/30">
                  <th className="p-6 font-black text-slate-700 uppercase text-xs tracking-tighter">{t('table.name')}</th>
                  <th className="p-6 font-black text-slate-700 uppercase text-xs tracking-tighter">{t('table.phone')}</th>
                  <th className="p-6 font-black text-slate-700 uppercase text-xs tracking-tighter">{t('table.role')}</th>
                  <th className="p-6 font-black text-slate-700 uppercase text-xs tracking-tighter">Activo</th>
                  <th className="p-6 font-black text-slate-700 uppercase text-xs tracking-tighter text-right">{t('table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {usuariosFiltrados.map((user) => {
                  
                  // DEFINE LA VARIABLE AQUÍ PARA CADA FILA
                  console.log("Estado 'activo' del usuario:", user.nombre, user.activo);
                  const isUserActive = UserService.getActiveUserId() === user.id ? true : Boolean(user.activo);

                  return (
                    <tr 
                      key={user.id} 
                      className={`transition-all duration-300 ${!isUserActive ? 'bg-slate-100/40 opacity-60' : 'hover:bg-white/40'}`}
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <div className={`font-bold ${isUserActive ? 'text-slate-800' : 'text-slate-500 italic'}`}>
                            {user.nombre}
                          </div>
                          {!isUserActive && (
                             <span className="px-2 py-0.5 text-[9px] bg-slate-200 text-slate-600 rounded-lg font-black uppercase tracking-widest">Inactivo</span>
                          )}
                        </div>
                      </td>
                      <td className="p-6 text-slate-500 font-medium">{user.telefono || '---'}</td>
                      <td className="p-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-tight shadow-sm ${
                          user.rol === 'ROLE_ADMIN' 
                          ? 'bg-indigo-500/10 text-indigo-700 border border-indigo-200/30' 
                          : 'bg-emerald-500/10 text-emerald-700 border border-emerald-200/30'
                        }`}>
                          <ShieldCheck size={14} /> 
                          {user.rol === 'ROLE_ADMIN' ? t('role_admin') : t('role_user')}
                        </span>
                      </td>
                      <td>
                        {isUserActive ? (
                          <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold uppercase tracking-tight">Sí</span>
                        ) : (
                          <span className="inline-block px-3 py-1 bg-rose-100 text-rose-700 rounded-xl text-xs font-bold uppercase tracking-tight">No</span>
                        )}
                      </td>
                      <td className="p-6">
                        <div className="flex justify-end gap-2">
                          <UserProfileButton />
                          <button 
                            onClick={() => navigate(`/update-user/${user.id}`)}
                            className="p-2 bg-white/60 hover:bg-brand-indigo hover:text-white text-slate-600 rounded-xl transition-all shadow-sm"
                          >
                            <Edit size={18} />
                          </button>

                          <button 
                            onClick={() => handleCambiarEstado(user)}
                            className={`p-2 rounded-xl transition-all shadow-sm group/btn ${
                              isUserActive 
                                ? 'bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white' 
                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                            }`}
                            title={isUserActive ? t('btn_disable') : t('btn_enable')}
                          >
                            {isUserActive ? <Trash2 size={18} className="group-hover/btn:rotate-12 transition-transform" /> : <UserCheck size={18} className="group-hover/btn:scale-110 transition-transform" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Usuarios;