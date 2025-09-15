/**
 * Validation utilities for word replacement pairs
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate a single word (original or replacement)
 */
export function validateWord(word: string): ValidationResult {
  if (typeof word !== 'string') {
    return { isValid: false, error: 'Word must be a non-empty string' };
  }

  const trimmedWord = word.trim();
  
  if (trimmedWord.length === 0) {
    return { isValid: false, error: 'Word cannot be empty or only whitespace' };
  }

  if (trimmedWord.length > 100) {
    return { isValid: false, error: 'Word cannot exceed 100 characters' };
  }

  return { isValid: true };
}

/**
 * Validate a word replacement pair
 */
export function validateWordPair(originalWord: string, replacementWord: string): ValidationResult {
  const originalValidation = validateWord(originalWord);
  if (!originalValidation.isValid) {
    return { isValid: false, error: `Original word: ${originalValidation.error}` };
  }

  const replacementValidation = validateWord(replacementWord);
  if (!replacementValidation.isValid) {
    return { isValid: false, error: `Replacement word: ${replacementValidation.error}` };
  }

  return { isValid: true };
}

/**
 * Sanitize a word by trimming whitespace
 */
export function sanitizeWord(word: string): string {
  return word.trim();
}

/**
 * Validate and sanitize word replacement pairs object
 */
export function validateWordReplacements(wordReplacements: Record<string, any>): ValidationResult {
  if (!wordReplacements || typeof wordReplacements !== 'object') {
    return { isValid: false, error: 'Word replacements must be an object' };
  }

  for (const [originalWord, replacementWord] of Object.entries(wordReplacements)) {
    const validation = validateWordPair(originalWord, replacementWord as string);
    if (!validation.isValid) {
      return { isValid: false, error: `Invalid word pair "${originalWord}" -> "${replacementWord}": ${validation.error}` };
    }
  }

  return { isValid: true };
}