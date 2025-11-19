import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WordStorageService } from '../word-storage';

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
    
    const spanish = { code: 'es', name: 'spanish', nativeName: 'espanol' }

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getLanguage', () => {
        it('should return the language code for the service instance', () => {
            const enService = new WordStorageService(spanish);
            expect(enService.getLanguage().code).toBe(spanish.code);
        });
    });
});