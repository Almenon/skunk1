import { browser } from 'wxt/browser';

console.log('extension icon clicked!')
if (browser && browser.runtime.openOptionsPage) {
  browser.runtime.openOptionsPage();
} else {
  window.open(browser.runtime.getURL('/options.html'));
}