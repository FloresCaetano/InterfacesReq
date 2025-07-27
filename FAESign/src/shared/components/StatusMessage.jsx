import './StatusMessage.css';

export default function StatusMessage({ message, type, onClose }) {
  if (!message) return null;

  return (
    <div className={`status-message ${type}`}>
      <span className="status-message-text">{message}</span>
      {onClose && (
        <button 
          className="status-message-close"
          onClick={onClose}
          aria-label="Cerrar mensaje"
        >
          ×
        </button>
      )}
    </div>
  );
}
