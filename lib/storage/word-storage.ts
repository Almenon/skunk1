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
    // Validate the entire word replacements object
    const validation = validateWordReplacements(wordPairs);
    if (!validation.isValid) {
      throw new Error(`Invalid word replacements: ${validation.error}`);
    }

    try {
      await wordPairsStorage.setValue(wordPairs);
    } catch (error) {
      console.error('Failed to save word pairs to storage:', error);
      throw error;
    }
  }

  /**
   * Add a new word replacement pair
   */
  static async addWordPair(originalWord: string, replacementWord: string): Promise<void> {
    // Validate input
    const validation = validateWordPair(originalWord, replacementWord);
    if (!validation.isValid) {
      throw new Error(`Invalid word pair: ${validation.error}`);
    }

    try {
      const currentPairs = await this.getWordPairs();
      const sanitizedOriginal = sanitizeWord(originalWord);
      const sanitizedReplacement = sanitizeWord(replacementWord);
      
      const updatedPairs = {
        ...currentPairs,
        [sanitizedOriginal]: sanitizedReplacement
      };
      await this.setWordPairs(updatedPairs);
    } catch (error) {
      console.error('Failed to add word pair:', error);
      throw error;
    }
  }

  /**
   * Update an existing word replacement pair
   */
  static async updateWordPair(originalWord: string, newReplacementWord: string): Promise<void> {
    // Validate input
    const validation = validateWordPair(originalWord, newReplacementWord);
    if (!validation.isValid) {
      throw new Error(`Invalid word pair: ${validation.error}`);
    }

    try {
      const currentPairs = await this.getWordPairs();
      const sanitizedOriginal = sanitizeWord(originalWord);
      
      if (sanitizedOriginal in currentPairs) {
        currentPairs[sanitizedOriginal] = sanitizeWord(newReplacementWord);
        await this.setWordPairs(currentPairs);
      } else {
        throw new Error(`Word pair with original word "${originalWord}" not found`);
      }
    } catch (error) {
      console.error('Failed to update word pair:', error);
      throw error;
    }
  }

  /**
   * Delete a word replacement pair
   */
  static async deleteWordPair(originalWord: string): Promise<void> {
    try {
      const currentPairs = await this.getWordPairs();
      if (originalWord in currentPairs) {
        delete currentPairs[originalWord];
        await this.setWordPairs(currentPairs);
      } else {
        throw new Error(`Word pair with original word "${originalWord}" not found`);
      }
    } catch (error) {
      console.error('Failed to delete word pair:', error);
      throw error;
    }
  }

  /**
   * Check if a word pair exists
   */
  static async wordPairExists(originalWord: string): Promise<boolean> {
    try {
      const currentPairs = await this.getWordPairs();
      return originalWord in currentPairs;
    } catch (error) {
      console.error('Failed to check if word pair exists:', error);
      return false;
    }
  }

  /**
   * Clear all word replacement pairs
   */
  static async clearAllWordPairs(): Promise<void> {
    try {
      await this.setWordPairs({});
    } catch (error) {
      console.error('Failed to clear all word pairs:', error);
      throw error;
    }
  }

  /**
   * Watch for changes to word pairs storage
   */
  static watchWordPairs(callback: (newValue: WordReplacements, oldValue: WordReplacements) => void) {
    return wordPairsStorage.watch(callback);
  }
}