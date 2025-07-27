import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Carousel from 'react-bootstrap/Carousel';
import 'bootstrap/dist/css/bootstrap.min.css';
import './LoginPage.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'error' | 'success'
  const navigate = useNavigate();

  // Definir roles basados en email
  const getRoleFromEmail = (email) => {
    const emailToRole = {
      'creador@fae.ec': 'Creador',
      'firmante@fae.ec': 'Firmante', 
      'administrador@fae.ec': 'Administrador',
      'auditor@fae.ec': 'Auditor'
    };
    return emailToRole[email] || null;
  };

  // Rutas específicas por rol
  const getRoleRoute = (role) => {
    const roleRoutes = {
      'Creador': '/creador',
      'Firmante': '/firmante',
      'Administrador': '/administrador',
      'Auditor': '/auditor'
    };
    return roleRoutes[role] || '/dashboard';
  };

  const canRecoverCode = (role) => role !== 'Firmante';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (email && accessCode) {
        const userRole = getRoleFromEmail(email);
        
        if (!userRole) {
          setMessage('Usuario no autorizado. Use: creador@fae.ec, firmante@fae.ec, administrador@fae.ec o auditor@fae.ec');
          setMessageType('error');
          setIsLoading(false);
          return;
        }

        // Simulación de éxito con rol específico
        setMessage(`Autenticación exitosa como ${userRole}. Generando token JWT...`);
        setMessageType('success');
        
        // Simular almacenamiento del rol y token
        localStorage.setItem('fae_user_role', userRole);
        localStorage.setItem('fae_user_email', email);
        localStorage.setItem('fae_token', `jwt_${Date.now()}`);
        localStorage.setItem('fae_token_expiry', new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString());
        
        // Navegar al dashboard específico del rol
        setTimeout(() => {
          navigate(getRoleRoute(userRole));
        }, 1000);
      } else {
        setMessage('Código inválido. Verifique sus credenciales.');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Error de conexión. Intente nuevamente.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoveryRequest = async () => {
    if (!email) {
      setMessage('Ingrese su correo electrónico para solicitar recuperación.');
      setMessageType('error');
      return;
    }

    const userRole = getRoleFromEmail(email);
    
    if (!userRole) {
      setMessage('Usuario no autorizado para recuperación.');
      setMessageType('error');
      return;
    }

    if (!canRecoverCode(userRole)) {
      setMessage('Los Firmantes no pueden recuperar códigos de acceso.');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // Simulación de envío de código temporal
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setMessage(`Código temporal enviado a ${email} para rol de ${userRole}.`);
      setMessageType('success');
      setShowRecovery(false);
    } catch (error) {
      setMessage('Error al enviar código de recuperación. Intente nuevamente.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-card">
          <div className="login-header">
            <h1>FAESign</h1>
            <p>Sistema de Firma Electrónica Avanzada</p>
          </div>

          {/* Logo institucional */}
          <div className="logo-container">
            <img 
              src="/assets/logo.png" 
              alt="Logo Fuerzas Armadas del Ecuador" 
              className="fae-logo"
            />
          </div>

          {/* Mensajes de estado */}
          {message && (
            <div className={messageType === 'error' ? 'error-message' : 'success-message'}>
              {message}
            </div>
          )}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="usuario@ejemplo.com"
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="accessCode">Código de Acceso</label>
            <input
              type="password"
              id="accessCode"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              required
              placeholder="Ingrese su código de acceso"
              disabled={isLoading}
            />
          </div>
          
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading && <span className="loading-spinner"></span>}
            {isLoading ? 'Autenticando...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Sección de recuperación de código */}
        <div className="recovery-section">
          <h3>¿Olvidó su código de acceso?</h3>
          
          {!showRecovery ? (
            <button 
              type="button"
              className="recovery-button"
              onClick={() => setShowRecovery(true)}
              disabled={isLoading}
            >
              Solicitar Código Temporal
            </button>
          ) : (
            <div>
              <p style={{ fontSize: '14px', color: '#333333', marginBottom: '1rem', textAlign: 'center' }}>
                Disponible solo para: Creador, Administrador, Auditor
              </p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  type="button"
                  className="recovery-button"
                  onClick={handleRecoveryRequest}
                  disabled={isLoading || !email}
                  style={{ flex: 1 }}
                >
                  {isLoading ? 'Enviando...' : 'Enviar Código'}
                </button>
                <button 
                  type="button"
                  className="recovery-button"
                  onClick={() => setShowRecovery(false)}
                  disabled={isLoading}
                  style={{ flex: 0, width: 'auto', padding: '0.75rem 1rem' }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

          <div className="login-footer">
            <p style={{ fontSize: '12px', color: '#666666', textAlign: 'center', margin: 0 }}>
              Token JWT válido por 8 horas • Auditoría completa de accesos
            </p>
          </div>
        </div>
      </div>
      
      <div className="login-right">
        <div className="carousel-container">
          <Carousel interval={3000} controls={false} indicators={true} fade>
            <Carousel.Item>
              <img
                className="d-block w-100"
                src="/assets/images/FAE1.jpeg"
                alt="Fuerzas Armadas del Ecuador 1"
              />
            </Carousel.Item>
            <Carousel.Item>
              <img
                className="d-block w-100"
                src="/assets/images/FAE2.jpg"
                alt="Fuerzas Armadas del Ecuador 2"
              />
            </Carousel.Item>
            <Carousel.Item>
              <img
                className="d-block w-100"
                src="/assets/images/FAE3.jpg"
                alt="Fuerzas Armadas del Ecuador 3"
              />
            </Carousel.Item>
            <Carousel.Item>
              <img
                className="d-block w-100"
                src="/assets/images/FAE4.jpg"
                alt="Fuerzas Armadas del Ecuador 4"
              />
            </Carousel.Item>
          </Carousel>
        </div>
      </div>
    </div>
  );
}
