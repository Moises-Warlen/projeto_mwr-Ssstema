import React from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Home from './pages/Home';
import Clientes from './pages/Clientes';
import Categorias from './pages/Categorias';
import NovaOS from './pages/NovaOS';
import Relatorios from './pages/Relatorios';
import DetalhesOS from './pages/DetalhesOS';
import EditarOS from './pages/EditarOS';
import Login from './pages/Login';

function NavBar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);

  if (!user) return null; // não mostra menu se não logado

  return (
    <nav className="navbar">
      <Link to="/" className="logo">MWR SISTEMA</Link>
      <div className="menu-icon" onClick={toggleMenu}>☰</div>
      <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
        <NavLink to="/" label="🏠 Home" location={location} />
        <NavLink to="/clientes" label="👥 Clientes" location={location} />
        <NavLink to="/categorias" label="📂 Categorias" location={location} />
        <NavLink to="/nova-os" label="➕ Nova OS" location={location} />
        <NavLink to="/relatorios" label="📊 Relatórios" location={location} />
        <button onClick={logout} className="btn btn-danger" style={{ marginLeft: 'auto' }}>Sair</button>
      </div>
    </nav>
  );
}

function NavLink({ to, label, location }) {
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`nav-link ${isActive ? 'active' : ''}`}>
      {label}
    </Link>
  );
}

// Componente para proteger rotas
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function App() {
  const { user } = useAuth();
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f6f9' }}>
      {user && <NavBar />}
      <div style={{ padding: '1rem', maxWidth: '1400px', margin: '0 auto' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/clientes" element={<ProtectedRoute><Clientes /></ProtectedRoute>} />
          <Route path="/categorias" element={<ProtectedRoute><Categorias /></ProtectedRoute>} />
          <Route path="/nova-os" element={<ProtectedRoute><NovaOS /></ProtectedRoute>} />
          <Route path="/relatorios" element={<ProtectedRoute><Relatorios /></ProtectedRoute>} />
          <Route path="/os/:id" element={<ProtectedRoute><DetalhesOS /></ProtectedRoute>} />
          <Route path="/os/editar/:id" element={<ProtectedRoute><EditarOS /></ProtectedRoute>} />
        </Routes>
      </div>
    </div>
  );
}

export default App;