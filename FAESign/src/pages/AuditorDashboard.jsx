import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './AuditorDashboard.css'; 

const AuditorDashboard = () => {
  const [activeTab, setActiveTab] = useState('logs');
  const navigate = useNavigate();

  const auditLogs = [
    {
      id: 1,
      timestamp: '2025-07-20 14:45:00',
      user: 'carlos.lopez@fae.mil.ec',
      action: 'AUDIT_LOG_VIEWED',
      details: 'Revisión de logs del sistema',
      ip: '192.168.1.101',
      criticality: 'low'
    },
    {
      id: 2,
      timestamp: '2025-07-19 09:30:00',
      user: 'carlos.lopez@fae.mil.ec',
      action: 'REPORT_GENERATED',
      details: 'Generó reporte de seguridad',
      ip: '192.168.1.101',
      criticality: 'medium'
    }
  ];

  const statistics = [
    { title: 'Firmas Completadas', value: 1204, trend: '+10%' },
    { title: 'Errores del Sistema', value: 2, trend: '-50%' },
    { title: 'Tiempo Medio de Firma', value: '1.2 días', trend: '+0.2 días' },
    { title: 'Sesiones Activas', value: 14, trend: '+3%' }
  ];

  const logout = () => {
    localStorage.clear();
    navigate('/');
  };

  const exportData = (type) => {
    Swal.fire({
      title: 'Exportando...',
      text: `Se está generando el archivo de ${type}`,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
        setTimeout(() => {
          Swal.fire({
            title: 'Exportación completada',
            text: `El archivo de ${type} ha sido generado exitosamente.`,
            icon: 'success',
            confirmButtonText: 'Descargar PDF',
            showCancelButton: true,
            cancelButtonText: 'Cerrar'
          });
        }, 1500);
      }
    });
  };

  return (
    <div className="auditor-dashboard">
      <header className="auditor-header">
        <div className="header-left">
          <h1><i className="fas fa-user-secret"></i> Panel del Auditor FAE-Sign</h1>
          <span className="auditor-badge">Auditor</span>
        </div>
        <button className="btn-secondary" onClick={logout}>
          <i className="fas fa-sign-out-alt"></i>
          Cerrar Sesión
        </button>
      </header>

      <nav className="auditor-nav">
        <button
          className={`nav-btn ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          <i className="fas fa-file-alt"></i> Logs de Auditoría
        </button>
        <button
          className={`nav-btn ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <i className="fas fa-chart-line"></i> Estadísticas del Sistema
        </button>
      </nav>

      <main className="auditor-content">
        {activeTab === 'logs' && (
          <div className="logs-tab">
            <div className="section-header">
              <h2><i className="fas fa-clipboard-list"></i> Logs del Sistema</h2>
              <button className="export-btn" onClick={() => exportData('logs')}>
                <i className="fas fa-file-export"></i> Exportar
              </button>
            </div>
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Usuario</th>
                  <th>Acción</th>
                  <th>Detalles</th>
                  <th>IP</th>
                  <th>Criticidad</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map(log => (
                  <tr key={log.id}>
                    <td>{log.timestamp}</td>
                    <td>{log.user}</td>
                    <td>{log.action}</td>
                    <td>{log.details}</td>
                    <td>{log.ip}</td>
                    <td>
                      <span className={`badge ${log.criticality}`}>
                        {log.criticality}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="stats-tab">
            <div className="section-header">
              <h2><i className="fas fa-chart-pie"></i> Estadísticas del Sistema</h2>
              <button className="export-btn" onClick={() => exportData('estadísticas')}>
                <i className="fas fa-file-export"></i> Exportar
              </button>
            </div>
            <div className="stats-grid">
              {statistics.map((stat, i) => (
                <div key={i} className="stat-card">
                  <h3>{stat.title}</h3>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-trend">{stat.trend}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AuditorDashboard;
