import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigService, configStorage, type AppConfig } from '../config-storage';

// Mock the storage module
vi.mock('#imports', () => ({
    storage: {
        defineItem: vi.fn(() => ({
            getValue: vi.fn(),
            setValue: vi.fn(),
            watch: vi.fn()
        }))
    }
}));

describe('ConfigService', () => {
    const spanish = {
        code: 'en',
        name: 'Spanish',
        nativeName: 'Espanol'
    }

    let mockStorage: {
        getValue: ReturnType<typeof vi.fn>;
        setValue: ReturnType<typeof vi.fn>;
        watch: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
        // Reset mocks before each test
        vi.clearAllMocks();

        // Create mock storage with default behavior
        mockStorage = {
            getValue: vi.fn().mockResolvedValue({ selectedLanguage: 'en' }),
            setValue: vi.fn().mockResolvedValue(undefined),
            watch: vi.fn()
        };

        // Mock the configStorage object
        vi.mocked(configStorage).getValue = mockStorage.getValue;
        vi.mocked(configStorage).setValue = mockStorage.setValue;
        vi.mocked(configStorage).watch = mockStorage.watch;
    });

    describe('getConfig', () => {
        it('should return configuration from storage', async () => {
            const expectedConfig: AppConfig = { selectedLanguage: spanish};
            mockStorage.getValue.mockResolvedValue(expectedConfig);

            const result = await ConfigService.getConfig();

            expect(result).toEqual(expectedConfig);
            expect(mockStorage.getValue).toHaveBeenCalledOnce();
        });
    });

    describe('setConfig', () => {
        it('should save configuration to storage', async () => {
            const config: AppConfig = { selectedLanguage: spanish};

            await ConfigService.setConfig(config);

            expect(mockStorage.setValue).toHaveBeenCalledWith(config);
        });

        it('should throw error when storage fails', async () => {
            const config: AppConfig = { selectedLanguage: spanish};
            const storageError = new Error('Storage error');
            mockStorage.setValue.mockRejectedValue(storageError);
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            await expect(ConfigService.setConfig(config)).rejects.toThrow('Storage error');
            expect(consoleSpy).toHaveBeenCalledWith('Failed to set config in storage:', storageError);

            consoleSpy.mockRestore();
        });
    });

    describe('getActiveLanguage', () => {
        it('should return the selected language from config', async () => {
            mockStorage.getValue.mockResolvedValue({ selectedLanguage: spanish });

            const result = await ConfigService.getActiveLanguage();

            expect(result?.code).toBe('en');
        });
    });

    describe('setActiveLanguage', () => {
        it('should update the selected language in config', async () => {
            const currentConfig = { selectedLanguage: spanish};
            mockStorage.getValue.mockResolvedValue(currentConfig);

            const english = {
                code: 'en',
                name: 'english',
                nativeName: 'english'
            }
            await ConfigService.setActiveLanguage(english);

            expect(mockStorage.setValue).toHaveBeenCalledWith({
                selectedLanguage: english
            });
        });
    });

    describe('getAvailableLanguages', () => {
        it('should return array of language objects', () => {
            const languages = ConfigService.getAvailableLanguages();

            expect(Array.isArray(languages)).toBe(true);
            expect(languages.length).toBeGreaterThan(0);

            // Check that each language has required properties
            languages.forEach(lang => {
                expect(lang).toHaveProperty('code');
                expect(lang).toHaveProperty('name');
                expect(lang).toHaveProperty('nativeName');
                expect(typeof lang.code).toBe('string');
                expect(typeof lang.name).toBe('string');
                expect(typeof lang.nativeName).toBe('string');
            });
        });

        it('should include common languages', () => {
            const languages = ConfigService.getAvailableLanguages();
            const languageCodes = languages.map(lang => lang.code);

            expect(languageCodes).toContain('en');
            expect(languageCodes).toContain('es');
            expect(languageCodes).toContain('fr');
            expect(languageCodes).toContain('de');
        });
    });

    describe('getDictionaryStorageKey', () => {
        it('should generate correct storage keys for valid languages', () => {
            expect(ConfigService.getDictionaryStorageKey(spanish)).toBe('local:en-dictionary');
        });
    });

    describe('watchConfig', () => {
        it('should call storage watch method', () => {
            const callback = vi.fn();

            ConfigService.watchConfig(callback);

            expect(mockStorage.watch).toHaveBeenCalledWith(callback);
        });
    });
});