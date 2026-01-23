import axios from 'axios';

export const api = axios.create({
  baseURL: "/api/",
  timeout: 20000,
});

export const login = (data) => api.post("login", data);

const storage = {
  get token() { return localStorage.getItem('token'); },
  set token(t) { t ? localStorage.setItem('token', t) : localStorage.removeItem('token'); },
  get rol() { return localStorage.getItem('rol'); },
  set rol(r) { r ? localStorage.setItem('rol', r) : localStorage.removeItem('rol'); },
  clear() { localStorage.removeItem('token'); localStorage.removeItem('rol'); }
};

function parseJwt(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch { return null; }
}

function isTokenExpired(token) {
  const p = parseJwt(token);
  if (!p?.exp) return false;
  const nowSec = Math.floor(Date.now() / 1000);
  return p.exp <= nowSec;
}

// --- Interceptores ---
api.interceptors.request.use((config) => {
  const url = (config.url || '').replace(/^\/+/, '');
  if (url === 'login' || url.endsWith('/login')) return config;

  const t = storage.token;
  if (t) {
    if (isTokenExpired(t)) {
      UserService.logout();
      throw new axios.Cancel('Token expirado');
    }
    config.headers.Authorization = `Bearer ${t}`;
  }
  return config;
});

api.interceptors.response.use(
  r => r,
  err => {
    if (err?.response?.status === 401) UserService.logout();
    return Promise.reject(err);
  }
);

export default class UserService {
  // --- Gestión de Sesión ---
  static async login(nombre, contrasena) {
    storage.clear();
    const res = await api.post('login', { nombre, contrasena });
    const { token, rol } = res.data || {};
    if (token) storage.token = token;
    if (rol) storage.rol = rol;
    window.dispatchEvent(new Event('authChange'));
    return res.data;
  }

  // En src/service/UserService.js
static logout() {
    localStorage.clear(); 
    sessionStorage.clear(); 
    window.location.replace('/login'); 
}

  // --- Helpers de Estado ---
  static getToken() { return storage.token; }
  static getRole() { return storage.rol; }

  static getActiveUserId() {
    const p = parseJwt(storage.token || '');
    return p?.userId || null;
  }

  static isAuthenticated() {
    const t = storage.token;
    return !!t && !isTokenExpired(t);
  }

  static isAdmin() {
    const p = parseJwt(storage.token || '');
    const authorities = p?.authorities || p?.roles || p?.scope?.split(' ') || [];
    if (Array.isArray(authorities) && authorities.includes('ROLE_ADMIN')) return true;
    return storage.rol === 'ROLE_ADMIN' || storage.rol === 'ADMIN';
  }

  static hasAny(roles = []) {
    const rol = storage.rol;
    if (!rol) return false;
    return roles.includes(rol);
  }

  // --- Base Request ---
  static async _request(method, url, data) {
    const clean = String(url).replace(/^\/+/, '');
    const res = await api.request({ method, url: clean, data });
    return res.data;
  }

  // ====== API CALLS ======
  static registrar(userData) { 
    return this._request('post', 'usuarios/registrar', userData); 
  }

  static listar() { 
    return this._request('get', 'usuarios/listar'); 
  }

  static detalle(userId) { 
    return this._request('get', `usuarios/detalle/${userId}`); 
  }

  static verPerfil() { 
    return this._request('get', 'usuarios/verPerfil'); 
  }

  static async cambiarEstado(userId, nuevoEstado) {
    const body = { activo: Boolean(nuevoEstado) };
    console.log("Cambiando estado del usuario", userId, "a", body.activo);
    return this._request('patch', `usuarios/${userId}/estado`, body);
  }

  static actualizar(userId, data) { 
    return this._request('put', `usuarios/actualizar/${userId}`, data); 
  }
}