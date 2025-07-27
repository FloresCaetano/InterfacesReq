import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './AdminDashboard.css';

const AdminDashboard = () => {
  // Estados principales
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [users, setUsers] = useState([]);
  const [securityLogs, setSecurityLogs] = useState([]);
  const [blockedAccounts, setBlockedAccounts] = useState([]);
  const [systemConfig, setSystemConfig] = useState({});
  
  const notificationRef = useRef(null);
  const navigate = useNavigate();

  // Datos mock para el dashboard
  useEffect(() => {
    // Mock notifications
    setNotifications([
      {
        id: 1,
        type: 'security_alert',
        title: 'Intento de acceso sospechoso',
        message: 'Se detectaron 5 intentos fallidos desde IP 192.168.1.100',
        time: '2 min',
        isRead: false,
        priority: 'high'
      },
      {
        id: 2,
        type: 'user_request',
        title: 'Solicitud de desbloqueo',
        message: 'Usuario: juan.perez@fae.mil.ec solicita desbloqueo de cuenta',
        time: '15 min',
        isRead: false,
        priority: 'medium'
      },
      {
        id: 3,
        type: 'system_update',
        title: 'Actualización completada',
        message: 'Políticas de seguridad actualizadas correctamente',
        time: '1 hora',
        isRead: true,
        priority: 'low'
      }
    ]);

    // Mock users data
    setUsers([
      {
        id: 1,
        name: 'Juan Pérez',
        email: 'juan.perez@fae.mil.ec',
        role: 'Creador',
        unit: 'Comando Conjunto',
        status: 'blocked',
        lastAccess: '2025-01-15 14:30'
      },
      {
        id: 2,
        name: 'María González',
        email: 'maria.gonzalez@fae.mil.ec',
        role: 'Firmante',
        unit: 'Fuerza Aérea',
        status: 'active',
        lastAccess: '2025-01-25 09:15'
      },
      {
        id: 3,
        name: 'Carlos López',
        email: 'carlos.lopez@fae.mil.ec',
        role: 'Auditor',
        unit: 'Estado Mayor',
        status: 'active',
        lastAccess: '2025-01-25 08:45'
      }
    ]);

    // Mock security logs
    setSecurityLogs([
      {
        id: 1,
        timestamp: '2025-01-25 10:30:00',
        user: 'juan.perez@fae.mil.ec',
        action: 'LOGIN_FAILED',
        ip: '192.168.1.100',
        details: 'Contraseña incorrecta',
        criticality: 'high'
      },
      {
        id: 2,
        timestamp: '2025-01-25 10:15:00',
        user: 'maria.gonzalez@fae.mil.ec',
        action: 'DOCUMENT_ACCESS',
        ip: '192.168.1.50',
        details: 'Acceso a documento CONF-2025-001',
        criticality: 'medium'
      },
      {
        id: 3,
        timestamp: '2025-01-25 09:45:00',
        user: 'carlos.lopez@fae.mil.ec',
        action: 'REPORT_GENERATED',
        ip: '192.168.1.75',
        details: 'Reporte de auditoría mensual',
        criticality: 'low'
      }
    ]);

    // Mock blocked accounts
    setBlockedAccounts([
      {
        id: 1,
        user: 'juan.perez@fae.mil.ec',
        reason: 'Múltiples intentos fallidos',
        blockedAt: '2025-01-25 10:30:00',
        blockedBy: 'Sistema automático',
        type: 'temporary',
        duration: '24 horas'
      }
    ]);
  }, []);

  // Click outside para cerrar notificaciones
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate('/');
  };

  // Funciones de gestión de usuarios
  const handleUserAction = (userId, action) => {
    const user = users.find(u => u.id === userId);
    
    switch(action) {
      case 'block':
        Swal.fire({
          title: '¿Bloquear usuario?',
          text: `Se bloqueará el acceso de ${user.name}`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#dc2626',
          cancelButtonColor: '#6b7280',
          confirmButtonText: 'Bloquear',
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            setUsers(users.map(u => 
              u.id === userId ? { ...u, status: 'blocked' } : u
            ));
            Swal.fire('Bloqueado', 'Usuario bloqueado correctamente', 'success');
          }
        });
        break;
      
      case 'unblock':
        Swal.fire({
          title: '¿Desbloquear usuario?',
          text: `Se restaurará el acceso de ${user.name}`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#10b981',
          cancelButtonColor: '#6b7280',
          confirmButtonText: 'Desbloquear',
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            setUsers(users.map(u => 
              u.id === userId ? { ...u, status: 'active' } : u
            ));
            Swal.fire('Desbloqueado', 'Usuario desbloqueado correctamente', 'success');
          }
        });
        break;
      
      case 'edit':
        // Aquí iría la lógica para editar usuario
        Swal.fire('Función en desarrollo', 'La edición de usuarios estará disponible próximamente', 'info');
        break;
      
      case 'reset_password':
        Swal.fire({
          title: '¿Resetear contraseña?',
          text: `Se enviará una nueva contraseña temporal a ${user.email}`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#0ea5e9',
          cancelButtonColor: '#6b7280',
          confirmButtonText: 'Resetear',
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            Swal.fire('Contraseña reseteada', 'Se ha enviado la nueva contraseña al correo del usuario', 'success');
          }
        });
        break;
    }
  };

  // Función para generar reportes
  const generateReport = (type) => {
    Swal.fire({
      title: 'Generando reporte...',
      text: 'Por favor espere mientras se procesa la información',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
        // Simular tiempo de procesamiento
        setTimeout(() => {
          Swal.fire({
            title: 'Reporte generado',
            text: `El reporte de ${type} ha sido generado exitosamente`,
            icon: 'success',
            confirmButtonText: 'Descargar PDF',
            showCancelButton: true,
            cancelButtonText: 'Cerrar'
          }).then((result) => {
            if (result.isConfirmed) {
              // Aquí iría la lógica de descarga
              console.log(`Descargando reporte: ${type}`);
            }
          });
        }, 2000);
      }
    });
  };

  // Estadísticas del dashboard
  const stats = [
    {
      title: 'Usuarios Activos',
      value: users.filter(u => u.status === 'active').length,
      total: users.length,
      icon: 'fas fa-users',
      color: '#10b981'
    },
    {
      title: 'Cuentas Bloqueadas',
      value: blockedAccounts.length,
      icon: 'fas fa-shield-alt',
      color: '#dc2626'
    },
    {
      title: 'Alertas de Seguridad',
      value: notifications.filter(n => n.type === 'security_alert' && !n.isRead).length,
      icon: 'fas fa-exclamation-triangle',
      color: '#f59e0b'
    },
    {
      title: 'Accesos Hoy',
      value: securityLogs.length,
      icon: 'fas fa-chart-line',
      color: '#0ea5e9'
    }
  ];

  return (
    <div className="dashboard-layout">
      <div className="dashboard-container">
        <div className="admin-dashboard">
          {/* Header */}
          <header className="admin-header">
            <div className="header-left">
              <h1>
                <i className="fas fa-shield-alt"></i>
                Panel de Administración FAE-Sign
              </h1>
              <span className="admin-badge">Administrador</span>
            </div>
            
            <div className="header-right">
              {/* Notificaciones */}
              <div className="notifications-container" ref={notificationRef}>
                <button 
                  className="notification-btn"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <i className="fas fa-bell"></i>
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="notification-badge">
                  {notifications.filter(n => !n.isRead).length}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="notifications-dropdown">
                <div className="notifications-header">
                  <h3>Notificaciones</h3>
                  <button 
                    className="mark-all-read"
                    onClick={() => setNotifications(notifications.map(n => ({ ...n, isRead: true })))}
                  >
                    Marcar todas como leídas
                  </button>
                </div>
                <div className="notifications-list">
                  {notifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`notification-item ${!notification.isRead ? 'unread' : ''} priority-${notification.priority}`}
                    >
                      <div className="notification-icon">
                        <i className={`fas ${
                          notification.type === 'security_alert' ? 'fa-exclamation-triangle' :
                          notification.type === 'user_request' ? 'fa-user-clock' :
                          'fa-info-circle'
                        }`}></i>
                      </div>
                      <div className="notification-content">
                        <h4>{notification.title}</h4>
                        <p>{notification.message}</p>
                        <span className="notification-time">{notification.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <button className="btn-secondary" onClick={logout}>
            <i className="fas fa-sign-out-alt"></i>
            Cerrar Sesión
          </button>
          
          <div className="user-info">
            <span>Admin FAE</span>
            <i className="fas fa-user-shield"></i>
          </div>
        </div>
      </header>

      {/* Navegación de pestañas */}
      <nav className="admin-nav">
        <button 
          className={`nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <i className="fas fa-tachometer-alt"></i>
          Resumen
        </button>
        <button 
          className={`nav-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <i className="fas fa-users-cog"></i>
          Gestión de Usuarios
        </button>
        <button 
          className={`nav-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <i className="fas fa-shield-alt"></i>
          Seguridad y Accesos
        </button>
        <button 
          className={`nav-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <i className="fas fa-chart-bar"></i>
          Reportes y Auditoría
        </button>
        <button 
          className={`nav-btn ${activeTab === 'blocks' ? 'active' : ''}`}
          onClick={() => setActiveTab('blocks')}
        >
          <i className="fas fa-ban"></i>
          Gestión de Bloqueos
        </button>
      </nav>

      {/* Contenido principal */}
      <main className="admin-content">
        {/* Pestaña Resumen */}
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="stats-grid">
              {stats.map((stat, index) => (
                <div key={index} className="stat-card">
                  <div className="stat-icon" style={{ color: stat.color }}>
                    <i className={stat.icon}></i>
                  </div>
                  <div className="stat-content">
                    <h3>{stat.title}</h3>
                    <div className="stat-value">
                      {stat.value}
                      {stat.total && <span className="stat-total">/{stat.total}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="recent-activity">
              <h2><i className="fas fa-clock"></i> Actividad Reciente</h2>
              <div className="activity-list">
                {securityLogs.slice(0, 5).map(log => (
                  <div key={log.id} className="activity-item">
                    <div className={`activity-icon ${log.criticality}`}>
                      <i className="fas fa-circle"></i>
                    </div>
                    <div className="activity-content">
                      <p><strong>{log.user}</strong> - {log.action}</p>
                      <span className="activity-time">{log.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Pestaña Gestión de Usuarios */}
        {activeTab === 'users' && (
          <div className="users-tab">
            <div className="section-header">
              <h2><i className="fas fa-users-cog"></i> Administrar Sistema y Usuarios</h2>
              <button className="primary-btn">
                <i className="fas fa-user-plus"></i>
                Registrar Nuevo Usuario
              </button>
            </div>

            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Unidad</th>
                    <th>Estado</th>
                    <th>Último Acceso</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-info">
                          <i className="fas fa-user"></i>
                          {user.name}
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge role-${user.role.toLowerCase()}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{user.unit}</td>
                      <td>
                        <span className={`status-badge status-${user.status}`}>
                          {user.status === 'active' ? 'Activo' : 'Bloqueado'}
                        </span>
                      </td>
                      <td>{user.lastAccess}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="action-btn edit"
                            onClick={() => handleUserAction(user.id, 'edit')}
                            title="Editar usuario"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          {user.status === 'active' ? (
                            <button 
                              className="action-btn block"
                              onClick={() => handleUserAction(user.id, 'block')}
                              title="Bloquear usuario"
                            >
                              <i className="fas fa-ban"></i>
                            </button>
                          ) : (
                            <button 
                              className="action-btn unblock"
                              onClick={() => handleUserAction(user.id, 'unblock')}
                              title="Desbloquear usuario"
                            >
                              <i className="fas fa-unlock"></i>
                            </button>
                          )}
                          <button 
                            className="action-btn reset"
                            onClick={() => handleUserAction(user.id, 'reset_password')}
                            title="Resetear contraseña"
                          >
                            <i className="fas fa-key"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pestaña Seguridad y Accesos */}
        {activeTab === 'security' && (
          <div className="security-tab">
            <div className="section-header">
              <h2><i className="fas fa-shield-alt"></i> Controlar Seguridad y Acceso</h2>
              <div className="security-controls">
                <button className="secondary-btn">
                  <i className="fas fa-cog"></i>
                  Configurar Políticas
                </button>
                <button className="secondary-btn">
                  <i className="fas fa-sync"></i>
                  Actualizar Logs
                </button>
              </div>
            </div>

            <div className="security-filters">
              <h3><i className="fas fa-filter"></i> Monitorizar Accesos</h3>
              <div className="filter-row">
                <div className="filter-group">
                  <label>Fecha Inicio:</label>
                  <input type="date" className="filter-input" />
                </div>
                <div className="filter-group">
                  <label>Fecha Fin:</label>
                  <input type="date" className="filter-input" />
                </div>
                <div className="filter-group">
                  <label>Tipo de Acceso:</label>
                  <select className="filter-input">
                    <option value="">Todos</option>
                    <option value="login">Inicio de sesión</option>
                    <option value="document">Acceso a documentos</option>
                    <option value="signature">Firma</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Criticidad:</label>
                  <select className="filter-input">
                    <option value="">Todos</option>
                    <option value="high">Alta</option>
                    <option value="medium">Media</option>
                    <option value="low">Baja</option>
                  </select>
                </div>
                <button className="primary-btn">
                  <i className="fas fa-search"></i>
                  Filtrar
                </button>
              </div>
            </div>

            <div className="security-logs">
              <table className="logs-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Usuario</th>
                    <th>Acción</th>
                    <th>IP</th>
                    <th>Detalles</th>
                    <th>Criticidad</th>
                  </tr>
                </thead>
                <tbody>
                  {securityLogs.map(log => (
                    <tr key={log.id}>
                      <td>{log.timestamp}</td>
                      <td>{log.user}</td>
                      <td>
                        <span className={`action-badge action-${log.action.toLowerCase()}`}>
                          {log.action}
                        </span>
                      </td>
                      <td>{log.ip}</td>
                      <td>{log.details}</td>
                      <td>
                        <span className={`criticality-badge criticality-${log.criticality}`}>
                          {log.criticality === 'high' ? 'Alta' : 
                           log.criticality === 'medium' ? 'Media' : 'Baja'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pestaña Reportes y Auditoría */}
        {activeTab === 'reports' && (
          <div className="reports-tab">
            <div className="section-header">
              <h2><i className="fas fa-chart-bar"></i> Generar Reportes y Auditoría</h2>
            </div>

            <div className="reports-grid">
              <div className="report-card">
                <div className="report-icon">
                  <i className="fas fa-users"></i>
                </div>
                <div className="report-content">
                  <h3>Reporte de Usuarios</h3>
                  <p>Actividad, roles y estadísticas de usuarios del sistema</p>
                  <button 
                    className="generate-btn"
                    onClick={() => generateReport('usuarios')}
                  >
                    <i className="fas fa-download"></i>
                    Generar
                  </button>
                </div>
              </div>

              <div className="report-card">
                <div className="report-icon">
                  <i className="fas fa-file-signature"></i>
                </div>
                <div className="report-content">
                  <h3>Reporte de Firmas</h3>
                  <p>Documentos firmados, pendientes y rechazados</p>
                  <button 
                    className="generate-btn"
                    onClick={() => generateReport('firmas')}
                  >
                    <i className="fas fa-download"></i>
                    Generar
                  </button>
                </div>
              </div>

              <div className="report-card">
                <div className="report-icon">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <div className="report-content">
                  <h3>Reporte de Seguridad</h3>
                  <p>Accesos, intentos fallidos y alertas de seguridad</p>
                  <button 
                    className="generate-btn"
                    onClick={() => generateReport('seguridad')}
                  >
                    <i className="fas fa-download"></i>
                    Generar
                  </button>
                </div>
              </div>

              <div className="report-card">
                <div className="report-icon">
                  <i className="fas fa-history"></i>
                </div>
                <div className="report-content">
                  <h3>Auditoría Completa</h3>
                  <p>Registro completo de todas las actividades del sistema</p>
                  <button 
                    className="generate-btn"
                    onClick={() => generateReport('auditoria')}
                  >
                    <i className="fas fa-download"></i>
                    Generar
                  </button>
                </div>
              </div>
            </div>

            <div className="audit-dashboard">
              <h3><i className="fas fa-chart-pie"></i> Dashboard de Métricas</h3>
              <div className="metrics-grid">
                <div className="metric-card">
                  <h4>Documentos Procesados</h4>
                  <div className="metric-value">1,247</div>
                  <div className="metric-trend positive">+12% vs mes anterior</div>
                </div>
                <div className="metric-card">
                  <h4>Tiempo Promedio de Firma</h4>
                  <div className="metric-value">2.3 días</div>
                  <div className="metric-trend negative">+0.5 días vs mes anterior</div>
                </div>
                <div className="metric-card">
                  <h4>Eficiencia del Sistema</h4>
                  <div className="metric-value">97.8%</div>
                  <div className="metric-trend positive">+1.2% vs mes anterior</div>
                </div>
                <div className="metric-card">
                  <h4>Incidentes de Seguridad</h4>
                  <div className="metric-value">3</div>
                  <div className="metric-trend neutral">Sin cambios</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pestaña Gestión de Bloqueos */}
        {activeTab === 'blocks' && (
          <div className="blocks-tab">
            <div className="section-header">
              <h2><i className="fas fa-ban"></i> Gestionar Bloqueos</h2>
              <div className="block-controls">
                <button className="secondary-btn">
                  <i className="fas fa-plus"></i>
                  Nuevo Bloqueo Manual
                </button>
                <button className="secondary-btn">
                  <i className="fas fa-cog"></i>
                  Configurar Políticas
                </button>
              </div>
            </div>

            <div className="blocked-accounts">
              <h3><i className="fas fa-list"></i> Cuentas Bloqueadas</h3>
              {blockedAccounts.length > 0 ? (
                <div className="blocks-table-container">
                  <table className="blocks-table">
                    <thead>
                      <tr>
                        <th>Usuario</th>
                        <th>Motivo</th>
                        <th>Fecha de Bloqueo</th>
                        <th>Bloqueado Por</th>
                        <th>Tipo</th>
                        <th>Duración</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {blockedAccounts.map(block => (
                        <tr key={block.id}>
                          <td>{block.user}</td>
                          <td>{block.reason}</td>
                          <td>{block.blockedAt}</td>
                          <td>{block.blockedBy}</td>
                          <td>
                            <span className={`block-type-badge ${block.type}`}>
                              {block.type === 'temporary' ? 'Temporal' : 'Permanente'}
                            </span>
                          </td>
                          <td>{block.duration}</td>
                          <td>
                            <div className="action-buttons">
                              <button 
                                className="action-btn unblock"
                                onClick={() => {
                                  Swal.fire({
                                    title: '¿Levantar bloqueo?',
                                    text: `Se restaurará el acceso de ${block.user}`,
                                    icon: 'question',
                                    showCancelButton: true,
                                    confirmButtonColor: '#10b981',
                                    cancelButtonColor: '#6b7280',
                                    confirmButtonText: 'Desbloquear',
                                    cancelButtonText: 'Cancelar'
                                  }).then((result) => {
                                    if (result.isConfirmed) {
                                      setBlockedAccounts(blockedAccounts.filter(b => b.id !== block.id));
                                      Swal.fire('Desbloqueado', 'El bloqueo ha sido levantado', 'success');
                                    }
                                  });
                                }}
                                title="Levantar bloqueo"
                              >
                                <i className="fas fa-unlock"></i>
                              </button>
                              <button 
                                className="action-btn info"
                                title="Ver detalles"
                              >
                                <i className="fas fa-info"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="no-blocks">
                  <i className="fas fa-check-circle"></i>
                  <p>No hay cuentas bloqueadas actualmente</p>
                </div>
              )}
            </div>

            <div className="block-policies">
              <h3><i className="fas fa-shield-alt"></i> Políticas de Bloqueo Activas</h3>
              <div className="policies-grid">
                <div className="policy-card">
                  <h4>Intentos Fallidos de Login</h4>
                  <p><strong>5 intentos</strong> → Bloqueo temporal de <strong>30 minutos</strong></p>
                  <div className="policy-status active">Activa</div>
                </div>
                <div className="policy-card">
                  <h4>Acceso desde IP Sospechosa</h4>
                  <p>Bloqueo <strong>inmediato</strong> → Requiere revisión manual</p>
                  <div className="policy-status active">Activa</div>
                </div>
                <div className="policy-card">
                  <h4>Horario de Acceso</h4>
                  <p>Fuera de horario laboral → <strong>Alerta</strong> al administrador</p>
                  <div className="policy-status active">Activa</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
