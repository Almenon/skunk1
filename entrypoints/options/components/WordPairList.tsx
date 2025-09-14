import { useState } from 'react';
import InlineEditableWord from './InlineEditableWord';
import DeleteConfirmation from './DeleteConfirmation';
import './WordPairList.css';

interface WordReplacements {
  [original: string]: string;
}

interface WordPairListProps {
  wordPairs: WordReplacements;
  onEditWord: (oldOriginal: string, newOriginal: string, newReplacement: string) => void;
  onDeleteWord: (original: string) => void;
}

export default function WordPairList({ wordPairs, onEditWord, onDeleteWord }: WordPairListProps) {
  const [deletingWord, setDeletingWord] = useState<string | null>(null);

  const sortedPairs = Object.entries(wordPairs).sort(([a], [b]) => 
    a.toLowerCase().localeCompare(b.toLowerCase())
  );

  const handleOriginalEdit = (oldOriginal: string, newOriginal: string) => {
    const replacement = wordPairs[oldOriginal];
    onEditWord(oldOriginal, newOriginal, replacement);
  };

  const handleReplacementEdit = (original: string, newReplacement: string) => {
    onEditWord(original, original, newReplacement);
  };

  const handleDeleteStart = (original: string) => {
    setDeletingWord(original);
  };

  const handleDeleteConfirm = () => {
    if (deletingWord) {
      onDeleteWord(deletingWord);
      setDeletingWord(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeletingWord(null);
  };

  if (sortedPairs.length === 0) {
    return (
      <div className="empty-state">
        <p>No word replacements configured yet.</p>
        <p>Add your first word pair below to get started!</p>
      </div>
    );
  }

  return (
    <div className="word-pair-list">
      <div className="word-pair-header">
        <span className="header-original">Original Word</span>
        <span className="header-replacement">Replacement Word</span>
        <span className="header-actions">Actions</span>
      </div>
      
      {sortedPairs.map(([original, replacement]) => (
        <div key={original} className="word-pair-item">
          <InlineEditableWord
            value={original}
            onSave={(newValue) => handleOriginalEdit(original, newValue)}
            className="word-original"
            placeholder="Original word"
          />
          <InlineEditableWord
            value={replacement}
            onSave={(newValue) => handleReplacementEdit(original, newValue)}
            className="word-replacement"
            placeholder="Replacement word"
          />
          <div className="word-actions">
            <button 
              onClick={() => handleDeleteStart(original)}
              className="delete-button"
              title="Delete word pair"
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      {deletingWord && (
        <DeleteConfirmation
          original={deletingWord}
          replacement={wordPairs[deletingWord]}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </div>
  );
}