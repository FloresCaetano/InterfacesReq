import { useState } from 'react';
import './Dashboard.css';

export default function Dashboard() {
  const [documents, setDocuments] = useState([
    { id: 1, name: 'Contrato_Servicios_2024.pdf', status: 'Pendiente', date: '2024-01-15' },
    { id: 2, name: 'Acuerdo_Confidencialidad.pdf', status: 'Firmado', date: '2024-01-10' },
    { id: 3, name: 'Propuesta_Comercial.pdf', status: 'En Proceso', date: '2024-01-12' },
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Firmado': return '#10b981';
      case 'En Proceso': return '#f59e0b';
      case 'Pendiente': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Dashboard - FAESign</h1>
          <div className="header-actions">
            <button className="btn-primary">Nuevo Documento</button>
            <button className="btn-secondary">Perfil</button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Documentos Totales</h3>
            <p className="stat-number">{documents.length}</p>
          </div>
          <div className="stat-card">
            <h3>Pendientes</h3>
            <p className="stat-number">
              {documents.filter(doc => doc.status === 'Pendiente').length}
            </p>
          </div>
          <div className="stat-card">
            <h3>Firmados</h3>
            <p className="stat-number">
              {documents.filter(doc => doc.status === 'Firmado').length}
            </p>
          </div>
          <div className="stat-card">
            <h3>En Proceso</h3>
            <p className="stat-number">
              {documents.filter(doc => doc.status === 'En Proceso').length}
            </p>
          </div>
        </div>

        <div className="documents-section">
          <h2>Documentos Recientes</h2>
          <div className="documents-table">
            <div className="table-header">
              <span>Documento</span>
              <span>Estado</span>
              <span>Fecha</span>
              <span>Acciones</span>
            </div>
            {documents.map(doc => (
              <div key={doc.id} className="table-row">
                <span className="doc-name">{doc.name}</span>
                <span 
                  className="doc-status" 
                  style={{ color: getStatusColor(doc.status) }}
                >
                  {doc.status}
                </span>
                <span className="doc-date">{doc.date}</span>
                <div className="doc-actions">
                  <button className="action-btn">Ver</button>
                  <button className="action-btn">Firmar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
