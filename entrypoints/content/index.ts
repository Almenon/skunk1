import { scanAndReplaceWords } from './word-replacer';
import { WordStorageService } from '../../lib/storage';

export default defineContentScript({
  matches: ["*://*/*"],
  async main() {
    console.log('Content script loaded - initializing word replacements');
    const ITERATION_MAX = 30000; // arbitrary, I just want to at least cover first page

    async function performWordReplacement() {
      const wordReplacements = await WordStorageService.getWordPairs();
      const body = document.body;
      
      if (!body) {
        console.warn("Document has no body. Exiting");
        return;
      }

      const startTime = performance.now();
      const result = scanAndReplaceWords(body, wordReplacements, ITERATION_MAX);
      console.log(`Word replacement completed: ${result.matchCount} matches found in ${performance.now()-startTime}ms`);
    }

    // Initial replacement
    await performWordReplacement();

    // Watch for storage changes
    const unwatch = WordStorageService.watchWordPairs(async () => {
      console.log('Word replacements updated - re-scanning page');
      await performWordReplacement();
    });

    // Cleanup on page unload
    window.addEventListener('beforeunload', unwatch);
  },
});
