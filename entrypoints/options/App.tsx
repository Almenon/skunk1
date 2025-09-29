import { useState, useEffect, useCallback } from 'react';
import { AddWordForm, WordPairList } from './components';
import { WordStorageService, WordReplacements } from '../../lib/storage/word-storage';
import './App.css';

function App() {
  const [wordPairs, setWordPairs] = useState<WordReplacements>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [operationInProgress, setOperationInProgress] = useState(false);

  // Load word pairs from storage on component mount
  useEffect(() => {
    const loadWordPairs = async () => {
      try {
        setLoading(true);
        setError(null);
        const pairs = await WordStorageService.getWordPairs();
        setWordPairs(pairs);
      } catch (err) {
        console.error('Failed to load word pairs:', err);
        setError('Failed to load word pairs from storage. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    loadWordPairs();
  }, []);

  // Set up real-time storage synchronization
  useEffect(() => {
    return WordStorageService.watchWordPairs((newValue) => {
      setWordPairs(newValue);
    });
  }, [wordPairs]);

  // Generic handler for all storage operations
  const handleStorageOperation = useCallback(async (operation: () => Promise<void>, operationName: string) => {
    try {
      setOperationInProgress(true);
      setError(null);
      await operation();
    } catch (err) {
      console.error(`Failed to ${operationName}:`, err);
      setError(err instanceof Error ? err.message : `Failed to ${operationName}`);
    } finally {
      setOperationInProgress(false);
    }
  }, []);

  const handleAddWord = useCallback((original: string, replacement: string) => {
    return handleStorageOperation(
      () => WordStorageService.addWordPair(original, replacement),
      'add word pair'
    );
  }, [handleStorageOperation]);

  const handleEditWord = useCallback((oldOriginal: string, newOriginal: string, newReplacement: string) => {
    return handleStorageOperation(async () => {
      if (oldOriginal !== newOriginal) {
        await WordStorageService.deleteWordPair(oldOriginal);
        await WordStorageService.addWordPair(newOriginal, newReplacement);
      } else {
        await WordStorageService.updateWordPair(oldOriginal, newReplacement);
      }
    }, 'edit word pair');
  }, [handleStorageOperation]);

  const handleDeleteWord = useCallback((original: string) => {
    return handleStorageOperation(
      () => WordStorageService.deleteWordPair(original),
      'delete word pair'
    );
  }, [handleStorageOperation]);

  // Clear error after a delay
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (loading) {
    return (
      <div className="options-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading word pairs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="options-container">
      <header className="options-header">
        <h1>Word Replacement Settings</h1>
        <p>Manage your word replacement pairs</p>
      </header>

      {error && (
        <div className="error-banner">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <span className="error-message">{error}</span>
            <button
              className="error-dismiss"
              onClick={() => setError(null)}
              title="Dismiss error"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <main className="options-main">
        <section className="add-word-section">
          <h2>Add New Word Pair</h2>
          <AddWordForm
            onAddWord={handleAddWord}
            existingWords={Object.keys(wordPairs)}
          />
        </section>

        <section className="word-pairs-section">
          <div className="section-header">
            <h2>Current Word Pairs</h2>
            {operationInProgress && (
              <div className="operation-indicator">
                <div className="operation-spinner"></div>
                <span>Saving...</span>
              </div>
            )}
          </div>
          <WordPairList
            wordPairs={wordPairs}
            onEditWord={handleEditWord}
            onDeleteWord={handleDeleteWord}
          />
        </section>
      </main>
    </div>
  );
}

export default App;