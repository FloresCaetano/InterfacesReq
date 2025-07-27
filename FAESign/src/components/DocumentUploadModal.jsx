import React, { useState } from 'react';
import './DocumentUploadModal.css';

const DocumentUploadModal = ({ show, onClose, onDocumentUploaded }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadState, setUploadState] = useState('idle'); // idle, validating, encrypting, uploading, success, error
  const [validationResults, setValidationResults] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  if (!show) return null;

  // Función para validar archivo
  const validateFile = (file) => {
    const errors = [];
    
    // Validar tipo de archivo
    if (file.type !== 'application/pdf') {
      errors.push('Solo se permiten archivos PDF');
    }
    
    // Validar tamaño (25MB máximo)
    const maxSize = 25 * 1024 * 1024; // 25MB en bytes
    if (file.size > maxSize) {
      errors.push(`El archivo excede el tamaño máximo de 25MB (archivo: ${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    }
    
    // Validar nombre del archivo
    if (file.name.length > 255) {
      errors.push('El nombre del archivo es demasiado largo');
    }
    
    // Validar caracteres especiales en el nombre
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(file.name)) {
      errors.push('El nombre del archivo contiene caracteres no válidos');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified)
      }
    };
  };

  // Función para simular cifrado AES-256
  const simulateEncryption = async (file) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simular ID de archivo cifrado
        const encryptedFileId = `enc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        resolve({
          fileId: encryptedFileId,
          algorithm: 'AES-256-GCM',
          keyId: `key_${Date.now()}`,
          iv: generateRandomHex(32) // Vector de inicialización simulado
        });
      }, 1500);
    });
  };

  // Función para generar hash SHA-256
  const generateSHA256Hash = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const buffer = e.target.result;
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        resolve(hashHex);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  // Función para generar hex aleatorio
  const generateRandomHex = (length) => {
    const array = new Uint8Array(length / 2);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  // Función para procesar archivo
  const processFile = async (file) => {
    try {
      setUploadState('validating');
      setUploadProgress(10);
      
      // Paso 1: Validar formato, tamaño e integridad
      const validation = validateFile(file);
      setValidationResults(validation);
      
      if (!validation.isValid) {
        setUploadState('error');
        setErrorMessage(validation.errors.join(', '));
        return;
      }
      
      setUploadProgress(30);
      
      // Paso 2: Generar hash SHA-256 para verificación
      setUploadState('encrypting');
      const hash = await generateSHA256Hash(file);
      setUploadProgress(60);
      
      // Paso 3: Cifrar archivo con AES-256
      const encryptionData = await simulateEncryption(file);
      setUploadProgress(80);
      
      // Paso 4: Simular almacenamiento en repositorio seguro
      setUploadState('uploading');
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUploadProgress(100);
      
      // Paso 5: Finalizar proceso
      setUploadState('success');
      
      const documentData = {
        filename: file.name,
        originalSize: file.size,
        hash: hash,
        fileId: encryptionData.fileId,
        uploadTimestamp: new Date().toISOString(),
        encryption: encryptionData,
        validation: validation.fileInfo
      };
      
      setTimeout(() => {
        onDocumentUploaded(documentData);
        resetModal();
      }, 1500);
      
    } catch (error) {
      setUploadState('error');
      setErrorMessage('Error al procesar el archivo: ' + error.message);
    }
  };

  // Función para manejar drop de archivos
  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setSelectedFile(files[0]);
      processFile(files[0]);
    }
  };

  // Función para manejar selección de archivo
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setSelectedFile(files[0]);
      processFile(files[0]);
    }
  };

  // Función para resetear modal
  const resetModal = () => {
    setSelectedFile(null);
    setUploadState('idle');
    setValidationResults(null);
    setUploadProgress(0);
    setErrorMessage('');
    setDragActive(false);
  };

  // Función para cerrar modal
  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Cargar Nuevo Documento</h2>
          <button className="modal-close-btn" onClick={handleClose}>
            ×
          </button>
        </div>
        
        <div className="modal-content">
          {uploadState === 'idle' && (
            <div
              className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
              onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <div className="upload-icon">📄</div>
              <h3>Arrastra tu documento PDF aquí</h3>
              <p>o</p>
              <label className="file-select-btn">
                Seleccionar archivo
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </label>
              <p className="upload-requirements">
                Archivos PDF únicamente • Máximo 25MB
              </p>
            </div>
          )}

          {(uploadState === 'validating' || uploadState === 'encrypting' || uploadState === 'uploading') && (
            <div className="upload-progress">
              <div className="progress-info">
                <h3>
                  {uploadState === 'validating' && 'Validando archivo...'}
                  {uploadState === 'encrypting' && 'Cifrando documento...'}
                  {uploadState === 'uploading' && 'Almacenando en repositorio seguro...'}
                </h3>
                <p>{selectedFile?.name}</p>
              </div>
              
              <div className="progress-bar-container">
                <div 
                  className="progress-bar"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              
              <div className="progress-steps">
                <div className={`step ${uploadProgress >= 10 ? 'completed' : ''}`}>
                  ✓ Validar formato y tamaño
                </div>
                <div className={`step ${uploadProgress >= 30 ? 'completed' : ''}`}>
                  ✓ Verificar integridad
                </div>
                <div className={`step ${uploadProgress >= 60 ? 'completed' : ''}`}>
                  ✓ Generar hash SHA-256
                </div>
                <div className={`step ${uploadProgress >= 80 ? 'completed' : ''}`}>
                  ✓ Cifrar con AES-256
                </div>
                <div className={`step ${uploadProgress >= 100 ? 'completed' : ''}`}>
                  ✓ Almacenar en repositorio
                </div>
              </div>
            </div>
          )}

          {uploadState === 'success' && (
            <div className="upload-success">
              <div className="success-icon">✅</div>
              <h3>Documento cargado exitosamente</h3>
              <p>El archivo ha sido cifrado y almacenado de forma segura</p>
              <div className="success-details">
                <p><strong>Archivo:</strong> {selectedFile?.name}</p>
                <p><strong>Hash SHA-256:</strong> <span className="hash-display">{validationResults?.fileInfo?.name && 'Generado'}</span></p>
                <p><strong>Cifrado:</strong> AES-256-GCM</p>
              </div>
            </div>
          )}

          {uploadState === 'error' && (
            <div className="upload-error">
              <div className="error-icon">❌</div>
              <h3>Error al cargar documento</h3>
              <p className="error-message">{errorMessage}</p>
              <button 
                className="retry-btn"
                onClick={() => {
                  setUploadState('idle');
                  setErrorMessage('');
                  setSelectedFile(null);
                }}
              >
                Intentar nuevamente
              </button>
            </div>
          )}
        </div>

        {uploadState === 'idle' && (
          <div className="modal-footer">
            <button className="cancel-btn" onClick={handleClose}>
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentUploadModal;
