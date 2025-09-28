import { WordStorageService } from '../lib/storage/word-storage';

export default defineBackground(async () => {
  console.log('Hello background!', { id: browser.runtime.id });

  // Initialize with sample data in development mode
  if (import.meta.env.MODE === "development") {
    try {
      const existingPairs = await WordStorageService.getWordPairs();

      // Only initialize if no pairs exist
      if (Object.keys(existingPairs).length === 0) {
        const samplePairs = {
          "hello": "hi",
          "awesome": "amazing",
          "quick": "fast",
          "beautiful": "gorgeous",
          "smart": "intelligent"
        };

        await WordStorageService.setWordPairs(samplePairs);
        console.log('Initialized WordStorageService with sample data for development');
      }
    } catch (error) {
      console.error('Failed to initialize sample word pairs:', error);
    }
  }
});
