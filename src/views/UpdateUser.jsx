import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UserService from '../service/UserService';
import { useTranslation } from 'react-i18next';
import { 
  Save, 
  X, 
  Mail, 
  Phone, 
  Shield, 
  ArrowLeft, 
  Loader2, 
  UserCircle,
  User // Añadido para el icono de nombre completo
} from 'lucide-react';

const UpdateUser = () => {
  const { t } = useTranslation('user');
  const navigate = useNavigate();
  const { userId } = useParams();

  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [userData, setUserData] = useState({
    id: '',
    nombre: '',          // Correo / Login
    nombreCompleto: '',  // Nuevo: Nombre Real
    contrasena: '',
    telefono: '',
    rol: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!userId) return;
        const response = await UserService.datosUsuario(userId);
        const data = response.user || response;

        setUserData({
          id: data.id || userId,
          nombre: data.nombre || '',
          nombreCompleto: data.nombreCompleto || '', // Carga el nombre real desde el backend
          contrasena: '', 
          telefono: data.telefono || '',
          rol: data.rol || ''
        });
      } catch (error) {
        console.error('Error:', error);
        alert(t('alerts.error_load'));
        navigate("/usuarios");
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [userId, navigate, t]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación actualizada incluyendo nombreCompleto
    if (!userData.nombre || !userData.nombreCompleto || !userData.rol) {
      alert(t('alerts.required_fields'));
      return;
    }

    setIsUpdating(true);
    try {
      await UserService.actualizar(userData.id, userData);
      alert(t('alerts.success_update'));
      navigate("/usuarios");
    } catch (error) {
      console.error("Error:", error);
      alert(t('alerts.error_update'));
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-brand-indigo mb-4" size={48} />
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">
          {t('placeholders.loading_text')}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-brand-indigo mb-6 font-bold transition-colors group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span>{t('table.back')}</span>
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">{t('title_edit')}</h1>
        <p className="text-slate-500 font-medium">{t('subtitle_edit')}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white/30 backdrop-blur-xl border border-white/60 p-8 rounded-[2.5rem] shadow-2xl space-y-6">
        
        {/* Nombre Real (Nuevo campo en la vista de edición) */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-wider ml-1">
            <User size={16} className="text-brand-indigo" /> {t('table.name') || 'Nombre Completo'}
          </label>
          <input 
            type="text" 
            name="nombreCompleto" 
            value={userData.nombreCompleto} 
            onChange={handleInputChange} 
            className="w-full p-4 bg-white/50 border border-white/80 rounded-2xl outline-none focus:ring-4 focus:ring-brand-indigo/10 transition-all font-medium text-slate-700"
            required
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-wider ml-1">
            <Mail size={16} className="text-brand-indigo" /> {t('table.email')}
          </label>
          <input 
            type="email" 
            name="nombre" 
            value={userData.nombre} 
            onChange={handleInputChange} 
            className="w-full p-4 bg-white/50 border border-white/80 rounded-2xl outline-none focus:ring-4 focus:ring-brand-indigo/10 transition-all font-medium text-slate-700"
            required
          />
        </div>

        {/* Contraseña */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-wider ml-1">
            <Shield size={16} className="text-brand-indigo" /> {t('contrasena')}
          </label>
          <input 
            type="password" 
            name="contrasena" 
            placeholder={t('placeholders.password')}
            value={userData.contrasena} 
            onChange={handleInputChange} 
            className="w-full p-4 bg-white/50 border border-white/80 rounded-2xl outline-none focus:ring-4 focus:ring-brand-indigo/10 transition-all font-medium text-slate-700"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Teléfono */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-wider ml-1">
              <Phone size={16} className="text-brand-indigo" /> {t('telefono')}
            </label>
            <input 
              type="text" 
              name="telefono" 
              value={userData.telefono} 
              onChange={handleInputChange} 
              className="w-full p-4 bg-white/50 border border-white/80 rounded-2xl outline-none focus:ring-4 focus:ring-brand-indigo/10 transition-all font-medium text-slate-700"
            />
          </div>

          {/* Rol */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-wider ml-1">
              <UserCircle size={16} className="text-brand-indigo" /> {t('table.role')}
            </label>
            <select 
              name="rol" 
              value={userData.rol} 
              onChange={handleInputChange} 
              className="w-full p-4 bg-white/50 border border-white/80 rounded-2xl outline-none focus:ring-4 focus:ring-brand-indigo/10 transition-all font-medium text-slate-700 appearance-none cursor-pointer"
            >
              <option value="ROLE_ADMIN">{t('role_admin')}</option>
              <option value="ROLE_USER">{t('role_user')}</option>
            </select>
          </div>
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <button type="submit" disabled={isUpdating} className="flex-1 bg-brand-indigo hover:bg-brand-dark text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50">
            {isUpdating ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {t('btn_save')}
          </button>
          
          <button type="button" onClick={() => navigate('/usuarios')} className="flex-1 bg-white/50 hover:bg-white text-slate-600 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 border border-white/80 transition-all active:scale-95">
            <X size={20} /> {t('btn_cancel')}
          </button>
        </div>
      </form>
    </div>
  );
};
export default UpdateUser;