import { GlobalStyle } from './styles/GlobalStyle';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Login } from './pages/login/Login';
import { Register } from './pages/register/Register';
import { Dashboard } from './pages/dashboard/Dashboard';
import { Layout } from './components/layout/Layout';
import { Operacoes } from './pages/operacoes/Operacoes';
import { Carteira } from './pages/carteira/Carteira';
import { Relatorios } from './pages/relatorios/Relatorios';
import { ProtectedRoute } from './components/protected-route/ProtectedRoute';
import { Profile } from './pages/profile/Profile';

function App() {
  return (
    <>
      <GlobalStyle />
      <Toaster
        position="top-right"
        toastOptions={{
          success: {
            style: {
              background: '#00a23b',
              color: 'white',
            },
          },
          error: {
            style: {
              background: '#f44336',
              color: 'white',
            },
          },
        }}
      />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}></Route>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/operacoes" element={<Operacoes />} />
            <Route path="/carteira" element={<Carteira />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/perfil" element={<Profile />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;