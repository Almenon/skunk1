import { storage } from '#imports';
import { ConfigService, Language } from './config-storage';
import { sanitizeWord, validateWordPair, validateWordReplacements } from './validation';

export interface WordReplacements {
  [key: string]: string;
}

/**
 * Storage utility functions for managing word replacement pairs
 * Now supports language-specific storage through constructor
 */
export class WordStorageService {
  private storageItem: ReturnType<typeof storage.defineItem<WordReplacements>>;

  /**
   * Create a WordStorageService instance for a specific language
   * @param language - Language code (e.g., 'en', 'es', 'fr')
   */
  constructor(private language: Language) {
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

  async deleteWordPair(originalWord: string): Promise<void> {
    const currentPairs = await this.getWordPairs();
    if (!(originalWord in currentPairs)) {
      throw new Error(`Word pair with original word "${originalWord}" not found`);
    }

    delete currentPairs[originalWord];
    await this.setWordPairs(currentPairs);
  }

  async wordPairExists(originalWord: string): Promise<boolean> {
    const currentPairs = await this.getWordPairs();
    return originalWord in currentPairs;
  }

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

  getLanguage(): Language {
    return this.language;
  }
}