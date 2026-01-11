import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, FileText, LogOut, 
  UserCircle, Menu, X, Bot 
} from 'lucide-react';
import ChatGloriaModal from './ChatGloriaModal';
import { useTranslation } from 'react-i18next';

const Layout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const rol = localStorage.getItem('rol'); 
  
  const { t, i18n } = useTranslation('layout');

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Mapeamos los nombres a las llaves de traducción de tus JSON
  const menuItems = [
    { name: t('dashboard'), icon: <LayoutDashboard size={20} />, path: '/dashboard', roles: ['ROLE_ADMIN', 'ROLE_USER'] },
    { name: t('users'), icon: <Users size={20} />, path: '/usuarios', roles: ['ROLE_ADMIN'] },
    { name: t('scenarios'), icon: <FileText size={20} />, path: '/escenarios', roles: ['ROLE_ADMIN', 'ROLE_USER'] },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white/10 backdrop-blur-xl border-r border-white/20 shadow-2xl">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-brand-indigo p-2 rounded-xl shadow-lg shadow-indigo-200">
            <Bot className="text-white" size={24} />
          </div>
          <span className="text-2xl font-black tracking-tighter text-slate-800">{t('brand')}</span>
        </div>                        
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('management')}</p>

        {/* Selector de Idiomas Moderno */}
        <br />
        <div className="flex gap-2 p-1 bg-white/20 backdrop-blur-md rounded-xl border border-white/40 mb-4">
          <button 
            onClick={() => changeLanguage('es')}
            className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-all ${i18n.language.includes('es') ? 'bg-brand-indigo text-white shadow-sm' : 'text-slate-500 hover:bg-white/50'}`}
          >
            ESPAÑOL
          </button>
          <button 
            onClick={() => changeLanguage('en')}
            className={`flex-1 py-1 text-[10px] font-bold rounded-lg transition-all ${i18n.language.includes('en') ? 'bg-brand-indigo text-white shadow-sm' : 'text-slate-500 hover:bg-white/50'}`}
          >
            ENGLISH
          </button>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          item.roles.includes(rol) && (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 font-medium ${
                location.pathname === item.path 
                ? 'bg-white/40 text-brand-indigo shadow-sm border border-white/50' 
                : 'text-slate-600 hover:bg-white/30 hover:text-brand-indigo'
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          )
        ))}
      </nav>

      <div className="p-6 mt-auto">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 p-4 w-full rounded-2xl bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white border border-rose-200/20 backdrop-blur-md transition-all duration-300 font-bold group"
        >
          <div className="bg-rose-100 text-rose-600 p-1.5 rounded-lg group-hover:bg-white/20 group-hover:text-white transition-colors">
            <LogOut size={18} />
          </div>
          <span>{t('logout')}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-main-gradient">
      <aside className="hidden lg:flex w-72 flex-col shrink-0 z-30">
        <SidebarContent />
      </aside>

      <aside className={`fixed inset-y-0 left-0 w-72 z-50 transform transition-transform duration-500 lg:hidden ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <SidebarContent />
      </aside>

      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-20 flex justify-between lg:justify-end items-center px-8 z-20">
          <button 
            className="lg:hidden p-2 text-slate-600 bg-white/50 rounded-xl backdrop-blur-md border border-white"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-4 bg-white/40 backdrop-blur-md border border-white/60 p-1.5 pr-4 rounded-2xl shadow-sm">
            <div className="bg-brand-indigo/10 p-2 rounded-xl">
              <UserCircle size={24} className="text-brand-indigo" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold text-brand-indigo uppercase leading-none tracking-tighter">{t('connected_as')}</p>
              <p className="text-sm font-black text-slate-800 leading-tight">{rol?.replace('ROLE_', '')}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 pb-8 md:px-8 relative">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
          <ChatGloriaModal /> 
        </main>
      </div>
    </div>
  );
};

export default Layout;