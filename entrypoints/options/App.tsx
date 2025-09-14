import { useState, useEffect } from 'react';
import { AddWordForm, WordPairList } from './components';
import './App.css';

interface WordReplacements {
  [original: string]: string;
}

function App() {
  const [wordPairs, setWordPairs] = useState<WordReplacements>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Load word pairs from storage (will be implemented in later tasks)
    // For now, initialize with empty object
    setWordPairs({});
    setLoading(false);
  }, []);

  const handleAddWord = (original: string, replacement: string) => {
    setWordPairs(prev => ({
      ...prev,
      [original]: replacement
    }));
  };

  const handleEditWord = (oldOriginal: string, newOriginal: string, newReplacement: string) => {
    setWordPairs(prev => {
      const updated = { ...prev };
      
      // Remove old entry if original word changed
      if (oldOriginal !== newOriginal) {
        delete updated[oldOriginal];
      }
      
      // Add/update with new values
      updated[newOriginal] = newReplacement;
      
      return updated;
    });
  };

  const handleDeleteWord = (original: string) => {
    setWordPairs(prev => {
      const updated = { ...prev };
      delete updated[original];
      return updated;
    });
  };

  if (loading) {
    return (
      <div className="options-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="options-container">
      <header className="options-header">
        <h1>Word Replacement Settings</h1>
        <p>Manage your word replacement pairs</p>
      </header>

      <main className="options-main">
        <section className="word-pairs-section">
          <h2>Current Word Pairs</h2>
          <WordPairList
            wordPairs={wordPairs}
            onEditWord={handleEditWord}
            onDeleteWord={handleDeleteWord}
          />
        </section>

        <section className="add-word-section">
          <h2>Add New Word Pair</h2>
          <AddWordForm
            onAddWord={handleAddWord}
            existingWords={Object.keys(wordPairs)}
          />
        </section>
      </main>
    </div>
  );
}

export default App;