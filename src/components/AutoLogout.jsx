import { useEffect } from 'react';
import UserService from '../service/UserService';

const AutoLogout = () => {
  // PRUEBA: 10 segundos (10000ms). Luego cámbialo a 15 * 60 * 1000
  const INACTIVITY_TIME = 15 * 60 * 1000; 

  useEffect(() => {
    let timer;

    const logout = () => {
      console.log("TIEMPO AGOTADO");
      UserService.logout();
    };

    const resetTimer = () => {
      // console.log("Actividad detectada, reiniciando timer...");
      if (timer) clearTimeout(timer);
      timer = setTimeout(logout, INACTIVITY_TIME);
    };

    // Eventos clave de usuario
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'click'];

    // Iniciar timer al montar
    resetTimer();

    // Agregar escuchadores al objeto window para máxima cobertura
    events.forEach(event => window.addEventListener(event, resetTimer));

    // Limpiar al desmontar
    return () => {
      if (timer) clearTimeout(timer);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, []);

  return null;
};

export default AutoLogout;