import { useEffect, useRef } from 'react';
import UserService from '../service/UserService';

const AutoLogout = () => {
  const INACTIVITY_TIME = 10000; // 10 segundos para la prueba rápida
  const timerRef = useRef(null);

  console.log("DEBUG: El archivo AutoLogout.js ha sido cargado");

  useEffect(() => {
    console.log("DEBUG: useEffect de AutoLogout se ha ejecutado");

    const handleLogout = () => {
      console.log("ALERTA: Ejecutando UserService.logout() AHORA");
      UserService.logout();
    };

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(handleLogout, INACTIVITY_TIME);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    resetTimer();

    events.forEach(event => window.addEventListener(event, resetTimer));

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, []);

  return null;
};

export default AutoLogout;