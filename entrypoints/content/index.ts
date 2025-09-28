import { scanAndReplaceWords } from './word-replacer';
import { WordStorageService } from '../../lib/storage';

export default defineContentScript({
  matches: ["*://*/*"],
  async main() {
    console.log('Content script loaded - initializing word replacements');
    const iterationMax = 30000; // arbitrary, I just want to at least cover first page

    // Function to perform word replacement with current storage data
    async function performWordReplacement() {
      try {
        const wordReplacements = await WordStorageService.getWordPairs();
        console.log('Loaded word replacements from storage:', wordReplacements);

        const body = document.querySelector("body");
        if (body != null) {
          let startTime = performance.now()
          const result = scanAndReplaceWords(body, wordReplacements, iterationMax);
          console.log(`Word replacement completed: ${result.matchCount} matches found in ${performance.now()-startTime}ms`);
        } else {
          console.warn("document does not have a body. Exiting");
        }
      } catch (error) {
        console.error('Failed to load word replacements from storage:', error);
      }
    }

    // Initial word replacement on page load
    await performWordReplacement();

    // Set up storage change watcher for real-time updates
    try {
      const unwatch = WordStorageService.watchWordPairs(async (newValue, oldValue) => {
        console.log('Word replacements updated in storage:', { newValue, oldValue });

        // Re-scan and replace words with updated dictionary
        // Note: This is a simple implementation that re-processes the entire page
        // A more sophisticated approach would track and update only changed elements
        await performWordReplacement();
      });

      // Clean up watcher when page unloads (optional, but good practice)
      window.addEventListener('beforeunload', () => {
        if (typeof unwatch === 'function') {
          unwatch();
        }
      });
    } catch (error) {
      console.error('Failed to set up storage change watcher:', error);
    }
  },
});
