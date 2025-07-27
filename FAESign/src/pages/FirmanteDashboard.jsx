import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './FirmanteDashboard.css';

export default function FirmanteDashboard() {
  const [userEmail, setUserEmail] = useState('');
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [historyFilter, setHistoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showNotifications, setShowNotifications] = useState(false);
  
  const notificationRef = useRef(null);
  
  const [notifications, setNotifications] = useState([
    { 
      id: 1, 
      type: 'firma_pendiente', 
      title: 'Nuevo documento para firmar',
      message: 'Contrato_Servicios_2024.pdf requiere su firma',
      time: '2 min',
      isRead: false,
      priority: 'high',
      docId: 1
    },
    { 
      id: 2, 
      type: 'recordatorio', 
      title: 'Recordatorio de vencimiento',
      message: 'El documento Acuerdo_Confidencialidad.pdf vence mañana',
      time: '15 min',
      isRead: false,
      priority: 'medium',
      docId: 2
    },
    { 
      id: 3, 
      type: 'sistema', 
      title: 'Actualización del sistema',
      message: 'Nueva versión de FAESign disponible',
      time: '1 hora',
      isRead: true,
      priority: 'low'
    }
  ]);
  
  const [pendingDocs, setPendingDocs] = useState([
    { 
      id: 1, 
      nombre: 'Contrato_Servicios_2024.pdf', 
      creador: 'Juan Pérez', 
      prioridad: 'Alta', 
      fechaLimite: '2024-01-20',
      fechaCreacion: '2024-01-15',
      tipo: 'Contrato',
      descripcion: 'Contrato de servicios para el año fiscal 2024'
    },
    { 
      id: 2, 
      nombre: 'Acuerdo_Confidencialidad.pdf', 
      creador: 'María García', 
      prioridad: 'Media', 
      fechaLimite: '2024-01-25',
      fechaCreacion: '2024-01-14',
      tipo: 'Acuerdo',
      descripcion: 'Acuerdo de confidencialidad para proyecto especial'
    },
  ]);
  
  const [signedDocs, setSignedDocs] = useState([
    { 
      id: 3, 
      nombre: 'Propuesta_Comercial.pdf', 
      fechaFirma: '2024-01-10', 
      estado: 'Firmado',
      tipo: 'Propuesta',
      creador: 'Carlos López',
      fechaCreacion: '2024-01-08'
    },
    { 
      id: 4, 
      nombre: 'Acta_Reunion.pdf', 
      fechaFirma: '2024-01-08', 
      estado: 'Rechazado',
      tipo: 'Acta',
      creador: 'Ana Martínez',
      fechaCreacion: '2024-01-05',
      motivoRechazo: 'Información incompleta en sección 3'
    },
    { 
      id: 5, 
      nombre: 'Informe_Mensual.pdf', 
      fechaFirma: '2024-01-05', 
      estado: 'Firmado',
      tipo: 'Informe',
      creador: 'Luis Rodríguez',
      fechaCreacion: '2024-01-03'
    },
  ]);
  
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem('fae_user_email');
    const role = localStorage.getItem('fae_user_role');
    
    if (!email || role !== 'Firmante') {
      navigate('/');
      return;
    }
    
    setUserEmail(email);
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const logout = () => {
    localStorage.clear();
    navigate('/');
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
  };

  const getUnreadNotificationsCount = () => {
    return notifications.filter(notif => !notif.isRead).length;
  };

  const handleSignDocument = (docId) => {
    // Mostrar confirmación antes de redirigir
    Swal.fire({
      title: '¿Firmar documento?',
      text: 'Será redirigido a FirmaEC para completar la firma digital.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#003366',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Simular redirección a FirmaEC
        console.log(`Redirigiendo a FirmaEC para firmar documento ${docId}`);
        
        // Mostrar mensaje de éxito
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Documento enviado al siguiente firmante",
          text: "El proceso de firma ha sido completado exitosamente",
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true
        });
        
        // Aquí iría la lógica real de redirección a FirmaEC
        // window.location.href = 'https://firmaec.gob.ec/...';
      }
    });
  };

  const previewDocument = (doc) => {
    setSelectedDoc(doc);
    setCurrentView('preview');
  };

  const backToDashboard = () => {
    setSelectedDoc(null);
    setCurrentView('dashboard');
  };

  const exportHistory = (format) => {
    const data = getFilteredHistory();
    console.log(`Exportando historial en formato ${format}:`, data);
    // Aquí iría la lógica real de exportación
    alert(`Exportando historial en formato ${format.toUpperCase()}`);
  };

  const getFilteredHistory = () => {
    let filtered = [...signedDocs];
    
    if (historyFilter !== 'all') {
      filtered = filtered.filter(doc => doc.tipo.toLowerCase() === historyFilter);
    }
    
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          filterDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(doc => new Date(doc.fechaFirma) >= filterDate);
    }
    
    return filtered.sort((a, b) => new Date(b.fechaFirma) - new Date(a.fechaFirma));
  };

  const getPriorityColor = (prioridad) => {
    switch (prioridad) {
      case 'Alta': return '#ef4444';
      case 'Media': return '#f59e0b';
      case 'Baja': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'Firmado': return '#10b981';
      case 'Rechazado': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const renderDashboard = () => (
    <>
      {/* Estadísticas del Firmante */}
      <div className="stats-grid">
        <div className="stat-card">
          <i className="fas fa-clock stat-icon"></i>
          <h3>Documentos Pendientes</h3>
          <p className="stat-number">{pendingDocs.length}</p>
          <span className="stat-desc">Esperando su firma</span>
        </div>
        <div className="stat-card">
          <i className="fas fa-check-circle stat-icon"></i>
          <h3>Firmados Este Mes</h3>
          <p className="stat-number">
            {signedDocs.filter(doc => doc.estado === 'Firmado').length}
          </p>
          <span className="stat-desc">Documentos completados</span>
        </div>
        <div className="stat-card">
          <i className="fas fa-times-circle stat-icon"></i>
          <h3>Rechazados</h3>
          <p className="stat-number">
            {signedDocs.filter(doc => doc.estado === 'Rechazado').length}
          </p>
          <span className="stat-desc">Documentos rechazados</span>
        </div>
        <div className="stat-card">
          <i className="fas fa-file-alt stat-icon"></i>
          <h3>Total Procesados</h3>
          <p className="stat-number">{signedDocs.length}</p>
          <span className="stat-desc">Historial completo</span>
        </div>
      </div>

      {/* Documentos Pendientes */}
      <div className="documents-section">
        <h2><i className="fas fa-clock"></i> Documentos Pendientes de Firma</h2>
        <div className="documents-table">
          <div className="table-header">
            <span>Documento</span>
            <span>Creador</span>
            <span>Prioridad</span>
            <span>Fecha Límite</span>
            <span>Acciones</span>
          </div>
          {pendingDocs.map(doc => (
            <div key={doc.id} className="table-row">
              <div className="doc-info">
                <span className="doc-name">{doc.nombre}</span>
                <span className="doc-type">{doc.tipo}</span>
              </div>
              <span className="doc-creator">{doc.creador}</span>
              <span 
                className="doc-priority" 
                style={{ color: getPriorityColor(doc.prioridad) }}
              >
                <i className="fas fa-flag"></i> {doc.prioridad}
              </span>
              <span className="doc-deadline">{doc.fechaLimite}</span>
              <div className="doc-actions">
                <button 
                  className="action-btn view"
                  onClick={() => previewDocument(doc)}
                  title="Ver documento"
                >
                  <i className="fas fa-eye"></i>
                </button>
                <button 
                  className="action-btn sign"
                  onClick={() => handleSignDocument(doc.id)}
                  title="Firmar documento"
                >
                  <i className="fas fa-signature"></i>
                </button>
                <button 
                  className="action-btn reject"
                  title="Rechazar documento"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Acceso Rápido al Historial */}
      <div className="quick-actions">
        <div className="quick-action-card">
          <i className="fas fa-history"></i>
          <h3>Ver Historial Completo</h3>
          <p>Acceda a todos sus documentos firmados con filtros avanzados</p>
          <button 
            className="function-btn"
            onClick={() => setCurrentView('history')}
          >
            <i className="fas fa-list"></i> Ver Historial
          </button>
        </div>
      </div>
    </>
  );

  const renderHistoryView = () => (
    <div className="history-view">
      <div className="history-header">
        <div className="history-title">
          <button className="back-btn" onClick={() => setCurrentView('dashboard')}>
            <i className="fas fa-arrow-left"></i>
          </button>
          <h2><i className="fas fa-history"></i> Historial de Firmas</h2>
        </div>
        
        <div className="history-filters">
          <div className="filter-group">
            <label>Tipo de Documento:</label>
            <select 
              value={historyFilter} 
              onChange={(e) => setHistoryFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Todos los tipos</option>
              <option value="contrato">Contratos</option>
              <option value="acuerdo">Acuerdos</option>
              <option value="propuesta">Propuestas</option>
              <option value="acta">Actas</option>
              <option value="informe">Informes</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Período:</label>
            <select 
              value={dateFilter} 
              onChange={(e) => setDateFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Todo el historial</option>
              <option value="week">Última semana</option>
              <option value="month">Último mes</option>
              <option value="quarter">Último trimestre</option>
              <option value="year">Último año</option>
            </select>
          </div>
          
          <div className="export-actions">
            <button 
              className="export-btn pdf"
              onClick={() => exportHistory('pdf')}
            >
              <i className="fas fa-file-pdf"></i> Exportar PDF
            </button>
            <button 
              className="export-btn csv"
              onClick={() => exportHistory('csv')}
            >
              <i className="fas fa-file-csv"></i> Exportar CSV
            </button>
          </div>
        </div>
      </div>

      <div className="history-results">
        <div className="results-summary">
          <span>Mostrando {getFilteredHistory().length} documentos</span>
          <span className="audit-note">
            <i className="fas fa-shield-alt"></i> 
            Consulta registrada en auditoría
          </span>
        </div>

        {getFilteredHistory().length === 0 ? (
          <div className="no-results">
            <i className="fas fa-search"></i>
            <h3>No se encontraron documentos</h3>
            <p>No hay documentos que coincidan con los filtros seleccionados.</p>
            <p className="limit-note">
              <i className="fas fa-info-circle"></i>
              Límite de consulta: 5 años
            </p>
          </div>
        ) : (
          <div className="history-table">
            <div className="table-header">
              <span>Documento</span>
              <span>Tipo</span>
              <span>Creador</span>
              <span>Fecha de Firma</span>
              <span>Estado</span>
              <span>Acciones</span>
            </div>
            {getFilteredHistory().map(doc => (
              <div key={doc.id} className="table-row">
                <div className="doc-info">
                  <span className="doc-name">{doc.nombre}</span>
                  <span className="doc-creation">Creado: {doc.fechaCreacion}</span>
                </div>
                <span className="doc-type">
                  <i className="fas fa-file-alt"></i> {doc.tipo}
                </span>
                <span className="doc-creator">{doc.creador}</span>
                <span className="doc-date">{doc.fechaFirma}</span>
                <span 
                  className="doc-status" 
                  style={{ color: getStatusColor(doc.estado) }}
                >
                  <i className={`fas ${doc.estado === 'Firmado' ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                  {doc.estado}
                </span>
                <div className="doc-actions">
                  <button 
                    className="action-btn view"
                    onClick={() => previewDocument(doc)}
                    title="Ver documento"
                  >
                    <i className="fas fa-eye"></i>
                  </button>
                  <button 
                    className="action-btn download"
                    title="Descargar documento"
                  >
                    <i className="fas fa-download"></i>
                  </button>
                  {doc.estado === 'Rechazado' && (
                    <button 
                      className="action-btn info"
                      title={`Motivo: ${doc.motivoRechazo || 'No especificado'}`}
                    >
                      <i className="fas fa-info-circle"></i>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderPreviewView = () => (
    <div className="preview-view">
      <div className="preview-header">
        <button className="back-btn" onClick={backToDashboard}>
          <i className="fas fa-arrow-left"></i>
          Volver
        </button>
        <div className="document-info">
          <h2>{selectedDoc?.nombre}</h2>
          <div className="document-metadata">
            <span><i className="fas fa-user"></i> Creador: {selectedDoc?.creador}</span>
            <span><i className="fas fa-calendar"></i> Fecha: {selectedDoc?.fechaCreacion || selectedDoc?.fechaFirma}</span>
            <span><i className="fas fa-tag"></i> Tipo: {selectedDoc?.tipo}</span>
            {selectedDoc?.estado && (
              <span style={{ color: getStatusColor(selectedDoc.estado) }}>
                <i className={`fas ${selectedDoc.estado === 'Firmado' ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                {selectedDoc.estado}
              </span>
            )}
          </div>
        </div>
        
        {pendingDocs.find(doc => doc.id === selectedDoc?.id) && (
          <div className="preview-actions">
            <button 
              className="action-btn sign large"
              onClick={() => handleSignDocument(selectedDoc.id)}
            >
              <i className="fas fa-signature"></i>
              Firmar Documento
            </button>
            <button className="action-btn reject large">
              <i className="fas fa-times"></i>
              Rechazar
            </button>
          </div>
        )}
      </div>

      <div className="preview-content">
        <div className="preview-controls">
          <div className="zoom-controls">
            <button className="zoom-btn">
              <i className="fas fa-search-minus"></i>
            </button>
            <span className="zoom-level">100%</span>
            <button className="zoom-btn">
              <i className="fas fa-search-plus"></i>
            </button>
          </div>
          
          <div className="view-controls">
            <button className="view-btn active">
              <i className="fas fa-file"></i>
              Vista Documento
            </button>
            <button className="view-btn">
              <i className="fas fa-info-circle"></i>
              Detalles
            </button>
          </div>
        </div>

        <div className="document-viewer">
          <div className="pdf-placeholder">
            <i className="fas fa-file-pdf"></i>
            <h3>Vista Previa del Documento</h3>
            <p>{selectedDoc?.descripcion || 'Documento PDF para firma'}</p>
            <div className="file-info">
              <span><i className="fas fa-file"></i> {selectedDoc?.nombre}</span>
              <span><i className="fas fa-hdd"></i> Tamaño: 2.4 MB</span>
              <span><i className="fas fa-file-pdf"></i> Formato: PDF</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard-layout">
      <div className="dashboard-container">
        <div className="firmante-dashboard">
          <header className="dashboard-header">
            <div className="header-content">
              <div className="header-left">
                <h1>
                  <i className="fas fa-user-check"></i>
                  Panel del Firmante - FAE
                </h1>
                <span className="user-info">
                  <i className="fas fa-user"></i>
                  {userEmail}
                </span>
              </div>
              <div className="header-right">
                {/* Notificaciones */}
                <div className="notifications-container" ref={notificationRef}>
                  <button 
                    className="notification-btn"
                    onClick={() => setShowNotifications(!showNotifications)}
                  >
                    <i className="fas fa-bell"></i>
                    {getUnreadNotificationsCount() > 0 && (
                      <span className="notification-badge">{getUnreadNotificationsCount()}</span>
                    )}
                  </button>
                  
                  {showNotifications && (
                    <div className="notifications-dropdown">
                      <div className="notifications-header">
                        <h3>Notificaciones</h3>
                        <button 
                          className="mark-all-read"
                          onClick={() => setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })))}
                        >
                          Marcar todas como leídas
                        </button>
                      </div>
                      
                      <div className="notifications-list">
                        {notifications.length === 0 ? (
                          <div className="no-notifications">
                            <i className="fas fa-bell-slash"></i>
                            <p>No hay notificaciones</p>
                          </div>
                        ) : (
                          notifications.map(notification => (
                            <div 
                              key={notification.id} 
                              className={`notification-item ${!notification.isRead ? 'unread' : ''} priority-${notification.priority}`}
                              onClick={() => {
                                markNotificationAsRead(notification.id);
                                setShowNotifications(false);
                                if (notification.type === 'firma_pendiente' && notification.docId) {
                                  const doc = pendingDocs.find(d => d.id === notification.docId);
                                  if (doc) {
                                    previewDocument(doc);
                                  }
                                }
                              }}
                            >
                              <div className="notification-icon">
                                <i className={`fas ${
                                  notification.type === 'firma_pendiente' ? 'fa-pen' :
                                  notification.type === 'recordatorio' ? 'fa-exclamation-triangle' :
                                  'fa-info-circle'
                                }`}></i>
                              </div>
                              <div className="notification-content">
                                <h4>{notification.title}</h4>
                                <p>{notification.message}</p>
                                <span className="notification-time">{notification.time}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <button className="btn-secondary" onClick={logout}>
                  <i className="fas fa-sign-out-alt"></i>
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </header>

      <main className="dashboard-main">
        {currentView === 'dashboard' && renderDashboard()}
        {currentView === 'history' && renderHistoryView()}
        {currentView === 'preview' && renderPreviewView()}
      </main>
        </div>
      </div>
    </div>
  );
}
