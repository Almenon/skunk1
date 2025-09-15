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
    const unwatch = WordStorageService.watchWordPairs((newValue, oldValue) => {
      // Only update if the change came from outside this component
      // (to avoid infinite loops when this component makes changes)
      if (JSON.stringify(newValue) !== JSON.stringify(wordPairs)) {
        setWordPairs(newValue);
      }
    });

    return unwatch;
  }, [wordPairs]);

  const handleAddWord = useCallback(async (original: string, replacement: string) => {
    try {
      setOperationInProgress(true);
      setError(null);
      console.log(`saving ${original}: ${replacement}`)
      await WordStorageService.addWordPair(original, replacement);
      // The storage watcher will update the state automatically
    } catch (err) {
      console.error('Failed to add word pair:', err);
      setError(err instanceof Error ? err.message : 'Failed to add word pair');
    } finally {
      setOperationInProgress(false);
    }
  }, []);

  const handleEditWord = useCallback(async (oldOriginal: string, newOriginal: string, newReplacement: string) => {
    try {
      setOperationInProgress(true);
      setError(null);

      // If the original word changed, we need to delete the old one and add the new one
      if (oldOriginal !== newOriginal) {
        await WordStorageService.deleteWordPair(oldOriginal);
        await WordStorageService.addWordPair(newOriginal, newReplacement);
      } else {
        // Just update the replacement
        await WordStorageService.updateWordPair(oldOriginal, newReplacement);
      }
      // The storage watcher will update the state automatically
    } catch (err) {
      console.error('Failed to edit word pair:', err);
      setError(err instanceof Error ? err.message : 'Failed to edit word pair');
    } finally {
      setOperationInProgress(false);
    }
  }, []);

  const handleDeleteWord = useCallback(async (original: string) => {
    try {
      setOperationInProgress(true);
      setError(null);
      await WordStorageService.deleteWordPair(original);
      // The storage watcher will update the state automatically
    } catch (err) {
      console.error('Failed to delete word pair:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete word pair');
    } finally {
      setOperationInProgress(false);
    }
  }, []);

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