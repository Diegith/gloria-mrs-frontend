import axios from 'axios';

const api = axios.create({
  baseURL: 'https://gloria-manager-simulation.onrender.com', 
  //baseURL: 'http://localhost:8080',
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
// INTERCEPTOR: Se ejecuta al recibir cualquier respuesta del servidor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
    }
    return Promise.reject(error);
  }
);

export default api;