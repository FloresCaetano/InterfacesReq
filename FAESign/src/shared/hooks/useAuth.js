import { useState } from 'react';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Simulación de proceso de autenticación FAE
  const authenticate = async (email, accessCode) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulación de validación de credenciales
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (!email || !accessCode) {
        throw new Error('Código inválido');
      }

      // Simulación de generación de token JWT
      const token = `jwt_token_${Date.now()}`;
      
      // Simular almacenamiento de token (válido por 8 horas)
      const expirationTime = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 horas
      
      localStorage.setItem('fae_token', token);
      localStorage.setItem('fae_token_expiry', expirationTime.toISOString());
      
      // Registro de auditoría (simulado)
      const auditLog = {
        email,
        timestamp: new Date().toISOString(),
        ip: '192.168.1.100', // Simulado
        device: navigator.userAgent,
        action: 'LOGIN_SUCCESS'
      };
      
      console.log('Audit Log:', auditLog);
      
      return {
        success: true,
        token,
        expiresAt: expirationTime,
        message: 'Autenticación exitosa'
      };
      
    } catch (err) {
      const errorMessage = err.message || 'Error de autenticación';
      setError(errorMessage);
      
      // Registro de auditoría para fallos (simulado)
      const auditLog = {
        email,
        timestamp: new Date().toISOString(),
        ip: '192.168.1.100', // Simulado
        device: navigator.userAgent,
        action: 'LOGIN_FAILED',
        error: errorMessage
      };
      
      console.log('Audit Log:', auditLog);
      
      return {
        success: false,
        message: errorMessage
      };
      
    } finally {
      setIsLoading(false);
    }
  };

  // Solicitud de código temporal (solo para roles autorizados)
  const requestTemporaryCode = async (email, userRole) => {
    setIsLoading(true);
    setError(null);

    try {
      // Verificar si el rol puede recuperar códigos
      const authorizedRoles = ['Creador', 'Administrador', 'Auditor'];
      
      if (!authorizedRoles.includes(userRole)) {
        throw new Error('Los Firmantes no pueden recuperar códigos de acceso');
      }

      // Simulación de envío de código temporal
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Registro de auditoría (simulado)
      const auditLog = {
        email,
        userRole,
        timestamp: new Date().toISOString(),
        ip: '192.168.1.100', // Simulado
        device: navigator.userAgent,
        action: 'CODE_RECOVERY_REQUEST'
      };
      
      console.log('Audit Log:', auditLog);
      
      return {
        success: true,
        message: 'Código temporal enviado a su correo electrónico'
      };
      
    } catch (err) {
      const errorMessage = err.message || 'Error al enviar código de recuperación';
      setError(errorMessage);
      
      return {
        success: false,
        message: errorMessage
      };
      
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar si el token es válido
  const isTokenValid = () => {
    const token = localStorage.getItem('fae_token');
    const expiry = localStorage.getItem('fae_token_expiry');
    
    if (!token || !expiry) return false;
    
    return new Date() < new Date(expiry);
  };

  // Cerrar sesión
  const logout = () => {
    localStorage.removeItem('fae_token');
    localStorage.removeItem('fae_token_expiry');
    
    // Registro de auditoría (simulado)
    const auditLog = {
      timestamp: new Date().toISOString(),
      ip: '192.168.1.100', // Simulado
      device: navigator.userAgent,
      action: 'LOGOUT'
    };
    
    console.log('Audit Log:', auditLog);
  };

  return {
    authenticate,
    requestTemporaryCode,
    isTokenValid,
    logout,
    isLoading,
    error,
    setError
  };
};
