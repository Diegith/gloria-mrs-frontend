import { useEffect } from 'react';
import UserService from '../service/UserService';

const AutoLogout = () => {
  // 15 minutos de inactividad
  const INACTIVITY_TIME = 15 * 60 * 1000; 

  useEffect(() => {
    let timer;

    const handleLogout = () => {
      console.log("Sesión expirada por inactividad");
      UserService.logout();
    };

    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(handleLogout, INACTIVITY_TIME);
    };

    // Eventos que resetean el contador
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    // Inicializar
    resetTimer();

    // Listener para cada evento
    events.forEach(event => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    // Cleanup: Muy importante para evitar fugas de memoria y múltiples timers
    return () => {
      if (timer) clearTimeout(timer);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, []); // El array vacío asegura que solo se monte una vez

  return null;
};

export default AutoLogout;