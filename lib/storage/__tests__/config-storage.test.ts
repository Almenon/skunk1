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

// Mock iso-639-1 library
vi.mock('iso-639-1', () => ({
    default: {
        getAllCodes: vi.fn(() => ['en', 'es', 'fr', 'de', 'zh', 'ja']),
        getName: vi.fn((code: string) => {
            const names: Record<string, string> = {
                'en': 'English',
                'es': 'Spanish',
                'fr': 'French',
                'de': 'German',
                'zh': 'Chinese',
                'ja': 'Japanese'
            };
            return names[code] || 'Unknown';
        }),
        getNativeName: vi.fn((code: string) => {
            const nativeNames: Record<string, string> = {
                'en': 'English',
                'es': 'Español',
                'fr': 'Français',
                'de': 'Deutsch',
                'zh': '中文',
                'ja': '日本語'
            };
            return nativeNames[code] || 'Unknown';
        }),
        validate: vi.fn((code: string) => {
            const validCodes = ['en', 'es', 'fr', 'de', 'zh', 'ja'];
            return validCodes.includes(code);
        })
    }
}));

describe('ConfigService', () => {
    let mockStorage: unknown;

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
            const expectedConfig: AppConfig = { selectedLanguage: 'es' };
            mockStorage.getValue.mockResolvedValue(expectedConfig);

            const result = await ConfigService.getConfig();

            expect(result).toEqual(expectedConfig);
            expect(mockStorage.getValue).toHaveBeenCalledOnce();
        });

        it('should return default config when storage fails', async () => {
            mockStorage.getValue.mockRejectedValue(new Error('Storage error'));
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            const result = await ConfigService.getConfig();

            expect(result).toEqual({ selectedLanguage: 'en' });
            expect(consoleSpy).toHaveBeenCalledWith('Failed to get config from storage:', expect.any(Error));

            consoleSpy.mockRestore();
        });
    });

    describe('setConfig', () => {
        it('should save configuration to storage', async () => {
            const config: AppConfig = { selectedLanguage: 'fr' };

            await ConfigService.setConfig(config);

            expect(mockStorage.setValue).toHaveBeenCalledWith(config);
        });

        it('should throw error when storage fails', async () => {
            const config: AppConfig = { selectedLanguage: 'fr' };
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
            mockStorage.getValue.mockResolvedValue({ selectedLanguage: 'de' });

            const result = await ConfigService.getActiveLanguage();

            expect(result).toBe('de');
        });
    });

    describe('setActiveLanguage', () => {
        it('should update the selected language in config', async () => {
            const currentConfig = { selectedLanguage: 'en' };
            mockStorage.getValue.mockResolvedValue(currentConfig);

            await ConfigService.setActiveLanguage('ja');

            expect(mockStorage.setValue).toHaveBeenCalledWith({
                selectedLanguage: 'ja'
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
            expect(ConfigService.getDictionaryStorageKey('en')).toBe('local:en-dictionary');
            expect(ConfigService.getDictionaryStorageKey('es')).toBe('local:es-dictionary');
            expect(ConfigService.getDictionaryStorageKey('fr')).toBe('local:fr-dictionary');
        });

        it('should handle whitespace in language codes', () => {
            expect(ConfigService.getDictionaryStorageKey(' en ')).toBe('local:en-dictionary');
            expect(ConfigService.getDictionaryStorageKey('\tes\t')).toBe('local:es-dictionary');
        });

        it('should throw error for invalid language codes', () => {
            expect(() => ConfigService.getDictionaryStorageKey('invalid')).toThrow('Invalid language code: invalid');
            expect(() => ConfigService.getDictionaryStorageKey('')).toThrow('Invalid language code: ');
            expect(() => ConfigService.getDictionaryStorageKey('xyz')).toThrow('Invalid language code: xyz');
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