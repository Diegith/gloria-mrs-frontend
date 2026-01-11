import { useEffect, useRef } from 'react';
import UserService from '../service/UserService';

const AutoLogout = () => {
  const INACTIVITY_TIME = 15 * 60 * 1000; 
  const timerRef = useRef(null); // Usamos useRef para que el timer persista correctamente entre renders

  useEffect(() => {
    const handleLogout = () => {
      console.log("LOG: Ejecutando cierre de sesión por inactividad...");
      try {
        UserService.logout();
      } catch (error) {
        // Si el service falla, forzamos el cierre aquí mismo
        localStorage.clear();
        window.location.href = '/login';
      }
    };

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(handleLogout, INACTIVITY_TIME);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    // Iniciar
    resetTimer();

    // Agregar listeners
    events.forEach(event => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, []);

  return null;
};

export default AutoLogout;