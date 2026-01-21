import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import UserService from '../service/UserService';
import { useTranslation } from 'react-i18next';

// Recibe 'user' como prop para no cambiar la estructura interna
const UserProfileButton = ({ user }) => {
  const navigate = useNavigate();
  const { t } = useTranslation('user');

  // Si se pasa un usuario (desde la tabla), usa su ID y rol. 
  // Si no (uso genérico), podría usar los del usuario logueado.
  const targetId = user?.id;
  const displayRol = user?.rol || UserService.getRole();

  return (
    <button 
      // Navega al ID específico de la fila
      onClick={() => navigate(`/perfil/${targetId}`)}
      className="group flex items-center gap-3 p-2 pr-5 bg-white/40 hover:bg-white/70 backdrop-blur-md border border-white/60 rounded-full shadow-sm transition-all duration-300 active:scale-95"
    >
      {/* Círculo del Avatar */}
      <div className="h-10 w-10 rounded-full bg-brand-indigo flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:rotate-12 transition-transform">
        <User size={20} />
      </div>

      {/* Texto descriptivo */}
      <div className="flex flex-col text-left">
        <span className="text-xs font-black text-slate-800 uppercase tracking-tighter">
          {t('my_profile')}
        </span>
        <span className="text-[10px] font-bold text-brand-indigo/70 uppercase">
          {displayRol === 'ROLE_ADMIN' ? 'Admin' : 'User'}
        </span>
      </div>
    </button>
  );
};

export default UserProfileButton;