import React, { useState, useEffect } from 'react';
import './AssignSignersModal.css';

const AssignSignersModal = ({ show, onClose, document, onSignersAssigned }) => {
  const [users, setUsers] = useState([]);
  const [selectedSigners, setSelectedSigners] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRango, setFilterRango] = useState('');
  const [filterReparto, setFilterReparto] = useState('');
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  // Datos simulados de usuarios FAE
  const mockUsers = [
    { id: 1, nombre: 'Carlos', apellido: 'Mendoza', rango: 'Coronel', reparto: 'Comando Conjunto', email: 'carlos.mendoza@fae.mil.ec' },
    { id: 2, nombre: 'Ana', apellido: 'Rodriguez', rango: 'Teniente Coronel', reparto: 'Fuerza Aérea', email: 'ana.rodriguez@fae.mil.ec' },
    { id: 3, nombre: 'Miguel', apellido: 'Torres', rango: 'Mayor', reparto: 'Ejército', email: 'miguel.torres@fae.mil.ec' },
    { id: 4, nombre: 'Elena', apellido: 'Castro', rango: 'Capitán', reparto: 'Armada', email: 'elena.castro@fae.mil.ec' },
    { id: 5, nombre: 'Roberto', apellido: 'Silva', rango: 'Teniente', reparto: 'Fuerza Aérea', email: 'roberto.silva@fae.mil.ec' },
    { id: 6, nombre: 'Laura', apellido: 'Vega', rango: 'Subteniente', reparto: 'Ejército', email: 'laura.vega@fae.mil.ec' },
    { id: 7, nombre: 'Fernando', apellido: 'López', rango: 'General', reparto: 'Comando Conjunto', email: 'fernando.lopez@fae.mil.ec' },
    { id: 8, nombre: 'Isabel', apellido: 'Morales', rango: 'Coronel', reparto: 'Armada', email: 'isabel.morales@fae.mil.ec' },
    { id: 9, nombre: 'Diego', apellido: 'Herrera', rango: 'Mayor', reparto: 'Fuerza Aérea', email: 'diego.herrera@fae.mil.ec' },
    { id: 10, nombre: 'Carmen', apellido: 'Vargas', rango: 'Capitán', reparto: 'Ejército', email: 'carmen.vargas@fae.mil.ec' }
  ];

  if (!show || !document) return null;

  useEffect(() => {
    if (show) {
      loadUsers();
    }
  }, [show]);

  // Función para cargar usuarios
  const loadUsers = async () => {
    setLoading(true);
    // Simular carga desde base de datos
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUsers(mockUsers);
    setLoading(false);
  };

  // Función para filtrar usuarios
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      `${user.nombre} ${user.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRango = filterRango === '' || user.rango === filterRango;
    const matchesReparto = filterReparto === '' || user.reparto === filterReparto;
    
    return matchesSearch && matchesRango && matchesReparto;
  });

  // Función para agregar firmante
  const addSigner = (user) => {
    if (selectedSigners.length >= 10) {
      alert('Máximo 10 firmantes permitidos por documento');
      return;
    }
    
    if (selectedSigners.find(s => s.id === user.id)) {
      alert('Este usuario ya está asignado como firmante');
      return;
    }
    
    const newSigner = {
      ...user,
      role: 'Firmante', // Por defecto
      order: selectedSigners.length + 1
    };
    
    setSelectedSigners(prev => [...prev, newSigner]);
  };

  // Función para remover firmante
  const removeSigner = (id) => {
    setSelectedSigners(prev => {
      const updated = prev.filter(s => s.id !== id);
      // Reordenar después de eliminar
      return updated.map((signer, index) => ({
        ...signer,
        order: index + 1
      }));
    });
  };

  // Función para cambiar rol de firmante
  const changeSignerRole = (id, newRole) => {
    setSelectedSigners(prev =>
      prev.map(signer =>
        signer.id === id ? { ...signer, role: newRole } : signer
      )
    );
  };

  // Funciones para drag and drop
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }
    
    const newSigners = [...selectedSigners];
    const draggedItem = newSigners[draggedIndex];
    
    // Remover item de posición original
    newSigners.splice(draggedIndex, 1);
    
    // Insertar en nueva posición
    newSigners.splice(dropIndex, 0, draggedItem);
    
    // Actualizar órdenes
    const reorderedSigners = newSigners.map((signer, index) => ({
      ...signer,
      order: index + 1
    }));
    
    setSelectedSigners(reorderedSigners);
    setDraggedIndex(null);
  };

  // Función para procesar asignación
  const handleAssignSigners = () => {
    if (selectedSigners.length === 0) {
      alert('Debe asignar al menos un firmante');
      return;
    }
    
    // Validar que haya al menos un firmante
    const hasFirmante = selectedSigners.some(s => s.role === 'Firmante');
    if (!hasFirmante) {
      alert('Debe haber al menos un firmante en la lista');
      return;
    }
    
    // Simular envío de notificaciones
    const confirmed = window.confirm(
      `¿Confirma la asignación de ${selectedSigners.length} firmante(s) para el documento "${document.nombre}"?\n\n` +
      'Se enviarán notificaciones por correo electrónico a todos los firmantes asignados.'
    );
    
    if (confirmed) {
      onSignersAssigned(document.id, selectedSigners);
      
      // Simular envío de notificaciones
      selectedSigners.forEach(signer => {
        console.log(`Notificación enviada a: ${signer.email} (${signer.role})`);
      });
      
      alert('Firmantes asignados exitosamente. Se han enviado las notificaciones correspondientes.');
    }
  };

  // Obtener opciones únicas para filtros
  const rangos = [...new Set(users.map(u => u.rango))];
  const repartos = [...new Set(users.map(u => u.reparto))];

  return (
    <div className="modal-overlay">
      <div className="assign-modal-container">
        <div className="modal-header">
          <h2>Asignar Firmantes</h2>
          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="assign-content">
          {/* Información del documento */}
          <div className="document-summary">
            <h3>📄 {document.nombre}</h3>
            <p>Asignando firmantes para este documento</p>
          </div>
          
          <div className="assign-grid">
            {/* Panel izquierdo - Lista de usuarios */}
            <div className="users-panel">
              <h4>Personal FAE Disponible</h4>
              
              {/* Filtros */}
              <div className="filters">
                <input
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                
                <select
                  value={filterRango}
                  onChange={(e) => setFilterRango(e.target.value)}
                  className="filter-select"
                >
                  <option value="">Todos los rangos</option>
                  {rangos.map(rango => (
                    <option key={rango} value={rango}>{rango}</option>
                  ))}
                </select>
                
                <select
                  value={filterReparto}
                  onChange={(e) => setFilterReparto(e.target.value)}
                  className="filter-select"
                >
                  <option value="">Todos los repartos</option>
                  {repartos.map(reparto => (
                    <option key={reparto} value={reparto}>{reparto}</option>
                  ))}
                </select>
              </div>
              
              {/* Lista de usuarios */}
              <div className="users-list">
                {loading ? (
                  <div className="loading-users">
                    <div className="loading-spinner"></div>
                    <p>Cargando personal...</p>
                  </div>
                ) : (
                  filteredUsers.map(user => (
                    <div
                      key={user.id}
                      className={`user-item ${selectedSigners.find(s => s.id === user.id) ? 'selected' : ''}`}
                      onClick={() => addSigner(user)}
                    >
                      <div className="user-info">
                        <strong>{user.nombre} {user.apellido}</strong>
                        <span className="user-rango">{user.rango}</span>
                        <span className="user-reparto">{user.reparto}</span>
                        <span className="user-email">{user.email}</span>
                      </div>
                      <button className="add-btn">+</button>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Panel derecho - Firmantes asignados */}
            <div className="signers-panel">
              <h4>
                Firmantes Asignados ({selectedSigners.length}/10)
              </h4>
              
              {selectedSigners.length === 0 ? (
                <div className="no-signers">
                  <p>No hay firmantes asignados</p>
                  <p className="hint">Selecciona usuarios del panel izquierdo</p>
                </div>
              ) : (
                <div className="signers-list">
                  <div className="drag-hint">
                    💡 Arrastra para reordenar la secuencia de firmas
                  </div>
                  
                  {selectedSigners.map((signer, index) => (
                    <div
                      key={signer.id}
                      className={`signer-item ${draggedIndex === index ? 'dragging' : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                    >
                      <div className="signer-order">
                        <span className="order-number">{signer.order}</span>
                        <span className="drag-handle">⋮⋮</span>
                      </div>
                      
                      <div className="signer-details">
                        <strong>{signer.nombre} {signer.apellido}</strong>
                        <span className="signer-info">{signer.rango} • {signer.reparto}</span>
                        <span className="signer-email">{signer.email}</span>
                      </div>
                      
                      <div className="signer-role">
                        <select
                          value={signer.role}
                          onChange={(e) => changeSignerRole(signer.id, e.target.value)}
                          className="role-select"
                        >
                          <option value="Firmante">Firmante</option>
                          <option value="Aprobador">Aprobador</option>
                          <option value="Testigo">Testigo</option>
                        </select>
                      </div>
                      
                      <button
                        className="remove-btn"
                        onClick={() => removeSigner(signer.id)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Resumen de roles */}
              {selectedSigners.length > 0 && (
                <div className="roles-summary">
                  <h5>Resumen de Roles:</h5>
                  <div className="roles-count">
                    <span>Firmantes: {selectedSigners.filter(s => s.role === 'Firmante').length}</span>
                    <span>Aprobadores: {selectedSigners.filter(s => s.role === 'Aprobador').length}</span>
                    <span>Testigos: {selectedSigners.filter(s => s.role === 'Testigo').length}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="assign-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancelar
          </button>
          
          <button
            className="assign-confirm-btn"
            onClick={handleAssignSigners}
            disabled={selectedSigners.length === 0}
          >
            Asignar Firmantes ({selectedSigners.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignSignersModal;
