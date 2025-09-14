import { useState, useEffect } from 'react';
import './EditWordForm.css';

interface EditWordFormProps {
  original: string;
  replacement: string;
  existingWords: string[];
  onSave: (oldOriginal: string, newOriginal: string, newReplacement: string) => void;
  onCancel: () => void;
}

export default function EditWordForm({ 
  original, 
  replacement, 
  existingWords, 
  onSave, 
  onCancel 
}: EditWordFormProps) {
  const [newOriginal, setNewOriginal] = useState(original);
  const [newReplacement, setNewReplacement] = useState(replacement);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

  const trimmedOriginal = newOriginal.trim();
  const trimmedReplacement = newReplacement.trim();
  const isFormValid = trimmedOriginal.length > 0 && trimmedReplacement.length > 0;
  const isDuplicate = trimmedOriginal !== original && existingWords.includes(trimmedOriginal);
  const hasChanges = trimmedOriginal !== original || trimmedReplacement !== replacement;

  // Auto-focus the first input when component mounts
  useEffect(() => {
    const firstInput = document.querySelector('.edit-form input') as HTMLInputElement;
    if (firstInput) {
      firstInput.focus();
      firstInput.select();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid || !hasChanges) return;

    if (isDuplicate) {
      setShowDuplicateWarning(true);
      return;
    }

    handleSave();
  };

  const handleSave = () => {
    onSave(original, trimmedOriginal, trimmedReplacement);
    setShowDuplicateWarning(false);
  };

  const handleConfirmOverwrite = () => {
    handleSave();
  };

  const handleCancelOverwrite = () => {
    setShowDuplicateWarning(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="edit-form-container">
      <form onSubmit={handleSubmit} className="edit-form">
        <div className="edit-inputs">
          <input
            type="text"
            value={newOriginal}
            onChange={(e) => setNewOriginal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Original word"
            maxLength={100}
            className="edit-input original-input"
          />
          <input
            type="text"
            value={newReplacement}
            onChange={(e) => setNewReplacement(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Replacement word"
            maxLength={100}
            className="edit-input replacement-input"
          />
        </div>
        
        <div className="edit-actions">
          <button 
            type="submit" 
            className={`save-button ${(!isFormValid || !hasChanges) ? 'disabled' : ''}`}
            disabled={!isFormValid || !hasChanges}
          >
            Save
          </button>
          <button 
            type="button" 
            onClick={onCancel}
            className="cancel-button"
          >
            Cancel
          </button>
        </div>
      </form>

      {showDuplicateWarning && (
        <div className="duplicate-warning">
          <p>The word "{trimmedOriginal}" already exists. Do you want to overwrite it?</p>
          <div className="warning-buttons">
            <button onClick={handleConfirmOverwrite} className="confirm-button">
              Yes, Overwrite
            </button>
            <button onClick={handleCancelOverwrite} className="cancel-warning-button">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}