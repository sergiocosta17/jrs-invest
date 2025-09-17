import { GlobalStyle } from './styles/GlobalStyle';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/login/Login';
import { Dashboard } from './pages/dashboard/Dashboard';
import { Layout } from './components/layout/Layout';
import { Operacoes } from './pages/operacoes/Operacoes';
import { Carteira } from './pages/carteira/Carteira';
import { Relatorios } from './pages/relatorios/Relatorios';

function App() {
  return (
    <>
      <GlobalStyle />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/carteira" element={<Carteira />} />
            <Route path="/operacoes" element={<Operacoes />} />
            <Route path="/relatorios" element={<Relatorios />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;