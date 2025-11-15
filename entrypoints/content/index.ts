import { ConfigService, WordStorageService } from '../../lib/storage';
import { revertAllReplacements, scanAndReplaceWords } from './word-replacer';

export default defineContentScript({
  matches: ["*://*/*"],
  async main() {
    console.log('Content script loaded - initializing word replacements');
    const ITERATION_MAX = 30000; // arbitrary, I just want to at least cover first page

    let currentWordStorageService: WordStorageService | null = null;
    let currentLanguage: string;

    async function initializeWordStorageService() {
      currentLanguage = await ConfigService.getActiveLanguage();
      currentWordStorageService = new WordStorageService(currentLanguage);
      console.log(`Initialized word storage service for language: ${currentLanguage}`);
    }

    async function performWordReplacement() {
      if (!currentWordStorageService) {
        await initializeWordStorageService();
      }

      const wordReplacements = await currentWordStorageService!.getWordPairs();
      const body = document.body;

      if (!body) {
        console.warn("Document has no body. Exiting");
        return;
      }

      const startTime = performance.now();
      const result = scanAndReplaceWords(body, wordReplacements, ITERATION_MAX);
      console.log(`Word replacement completed: ${result.matchCount} matches found in ${performance.now() - startTime}ms for language: ${currentLanguage}`);
    }

    await initializeWordStorageService();

    await performWordReplacement();

    const unwatchWordPairs = currentWordStorageService!.watchWordPairs(async () => {
      console.log('Word replacements updated - re-scanning page');

      // Revert existing replacements before applying new ones
      const revertResult = revertAllReplacements();
      console.log(`Reverted ${revertResult.revertedCount} existing word replacements`);

      await performWordReplacement();
    });

    // Watch for language changes
    const unwatchConfig = ConfigService.watchConfig(async (newConfig, oldConfig) => {
      if (newConfig.selectedLanguage !== oldConfig.selectedLanguage) {
        console.log(`Language changed from ${oldConfig.selectedLanguage} to ${newConfig.selectedLanguage} - reinitializing`);

        // Cleanup old watcher
        unwatchWordPairs();

        // Revert all existing replacements before switching languages
        const revertResult = revertAllReplacements();
        console.log(`Reverted ${revertResult.revertedCount} existing word replacements`);

        await initializeWordStorageService();

        await performWordReplacement();

        // Set up new watcher for the new language
        const newUnwatchWordPairs = currentWordStorageService!.watchWordPairs(async () => {
          console.log('Word replacements updated - re-scanning page');

          // Revert existing replacements before applying new ones
          const revertResult = revertAllReplacements();
          console.log(`Reverted ${revertResult.revertedCount} existing word replacements`);

          await performWordReplacement();
        });

        // Update cleanup handler
        window.removeEventListener('beforeunload', cleanup);
        const newCleanup = () => {
          unwatchConfig();
          newUnwatchWordPairs();
        };
        window.addEventListener('beforeunload', newCleanup);
      }
    });

    // Cleanup on page unload
    const cleanup = () => {
      unwatchConfig();
      unwatchWordPairs();
    };
    window.addEventListener('beforeunload', cleanup);
  },
});
