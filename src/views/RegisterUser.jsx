import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserService from '../service/UserService';
import { useTranslation } from 'react-i18next';
import { 
  UserPlus, 
  X, 
  Mail, 
  Phone, 
  Shield, 
  ArrowLeft, 
  Loader2, 
  UserCircle,
  Lock,
  User // Nuevo icono para el nombre real
} from 'lucide-react';
import Swal from 'sweetalert2';

const RegisterUser = () => {
  const { t } = useTranslation('user');
  const navigate = useNavigate();

  const [isRegistering, setIsRegistering] = useState(false);
  const [userData, setUserData] = useState({
    nombre: '',           // Correo / Login
    nombreCompleto: '',   // Nuevo: Nombre Real
    contrasena: '',
    telefono: '',
    rol: 'ROLE_USER' 
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación básica incluyendo el nuevo campo
    if (!userData.nombre || !userData.nombreCompleto || !userData.contrasena || !userData.rol) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: t('alerts.required_fields'),
        background: 'rgba(255, 255, 255, 0.9)',
        backdrop: `rgba(15, 23, 42, 0.1) blur(4px)`,
        customClass: { popup: 'rounded-[2rem]' }
      });
      return;
    }

    setIsRegistering(true);
    try {
      await UserService.registrar(userData);
      
      await Swal.fire({
        icon: 'success',
        title: t('alerts.success_register') || 'Usuario creado',
        text: `${t('table.name')}: ${userData.nombreCompleto}`,
        timer: 2000,
        showConfirmButton: false,
        background: 'rgba(255, 255, 255, 0.9)',
        customClass: { popup: 'rounded-[2rem]' }
      });

      navigate("/usuarios");
    } catch (error) {
      console.error("Error al registrar:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: t('alerts.error_update'),
      });
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Botón Volver */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-brand-indigo mb-6 font-bold transition-colors group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span>{t('table.back') || 'Volver'}</span>
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">
          {t('btn_create') || 'Crear Nuevo Usuario'}
        </h1>
        <p className="text-slate-500 font-medium">
          {t('subtitle_register') || 'Registra un nuevo miembro en el ecosistema GlorIA.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white/30 backdrop-blur-xl border border-white/60 p-8 rounded-[2.5rem] shadow-2xl space-y-6">
        
        {/* Nombre Real (Nuevo Campo Prioritario) */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-wider ml-1">
            <User size={16} className="text-brand-indigo" /> {t('table.name') || 'Nombre Completo'}
          </label>
          <input 
            type="text" 
            name="nombreCompleto" 
            placeholder="Ej: Nombre Completo"
            value={userData.nombreCompleto} 
            onChange={handleInputChange} 
            className="w-full p-4 bg-white/50 border border-white/80 rounded-2xl outline-none focus:ring-4 focus:ring-brand-indigo/10 transition-all font-medium text-slate-700"
            required
          />
        </div>

        {/* Email / Nombre (Login) */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-wider ml-1">
            <Mail size={16} className="text-brand-indigo" /> {t('table.email')}
          </label>
          <input 
            type="email" 
            name="nombre" 
            placeholder="ejemplo@unab.edu.co"
            value={userData.nombre} 
            onChange={handleInputChange} 
            className="w-full p-4 bg-white/50 border border-white/80 rounded-2xl outline-none focus:ring-4 focus:ring-brand-indigo/10 transition-all font-medium text-slate-700"
            required
          />
        </div>

        {/* Contraseña */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-wider ml-1">
            <Lock size={16} className="text-brand-indigo" /> {t('contrasena') || 'Contraseña'}
          </label>
          <input 
            type="password" 
            name="contrasena" 
            value={userData.contrasena} 
            onChange={handleInputChange} 
            className="w-full p-4 bg-white/50 border border-white/80 rounded-2xl outline-none focus:ring-4 focus:ring-brand-indigo/10 transition-all font-medium text-slate-700"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Teléfono */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-wider ml-1">
              <Phone size={16} className="text-brand-indigo" /> {t('telefono') || 'Teléfono'}
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

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <button 
            type="submit" 
            disabled={isRegistering}
            className="flex-1 bg-brand-indigo hover:bg-brand-dark text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            {isRegistering ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
            {t('btn_create') || 'Registrar Usuario'}
          </button>
          
          <button 
            type="button" 
            onClick={() => navigate('/usuarios')}
            className="flex-1 bg-white/50 hover:bg-white text-slate-600 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 border border-white/80 transition-all active:scale-95"
          >
            <X size={20} /> {t('btn_cancel')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterUser;