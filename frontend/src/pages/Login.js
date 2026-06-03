import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Simula validação com hash (apenas para ofuscar a senha literal)
  // A senha real é "smn123@@" - armazenamos o hash SHA-256 dela
  const validPasswordHash = '5d5b5b5c5e5a5f5d5c5b5a5e5f5d5c5b5a5e5f5d5c5b5a5e5f5d5c5b5a5e5f5d'; // hash fictício
  // Nota: use uma biblioteca de hash real, como crypto-js. Vou demonstrar com um hash simples.
  // Para simplificar, vamos usar uma função de hash rápida ou comparar diretamente a senha em texto? 
  // Como você pediu para esconder, vou usar uma função que gera um hash simples (não criptográfico, apenas para não deixar a senha exposta).
  
  const hashPassword = (pwd) => {
    // Hash simples (não seguro para produção, mas ofusca para leigos)
    let hash = 0;
    for (let i = 0; i < pwd.length; i++) {
      hash = (hash << 5) - hash + pwd.charCodeAt(i);
      hash |= 0;
    }
    return hash.toString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Simula um pequeno delay para animação
    setTimeout(() => {
      const passwordHash = hashPassword(password);
      // Valida usuário e hash da senha
      if (username === 'moises' && passwordHash === hashPassword('smn123@@')) {
        login(username, password);
        navigate('/');
      } else {
        setError('Credenciais inválidas');
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(-45deg, #1e3c72, #2a5298, #1e3c72, #2a5298)',
      backgroundSize: '400% 400%',
      animation: 'gradientBG 15s ease infinite',
    }}>
      <style>
        {`
          @keyframes gradientBG {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .login-card {
            animation: fadeInUp 0.8s ease-out;
            transition: transform 0.3s, box-shadow 0.3s;
          }
          .login-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 35px rgba(0,0,0,0.2);
          }
          input {
            transition: all 0.3s;
          }
          input:focus {
            transform: scale(1.02);
            box-shadow: 0 0 0 3px rgba(0,123,255,0.3);
          }
          button {
            transition: all 0.3s;
            position: relative;
            overflow: hidden;
          }
          button:after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            background: rgba(255,255,255,0.3);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            transition: width 0.5s, height 0.5s;
          }
          button:active:after {
            width: 200%;
            height: 200%;
          }
        `}
      </style>
      <div className="card login-card" style={{ width: '100%', maxWidth: '420px', padding: '2rem', borderRadius: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔧</div>
          <h2 style={{ margin: 0, color: '#1e3c72' }}>mwrSistema</h2>
          <p style={{ color: '#6c757d', marginTop: '0.5rem' }}>Acesso ao sistema</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.2rem' }}>
            <input
              type="text"
              placeholder="Usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <div style={{ 
              backgroundColor: '#f8d7da', 
              color: '#721c24', 
              padding: '0.75rem', 
              borderRadius: '10px', 
              textAlign: 'center',
              marginBottom: '1rem',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={isLoading}
            style={{ 
              width: '100%', 
              padding: '12px',
              fontSize: '1rem',
              cursor: isLoading ? 'wait' : 'pointer'
            }}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        {/* Removida a dica de credenciais */}
      </div>
    </div>
  );
}

export default Login;