import { storage } from '#imports';
import { ConfigService } from './config-storage';
import { sanitizeWord, validateWordPair, validateWordReplacements } from './validation';

export interface WordReplacements {
  [key: string]: string;
}

// Legacy storage item for backward compatibility
export const wordPairsStorage = storage.defineItem<WordReplacements>('local:wordPairs', {
  defaultValue: {},
});

/**
 * Storage utility functions for managing word replacement pairs
 * Now supports language-specific storage through constructor
 */
export class WordStorageService {
  private language: string;
  private storageItem: ReturnType<typeof storage.defineItem<WordReplacements>>;

  /**
   * Create a WordStorageService instance for a specific language
   * @param language - Language code (e.g., 'en', 'es', 'fr')
   */
  constructor(language: string) {
    this.language = language;
    const storageKey = ConfigService.getDictionaryStorageKey(language) as `local:${string}`;
    this.storageItem = storage.defineItem<WordReplacements>(storageKey, {
      defaultValue: {},
    });
  }

  /**
   * Get all word replacement pairs from storage
   */
  async getWordPairs(): Promise<WordReplacements> {
    try {
      const value = await this.storageItem.getValue();
      return value || {};
    } catch (error) {
      console.error('Failed to get word pairs from storage:', error);
      return {};
    }
  }

  /**
   * Save all word replacement pairs to storage
   */
  async setWordPairs(wordPairs: WordReplacements): Promise<void> {
    const validation = validateWordReplacements(wordPairs);
    if (!validation.isValid) {
      throw new Error(`Invalid word replacements: ${validation.error}`);
    }
    await this.storageItem.setValue(wordPairs);
  }

  /**
   * Add a new word replacement pair
   */
  async addWordPair(originalWord: string, replacementWord: string): Promise<void> {
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
  async updateWordPair(originalWord: string, newReplacementWord: string): Promise<void> {
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
  async deleteWordPair(originalWord: string): Promise<void> {
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
  async wordPairExists(originalWord: string): Promise<boolean> {
    const currentPairs = await this.getWordPairs();
    return originalWord in currentPairs;
  }

  /**
   * Clear all word replacement pairs
   */
  async clearAllWordPairs(): Promise<void> {
    await this.setWordPairs({});
  }

  /**
   * Watch for changes to word pairs storage
   */
  watchWordPairs(callback: (newValue: WordReplacements, oldValue: WordReplacements) => void) {
    return this.storageItem.watch((newValue, oldValue) => {
      callback(newValue || {}, oldValue || {});
    });
  }

  /**
   * Get the language code for this service instance
   */
  getLanguage(): string {
    return this.language;
  }

  /**
   * @deprecated Use constructor with language parameter instead
   * Legacy static methods for backward compatibility
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
   * @deprecated Use constructor with language parameter instead
   */
  static async setWordPairs(wordPairs: WordReplacements): Promise<void> {
    const validation = validateWordReplacements(wordPairs);
    if (!validation.isValid) {
      throw new Error(`Invalid word replacements: ${validation.error}`);
    }
    await wordPairsStorage.setValue(wordPairs);
  }

  /**
   * @deprecated Use constructor with language parameter instead
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
   * @deprecated Use constructor with language parameter instead
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
   * @deprecated Use constructor with language parameter instead
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
   * @deprecated Use constructor with language parameter instead
   */
  static async wordPairExists(originalWord: string): Promise<boolean> {
    const currentPairs = await this.getWordPairs();
    return originalWord in currentPairs;
  }

  /**
   * @deprecated Use constructor with language parameter instead
   */
  static async clearAllWordPairs(): Promise<void> {
    await this.setWordPairs({});
  }

  /**
   * @deprecated Use constructor with language parameter instead
   */
  static watchWordPairs(callback: (newValue: WordReplacements, oldValue: WordReplacements) => void) {
    return wordPairsStorage.watch((newValue, oldValue) => {
      callback(newValue || {}, oldValue || {});
    });
  }
}