import { useEffect, useRef } from 'react';
import UserService from '../service/UserService';

const AutoLogout = () => {
  const INACTIVITY_TIME = 30 * 60 * 1000; // 30 minutos
  const timerRef = useRef(null);

  useEffect(() => {
    const handleLogout = () => {
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