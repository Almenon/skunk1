import { useRef, useState } from 'react';
import './AddWordForm.css';

interface AddWordFormProps {
  onAddWord: (original: string, replacement: string) => void;
  existingWords: string[];
}

export default function AddWordForm({ onAddWord, existingWords }: AddWordFormProps) {
  const [original, setOriginal] = useState('');
  const [replacement, setReplacement] = useState('');
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const originalInputRef = useRef<HTMLInputElement>(null);

  const trimmedOriginal = original.trim();
  const trimmedReplacement = replacement.trim();
  const isFormValid = trimmedOriginal.length > 0 && trimmedReplacement.length > 0;
  const isDuplicate = existingWords.includes(trimmedOriginal);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) return;

    if (isDuplicate) {
      setShowDuplicateWarning(true);
      return;
    }

    handleAddWord();
  };

  const handleAddWord = () => {
    onAddWord(trimmedOriginal, trimmedReplacement);
    setOriginal('');
    setReplacement('');
    setShowDuplicateWarning(false);

    // Focus back to the original word input for easy consecutive additions
    originalInputRef.current?.focus();
  };

  const handleConfirmOverwrite = () => {
    handleAddWord();
  };

  const handleCancelOverwrite = () => {
    setShowDuplicateWarning(false);
  };

  return (
    <div className="add-word-form">
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="original-word">Original Word / Phrase</label>
            <input
              ref={originalInputRef}
              id="original-word"
              type="text"
              value={original}
              onChange={(e) => setOriginal(e.target.value)}
              placeholder="Enter word to replace"
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label htmlFor="replacement-word">Replacement Word / Phrase</label>
            <input
              id="replacement-word"
              type="text"
              value={replacement}
              onChange={(e) => setReplacement(e.target.value)}
              placeholder="Enter replacement word"
              maxLength={100}
            />
          </div>

          <button
            type="submit"
            className={`add-button ${!isFormValid ? 'disabled' : ''}`}
            disabled={!isFormValid}
          >
            Add
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
            <button onClick={handleCancelOverwrite} className="cancel-button">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}