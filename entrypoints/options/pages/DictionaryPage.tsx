import { useCallback, useEffect, useState } from 'react';
import type { AppConfig, Language } from '../../../lib/storage';
import { ConfigService, WordReplacements, WordStorageService } from '../../../lib/storage';
import { AddWordForm, WordPairList } from '../components';

export function DictionaryPage() {
    const [wordPairs, setWordPairs] = useState<WordReplacements>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [operationInProgress, setOperationInProgress] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState<string>('en');
    const [currentLanguageInfo, setCurrentLanguageInfo] = useState<Language | null>(null);
    const [wordStorageService, setWordStorageService] = useState<WordStorageService | null>(null);

    // Initialize WordStorageService with active language and load word pairs
    useEffect(() => {
        const initializeService = async () => {
            try {
                setLoading(true);
                setError(null);

                // Get the active language
                const activeLanguage = await ConfigService.getActiveLanguage();
                setCurrentLanguage(activeLanguage);

                // Get language info for display
                const availableLanguages = ConfigService.getAvailableLanguages();
                const languageInfo = availableLanguages.find(lang => lang.code === activeLanguage);
                setCurrentLanguageInfo(languageInfo || null);

                // Create WordStorageService instance for the active language
                const service = new WordStorageService(activeLanguage);
                setWordStorageService(service);

                // Load word pairs for the active language
                const pairs = await service.getWordPairs();
                setWordPairs(pairs);
            } catch (err) {
                console.error('Failed to initialize dictionary:', err);
                setError('Failed to load dictionary. Please refresh the page.');
            } finally {
                setLoading(false);
            }
        };

        initializeService();
    }, []);

    // Set up real-time storage synchronization
    useEffect(() => {
        if (!wordStorageService) return;

        return wordStorageService.watchWordPairs((newValue) => {
            setWordPairs(newValue);
        });
    }, [wordStorageService]);

    // Watch for language changes and update the service
    useEffect(() => {
        const unwatch = ConfigService.watchConfig(async (newConfig: AppConfig) => {
            if (newConfig.selectedLanguage !== currentLanguage) {
                try {
                    setLoading(true);
                    setError(null);

                    // Update current language
                    setCurrentLanguage(newConfig.selectedLanguage);

                    // Get language info for display
                    const availableLanguages = ConfigService.getAvailableLanguages();
                    const languageInfo = availableLanguages.find(lang => lang.code === newConfig.selectedLanguage);
                    setCurrentLanguageInfo(languageInfo || null);

                    // Create new WordStorageService instance for the new language
                    const service = new WordStorageService(newConfig.selectedLanguage);
                    setWordStorageService(service);

                    // Load word pairs for the new language
                    const pairs = await service.getWordPairs();
                    setWordPairs(pairs);
                } catch (err) {
                    console.error('Failed to switch language:', err);
                    setError('Failed to switch language. Please refresh the page.');
                } finally {
                    setLoading(false);
                }
            }
        });

        return unwatch;
    }, [currentLanguage]);

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
        if (!wordStorageService) return Promise.reject(new Error('Storage service not initialized'));

        return handleStorageOperation(
            () => wordStorageService.addWordPair(original, replacement),
            'add word pair'
        );
    }, [handleStorageOperation, wordStorageService]);

    const handleEditWord = useCallback((oldOriginal: string, newOriginal: string, newReplacement: string) => {
        if (!wordStorageService) return Promise.reject(new Error('Storage service not initialized'));

        return handleStorageOperation(async () => {
            if (oldOriginal !== newOriginal) {
                await wordStorageService.deleteWordPair(oldOriginal);
                await wordStorageService.addWordPair(newOriginal, newReplacement);
            } else {
                await wordStorageService.updateWordPair(oldOriginal, newReplacement);
            }
        }, 'edit word pair');
    }, [handleStorageOperation, wordStorageService]);

    const handleDeleteWord = useCallback((original: string) => {
        if (!wordStorageService) return Promise.reject(new Error('Storage service not initialized'));

        return handleStorageOperation(
            () => wordStorageService.deleteWordPair(original),
            'delete word pair'
        );
    }, [handleStorageOperation, wordStorageService]);

    // Clear error after a delay
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    if (loading) {
        return (
            <div className="page-content">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading word pairs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-content">
            <header className="page-header">
                <div className="header-content">
                    <div className="header-text">
                        <h1>{currentLanguageInfo?.nativeName || 'Unknown Language'} Dictionary</h1>
                        <p>Set the words you want to practice here</p>
                    </div>
                </div>
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

            <main className="page-main">
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