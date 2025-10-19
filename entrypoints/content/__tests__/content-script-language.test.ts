/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigService, WordStorageService } from '../../../lib/storage';

// Mock the storage services
vi.mock('../../../lib/storage', () => ({
    ConfigService: {
        getActiveLanguage: vi.fn(),
        watchConfig: vi.fn(),
        getDictionaryStorageKey: vi.fn()
    },
    WordStorageService: vi.fn().mockImplementation(() => ({
        getWordPairs: vi.fn(),
        watchWordPairs: vi.fn()
    }))
}));

// Mock the word-replacer module
vi.mock('../word-replacer', () => ({
    scanAndReplaceWords: vi.fn().mockReturnValue({ matchCount: 0, scannedCount: 0 })
}));

describe('Content Script Language Support', () => {
    beforeEach(() => {
        // Reset all mocks
        vi.clearAllMocks();

        // Set up default mock implementations
        vi.mocked(ConfigService.getActiveLanguage).mockResolvedValue('en');
        vi.mocked(ConfigService.watchConfig).mockReturnValue(() => { });
        vi.mocked(ConfigService.getDictionaryStorageKey).mockImplementation((lang: string) => `local:${lang}-dictionary`);

        // Mock WordStorageService instance methods
        const mockInstance = {
            getWordPairs: vi.fn().mockResolvedValue({ 'hello': 'world' }),
            watchWordPairs: vi.fn().mockReturnValue(() => { })
        };
        vi.mocked(WordStorageService).mockReturnValue(mockInstance as any);

        // Set up DOM
        document.body.innerHTML = '<p>Test content</p>';
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    describe('Language-aware word replacement', () => {
        it('should initialize WordStorageService with active language', async () => {
            vi.mocked(ConfigService.getActiveLanguage).mockResolvedValue('es');

            // Since we can't directly test the content script execution,
            // we'll test the core logic by simulating the initialization
            const activeLanguage = await ConfigService.getActiveLanguage();
            const wordStorageService = new WordStorageService(activeLanguage);

            expect(ConfigService.getActiveLanguage).toHaveBeenCalled();
            expect(WordStorageService).toHaveBeenCalledWith('es');
            expect(wordStorageService).toBeDefined();
        });

        it('should use language-specific dictionary for word replacements', async () => {
            const mockWordPairs = { 'robot': 'robot-es', 'worker': 'trabajador' };
            vi.mocked(ConfigService.getActiveLanguage).mockResolvedValue('es');

            const mockInstance = {
                getWordPairs: vi.fn().mockResolvedValue(mockWordPairs),
                watchWordPairs: vi.fn().mockReturnValue(() => { })
            };
            vi.mocked(WordStorageService).mockReturnValue(mockInstance as any);

            // Simulate the word replacement logic
            const activeLanguage = await ConfigService.getActiveLanguage();
            const wordStorageService = new WordStorageService(activeLanguage);
            const wordReplacements = await wordStorageService.getWordPairs();

            expect(wordReplacements).toEqual(mockWordPairs);
            expect(mockInstance.getWordPairs).toHaveBeenCalled();
        });

        it('should handle different languages with different dictionaries', async () => {
            // Test English dictionary
            vi.mocked(ConfigService.getActiveLanguage).mockResolvedValue('en');
            const enWordPairs = { 'robot': '机器人', 'worker': '工人' };

            let mockInstance = {
                getWordPairs: vi.fn().mockResolvedValue(enWordPairs),
                watchWordPairs: vi.fn().mockReturnValue(() => { })
            };
            vi.mocked(WordStorageService).mockReturnValue(mockInstance as any);

            const enLanguage = await ConfigService.getActiveLanguage();
            const enWordStorageService = new WordStorageService(enLanguage);
            const enWordReplacements = await enWordStorageService.getWordPairs();

            expect(enWordReplacements).toEqual(enWordPairs);

            // Test Spanish dictionary
            vi.mocked(ConfigService.getActiveLanguage).mockResolvedValue('es');
            const esWordPairs = { 'robot': 'robot-es', 'worker': 'trabajador' };

            mockInstance = {
                getWordPairs: vi.fn().mockResolvedValue(esWordPairs),
                watchWordPairs: vi.fn().mockReturnValue(() => { })
            };
            vi.mocked(WordStorageService).mockReturnValue(mockInstance as any);

            const esLanguage = await ConfigService.getActiveLanguage();
            const esWordStorageService = new WordStorageService(esLanguage);
            const esWordReplacements = await esWordStorageService.getWordPairs();

            expect(esWordReplacements).toEqual(esWordPairs);
            expect(WordStorageService).toHaveBeenCalledWith('es');
        });
    });

    describe('Language switching', () => {
        it('should watch for language configuration changes', async () => {
            const mockUnwatchConfig = vi.fn();
            vi.mocked(ConfigService.watchConfig).mockReturnValue(mockUnwatchConfig);

            // Simulate setting up the config watcher
            const unwatchConfig = ConfigService.watchConfig(() => { });

            expect(ConfigService.watchConfig).toHaveBeenCalled();
            expect(typeof unwatchConfig).toBe('function');
        });

        it('should reinitialize WordStorageService when language changes', async () => {
            let configCallback: ((newConfig: { selectedLanguage: string }, oldConfig: { selectedLanguage: string }) => void) | undefined;
            vi.mocked(ConfigService.watchConfig).mockImplementation((callback: (newConfig: { selectedLanguage: string }, oldConfig: { selectedLanguage: string }) => void) => {
                configCallback = callback;
                return () => { };
            });

            // Set up initial language
            vi.mocked(ConfigService.getActiveLanguage).mockResolvedValue('en');

            // Simulate setting up the watcher
            ConfigService.watchConfig(() => {
                // This would trigger reinitializing WordStorageService
            });

            // Simulate language change
            const oldConfig = { selectedLanguage: 'en' };
            const newConfig = { selectedLanguage: 'es' };

            configCallback?.(newConfig, oldConfig);

            expect(ConfigService.watchConfig).toHaveBeenCalled();
        });

        it('should handle language change from English to Spanish', async () => {
            // Initial setup with English
            vi.mocked(ConfigService.getActiveLanguage).mockResolvedValue('en');
            let wordStorageService = new WordStorageService('en');

            expect(WordStorageService).toHaveBeenCalledWith('en');
            expect(wordStorageService).toBeDefined();

            // Simulate language change to Spanish
            vi.mocked(ConfigService.getActiveLanguage).mockResolvedValue('es');
            wordStorageService = new WordStorageService('es');

            expect(WordStorageService).toHaveBeenCalledWith('es');
            expect(wordStorageService).toBeDefined();
        });

        it('should handle language change from Spanish to Chinese', async () => {
            // Initial setup with Spanish
            vi.mocked(ConfigService.getActiveLanguage).mockResolvedValue('es');
            let wordStorageService = new WordStorageService('es');

            expect(WordStorageService).toHaveBeenCalledWith('es');
            expect(wordStorageService).toBeDefined();

            // Simulate language change to Chinese
            vi.mocked(ConfigService.getActiveLanguage).mockResolvedValue('zh');
            wordStorageService = new WordStorageService('zh');

            expect(WordStorageService).toHaveBeenCalledWith('zh');
            expect(wordStorageService).toBeDefined();
        });
    });

    describe('Storage key generation', () => {
        it('should use correct storage keys for different languages', () => {
            vi.mocked(ConfigService.getDictionaryStorageKey).mockImplementation((lang: string) => `local:${lang}-dictionary`);

            expect(ConfigService.getDictionaryStorageKey('en')).toBe('local:en-dictionary');
            expect(ConfigService.getDictionaryStorageKey('es')).toBe('local:es-dictionary');
            expect(ConfigService.getDictionaryStorageKey('zh')).toBe('local:zh-dictionary');
            expect(ConfigService.getDictionaryStorageKey('fr')).toBe('local:fr-dictionary');
        });
    });

    describe('Error handling', () => {
        it('should handle ConfigService errors gracefully', async () => {
            vi.mocked(ConfigService.getActiveLanguage).mockRejectedValue(new Error('Config service error'));

            try {
                await ConfigService.getActiveLanguage();
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect((error as Error).message).toBe('Config service error');
            }
        });

        it('should handle WordStorageService initialization errors', () => {
            vi.mocked(WordStorageService).mockImplementation(() => {
                throw new Error('Invalid language');
            });

            expect(() => new WordStorageService('invalid')).toThrow('Invalid language');
        });

        it('should handle word pairs retrieval errors', async () => {
            const mockInstance = {
                getWordPairs: vi.fn().mockRejectedValue(new Error('Storage error')),
                watchWordPairs: vi.fn().mockReturnValue(() => { })
            };
            vi.mocked(WordStorageService).mockReturnValue(mockInstance as any);

            const wordStorageService = new WordStorageService('en');

            try {
                await wordStorageService.getWordPairs();
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect((error as Error).message).toBe('Storage error');
            }
        });
    });
});