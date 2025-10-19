/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigService, WordStorageService } from '../../../lib/storage';
import { DictionaryPage } from '../pages/DictionaryPage';

// Mock the storage services
vi.mock('../../../lib/storage', () => ({
    ConfigService: {
        getActiveLanguage: vi.fn(),
        watchConfig: vi.fn(),
        getAvailableLanguages: vi.fn(),
    },
    WordStorageService: vi.fn().mockImplementation(() => ({
        getWordPairs: vi.fn(),
        addWordPair: vi.fn(),
        updateWordPair: vi.fn(),
        deleteWordPair: vi.fn(),
        watchWordPairs: vi.fn(() => () => { }), // Return unwatch function
    })),
}));

// Mock the ActiveLanguageIndicator component
vi.mock('../components', () => ({
    ActiveLanguageIndicator: ({ className }: { className?: string }) => (
        <div data-testid="active-language-indicator" className={className}>
            English (en)
        </div>
    ),
    AddWordForm: ({ onAddWord }: { onAddWord: (original: string, replacement: string) => void }) => (
        <div data-testid="add-word-form">
            <button onClick={() => onAddWord('test', 'prueba')}>Add Word</button>
        </div>
    ),
    WordPairList: ({ wordPairs }: { wordPairs: Record<string, string> }) => (
        <div data-testid="word-pair-list">
            {Object.entries(wordPairs).map(([original, replacement]) => (
                <div key={original} data-testid={`word-pair-${original}`}>
                    {original} → {replacement}
                </div>
            ))}
        </div>
    ),
}));

describe('DictionaryPage Language Integration', () => {
    let mockWordStorageService: {
        getWordPairs: ReturnType<typeof vi.fn>;
        addWordPair: ReturnType<typeof vi.fn>;
        updateWordPair: ReturnType<typeof vi.fn>;
        deleteWordPair: ReturnType<typeof vi.fn>;
        watchWordPairs: ReturnType<typeof vi.fn>;
    };
    let mockConfigWatchCallback: ((newConfig: { selectedLanguage: string }, oldConfig?: { selectedLanguage: string }) => void) | undefined;

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup default mocks
        vi.mocked(ConfigService.getActiveLanguage).mockResolvedValue('en');
        vi.mocked(ConfigService.getAvailableLanguages).mockReturnValue([
            { code: 'en', name: 'English', nativeName: 'English' },
            { code: 'es', name: 'Spanish', nativeName: 'Español' },
            { code: 'fr', name: 'French', nativeName: 'Français' },
        ]);

        // Create a mock WordStorageService instance
        mockWordStorageService = {
            getWordPairs: vi.fn().mockResolvedValue({}),
            addWordPair: vi.fn().mockResolvedValue(undefined),
            updateWordPair: vi.fn().mockResolvedValue(undefined),
            deleteWordPair: vi.fn().mockResolvedValue(undefined),
            watchWordPairs: vi.fn(() => () => { }),
        };

        vi.mocked(WordStorageService).mockImplementation(() => mockWordStorageService as any);

        // Setup config watcher mock
        vi.mocked(ConfigService.watchConfig).mockImplementation((callback: any) => {
            mockConfigWatchCallback = callback;
            return () => { }; // Return unwatch function
        });
    });

    it('should initialize with active language and display language indicator', async () => {
        vi.mocked(ConfigService.getActiveLanguage).mockResolvedValue('es');
        mockWordStorageService.getWordPairs.mockResolvedValue({
            'hello': 'hola',
            'world': 'mundo'
        });

        render(<DictionaryPage />);

        // Wait for initialization
        await waitFor(() => {
            expect(screen.getByText('Dictionary')).toBeInTheDocument();
        });

        // Check that ConfigService was called to get active language
        expect(ConfigService.getActiveLanguage).toHaveBeenCalled();

        // Check that WordStorageService was created with the correct language
        expect(WordStorageService).toHaveBeenCalledWith('es');

        // Check that language indicator is displayed
        expect(screen.getByTestId('active-language-indicator')).toBeInTheDocument();
        expect(screen.getByTestId('active-language-indicator')).toHaveClass('header-language-indicator');

        // Check that word pairs are loaded
        expect(mockWordStorageService.getWordPairs).toHaveBeenCalled();
        expect(screen.getByTestId('word-pair-hello')).toBeInTheDocument();
        expect(screen.getByTestId('word-pair-world')).toBeInTheDocument();
    });

    it('should handle language switching and reload dictionary data', async () => {
        // Start with English
        vi.mocked(ConfigService.getActiveLanguage).mockResolvedValue('en');
        mockWordStorageService.getWordPairs
            .mockResolvedValueOnce({ 'hello': 'hi' }) // Initial English data
            .mockResolvedValueOnce({ 'hello': 'hola', 'goodbye': 'adiós' }); // Spanish data after switch

        render(<DictionaryPage />);

        // Wait for initial load
        await waitFor(() => {
            expect(screen.getByText('Dictionary')).toBeInTheDocument();
        });

        // Verify initial state
        expect(WordStorageService).toHaveBeenCalledWith('en');
        expect(screen.getByTestId('word-pair-hello')).toBeInTheDocument();

        // Simulate language change to Spanish
        await waitFor(() => {
            mockConfigWatchCallback?.({ selectedLanguage: 'es' });
        });

        // Wait for language switch to complete
        await waitFor(() => {
            expect(WordStorageService).toHaveBeenCalledWith('es');
        });

        // Verify new WordStorageService instance was created and data loaded
        expect(WordStorageService).toHaveBeenCalledTimes(2);
        expect(mockWordStorageService.getWordPairs).toHaveBeenCalledTimes(2);
    });

    it('should use language-specific storage service for word operations', async () => {
        vi.mocked(ConfigService.getActiveLanguage).mockResolvedValue('fr');
        mockWordStorageService.getWordPairs.mockResolvedValue({});

        render(<DictionaryPage />);

        // Wait for initialization
        await waitFor(() => {
            expect(screen.getByText('Dictionary')).toBeInTheDocument();
        });

        // Verify WordStorageService was created with French language
        expect(WordStorageService).toHaveBeenCalledWith('fr');

        // Simulate adding a word
        const addButton = screen.getByText('Add Word');
        await userEvent.click(addButton);

        // Verify the French storage service was used
        expect(mockWordStorageService.addWordPair).toHaveBeenCalledWith('test', 'prueba');
    });

    it('should display loading state during language switch', async () => {
        vi.mocked(ConfigService.getActiveLanguage).mockResolvedValue('en');

        // Make the second getWordPairs call delay to simulate loading
        mockWordStorageService.getWordPairs
            .mockResolvedValueOnce({}) // Initial load
            .mockImplementationOnce(() => new Promise(resolve => setTimeout(() => resolve({}), 100))); // Delayed load

        render(<DictionaryPage />);

        // Wait for initial load
        await waitFor(() => {
            expect(screen.getByText('Dictionary')).toBeInTheDocument();
        });

        // Trigger language change
        mockConfigWatchCallback?.({ selectedLanguage: 'es' });

        // Should show loading state
        await waitFor(() => {
            expect(screen.getByText('Loading word pairs...')).toBeInTheDocument();
        });

        // Wait for loading to complete
        await waitFor(() => {
            expect(screen.queryByText('Loading word pairs...')).not.toBeInTheDocument();
        }, { timeout: 200 });
    });

    it('should handle errors during language switching', async () => {
        vi.mocked(ConfigService.getActiveLanguage).mockResolvedValue('en');
        mockWordStorageService.getWordPairs
            .mockResolvedValueOnce({}) // Initial load succeeds
            .mockRejectedValueOnce(new Error('Storage error')); // Language switch fails

        render(<DictionaryPage />);

        // Wait for initial load
        await waitFor(() => {
            expect(screen.getByText('Dictionary')).toBeInTheDocument();
        });

        // Trigger language change that will fail
        mockConfigWatchCallback?.({ selectedLanguage: 'es' });

        // Should show error message
        await waitFor(() => {
            expect(screen.getByText(/Failed to switch language/)).toBeInTheDocument();
        });
    });

    it('should maintain separate storage watchers for different languages', async () => {
        vi.mocked(ConfigService.getActiveLanguage).mockResolvedValue('en');

        // Create separate mock instances for each language
        const mockService1 = {
            ...mockWordStorageService,
            watchWordPairs: vi.fn(() => () => { }),
        };
        const mockService2 = {
            ...mockWordStorageService,
            watchWordPairs: vi.fn(() => () => { }),
        };

        vi.mocked(WordStorageService)
            .mockImplementationOnce(() => mockService1 as any) // First language service
            .mockImplementationOnce(() => mockService2 as any); // Second language service

        render(<DictionaryPage />);

        // Wait for initial load
        await waitFor(() => {
            expect(screen.getByText('Dictionary')).toBeInTheDocument();
        });

        // Verify first watcher is set up
        expect(mockService1.watchWordPairs).toHaveBeenCalledTimes(1);

        // Switch language
        mockConfigWatchCallback?.({ selectedLanguage: 'es' });

        // Wait for language switch
        await waitFor(() => {
            expect(WordStorageService).toHaveBeenCalledWith('es');
        });

        // Verify new watcher is set up for the new language
        await waitFor(() => {
            expect(mockService2.watchWordPairs).toHaveBeenCalledTimes(1);
        });
    });

    it('should handle initialization errors gracefully', async () => {
        vi.mocked(ConfigService.getActiveLanguage).mockRejectedValue(new Error('Config error'));

        render(<DictionaryPage />);

        // Should show error message
        await waitFor(() => {
            expect(screen.getByText(/Failed to load dictionary/)).toBeInTheDocument();
        });

        // Should not create WordStorageService
        expect(WordStorageService).not.toHaveBeenCalled();
    });
});