import { describe, it, expect } from 'vitest';
import { validateWord, validateWordPair, validateWordReplacements, sanitizeWord } from '../validation';

describe('Word Validation', () => {
  describe('validateWord', () => {
    it('should validate correct words', () => {
      expect(validateWord('hello')).toEqual({ isValid: true });
      expect(validateWord('world')).toEqual({ isValid: true });
      expect(validateWord('test123')).toEqual({ isValid: true });
    });

    it('should reject empty or whitespace-only words', () => {
      expect(validateWord('')).toEqual({ 
        isValid: false, 
        error: 'Word cannot be empty or only whitespace' 
      });
      expect(validateWord('   ')).toEqual({ 
        isValid: false, 
        error: 'Word cannot be empty or only whitespace' 
      });
    });

    it('should reject words that are too long', () => {
      const longWord = 'a'.repeat(101);
      expect(validateWord(longWord)).toEqual({ 
        isValid: false, 
        error: 'Word cannot exceed 100 characters' 
      });
    });
  });

  describe('validateWordPair', () => {
    it('should validate correct word pairs', () => {
      expect(validateWordPair('hello', 'world')).toEqual({ isValid: true });
    });

    it('should reject invalid original words', () => {
      expect(validateWordPair('', 'world')).toEqual({ 
        isValid: false, 
        error: 'Original word: Word cannot be empty or only whitespace' 
      });
    });

    it('should reject invalid replacement words', () => {
      expect(validateWordPair('hello', '')).toEqual({ 
        isValid: false, 
        error: 'Replacement word: Word cannot be empty or only whitespace' 
      });
    });
  });

  describe('validateWordReplacements', () => {
    it('should validate correct word replacements object', () => {
      const wordReplacements = {
        'hello': 'world',
        'test': 'example'
      };
      expect(validateWordReplacements(wordReplacements)).toEqual({ isValid: true });
    });

    it('should reject objects with invalid word pairs', () => {
      const invalidWordReplacements = {
        'hello': 'world',
        '': 'invalid'
      };
      expect(validateWordReplacements(invalidWordReplacements)).toEqual({ 
        isValid: false, 
        error: 'Invalid word pair "" -> "invalid": Original word: Word cannot be empty or only whitespace' 
      });
    });
  });

  describe('sanitizeWord', () => {
    it('should trim whitespace from words', () => {
      expect(sanitizeWord('  hello  ')).toBe('hello');
      expect(sanitizeWord('\t\nworld\t\n')).toBe('world');
    });

    it('should handle already clean words', () => {
      expect(sanitizeWord('hello')).toBe('hello');
    });
  });
});