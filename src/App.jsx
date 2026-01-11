import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import Usuarios from './views/Usuarios';
import Escenarios from './views/Escenarios';
import CrearEscenario from './views/CrearEscenario';
import Layout from './components/Layout'; 
import UpdateUser from './views/UpdateUser';
import RegisterUser from './views/RegisterUser';
import NotFound from './views/NotFound';
import AutoLogout from './components/AutoLogout';
import Perfil from './views/Perfil';
import VistaPreviaDialogos from './views/VistaPreviaDialogos';

// Componente para proteger rutas
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <AutoLogout />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Todas las rutas privadas van dentro de un Layout común */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Layout> <Dashboard /> </Layout>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/usuarios" 
          element={
            <PrivateRoute>
              <Layout> <Usuarios /> </Layout>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/chat" 
          element={
            <PrivateRoute>
              <Layout> </Layout>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/crear-escenario" 
          element={
            <PrivateRoute>
              <Layout> <CrearEscenario /> </Layout>
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/escenarios" 
          element={
            <PrivateRoute>
              <Layout> <Escenarios /> </Layout>
            </PrivateRoute>
          } 
        />
        <Route path="/perfil" element={<Perfil />} />

        <Route path="/crear-usuario" element={<RegisterUser />} />

        <Route path="/update-user/:userId" element={<UpdateUser />} />

        <Route path="/escenarios/:id/testeo-dialogos" element={<VistaPreviaDialogos />} />
  
        <Route path="/" element={<Navigate to="/dashboard" />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;