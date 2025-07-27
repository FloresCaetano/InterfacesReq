import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreadorDashboard.css';

export default function CreadorDashboard() {
  const [userEmail, setUserEmail] = useState('');
  const [documents, setDocuments] = useState([
    { id: 1, nombre: 'Contrato_Servicios_2024.pdf', estado: 'Borrador', firmantes: 0, creado: '2024-01-15', hash: 'abc123...', fileId: 'doc_001' },
    { id: 2, nombre: 'Acuerdo_Confidencialidad.pdf', estado: 'En Proceso', firmantes: 2, creado: '2024-01-12', hash: 'def456...', fileId: 'doc_002' },
    { id: 3, nombre: 'Propuesta_Comercial.pdf', estado: 'Configurado', firmantes: 4, creado: '2024-01-10', hash: 'ghi789...', fileId: 'doc_003' },
    { id: 4, nombre: 'Orden_Operacional.pdf', estado: 'Firmado', firmantes: 3, creado: '2024-01-08', hash: 'jkl012...', fileId: 'doc_004' },
  ]);
  
  // Estados para el workflow integrado
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, upload, preview, assign, search, configFlow, searchSigners
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadState, setUploadState] = useState('idle');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedSigners, setSelectedSigners] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [documentContent, setDocumentContent] = useState(null);
  
  // Estados para configuración de flujo de firma
  const [signatureFlowType, setSignatureFlowType] = useState('secuencial'); // secuencial, paralelo
  const [signatureGroups, setSignatureGroups] = useState([]);
  const [requireOTP, setRequireOTP] = useState(false);
  const [requireDigitalCert, setRequireDigitalCert] = useState(true);
  const [maxTimePerStage, setMaxTimePerStage] = useState(72); // horas
  const [mandatoryFields, setMandatoryFields] = useState([]);
  const [hierarchyOrder, setHierarchyOrder] = useState([]);
  
  // Estados para búsqueda de firmantes
  const [signerSearchQuery, setSignerSearchQuery] = useState('');
  const [signerFilters, setSignerFilters] = useState({
    reparto: '',
    rango: '',
    estado: 'Habilitado'
  });
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  
  const navigate = useNavigate();

  // Datos simulados de usuarios FAE con jerarquía militar completa
  const availableUsers = [
    // Oficiales Generales
    { id: 1, nombre: 'Fernando', apellido: 'López', rango: 'General del Aire', reparto: 'Comando Conjunto', email: 'fernando.lopez@fae.mil.ec', estado: 'Habilitado' },
    { id: 2, nombre: 'María', apellido: 'Rodríguez', rango: 'Teniente General', reparto: 'Fuerza Aérea', email: 'maria.rodriguez@fae.mil.ec', estado: 'Habilitado' },
    { id: 3, nombre: 'Carlos', apellido: 'Mendoza', rango: 'Brigadier General', reparto: 'Comando Conjunto', email: 'carlos.mendoza@fae.mil.ec', estado: 'Habilitado' },
    
    // Oficiales Superiores
    { id: 4, nombre: 'Ana', apellido: 'Vásquez', rango: 'Coronel', reparto: 'Fuerza Aérea', email: 'ana.vasquez@fae.mil.ec', estado: 'Habilitado' },
    { id: 5, nombre: 'Miguel', apellido: 'Torres', rango: 'Teniente Coronel', reparto: 'Ejército', email: 'miguel.torres@fae.mil.ec', estado: 'Habilitado' },
    { id: 6, nombre: 'Elena', apellido: 'Castro', rango: 'Mayor', reparto: 'Armada', email: 'elena.castro@fae.mil.ec', estado: 'Habilitado' },
    
    // Oficiales Subalternos
    { id: 7, nombre: 'Roberto', apellido: 'Silva', rango: 'Capitán', reparto: 'Fuerza Aérea', email: 'roberto.silva@fae.mil.ec', estado: 'Habilitado' },
    { id: 8, nombre: 'Laura', apellido: 'Vega', rango: 'Teniente', reparto: 'Ejército', email: 'laura.vega@fae.mil.ec', estado: 'Habilitado' },
    { id: 9, nombre: 'Diego', apellido: 'Morales', rango: 'Subteniente', reparto: 'Armada', email: 'diego.morales@fae.mil.ec', estado: 'Habilitado' },
    
    // Personal Civil
    { id: 10, nombre: 'Patricia', apellido: 'Jiménez', rango: 'Técnico Administrativo', reparto: 'Administración', email: 'patricia.jimenez@fae.mil.ec', estado: 'Habilitado' },
    { id: 11, nombre: 'Andrés', apellido: 'Guerrero', rango: 'Especialista TI', reparto: 'Sistemas', email: 'andres.guerrero@fae.mil.ec', estado: 'Habilitado' },
    
    // Algunos inhabilitados para demostrar filtros
    { id: 12, nombre: 'José', apellido: 'Ramírez', rango: 'Mayor', reparto: 'Logística', email: 'jose.ramirez@fae.mil.ec', estado: 'Inhabilitado' }
  ];

  useEffect(() => {
    const email = localStorage.getItem('fae_user_email');
    const role = localStorage.getItem('fae_user_role');
    
    if (!email || role !== 'Creador') {
      navigate('/');
      return;
    }
    
    setUserEmail(email);
  }, [navigate]);

  // Limpiar URLs de objetos al desmontar el componente
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  // Effect para filtrar usuarios cuando cambien los criterios
  useEffect(() => {
    if (currentView === 'searchSigners') {
      filterUsers();
    }
  }, [signerSearchQuery, signerFilters, currentView]);

  // Inicializar usuarios filtrados
  useEffect(() => {
    setFilteredUsers(availableUsers.filter(user => user.estado === 'Habilitado'));
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate('/');
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'Firmado': return '#10b981';
      case 'En Proceso': return '#f59e0b';
      case 'Configurado': return '#3b82f6';
      case 'Borrador': return '#6b7280';
      case 'Rechazado': return '#ef4444';
      case 'Cancelado': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Función para iniciar creación de documento
  const startDocumentCreation = () => {
    setCurrentView('upload');
    setSelectedFile(null);
    setUploadState('idle');
    setUploadProgress(0);
  };

  // Función para manejar selección de archivo
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar archivo
    if (file.type !== 'application/pdf') {
      alert('Solo se permiten archivos PDF');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      alert('El archivo excede el tamaño máximo de 25MB');
      return;
    }

    setSelectedFile(file);
    await processFile(file);
  };

  // Función para procesar archivo
  const processFile = async (file) => {
    setUploadState('processing');
    setUploadProgress(20);

    // Crear URL del objeto para previsualización
    const fileUrl = URL.createObjectURL(file);
    setPdfUrl(fileUrl);

    // Simular procesamiento
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUploadProgress(50);

    // Simular cifrado
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUploadProgress(80);

    // Simular hash y finalización
    await new Promise(resolve => setTimeout(resolve, 800));
    setUploadProgress(100);
    setUploadState('completed');

    // Crear documento con URL del PDF
    const newDoc = {
      id: Date.now(),
      nombre: file.name,
      estado: 'Borrador',
      firmantes: 0,
      creado: new Date().toISOString().split('T')[0],
      hash: 'sha256_' + Math.random().toString(36).substr(2, 9),
      fileId: 'file_' + Date.now(),
      pdfUrl: fileUrl,
      fileSize: file.size,
      lastModified: file.lastModified
    };

    setDocuments(prev => [...prev, newDoc]);
    setSelectedDocument(newDoc);
    setDocumentContent({
      name: file.name,
      size: file.size,
      type: file.type,
      url: fileUrl
    });

    setTimeout(() => {
      setCurrentView('preview');
    }, 1500);
  };

  // Función para previsualizar documento
  const previewDocument = (doc) => {
    setSelectedDocument(doc);
    setCurrentView('preview');
    
    // Si el documento tiene una URL de PDF, usarla
    if (doc.pdfUrl) {
      setPdfUrl(doc.pdfUrl);
      setDocumentContent({
        name: doc.nombre,
        size: doc.fileSize || 0,
        type: 'application/pdf',
        url: doc.pdfUrl
      });
    } else {
      // Para documentos existentes sin archivo real, limpiar la previsualización
      setPdfUrl(null);
      setDocumentContent(null);
    }
  };

  // Función para asignar firmantes
  const startSignerAssignment = (doc) => {
    setSelectedDocument(doc);
    setSelectedSigners([]);
    setCurrentView('assign');
  };

  // Función para agregar firmante (sin selector de rol manual)
  const addSigner = (user) => {
    if (selectedSigners.length >= 10) {
      alert('Máximo 10 firmantes permitidos');
      return;
    }

    if (selectedSigners.find(s => s.id === user.id)) {
      alert('Este usuario ya está asignado');
      return;
    }

    const newSigner = {
      ...user,
      role: getRoleFromRank(user.rango), // Rol asignado automáticamente
      order: selectedSigners.length + 1,
      addedAt: new Date().toISOString(),
      requiresField: [],
      notes: ''
    };

    setSelectedSigners(prev => [...prev, newSigner]);
  };

  // Función para filtrar usuarios disponibles
  const filterUsers = () => {
    let filtered = availableUsers.filter(user => {
      // Filtro por estado (solo habilitados por defecto)
      if (signerFilters.estado && user.estado !== signerFilters.estado) {
        return false;
      }
      
      // Filtro por búsqueda libre (nombre, apellido, email)
      if (signerSearchQuery) {
        const searchTerm = signerSearchQuery.toLowerCase();
        const matchesName = user.nombre.toLowerCase().includes(searchTerm);
        const matchesLastName = user.apellido.toLowerCase().includes(searchTerm);
        const matchesEmail = user.email.toLowerCase().includes(searchTerm);
        
        if (!matchesName && !matchesLastName && !matchesEmail) {
          return false;
        }
      }
      
      // Filtro por reparto
      if (signerFilters.reparto && user.reparto !== signerFilters.reparto) {
        return false;
      }
      
      // Filtro por rango
      if (signerFilters.rango && user.rango !== signerFilters.rango) {
        return false;
      }
      
      return true;
    });
    
    setFilteredUsers(filtered);
  };

  // Effect para filtrar usuarios cuando cambien los criterios
  useEffect(() => {
    filterUsers();
  }, [signerSearchQuery, signerFilters]);

  // Inicializar usuarios filtrados
  useEffect(() => {
    setFilteredUsers(availableUsers.filter(user => user.estado === 'Habilitado'));
  }, []);

  // Función para iniciar búsqueda de firmantes
  const startSignerSearch = (doc) => {
    setSelectedDocument(doc);
    setCurrentView('searchSigners');
    setSelectedSigners([]); // Limpiar selección anterior
    setSignerSearchQuery('');
    setSignerFilters({
      reparto: '',
      rango: '',
      estado: 'Habilitado'
    });
  };

  // Función para proceder a configuración de flujo después de seleccionar firmantes
  const proceedToFlowConfig = () => {
    if (selectedSigners.length === 0) {
      alert('Debe seleccionar al menos un firmante');
      return;
    }

    // Generar orden jerárquico automáticamente
    const hierarchicalOrder = getHierarchyOrder(selectedSigners);
    setHierarchyOrder(hierarchicalOrder);
    
    // Ir a configuración de flujo
    setCurrentView('configFlow');
  };

  // Función para remover firmante
  const removeSigner = (id) => {
    setSelectedSigners(prev => {
      const updated = prev.filter(s => s.id !== id);
      return updated.map((signer, index) => ({
        ...signer,
        order: index + 1
      }));
    });
  };

  // Función para cambiar rol
  const changeSignerRole = (id, newRole) => {
    setSelectedSigners(prev =>
      prev.map(signer =>
        signer.id === id ? { ...signer, role: newRole } : signer
      )
    );
  };

  // Función para confirmar asignación
  const confirmSignerAssignment = () => {
    if (selectedSigners.length === 0) {
      alert('Debe asignar al menos un firmante');
      return;
    }

    // Actualizar validación para roles automáticos
    const hasFirmante = selectedSigners.some(s => 
      s.role === 'Firmante Militar' || 
      s.role === 'Firmante Civil' || 
      s.role === 'Firmante' // Compatibilidad con rol anterior
    );
    
    if (!hasFirmante) {
      alert('Debe haber al menos un firmante válido');
      return;
    }

    const confirmed = window.confirm(
      `¿Confirma la asignación de ${selectedSigners.length} miembro(s) del personal?`
    );

    if (confirmed) {
      setDocuments(prev =>
        prev.map(doc =>
          doc.id === selectedDocument.id
            ? { ...doc, firmantes: selectedSigners.length, estado: 'En Proceso' }
            : doc
        )
      );

      alert('Personal asignado exitosamente. Se han enviado las notificaciones oficiales.');
      setCurrentView('dashboard');
    }
  };

  // Función para cancelar documento
  const cancelDocument = (docId) => {
    const confirmed = window.confirm('¿Está seguro de anular este documento oficial?');
    
    if (confirmed) {
      const motivo = prompt('Motivo de anulación (requerido):');
      
      setDocuments(prev =>
        prev.map(doc =>
          doc.id === docId ? { ...doc, estado: 'Cancelado' } : doc
        )
      );
      
      alert('Documento anulado exitosamente.');
    }
  };

  // Función para configurar flujo de firma
  const configureSignatureFlow = (doc) => {
    setSelectedDocument(doc);
    setCurrentView('configFlow');
    
    // Inicializar configuración basada en firmantes ya asignados
    if (doc.firmantes > 0) {
      // Obtener jerarquía según rangos militares
      const hierarchy = getHierarchyOrder(selectedSigners);
      setHierarchyOrder(hierarchy);
    }
  };

  // Función para obtener orden jerárquico militar completo
  const getHierarchyOrder = (signers) => {
    const rankOrder = {
      // Oficiales Generales
      'General del Aire': 1,
      'Teniente General': 2,
      'Brigadier General': 3,
      
      // Oficiales Superiores
      'Coronel': 4,
      'Teniente Coronel': 5,
      'Mayor': 6,
      
      // Oficiales Subalternos
      'Capitán': 7,
      'Teniente': 8,
      'Subteniente': 9,
      
      // Personal Civil (menor prioridad jerárquica para firmas)
      'Especialista TI': 10,
      'Técnico Administrativo': 11,
      
      // Rangos anteriores (compatibilidad)
      'General': 1,
      'Coronel': 4
    };

    return [...signers].sort((a, b) => {
      const rankA = rankOrder[a.rango] || 999;
      const rankB = rankOrder[b.rango] || 999;
      
      // Si tienen el mismo rango, ordenar alfabéticamente
      if (rankA === rankB) {
        return `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`);
      }
      
      return rankA - rankB;
    });
  };

  // Función para determinar rol automáticamente según rango
  const getRoleFromRank = (rango) => {
    const officialRanks = [
      'General del Aire', 'Teniente General', 'Brigadier General',
      'Coronel', 'Teniente Coronel', 'Mayor',
      'Capitán', 'Teniente', 'Subteniente'
    ];
    
    const civilRanks = ['Especialista TI', 'Técnico Administrativo'];
    
    if (officialRanks.includes(rango)) {
      return 'Firmante Militar';
    } else if (civilRanks.includes(rango)) {
      return 'Firmante Civil';
    } else {
      return 'Firmante'; // Rol por defecto
    }
  };

  // Función para agregar grupo de firmantes paralelos
  const addParallelGroup = () => {
    const newGroup = {
      id: Date.now(),
      name: `Grupo ${signatureGroups.length + 1}`,
      members: [],
      maxTime: 72,
      mandatoryFields: []
    };
    setSignatureGroups([...signatureGroups, newGroup]);
  };

  // Función para remover grupo
  const removeGroup = (groupId) => {
    setSignatureGroups(signatureGroups.filter(g => g.id !== groupId));
  };

  // Función para agregar miembro a grupo
  const addMemberToGroup = (groupId, member) => {
    setSignatureGroups(signatureGroups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          members: [...group.members, member]
        };
      }
      return group;
    }));
  };

  // Función para confirmar configuración de flujo
  const confirmFlowConfiguration = () => {
    if (signatureFlowType === 'secuencial' && hierarchyOrder.length === 0) {
      alert('Debe definir el orden de firmantes para flujo secuencial');
      return;
    }

    if (signatureFlowType === 'paralelo' && signatureGroups.length === 0) {
      alert('Debe crear al menos un grupo para flujo paralelo');
      return;
    }

    const flowConfig = {
      type: signatureFlowType,
      requireOTP,
      requireDigitalCert,
      maxTimePerStage,
      mandatoryFields,
      ...(signatureFlowType === 'secuencial' 
        ? { hierarchyOrder } 
        : { signatureGroups }
      )
    };

    // Actualizar documento con configuración de flujo
    setDocuments(prev =>
      prev.map(doc =>
        doc.id === selectedDocument.id
          ? { 
              ...doc, 
              estado: 'Configurado',
              firmantes: selectedSigners.length,
              flowConfig,
              assignedSigners: selectedSigners,
              configuredAt: new Date().toISOString()
            }
          : doc
      )
    );

    alert(`Flujo de firma ${signatureFlowType} configurado exitosamente. Personal asignado: ${selectedSigners.length} firmantes.`);
    
    // Limpiar estados
    setSelectedSigners([]);
    setHierarchyOrder([]);
    setSignatureGroups([]);
    setMandatoryFields([]);
    
    setCurrentView('dashboard');
  };

  // Función para volver al dashboard
  const backToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedDocument(null);
    setSelectedFile(null);
    setSelectedSigners([]);
    setSearchQuery('');
    setFilteredDocuments([]);
    
    // Limpiar URL del objeto para liberar memoria
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
    setDocumentContent(null);
  };

  // Función para búsqueda avanzada
  const startAdvancedSearch = () => {
    setCurrentView('search');
    setFilteredDocuments(documents);
  };

  // Función para manejar búsqueda
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredDocuments(documents);
    } else {
      const filtered = documents.filter(doc => 
        doc.nombre.toLowerCase().includes(query.toLowerCase()) ||
        doc.estado.toLowerCase().includes(query.toLowerCase()) ||
        doc.fileId.toLowerCase().includes(query.toLowerCase()) ||
        doc.hash.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredDocuments(filtered);
    }
  };

  // Funciones de zoom para previsualización
  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 200));
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 50));
  };

  const resetZoom = () => {
    setZoomLevel(100);
  };

  return (
    <div className="dashboard-layout">
      <div className="dashboard-container">
        <div className="creador-dashboard">
          <header className="dashboard-header">
            <div className="header-content">
              <div className="header-left">
                <h1>Panel del Creador</h1>
                <span className="user-info">{userEmail}</span>
              </div>
              <div className="header-actions">
                {currentView !== 'dashboard' && (
                  <button className="btn-secondary" onClick={backToDashboard}>
                    <i className="fa-solid fa-arrow-left"></i> Volver al Panel
                  </button>
                )}
                <button className="btn-secondary" onClick={logout}>
                  <i className="fa-solid fa-sign-out-alt"></i> Cerrar Sesión
                </button>
              </div>
            </div>
          </header>

          <main className="dashboard-main">
        {/* Vista Dashboard */}
        {currentView === 'dashboard' && (
          <>
            {/* Estadísticas */}
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Documentos Creados</h3>
                <p className="stat-number">{documents.length}</p>
                <span className="stat-desc">Total en el sistema</span>
              </div>
              <div className="stat-card">
                <h3>En Proceso</h3>
                <p className="stat-number">
                  {documents.filter(doc => doc.estado === 'En Proceso').length}
                </p>
                <span className="stat-desc">Esperando firmas</span>
              </div>
              <div className="stat-card">
                <h3>Completados</h3>
                <p className="stat-number">
                  {documents.filter(doc => doc.estado === 'Firmado').length}
                </p>
                <span className="stat-desc">Totalmente firmados</span>
              </div>
              <div className="stat-card">
                <h3>Borradores</h3>
                <p className="stat-number">
                  {documents.filter(doc => doc.estado === 'Borrador').length}
                </p>
                <span className="stat-desc">Sin enviar</span>
              </div>
            </div>

            {/* Acciones Rápidas */}
            <div className="quick-actions">
              <h2>Acciones de Comando</h2>
              <div className="actions-grid">
                <button className="action-card" onClick={startDocumentCreation}>
                  <div className="action-icon">
                    <i className="fa-solid fa-folder-open"></i>
                  </div>
                  <h3>Crear Documento</h3>
                  <p>Iniciar proceso de documentación oficial</p>
                </button>
                <button className="action-card" onClick={startAdvancedSearch}>
                  <div className="action-icon">
                    <i className="fa-solid fa-magnifying-glass"></i>
                  </div>
                  <h3>Búsqueda Avanzada</h3>
                  <p>Localizar documentación específica</p>
                </button>
              </div>
            </div>

            {/* Lista de Documentos */}
            <div className="documents-section">
              <h2>Mis Documentos</h2>
              <div className="documents-table">
                <div className="table-header">
                  <span>Documento</span>
                  <span>Estado</span>
                  <span>Firmantes</span>
                  <span>Creado</span>
                  <span>Acciones</span>
                </div>
                {documents.map(doc => (
                  <div key={doc.id} className="table-row">
                    <span className="doc-name">{doc.nombre}</span>
                    <span 
                      className="doc-status" 
                      style={{ color: getStatusColor(doc.estado) }}
                    >
                      {doc.estado}
                    </span>
                    <span className="doc-signers">{doc.firmantes} firmantes</span>
                    <span className="doc-date">{doc.creado}</span>
                    <div className="doc-actions">
                      <button 
                        className="action-btn preview"
                        onClick={() => previewDocument(doc)}
                      >
                        Revisar
                      </button>
                      {doc.estado === 'Borrador' && (
                        <button 
                          className="action-btn assign"
                          onClick={() => startSignerSearch(doc)}
                        >
                          Buscar Firmantes
                        </button>
                      )}
                      {(doc.estado === 'En Proceso' || doc.estado === 'Configurado') && (
                        <button 
                          className="action-btn info"
                          onClick={() => previewDocument(doc)}
                        >
                          {doc.firmantes} asignado(s)
                        </button>
                      )}
                      {doc.estado === 'En Proceso' && (
                        <button 
                          className="action-btn config"
                          onClick={() => configureSignatureFlow(doc)}
                        >
                          Configurar Flujo
                        </button>
                      )}
                      {doc.estado === 'Configurado' && (
                        <button 
                          className="action-btn config"
                          onClick={() => configureSignatureFlow(doc)}
                        >
                          Editar Flujo
                        </button>
                      )}
                      {(doc.estado === 'Borrador' || doc.estado === 'En Proceso') && (
                        <button 
                          className="action-btn cancel"
                          onClick={() => cancelDocument(doc.id)}
                        >
                          Anular
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Vista de Carga de Documento */}
        {currentView === 'upload' && (
          <div className="upload-section">
            <h2>Iniciar Nuevo Documento Oficial</h2>
            
            {uploadState === 'idle' && (
              <div className="upload-area">
                <div className="upload-box">
                  <div className="upload-icon">
                    <i className="fa-solid fa-file-pdf"></i>
                  </div>
                  <h3>Cargar Documento PDF</h3>
                  <p>Seleccione el archivo oficial para procesamiento</p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="file-input"
                    id="fileInput"
                  />
                  <label htmlFor="fileInput" className="upload-btn">
                    Seleccionar Archivo
                  </label>
                  <div className="upload-requirements">
                    <p>• Formato: PDF únicamente</p>
                    <p>• Tamaño máximo: 25MB</p>
                    <p>• Seguridad: Cifrado AES-256</p>
                  </div>
                </div>
              </div>
            )}

            {uploadState === 'processing' && (
              <div className="processing-area">
                <h3>Procesando documento oficial...</h3>
                <div className="progress-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p>{uploadProgress}% completado</p>
                </div>
                <div className="processing-steps">
                  <div className={`step ${uploadProgress >= 20 ? 'completed' : ''}`}>
                    <i className="fa-solid fa-check"></i> Validación de formato y seguridad
                  </div>
                  <div className={`step ${uploadProgress >= 50 ? 'completed' : ''}`}>
                    <i className="fa-solid fa-check"></i> Aplicando cifrado militar AES-256
                  </div>
                  <div className={`step ${uploadProgress >= 80 ? 'completed' : ''}`}>
                    <i className="fa-solid fa-check"></i> Generando hash de integridad SHA-256
                  </div>
                  <div className={`step ${uploadProgress >= 100 ? 'completed' : ''}`}>
                    <i className="fa-solid fa-check"></i> Almacenando en repositorio seguro FAE
                  </div>
                </div>
              </div>
            )}

            {uploadState === 'completed' && (
              <div className="success-area">
                <div className="success-icon">
                  <i className="fa-solid fa-circle-check"></i>
                </div>
                <h3>Documento procesado exitosamente</h3>
                <p>Archivo: {selectedFile?.name}</p>
                <p>El documento ha sido cifrado y almacenado según protocolos FAE</p>
                <p>Redirigiendo a inspección...</p>
              </div>
            )}
          </div>
        )}

        {/* Vista de Preview */}
        {currentView === 'preview' && selectedDocument && (
          <div className="preview-section">
            <h2>Inspección del Documento</h2>
            
            <div className="document-details">
              <div className="doc-header">
                <div className="doc-icon">
                  <i className="fa-solid fa-file-lines"></i>
                </div>
                <div className="doc-info">
                  <h3>{selectedDocument.nombre}</h3>
                  <p>Fecha de carga: {selectedDocument.creado}</p>
                  <p>Estado operacional: <span style={{ color: getStatusColor(selectedDocument.estado) }}>
                    {selectedDocument.estado}
                  </span></p>
                </div>
              </div>

              <div className="security-info">
                <h4>
                  <i className="fa-solid fa-shield-halved"></i> Información de Seguridad FAE
                </h4>
                <div className="security-grid">
                  <div className="security-item">
                    <span className="label">Hash de Integridad:</span>
                    <span className="value">{selectedDocument.hash}</span>
                  </div>
                  <div className="security-item">
                    <span className="label">Cifrado Militar:</span>
                    <span className="value">AES-256-GCM <i className="fa-solid fa-check-circle"></i></span>
                  </div>
                  <div className="security-item">
                    <span className="label">Personal asignado:</span>
                    <span className="value">{selectedDocument.firmantes}</span>
                  </div>
                </div>
              </div>

              <div className="pdf-preview">
                <div className="preview-header">
                  <h4>
                    <i className="fa-solid fa-file-pdf"></i> Vista de Inspección
                  </h4>
                  <div className="preview-controls">
                    <button className="zoom-btn" onClick={zoomOut} disabled={zoomLevel <= 50}>
                      <i className="fa-solid fa-magnifying-glass-minus"></i>
                    </button>
                    <span className="zoom-level">{zoomLevel}%</span>
                    <button className="zoom-btn" onClick={zoomIn} disabled={zoomLevel >= 200}>
                      <i className="fa-solid fa-magnifying-glass-plus"></i>
                    </button>
                    <button className="zoom-btn" onClick={resetZoom}>
                      <i className="fa-solid fa-arrows-to-circle"></i>
                    </button>
                  </div>
                </div>
                
                <div className="pdf-viewer-container">
                  {pdfUrl && documentContent ? (
                    <div className="real-pdf-viewer">
                      <div className="pdf-info">
                        <p><strong>Archivo:</strong> {documentContent.name}</p>
                        <p><strong>Tamaño:</strong> {(documentContent.size / 1024 / 1024).toFixed(2)} MB</p>
                        <p><strong>Tipo:</strong> {documentContent.type}</p>
                      </div>
                      <div className="pdf-embed-container" style={{ transform: `scale(${zoomLevel / 100})` }}>
                        <embed
                          src={pdfUrl}
                          type="application/pdf"
                          width="100%"
                          height="600px"
                          className="pdf-embed"
                        />
                      </div>
                      <div className="pdf-fallback">
                        <p>
                          Si no puede ver el PDF, puede 
                          <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="download-link">
                            <i className="fa-solid fa-download"></i> descargarlo aquí
                          </a>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="pdf-placeholder">
                      <div className="pdf-page" style={{ transform: `scale(${zoomLevel / 100})` }}>
                        <div className="document-header">
                          <div className="fae-logo">
                            <strong>FUERZAS ARMADAS DEL ECUADOR</strong>
                          </div>
                          <div className="document-type">
                            DOCUMENTO OFICIAL
                          </div>
                        </div>
                        
                        <div className="document-content">
                          <div className="document-title">
                            <h2>{selectedDocument.nombre.replace('.pdf', '').replace(/_/g, ' ')}</h2>
                          </div>
                          
                          <div className="document-body">
                            <div className="content-section">
                              <h3>ANTECEDENTES</h3>
                              <div className="content-line full"></div>
                              <div className="content-line full"></div>
                              <div className="content-line medium"></div>
                            </div>
                            
                            <div className="content-section">
                              <h3>CONSIDERANDO</h3>
                              <div className="content-line full"></div>
                              <div className="content-line full"></div>
                              <div className="content-line short"></div>
                            </div>
                            
                            <div className="content-section">
                              <h3>RESUELVE</h3>
                              <div className="content-line full"></div>
                              <div className="content-line medium"></div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="signature-section">
                          <div className="signature-placeholder">
                            <div className="signature-line">
                              <span>____________________________</span>
                              <p>Área de Firma Electrónica FAE</p>
                              <small>Firma Digital Certificada</small>
                            </div>
                          </div>
                          
                          <div className="document-metadata">
                            <p><strong>ID Documento:</strong> {selectedDocument.fileId}</p>
                            <p><strong>Hash:</strong> {selectedDocument.hash}</p>
                            <p><strong>Fecha:</strong> {selectedDocument.creado}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="preview-actions">
                {selectedDocument.estado === 'Borrador' && (
                  <button 
                    className="btn-primary"
                    onClick={() => startSignerSearch(selectedDocument)}
                  >
                    <i className="fa-solid fa-search"></i> Buscar Firmantes
                  </button>
                )}
                <button className="btn-secondary" onClick={backToDashboard}>
                  <i className="fa-solid fa-arrow-left"></i> Volver al Panel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Vista de Asignación de Firmantes */}
        {currentView === 'assign' && selectedDocument && (
          <div className="assign-section">
            <h2>
              <i className="fa-solid fa-user-gear"></i> Asignación de Personal Militar
            </h2>
            <p>Documento oficial: <strong>{selectedDocument.nombre}</strong></p>

            <div className="assign-grid">
              <div className="available-users">
                <h3>Personal FAE Disponible</h3>
                <div className="users-list">
                  {availableUsers.map(user => (
                    <div 
                      key={user.id} 
                      className={`user-card ${selectedSigners.find(s => s.id === user.id) ? 'selected' : ''}`}
                      onClick={() => addSigner(user)}
                    >
                      <div className="user-info">
                        <strong>{user.nombre} {user.apellido}</strong>
                        <span className="user-rank">{user.rango}</span>
                        <span className="user-unit">{user.reparto}</span>
                        <span className="user-email">{user.email}</span>
                      </div>
                      <button className="add-user-btn">
                        {selectedSigners.find(s => s.id === user.id) ? 
                          <i className="fa-solid fa-check"></i> : 
                          <i className="fa-solid fa-plus"></i>
                        }
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="selected-signers">
                <h3>Personal Asignado ({selectedSigners.length}/10)</h3>
                
                {selectedSigners.length === 0 ? (
                  <div className="no-signers">
                    <p>Sin personal asignado</p>
                    <p>Seleccione personal del panel izquierdo</p>
                  </div>
                ) : (
                  <div className="signers-list">
                    {selectedSigners.map((signer, index) => (
                      <div key={signer.id} className="signer-card">
                        <div className="signer-order">{signer.order}</div>
                        <div className="signer-details">
                          <strong>{signer.nombre} {signer.apellido}</strong>
                          <span>{signer.rango} • {signer.reparto}</span>
                        </div>
                        <select 
                          value={signer.role}
                          onChange={(e) => changeSignerRole(signer.id, e.target.value)}
                          className="role-select"
                        >
                          <option value="Firmante">Firmante</option>
                          <option value="Aprobador">Aprobador</option>
                          <option value="Testigo">Testigo</option>
                        </select>
                        <button 
                          className="remove-signer-btn"
                          onClick={() => removeSigner(signer.id)}
                        >
                          <i className="fa-solid fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="assign-actions">
                  <button 
                    className="btn-primary"
                    onClick={confirmSignerAssignment}
                    disabled={selectedSigners.length === 0}
                  >
                    <i className="fa-solid fa-check-circle"></i> Confirmar Asignación ({selectedSigners.length})
                  </button>
                  <button className="btn-secondary" onClick={backToDashboard}>
                    <i className="fa-solid fa-ban"></i> Cancelar Operación
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vista de Búsqueda Avanzada */}
        {currentView === 'search' && (
          <div className="search-section">
            <h2>
              <i className="fa-solid fa-magnifying-glass"></i> Búsqueda Avanzada de Documentos
            </h2>
            
            <div className="search-container">
              <div className="search-input-container">
                <i className="fa-solid fa-search search-icon"></i>
                <input
                  type="text"
                  placeholder="Buscar por nombre, estado, ID o hash del documento..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="search-input"
                />
                {searchQuery && (
                  <button 
                    className="clear-search"
                    onClick={() => handleSearch('')}
                  >
                    <i className="fa-solid fa-times"></i>
                  </button>
                )}
              </div>
              
              <div className="search-results">
                <div className="results-header">
                  <h3>
                    Resultados de búsqueda ({filteredDocuments.length} documento{filteredDocuments.length !== 1 ? 's' : ''})
                  </h3>
                </div>
                
                {filteredDocuments.length === 0 ? (
                  <div className="no-results">
                    <i className="fa-solid fa-folder-open"></i>
                    <p>No se encontraron documentos que coincidan con su búsqueda</p>
                    <p>Intente con otros términos de búsqueda</p>
                  </div>
                ) : (
                  <div className="search-documents-table">
                    <div className="table-header">
                      <span>Documento</span>
                      <span>Estado</span>
                      <span>Firmantes</span>
                      <span>Creado</span>
                      <span>Acciones</span>
                    </div>
                    {filteredDocuments.map(doc => (
                      <div key={doc.id} className="table-row">
                        <span className="doc-name">{doc.nombre}</span>
                        <span 
                          className="doc-status" 
                          style={{ color: getStatusColor(doc.estado) }}
                        >
                          {doc.estado}
                        </span>
                        <span className="doc-signers">{doc.firmantes} firmantes</span>
                        <span className="doc-date">{doc.creado}</span>
                        <div className="doc-actions">
                          <button 
                            className="action-btn preview"
                            onClick={() => previewDocument(doc)}
                          >
                            <i className="fa-solid fa-eye"></i> Revisar
                          </button>
                          {doc.estado === 'Borrador' && (
                            <button 
                              className="action-btn assign"
                              onClick={() => startSignerSearch(doc)}
                            >
                              <i className="fa-solid fa-users"></i> Buscar Firmantes
                            </button>
                          )}
                          {doc.estado === 'En Proceso' && (
                            <button 
                              className="action-btn info"
                              onClick={() => previewDocument(doc)}
                            >
                              <i className="fa-solid fa-info-circle"></i> {doc.firmantes} asignado(s)
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Vista de Búsqueda de Firmantes */}
        {currentView === 'searchSigners' && selectedDocument && (
          <div className="search-signers-section">
            <h2>
              <i className="fa-solid fa-search"></i> Buscar Firmantes Disponibles
            </h2>
            
            <div className="document-header-search">
              <div className="doc-icon">
                <i className="fa-solid fa-file-signature"></i>
              </div>
              <div className="doc-info">
                <h3>{selectedDocument.nombre}</h3>
                <p>Estado: <span style={{ color: getStatusColor(selectedDocument.estado) }}>
                  {selectedDocument.estado}
                </span></p>
              </div>
            </div>

            <div className="search-container">
              {/* Barra de búsqueda */}
              <div className="search-input-container">
                <i className="fa-solid fa-search search-icon"></i>
                <input
                  type="text"
                  placeholder="Buscar por nombre, apellido o email..."
                  value={signerSearchQuery}
                  onChange={(e) => setSignerSearchQuery(e.target.value)}
                  className="search-input"
                />
                <button 
                  className="filter-toggle-btn"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <i className="fa-solid fa-filter"></i>
                  Filtros
                </button>
              </div>

              {/* Filtros avanzados */}
              {showFilters && (
                <div className="filters-panel">
                  <div className="filter-group">
                    <label>Reparto:</label>
                    <select
                      value={signerFilters.reparto}
                      onChange={(e) => setSignerFilters({...signerFilters, reparto: e.target.value})}
                    >
                      <option value="">Todos los repartos</option>
                      <option value="Comando Conjunto">Comando Conjunto</option>
                      <option value="Fuerza Aérea">Fuerza Aérea</option>
                      <option value="Ejército">Ejército</option>
                      <option value="Armada">Armada</option>
                      <option value="Administración">Administración</option>
                      <option value="Sistemas">Sistemas</option>
                      <option value="Logística">Logística</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <label>Rango:</label>
                    <select
                      value={signerFilters.rango}
                      onChange={(e) => setSignerFilters({...signerFilters, rango: e.target.value})}
                    >
                      <option value="">Todos los rangos</option>
                      <optgroup label="Oficiales Generales">
                        <option value="General del Aire">General del Aire</option>
                        <option value="Teniente General">Teniente General</option>
                        <option value="Brigadier General">Brigadier General</option>
                      </optgroup>
                      <optgroup label="Oficiales Superiores">
                        <option value="Coronel">Coronel</option>
                        <option value="Teniente Coronel">Teniente Coronel</option>
                        <option value="Mayor">Mayor</option>
                      </optgroup>
                      <optgroup label="Oficiales Subalternos">
                        <option value="Capitán">Capitán</option>
                        <option value="Teniente">Teniente</option>
                        <option value="Subteniente">Subteniente</option>
                      </optgroup>
                      <optgroup label="Personal Civil">
                        <option value="Especialista TI">Especialista TI</option>
                        <option value="Técnico Administrativo">Técnico Administrativo</option>
                      </optgroup>
                    </select>
                  </div>

                  <div className="filter-group">
                    <label>Estado:</label>
                    <select
                      value={signerFilters.estado}
                      onChange={(e) => setSignerFilters({...signerFilters, estado: e.target.value})}
                    >
                      <option value="">Todos</option>
                      <option value="Habilitado">Habilitado</option>
                      <option value="Inhabilitado">Inhabilitado</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="search-results">
              {/* Estadísticas de búsqueda */}
              <div className="search-stats">
                <p>
                  Mostrando {filteredUsers.length} de {availableUsers.length} usuarios disponibles
                  {selectedSigners.length > 0 && (
                    <span className="selected-count">
                      | {selectedSigners.length} seleccionado(s)
                    </span>
                  )}
                </p>
              </div>

              {/* Lista de usuarios disponibles */}
              <div className="users-grid">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <div 
                      key={user.id} 
                      className={`user-card-search ${selectedSigners.find(s => s.id === user.id) ? 'selected' : ''} ${user.estado === 'Inhabilitado' ? 'disabled' : ''}`}
                    >
                      <div className="user-header">
                        <div className="user-avatar">
                          <i className="fa-solid fa-user"></i>
                        </div>
                        <div className="user-info">
                          <h4>{user.nombre} {user.apellido}</h4>
                          <p className="user-rank">{user.rango}</p>
                          <p className="user-department">{user.reparto}</p>
                        </div>
                        <div className="user-status">
                          <span className={`status-badge ${user.estado.toLowerCase()}`}>
                            {user.estado}
                          </span>
                        </div>
                      </div>
                      
                      <div className="user-details">
                        <p className="user-email">
                          <i className="fa-solid fa-envelope"></i>
                          {user.email}
                        </p>
                        <p className="user-role-auto">
                          <i className="fa-solid fa-tag"></i>
                          Rol automático: {getRoleFromRank(user.rango)}
                        </p>
                      </div>

                      <div className="user-actions">
                        {selectedSigners.find(s => s.id === user.id) ? (
                          <button 
                            className="btn-remove"
                            onClick={() => removeSigner(user.id)}
                          >
                            <i className="fa-solid fa-minus"></i> Remover
                          </button>
                        ) : (
                          <button 
                            className="btn-add"
                            onClick={() => addSigner(user)}
                            disabled={user.estado === 'Inhabilitado'}
                          >
                            <i className="fa-solid fa-plus"></i> Agregar
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-results">
                    <i className="fa-solid fa-search-minus"></i>
                    <h3>No se encontraron resultados</h3>
                    <p>Intente modificar los criterios de búsqueda o filtros</p>
                  </div>
                )}
              </div>
            </div>

            {/* Panel de firmantes seleccionados */}
            {selectedSigners.length > 0 && (
              <div className="selected-signers-panel">
                <h3>
                  <i className="fa-solid fa-users-check"></i> 
                  Firmantes Seleccionados ({selectedSigners.length})
                </h3>
                <div className="selected-signers-list">
                  {selectedSigners.map((signer, index) => (
                    <div key={signer.id} className="selected-signer-item">
                      <div className="signer-info">
                        <span className="signer-name">{signer.nombre} {signer.apellido}</span>
                        <span className="signer-rank">{signer.rango}</span>
                        <span className="signer-role">{signer.role}</span>
                      </div>
                      <button 
                        className="remove-signer-btn"
                        onClick={() => removeSigner(signer.id)}
                      >
                        <i className="fa-solid fa-times"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="search-actions">
              <button 
                className="btn-secondary"
                onClick={() => setCurrentView('dashboard')}
              >
                <i className="fa-solid fa-arrow-left"></i> Cancelar
              </button>
              
              <button 
                className="btn-primary"
                onClick={proceedToFlowConfig}
                disabled={selectedSigners.length === 0}
              >
                <i className="fa-solid fa-arrow-right"></i> 
                Configurar Flujo ({selectedSigners.length} firmantes)
              </button>
            </div>
          </div>
        )}

        {/* Vista de Configuración de Flujo de Firma */}
        {currentView === 'configFlow' && selectedDocument && (
          <div className="config-flow-section">
            <h2>
              <i className="fa-solid fa-sitemap"></i> Configurar Flujo de Firma Digital
            </h2>
            
            <div className="document-header-config">
              <div className="doc-icon">
                <i className="fa-solid fa-file-signature"></i>
              </div>
              <div className="doc-info">
                <h3>{selectedDocument.nombre}</h3>
                <p>Estado: <span style={{ color: getStatusColor(selectedDocument.estado) }}>
                  {selectedDocument.estado}
                </span></p>
                <p>Firmantes asignados: {selectedDocument.firmantes}</p>
              </div>
            </div>

            <div className="flow-config-container">
              {/* Tipo de Flujo */}
              <div className="config-section">
                <h3>
                  <i className="fa-solid fa-route"></i> Tipo de Flujo
                </h3>
                <div className="flow-type-options">
                  <label className={`flow-option ${signatureFlowType === 'secuencial' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="flowType"
                      value="secuencial"
                      checked={signatureFlowType === 'secuencial'}
                      onChange={(e) => setSignatureFlowType(e.target.value)}
                    />
                    <div className="option-content">
                      <i className="fa-solid fa-arrow-down"></i>
                      <span>Secuencial</span>
                      <p>Los firmantes firman en orden jerárquico establecido</p>
                    </div>
                  </label>
                  
                  <label className={`flow-option ${signatureFlowType === 'paralelo' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="flowType"
                      value="paralelo"
                      checked={signatureFlowType === 'paralelo'}
                      onChange={(e) => setSignatureFlowType(e.target.value)}
                    />
                    <div className="option-content">
                      <i className="fa-solid fa-users"></i>
                      <span>Paralelo</span>
                      <p>Múltiples firmantes pueden firmar simultáneamente</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Requisitos de Seguridad */}
              <div className="config-section">
                <h3>
                  <i className="fa-solid fa-shield-halved"></i> Requisitos de Seguridad
                </h3>
                <div className="security-options">
                  <label className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={requireOTP}
                      onChange={(e) => setRequireOTP(e.target.checked)}
                    />
                    <span>Requerir OTP (One-Time Password)</span>
                  </label>
                  
                  <label className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={requireDigitalCert}
                      onChange={(e) => setRequireDigitalCert(e.target.checked)}
                    />
                    <span>Certificado Digital Obligatorio</span>
                  </label>
                </div>
              </div>

              {/* Configuración de Tiempo */}
              <div className="config-section">
                <h3>
                  <i className="fa-solid fa-clock"></i> Plazos Máximos
                </h3>
                <div className="time-config">
                  <label>
                    Tiempo máximo por etapa (horas):
                    <input
                      type="number"
                      min="1"
                      max="168"
                      value={maxTimePerStage}
                      onChange={(e) => setMaxTimePerStage(parseInt(e.target.value))}
                    />
                  </label>
                  <p className="time-note">
                    Después de este tiempo, se notificará a supervisores
                  </p>
                </div>
              </div>

              {/* Configuración Secuencial */}
              {signatureFlowType === 'secuencial' && (
                <div className="config-section">
                  <h3>
                    <i className="fa-solid fa-list-ol"></i> Orden de Firmantes (Jerárquico Automático)
                  </h3>
                  
                  {hierarchyOrder.length > 0 ? (
                    <div className="hierarchy-preview">
                      <p>Orden de firma establecido automáticamente según jerarquía militar FAE:</p>
                      <div className="signing-order">
                        {hierarchyOrder.map((signer, index) => (
                          <div key={signer.id} className="signing-step">
                            <div className="step-number">{index + 1}</div>
                            <div className="signer-details">
                              <div className="signer-name">{signer.nombre} {signer.apellido}</div>
                              <div className="signer-rank">{signer.rango}</div>
                              <div className="signer-department">{signer.reparto}</div>
                              <div className="signer-role">{signer.role}</div>
                            </div>
                            <div className="step-connector">
                              {index < hierarchyOrder.length - 1 && (
                                <i className="fa-solid fa-arrow-down"></i>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="hierarchy-info">
                      <p>Seleccione firmantes para ver el orden jerárquico automático</p>
                      <div className="hierarchy-order">
                        <div className="rank-item">1. General del Aire / Teniente General / Brigadier General</div>
                        <div className="rank-item">2. Coronel</div>
                        <div className="rank-item">3. Teniente Coronel</div>
                        <div className="rank-item">4. Mayor</div>
                        <div className="rank-item">5. Capitán</div>
                        <div className="rank-item">6. Teniente</div>
                        <div className="rank-item">7. Subteniente</div>
                        <div className="rank-item">8. Personal Civil (Especialistas/Técnicos)</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Configuración Paralela */}
              {signatureFlowType === 'paralelo' && (
                <div className="config-section">
                  <h3>
                    <i className="fa-solid fa-layer-group"></i> Grupos de Firmantes
                  </h3>
                  <div className="parallel-groups">
                    {signatureGroups.map((group, index) => (
                      <div key={group.id} className="group-config">
                        <div className="group-header">
                          <input
                            type="text"
                            value={group.name}
                            onChange={(e) => {
                              const updatedGroups = [...signatureGroups];
                              updatedGroups[index].name = e.target.value;
                              setSignatureGroups(updatedGroups);
                            }}
                            placeholder="Nombre del grupo"
                          />
                          <button 
                            className="remove-group-btn"
                            onClick={() => removeGroup(group.id)}
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                        <div className="group-time">
                          <label>
                            Tiempo máximo para este grupo (horas):
                            <input
                              type="number"
                              min="1"
                              max="168"
                              value={group.maxTime}
                              onChange={(e) => {
                                const updatedGroups = [...signatureGroups];
                                updatedGroups[index].maxTime = parseInt(e.target.value);
                                setSignatureGroups(updatedGroups);
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    ))}
                    
                    <button 
                      className="add-group-btn"
                      onClick={addParallelGroup}
                    >
                      <i className="fa-solid fa-plus"></i> Agregar Grupo
                    </button>
                  </div>
                </div>
              )}

              {/* Campos Obligatorios */}
              <div className="config-section">
                <h3>
                  <i className="fa-solid fa-check-square"></i> Campos Obligatorios por Firmante
                </h3>
                <div className="mandatory-fields">
                  {['Observaciones', 'Cargo/Función', 'Ubicación', 'Fecha específica'].map((field) => (
                    <label key={field} className="checkbox-option">
                      <input
                        type="checkbox"
                        checked={mandatoryFields.includes(field)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setMandatoryFields([...mandatoryFields, field]);
                          } else {
                            setMandatoryFields(mandatoryFields.filter(f => f !== field));
                          }
                        }}
                      />
                      <span>{field}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="config-actions">
              <button 
                className="btn-secondary"
                onClick={() => setCurrentView('dashboard')}
              >
                <i className="fa-solid fa-arrow-left"></i> Cancelar
              </button>
              
              <button 
                className="btn-primary"
                onClick={confirmFlowConfiguration}
              >
                <i className="fa-solid fa-save"></i> Confirmar Configuración
              </button>
            </div>
          </div>
        )}
      </main>
        </div>
      </div>
    </div>
  );
}
