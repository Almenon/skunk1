import { useState, useEffect } from 'react';
import './App.css';

interface WordReplacements {
  [original: string]: string;
}

function App() {
  const [wordPairs, setWordPairs] = useState<WordReplacements>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Load word pairs from storage (will be implemented in later tasks)
    setLoading(false);
  }, []);

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
        <p>Manage your word replacement pairs for enhanced browsing experience.</p>
      </header>

      <main className="options-main">
        <section className="word-pairs-section">
          <h2>Current Word Pairs</h2>
          {Object.keys(wordPairs).length === 0 ? (
            <div className="empty-state">
              <p>No word replacements configured yet.</p>
              <p>Add your first word pair below to get started!</p>
            </div>
          ) : (
            <div className="word-pairs-list">
              {/* Word pairs list will be implemented in later tasks */}
              <p>Word pairs will be displayed here.</p>
            </div>
          )}
        </section>

        <section className="add-word-section">
          <h2>Add New Word Pair</h2>
          <div className="add-word-form">
            {/* Add word form will be implemented in later tasks */}
            <p>Add word form will be implemented here.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;