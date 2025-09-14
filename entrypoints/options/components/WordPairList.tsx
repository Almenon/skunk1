import { useState } from 'react';
import EditWordForm from './EditWordForm';
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
  const [editingWord, setEditingWord] = useState<string | null>(null);
  const [deletingWord, setDeletingWord] = useState<string | null>(null);

  const sortedPairs = Object.entries(wordPairs).sort(([a], [b]) => 
    a.toLowerCase().localeCompare(b.toLowerCase())
  );

  const handleEditStart = (original: string) => {
    setEditingWord(original);
  };

  const handleEditSave = (oldOriginal: string, newOriginal: string, newReplacement: string) => {
    onEditWord(oldOriginal, newOriginal, newReplacement);
    setEditingWord(null);
  };

  const handleEditCancel = () => {
    setEditingWord(null);
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
          {editingWord === original ? (
            <EditWordForm
              original={original}
              replacement={replacement}
              existingWords={Object.keys(wordPairs).filter(w => w !== original)}
              onSave={handleEditSave}
              onCancel={handleEditCancel}
            />
          ) : (
            <>
              <span className="word-original">{original}</span>
              <span className="word-replacement">{replacement}</span>
              <div className="word-actions">
                <button 
                  onClick={() => handleEditStart(original)}
                  className="edit-button"
                  title="Edit word pair"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteStart(original)}
                  className="delete-button"
                  title="Delete word pair"
                >
                  Delete
                </button>
              </div>
            </>
          )}
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