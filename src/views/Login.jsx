import React, { useState } from 'react';
import api from '../api/apiConfig';
import { Lock, User, Info, Loader2 } from 'lucide-react';
import logoUnab from '../assets/logo_UNAB.png'; // Asegúrate de que la ruta sea correcta

const Login = () => {
  const [datos, setDatos] = useState({ nombre: '', contrasena: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/login', datos);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('rol', response.data.rol);
      window.location.href = '/dashboard';
    } catch (err) {
      setError('Credenciales inválidas. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4">
      <div className="max-w-4xl w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-100">
        
        {/* Lado Izquierdo: Branding UNAB */}
        <div className="md:w-[45%] bg-gradient-to-br from-[#3B82F680] to-[#003d6b] p-12 text-white flex flex-col justify-center relative overflow-hidden">
          {/* Círculos decorativos de fondo para profundidad */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            {/* Contenedor del Logo con Glassmorphism */}
            <div className="mb-10 bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 inline-block shadow-xl">
              <img 
                src={logoUnab} 
                alt="Logo UNAB" 
                className="h-70 w-auto object-contain brightness-0 invert" // Mantiene el logo en blanco para el fondo oscuro
              />
            </div>

            <h1 className="text-5xl font-black mb-4 tracking-tighter">GlorIA</h1>
            
            <p className="text-blue-100 text-lg font-medium leading-relaxed opacity-90">
              Sistema Inteligente de Gestión de Escenarios de Realidad Mixta.
            </p>

            <div className="mt-12 flex items-center gap-3 text-xs font-bold text-blue-200 bg-white/5 w-fit p-3 rounded-xl border border-white/10">
              <Info size={18} />
              <span className="uppercase tracking-widest">Acceso exclusivo UNAB</span>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Formulario */}
        <div className="md:w-[55%] p-12 bg-white flex flex-col justify-center">
          <div className="text-center md:text-left mb-10">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Bienvenido</h2>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
              Introduce tus credenciales
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase ml-1">Usuario</label>
              <div className="relative group">
                <User className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-[#005696] transition-colors" size={20} />
                <input
                  name="nombre"
                  type="text"
                  required
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-[#005696] outline-none transition-all font-bold text-slate-700 placeholder:font-medium"
                  placeholder="nombre.apellido"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase ml-1">Contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-[#005696] transition-colors" size={20} />
                <input
                  name="contrasena"
                  type="password"
                  required
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-[#005696] outline-none transition-all font-bold text-slate-700 placeholder:font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl text-xs font-black text-center animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#005696] hover:bg-[#003d6b] text-white font-black py-4 rounded-2xl transition-all transform active:scale-[0.98] disabled:opacity-70 shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Verificando...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>
          
          <p className="mt-8 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            Centro Tecnológico de Simulación — UNAB
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;