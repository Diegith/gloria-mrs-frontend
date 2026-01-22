import axios from 'axios';

const api = axios.create({
  baseURL: 'https://mursionassistantunab-api.onrender.com', 
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, 
});

// INTERCEPTOR: Se ejecuta antes de enviar cualquier petición al servidor
api.interceptors.request.use(
  (config) => {
    // Buscamos el token almacenado en el login
    const token = localStorage.getItem('token');
    
    if (token) {
      // Si existe, lo añadimos al header de Authorization (Bearer token)
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// INTERCEPTOR: Manejo de respuestas (Opcional pero recomendado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el servidor responde 403 (Prohibido) o 401 (No autorizado)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Podríamos limpiar el storage y redirigir al login si el token expiró
      // localStorage.clear();
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;