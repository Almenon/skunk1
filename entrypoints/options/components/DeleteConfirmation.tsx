import { useEffect } from 'react';
import './DeleteConfirmation.css';

interface DeleteConfirmationProps {
  original: string;
  replacement: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmation({ 
  original, 
  replacement, 
  onConfirm, 
  onCancel 
}: DeleteConfirmationProps) {
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      } else if (e.key === 'Enter') {
        onConfirm();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onConfirm, onCancel]);

  // Focus the confirm button when component mounts
  useEffect(() => {
    const confirmButton = document.querySelector('.delete-confirm-button') as HTMLButtonElement;
    if (confirmButton) {
      confirmButton.focus();
    }
  }, []);

  return (
    <div className="delete-confirmation-overlay">
      <div className="delete-confirmation-modal">
        <div className="delete-confirmation-header">
          <h3>Confirm Deletion</h3>
        </div>
        
        <div className="delete-confirmation-content">
          <p>Are you sure you want to delete this word pair?</p>
          
          <div className="word-pair-preview">
            <div className="preview-item">
              <span className="preview-label">Original:</span>
              <span className="preview-original">{original}</span>
            </div>
            <div className="preview-item">
              <span className="preview-label">Replacement:</span>
              <span className="preview-replacement">{replacement}</span>
            </div>
          </div>
          
          <p className="warning-text">This action cannot be undone.</p>
        </div>
        
        <div className="delete-confirmation-actions">
          <button 
            onClick={onConfirm}
            className="delete-confirm-button"
          >
            Yes, Delete
          </button>
          <button 
            onClick={onCancel}
            className="delete-cancel-button"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}