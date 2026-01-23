import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// Importamos los iconos de flechas para la paginación
import { UserPlus, Edit, Trash2, ShieldCheck, Search, Loader2, UserCheck, Mail, ChevronLeft, ChevronRight } from 'lucide-react'; 
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import api from '../api/apiConfig';
import UserService from '../service/UserService';
import UserProfileButton from '../components/UserProfileButton';

const MySwal = withReactContent(Swal);

const Usuarios = () => {
  const { t } = useTranslation('user');
  const navigate = useNavigate();
  
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  
  // 1. Nuevos estados para paginación
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10; // Tamaño de página fijo

  const parseActivo = (val) => val === true || String(val).toLowerCase() === 'true';

  // 2. Actualizamos el useEffect para que dependa de currentPage
  useEffect(() => {
    const fetchUsuarios = async () => {
      setLoading(true);
      try {
        // Inyectamos la página actual en la URL
        const res = await api.get(`/usuarios/listar?page=${currentPage}&size=${pageSize}`);
        
        // Mapeamos los usuarios
        const usersNormalizados = (res.data.users || []).map(u => ({
          ...u,
          activo: parseActivo(u.activo)
        }));
        
        setUsuarios(usersNormalizados);
        // Guardamos el total de páginas que viene del backend
        setTotalPages(res.data.totalPages); 

      } catch (err) {
        console.error("Error al cargar usuarios", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsuarios();
  }, [currentPage]); // El array de dependencia incluye currentPage

  const usuariosFiltrados = useMemo(() => {
    const term = busqueda.toLowerCase();
    return usuarios.filter(user =>
      user.nombre?.toLowerCase().includes(term) || 
      user.nombreCompleto?.toLowerCase().includes(term)
    );
  }, [usuarios, busqueda]);

  const handleCambiarEstado = async (user) => {
    const nuevoEstado = !user.activo;

    const result = await MySwal.fire({
      title: nuevoEstado ? t('alerts.confirm_enable') : t('alerts.confirm_disable'),
      text: user.nombreCompleto || user.nombre,
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
        const res = await UserService.cambiarEstado(user.id, nuevoEstado);
        setUsuarios(prev => prev.map(u => 
          u.id === user.id ? { ...u, activo: parseActivo(res.activo) } : u
        ));
        MySwal.fire({
          title: t('alerts.success_title') || '¡Éxito!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (err) {
        MySwal.fire('Error', t('alerts.error_delete'), 'error');
      }
    }
  };

  // 3. Funciones para cambiar de página
  const handlePrevPage = () => {
    if (currentPage > 0) setCurrentPage(prev => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage(prev => prev + 1);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
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

      {/* Tabla Container */}
      <div className="bg-white/30 backdrop-blur-md border border-white/50 rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-brand-indigo" size={40} />
            <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">{t('placeholders.loading_text')}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/20 border-b border-white/30">
                    <th className="p-6 font-black text-slate-700 uppercase text-xs tracking-tighter">{t('table.name')}</th>
                    <th className="p-6 font-black text-slate-700 uppercase text-xs tracking-tighter">{t('table.phone')}</th>
                    <th className="p-6 font-black text-slate-700 uppercase text-xs tracking-tighter">{t('table.role')}</th>
                    <th className="p-6 font-black text-slate-700 uppercase text-xs tracking-tighter">{t('table.status')}</th>
                    <th className="p-6 font-black text-slate-700 uppercase text-xs tracking-tighter text-right">{t('table.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {usuariosFiltrados.map((user) => {
                    const isUserActive = parseActivo(user.activo);
                    return (
                      <tr 
                        key={user.id} 
                        className={`transition-all duration-300 ${!isUserActive ? 'bg-slate-100/40 opacity-60' : 'hover:bg-white/40'}`}
                      >
                        <td className="p-6">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <div className={`font-bold ${isUserActive ? 'text-slate-800' : 'text-slate-500 italic'}`}>
                                {user.nombreCompleto || user.nombre}
                              </div>
                              {!isUserActive && (
                                 <span className="px-2 py-0.5 text-[9px] bg-slate-200 text-slate-600 rounded-lg font-black uppercase tracking-widest">
                                   {t('status_inactive') || 'Inactivo'}
                                 </span>
                              )}
                            </div>
                            {user.nombreCompleto && (
                              <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                                <Mail size={10} />
                                {user.nombre}
                              </div>
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
                        <td className="p-6">
                          <span className={`px-3 py-1 rounded-xl text-xs font-bold uppercase ${
                            isUserActive 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-rose-100 text-rose-700'
                          }`}>
                            {isUserActive ? t('table.status_active') : t('table.status_inactive')}
                          </span>
                        </td>                      
                        <td className="p-6 text-right">
                          <div className="flex justify-end gap-2">
                            <UserProfileButton user={user}/>
                            <button 
                              onClick={() => navigate(`/update-user/${user.id}`)}
                              className="p-2 bg-white/60 hover:bg-brand-indigo hover:text-white text-slate-600 rounded-xl transition-all shadow-sm"
                              title={t('btn_edit')}
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
                              {isUserActive ? (
                                <Trash2 size={18} className="group-hover/btn:rotate-12 transition-transform" />
                              ) : (
                                <UserCheck size={18} className="group-hover/btn:scale-110 transition-transform" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 4. Footer de Paginación */}
            <div className="p-4 border-t border-white/30 flex items-center justify-between bg-white/20">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-2">
                Página {currentPage + 1} de {totalPages || 1}
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
          </>
        )}
      </div>
    </div>
  );
};

export default Usuarios;