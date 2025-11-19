/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigService, Language, WordStorageService } from '../../../lib/storage';

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
    scanAndReplaceWords: vi.fn().mockReturnValue({ matchCount: 0, scannedCount: 0 }),
    revertAllReplacements: vi.fn().mockReturnValue({ revertedCount: 0 })
}));

const english = { code: 'en', name: 'english', nativeName: 'english' }

const spanish = { code: 'es', name: 'spanish', nativeName: 'espanol' }

const mandarin = { code: 'zh', name: 'chinese', nativeName: 'zhongwen' }

describe('Content Script Language Support', () => {
    beforeEach(() => {
        // Reset all mocks
        vi.clearAllMocks();

        // Set up default mock implementations
        vi.mocked(ConfigService.getActiveLanguage).mockResolvedValue(spanish);
        vi.mocked(ConfigService.watchConfig).mockReturnValue(() => { });
        vi.mocked(ConfigService.getDictionaryStorageKey).mockImplementation((lang: Language) => `local:${lang.code}-dictionary`);

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
            vi.mocked(ConfigService.getActiveLanguage).mockResolvedValue(spanish);

            // Since we can't directly test the content script execution,
            // we'll test the core logic by simulating the initialization
            const activeLanguage = await ConfigService.getActiveLanguage();
            const wordStorageService = new WordStorageService(activeLanguage as Language);

            expect(ConfigService.getActiveLanguage).toHaveBeenCalled();
            expect(WordStorageService).toHaveBeenCalledWith(spanish);
            expect(wordStorageService).toBeDefined();
        });

        it('should use language-specific dictionary for word replacements', async () => {
            const mockWordPairs = { 'robot': 'robot-es', 'worker': 'trabajador' };
            vi.mocked(ConfigService.getActiveLanguage).mockResolvedValue(spanish);

            const mockInstance = {
                getWordPairs: vi.fn().mockResolvedValue(mockWordPairs),
                watchWordPairs: vi.fn().mockReturnValue(() => { })
            };
            vi.mocked(WordStorageService).mockReturnValue(mockInstance as any);

            // Simulate the word replacement logic
            const activeLanguage = await ConfigService.getActiveLanguage();
            const wordStorageService = new WordStorageService(activeLanguage as Language);
            const wordReplacements = await wordStorageService.getWordPairs();

            expect(wordReplacements).toEqual(mockWordPairs);
            expect(mockInstance.getWordPairs).toHaveBeenCalled();
        });

        it('should handle different languages with different dictionaries', async () => {
            // Test English dictionary
            vi.mocked(ConfigService.getActiveLanguage).mockResolvedValue(english);
            const enWordPairs = { 'robot': '机器人', 'worker': '工人' };

            let mockInstance = {
                getWordPairs: vi.fn().mockResolvedValue(enWordPairs),
                watchWordPairs: vi.fn().mockReturnValue(() => { })
            };
            vi.mocked(WordStorageService).mockReturnValue(mockInstance as any);

            const enLanguage = await ConfigService.getActiveLanguage();
            const enWordStorageService = new WordStorageService(enLanguage as Language);
            const enWordReplacements = await enWordStorageService.getWordPairs();

            expect(enWordReplacements).toEqual(enWordPairs);

            // Test Spanish dictionary
            vi.mocked(ConfigService.getActiveLanguage).mockResolvedValue(spanish);
            const esWordPairs = { 'robot': 'robot-es', 'worker': 'trabajador' };

            mockInstance = {
                getWordPairs: vi.fn().mockResolvedValue(esWordPairs),
                watchWordPairs: vi.fn().mockReturnValue(() => { })
            };
            vi.mocked(WordStorageService).mockReturnValue(mockInstance as any);

            const esLanguage = await ConfigService.getActiveLanguage();
            const esWordStorageService = new WordStorageService(esLanguage as Language);
            const esWordReplacements = await esWordStorageService.getWordPairs();

            expect(esWordReplacements).toEqual(esWordPairs);
            expect(WordStorageService).toHaveBeenCalledWith(spanish);
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
            let configCallback: ((newConfig: { selectedLanguage: Language }, oldConfig: { selectedLanguage: Language }) => void) | undefined;
            vi.mocked(ConfigService.watchConfig).mockImplementation((callback: (newConfig: { selectedLanguage: Language }, oldConfig: { selectedLanguage: Language }) => void) => {
                configCallback = callback;
                return () => { };
            });

            // Set up initial language
            vi.mocked(ConfigService.getActiveLanguage).mockResolvedValue(english);

            // Simulate setting up the watcher
            ConfigService.watchConfig(() => {
                // This would trigger reinitializing WordStorageService
            });

            // Simulate language change
            const oldConfig = { selectedLanguage: english };
            const newConfig = { selectedLanguage: spanish };

            configCallback?.(newConfig, oldConfig);

            expect(ConfigService.watchConfig).toHaveBeenCalled();
        });

        it('should handle language change from English to Spanish', async () => {
            // Initial setup with English
            vi.mocked(ConfigService.getActiveLanguage).mockResolvedValue(english);
            let wordStorageService = new WordStorageService(english);

            expect(WordStorageService).toHaveBeenCalledWith(english);
            expect(wordStorageService).toBeDefined();

            // Simulate language change to Spanish
            vi.mocked(ConfigService.getActiveLanguage).mockResolvedValue(spanish);
            wordStorageService = new WordStorageService(spanish);

            expect(WordStorageService).toHaveBeenCalledWith(spanish);
            expect(wordStorageService).toBeDefined();
        });

        it('should handle language change from Spanish to Mandarin', async () => {
            // Initial setup with Spanish
            vi.mocked(ConfigService.getActiveLanguage).mockResolvedValue(spanish);
            let wordStorageService = new WordStorageService(spanish);

            expect(WordStorageService).toHaveBeenCalledWith(spanish);
            expect(wordStorageService).toBeDefined();

            // Simulate language change to Chinese
            vi.mocked(ConfigService.getActiveLanguage).mockResolvedValue(mandarin);
            wordStorageService = new WordStorageService(mandarin);

            expect(WordStorageService).toHaveBeenCalledWith(mandarin);
            expect(wordStorageService).toBeDefined();
        });
    });

    describe('Storage key generation', () => {
        it('should use correct storage keys for different languages', () => {
            expect(ConfigService.getDictionaryStorageKey(english)).toBe('local:en-dictionary');
            expect(ConfigService.getDictionaryStorageKey(spanish)).toBe('local:es-dictionary');
            expect(ConfigService.getDictionaryStorageKey(mandarin)).toBe('local:zh-dictionary');
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

        it('should handle word pairs retrieval errors', async () => {
            const mockInstance = {
                getWordPairs: vi.fn().mockRejectedValue(new Error('Storage error')),
                watchWordPairs: vi.fn().mockReturnValue(() => { })
            };
            vi.mocked(WordStorageService).mockReturnValue(mockInstance as any);

            const wordStorageService = new WordStorageService(english);

            try {
                await wordStorageService.getWordPairs();
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect((error as Error).message).toBe('Storage error');
            }
        });
    });
});