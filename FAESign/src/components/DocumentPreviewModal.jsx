import React, { useState, useEffect } from 'react';
import './DocumentPreviewModal.css';

const DocumentPreviewModal = ({ show, onClose, document, onAssignSigners }) => {
  const [previewLoading, setPreviewLoading] = useState(true);
  const [documentData, setDocumentData] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('pending');

  if (!show || !document) return null;

  useEffect(() => {
    if (show && document) {
      loadDocumentPreview();
    }
  }, [show, document]);

  // Función para cargar preview del documento
  const loadDocumentPreview = async () => {
    setPreviewLoading(true);
    setVerificationStatus('pending');
    
    try {
      // Simular carga de documento desde repositorio seguro
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simular datos del documento
      const docData = {
        filename: document.nombre,
        uploadDate: document.creado,
        size: '2.4 MB', // Simulado
        pages: 15, // Simulado
        hash: document.hash || 'abcd1234ef567890...', // Simulado si no existe
        encryption: 'AES-256-GCM',
        lastModified: new Date(document.creado).toLocaleString('es-EC'),
        status: document.estado,
        signers: document.firmantes || 0
      };
      
      setDocumentData(docData);
      
      // Simular verificación de integridad
      setTimeout(() => {
        setVerificationStatus('verified');
      }, 800);
      
    } catch (error) {
      console.error('Error loading document preview:', error);
      setVerificationStatus('error');
    } finally {
      setPreviewLoading(false);
    }
  };

  // Función para simular verificación de hash
  const verifyDocumentIntegrity = () => {
    setVerificationStatus('verifying');
    
    setTimeout(() => {
      // Simular verificación exitosa (en una implementación real, esto compararía hashes)
      setVerificationStatus('verified');
    }, 2000);
  };

  // Función para proceder a asignación de firmantes
  const handleProceedToAssignment = () => {
    onAssignSigners(document);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="preview-modal-container">
        <div className="modal-header">
          <h2>Vista Previa del Documento</h2>
          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="preview-content">
          {previewLoading ? (
            <div className="preview-loading">
              <div className="loading-spinner"></div>
              <h3>Cargando documento...</h3>
              <p>Descriptando y verificando integridad</p>
            </div>
          ) : (
            <>
              {/* Información del documento */}
              <div className="document-info-section">
                <div className="document-header">
                  <div className="doc-icon">📄</div>
                  <div className="doc-details">
                    <h3>{documentData?.filename}</h3>
                    <p className="doc-meta">
                      {documentData?.size} • {documentData?.pages} páginas • Subido el {documentData?.lastModified}
                    </p>
                  </div>
                  <div className={`status-badge status-${document.estado.toLowerCase().replace(' ', '-')}`}>
                    {document.estado}
                  </div>
                </div>
              </div>

              {/* Verificación de integridad */}
              <div className="integrity-section">
                <h4>Verificación de Integridad</h4>
                <div className="integrity-check">
                  <div className="check-item">
                    <span className="check-label">Hash SHA-256:</span>
                    <span className="hash-value">{documentData?.hash}</span>
                    <button 
                      className={`verify-btn ${verificationStatus}`}
                      onClick={verifyDocumentIntegrity}
                      disabled={verificationStatus === 'verifying'}
                    >
                      {verificationStatus === 'pending' && '🔍 Verificar'}
                      {verificationStatus === 'verifying' && '⏳ Verificando...'}
                      {verificationStatus === 'verified' && '✅ Verificado'}
                      {verificationStatus === 'error' && '❌ Error'}
                    </button>
                  </div>
                  
                  <div className="check-item">
                    <span className="check-label">Cifrado:</span>
                    <span className="encryption-value">{documentData?.encryption}</span>
                    <span className="encryption-status">🔒 Activo</span>
                  </div>
                  
                  <div className="check-item">
                    <span className="check-label">Firmantes asignados:</span>
                    <span className="signers-count">{documentData?.signers}</span>
                    {documentData?.signers === 0 && (
                      <span className="no-signers">⚠️ Sin asignar</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Simulación de vista previa del PDF */}
              <div className="pdf-preview-section">
                <h4>Vista Previa</h4>
                <div className="pdf-preview-container">
                  <div className="pdf-placeholder">
                    <div className="pdf-page">
                      <div className="pdf-header">
                        <div className="header-line"></div>
                        <div className="header-line short"></div>
                      </div>
                      <div className="pdf-content">
                        <div className="content-line"></div>
                        <div className="content-line"></div>
                        <div className="content-line short"></div>
                        <div className="content-line"></div>
                        <div className="content-line long"></div>
                        <div className="content-line"></div>
                        <div className="content-line short"></div>
                      </div>
                      <div className="signature-area">
                        <div className="signature-placeholder">
                          <span>Área de firma</span>
                        </div>
                      </div>
                    </div>
                    <div className="pdf-controls">
                      <button className="pdf-control-btn">◀</button>
                      <span>Página 1 de {documentData?.pages}</span>
                      <button className="pdf-control-btn">▶</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de seguridad */}
              <div className="security-info">
                <h4>Información de Seguridad</h4>
                <div className="security-details">
                  <div className="security-item">
                    <span className="security-icon">🔐</span>
                    <span>Documento cifrado con AES-256-GCM</span>
                  </div>
                  <div className="security-item">
                    <span className="security-icon">🏷️</span>
                    <span>Hash SHA-256 generado para verificación de integridad</span>
                  </div>
                  <div className="security-item">
                    <span className="security-icon">🛡️</span>
                    <span>Almacenado en repositorio seguro con control de acceso</span>
                  </div>
                  <div className="security-item">
                    <span className="security-icon">📝</span>
                    <span>Registro de auditoría completo habilitado</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {!previewLoading && (
          <div className="preview-footer">
            <button className="cancel-btn" onClick={onClose}>
              Cerrar
            </button>
            
            {document.estado === 'Borrador' && (
              <button 
                className="assign-btn"
                onClick={handleProceedToAssignment}
                disabled={verificationStatus !== 'verified'}
              >
                Asignar Firmantes
              </button>
            )}
            
            {document.estado !== 'Borrador' && (
              <button className="info-btn" disabled>
                {document.firmantes > 0 
                  ? `${document.firmantes} firmante(s) asignado(s)`
                  : 'Sin firmantes asignados'
                }
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentPreviewModal;
