import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';

// Componente para proteger a rota da Dashboard
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('@FinanceFlow:token');
  return token ? children : <Navigate to="/" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota de Login / Cadastro */}
        <Route path="/" element={<Auth />} />

        {/* Rota Protegida da Dashboard */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* Qualquer outra rota volta para o Login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}