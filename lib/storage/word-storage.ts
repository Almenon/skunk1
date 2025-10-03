import { storage } from '#imports';
import { validateWordPair, validateWordReplacements, sanitizeWord } from './validation';

export interface WordReplacements {
  [key: string]: string;
}

// Define storage item for word replacements with default empty dictionary
export const wordPairsStorage = storage.defineItem<WordReplacements>('local:wordPairs', {
  defaultValue: {},
});

/**
 * Storage utility functions for managing word replacement pairs
 */
export class WordStorageService {

  /**
   * Get all word replacement pairs from storage
   */
  static async getWordPairs(): Promise<WordReplacements> {
    try {
      return await wordPairsStorage.getValue();
    } catch (error) {
      console.error('Failed to get word pairs from storage:', error);
      return {};
    }
  }

  /**
   * Save all word replacement pairs to storage
   */
  static async setWordPairs(wordPairs: WordReplacements): Promise<void> {
    const validation = validateWordReplacements(wordPairs);
    if (!validation.isValid) {
      throw new Error(`Invalid word replacements: ${validation.error}`);
    }
    await wordPairsStorage.setValue(wordPairs);
  }

  /**
   * Add a new word replacement pair
   */
  static async addWordPair(originalWord: string, replacementWord: string): Promise<void> {
    const validation = validateWordPair(originalWord, replacementWord);
    if (!validation.isValid) {
      throw new Error(`Invalid word pair: ${validation.error}`);
    }

    const currentPairs = await this.getWordPairs();
    const sanitizedOriginal = sanitizeWord(originalWord);
    const sanitizedReplacement = sanitizeWord(replacementWord);

    await this.setWordPairs({
      ...currentPairs,
      [sanitizedOriginal]: sanitizedReplacement
    });
  }

  /**
   * Update an existing word replacement pair
   */
  static async updateWordPair(originalWord: string, newReplacementWord: string): Promise<void> {
    const validation = validateWordPair(originalWord, newReplacementWord);
    if (!validation.isValid) {
      throw new Error(`Invalid word pair: ${validation.error}`);
    }

    const currentPairs = await this.getWordPairs();
    const sanitizedOriginal = sanitizeWord(originalWord);

    if (!(sanitizedOriginal in currentPairs)) {
      throw new Error(`Word pair with original word "${originalWord}" not found`);
    }

    currentPairs[sanitizedOriginal] = sanitizeWord(newReplacementWord);
    await this.setWordPairs(currentPairs);
  }

  /**
   * Delete a word replacement pair
   */
  static async deleteWordPair(originalWord: string): Promise<void> {
    const currentPairs = await this.getWordPairs();
    if (!(originalWord in currentPairs)) {
      throw new Error(`Word pair with original word "${originalWord}" not found`);
    }

    delete currentPairs[originalWord];
    await this.setWordPairs(currentPairs);
  }

  /**
   * Check if a word pair exists
   */
  static async wordPairExists(originalWord: string): Promise<boolean> {
    const currentPairs = await this.getWordPairs();
    return originalWord in currentPairs;
  }

  /**
   * Clear all word replacement pairs
   */
  static async clearAllWordPairs(): Promise<void> {
    await this.setWordPairs({});
  }

  /**
   * Watch for changes to word pairs storage
   */
  static watchWordPairs(callback: (newValue: WordReplacements, oldValue: WordReplacements) => void) {
    return wordPairsStorage.watch(callback);
  }
}