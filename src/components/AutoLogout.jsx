import { useEffect, useRef } from 'react';
import UserService from '../service/UserService';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';

const AutoLogout = () => {
  const { t } = useTranslation('user');
  
  // TIEMPOS DE PRUEBA (10 segundos total)
  const INACTIVITY_TIME = 15 * 60 * 1000; 
  const WARNING_TIME = 14 * 60 * 1000;    // Avisa a los 5 segundos
  
  const timerRef = useRef(null);
  const warningTimerRef = useRef(null);

  useEffect(() => {
    const handleLogout = () => {
      console.log("Cerrando sesión por inactividad...");
      Swal.close();
      UserService.logout(); 
      // Si el logout no redirecciona solo, fuerza la recarga:
      window.location.href = '/login'; 
    };

    const showWarning = () => {
      Swal.fire({
        title: t('auth.session_timeout_title'),
        text: t('auth.session_timeout_text'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: t('auth.stay_logged_in'),
        cancelButtonText: t('auth.logout_now'),
        timer: 5000, // 5 segundos para responder
        timerProgressBar: true,
        allowOutsideClick: false
      }).then((result) => {
        if (result.isConfirmed) {
          console.log("Sesión restaurada");
          resetTimer(); 
        } else if (result.dismiss === Swal.DismissReason.timer || result.isDismissed) {
          handleLogout();
        }
      });
    };

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);

      warningTimerRef.current = setTimeout(showWarning, WARNING_TIME);
      timerRef.current = setTimeout(handleLogout, INACTIVITY_TIME);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'click'];
    
    // Iniciar el ciclo
    resetTimer();

    // Agregar escuchas
    events.forEach(event => window.addEventListener(event, resetTimer));

    // Limpieza al desmontar
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [t]);

  return null;
};

export default AutoLogout;