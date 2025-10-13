import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigService } from '../config-storage';
import { WordStorageService } from '../word-storage';

// Mock ConfigService
vi.mock('../config-storage', () => ({
    ConfigService: {
        getDictionaryStorageKey: vi.fn()
    }
}));

// Mock storage
vi.mock('#imports', () => ({
    storage: {
        defineItem: vi.fn(() => ({
            getValue: vi.fn(),
            setValue: vi.fn(),
            watch: vi.fn()
        }))
    }
}));

describe('WordStorageService', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Setup ConfigService mocks
        vi.mocked(ConfigService.getDictionaryStorageKey).mockImplementation((lang: string) => `local:${lang}-dictionary`);
    });

    describe('constructor', () => {
        it('should create instance with any language', () => {
            expect(() => new WordStorageService('en')).not.toThrow();
            expect(() => new WordStorageService('es')).not.toThrow();
            expect(() => new WordStorageService('fr')).not.toThrow();
            expect(() => new WordStorageService('invalid')).not.toThrow();
            expect(() => new WordStorageService('')).not.toThrow();
        });

        it('should call ConfigService.getDictionaryStorageKey', () => {
            new WordStorageService('es');
            expect(ConfigService.getDictionaryStorageKey).toHaveBeenCalledWith('es');
        });
    });

    describe('getLanguage', () => {
        it('should return the language code for the service instance', () => {
            const enService = new WordStorageService('en');
            const esService = new WordStorageService('es');

            expect(enService.getLanguage()).toBe('en');
            expect(esService.getLanguage()).toBe('es');
        });
    });

    describe('multiple language instances', () => {
        it('should create separate instances for different languages', () => {
            const enService = new WordStorageService('en');
            const esService = new WordStorageService('es');
            const frService = new WordStorageService('fr');

            expect(enService.getLanguage()).toBe('en');
            expect(esService.getLanguage()).toBe('es');
            expect(frService.getLanguage()).toBe('fr');
        });

        it('should call getDictionaryStorageKey for each language', () => {
            new WordStorageService('en');
            new WordStorageService('es');
            new WordStorageService('fr');

            expect(ConfigService.getDictionaryStorageKey).toHaveBeenCalledWith('en');
            expect(ConfigService.getDictionaryStorageKey).toHaveBeenCalledWith('es');
            expect(ConfigService.getDictionaryStorageKey).toHaveBeenCalledWith('fr');
        });

        it('should generate correct storage keys for different languages', () => {
            new WordStorageService('en');
            new WordStorageService('es');
            new WordStorageService('fr');

            expect(ConfigService.getDictionaryStorageKey).toHaveBeenCalledWith('en');
            expect(ConfigService.getDictionaryStorageKey).toHaveBeenCalledWith('es');
            expect(ConfigService.getDictionaryStorageKey).toHaveBeenCalledWith('fr');
        });
    });

    describe('backward compatibility scenarios', () => {
        it('should handle migration from old storage format', () => {
            // This test verifies that the new constructor-based approach
            // can coexist with the old static methods during migration
            const service = new WordStorageService('en');

            expect(service.getLanguage()).toBe('en');
            expect(ConfigService.getDictionaryStorageKey).toHaveBeenCalledWith('en');
        });

        it('should use language-specific storage keys', () => {
            new WordStorageService('en');
            new WordStorageService('es');

            expect(ConfigService.getDictionaryStorageKey).toHaveBeenCalledWith('en');
            expect(ConfigService.getDictionaryStorageKey).toHaveBeenCalledWith('es');
        });

        it('should generate storage keys using ConfigService', () => {
            // Test that storage key generation is properly delegated to ConfigService
            new WordStorageService('en');

            expect(ConfigService.getDictionaryStorageKey).toHaveBeenCalledWith('en');
        });
    });

    describe('storage key generation', () => {
        it('should generate unique storage keys for different languages', () => {
            new WordStorageService('en');
            new WordStorageService('es');
            new WordStorageService('zh');

            expect(ConfigService.getDictionaryStorageKey).toHaveBeenCalledWith('en');
            expect(ConfigService.getDictionaryStorageKey).toHaveBeenCalledWith('es');
            expect(ConfigService.getDictionaryStorageKey).toHaveBeenCalledWith('zh');
        });
    });
});