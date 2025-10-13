// Export storage utilities and data models
export { ConfigService, configStorage } from './config-storage';
export type { AppConfig, Language } from './config-storage';
export { sanitizeWord, validateWord, validateWordPair, validateWordReplacements } from './validation';
export type { ValidationResult } from './validation';
export { wordPairsStorage, WordStorageService } from './word-storage';
export type { WordReplacements } from './word-storage';

