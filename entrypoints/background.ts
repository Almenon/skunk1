export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });

  if (import.meta.env.DEV) {
    browser.tabs.create({
      url: browser.runtime.getURL('/tutorial.html')
    });
    return
  }

  browser.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === 'install') {
      await browser.tabs.create({
        url: browser.runtime.getURL('/tutorial.html')
      });
    }
  });
});
