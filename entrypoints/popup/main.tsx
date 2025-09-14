console.log('extension icon clicked!')
if(document != null){
  // @ts-ignore
  if (chrome && chrome.runtime.openOptionsPage) {
    // @ts-ignore
    chrome.runtime.openOptionsPage();
    // @ts-ignore
  } else if (chrome) {
    // @ts-ignore
    window.open(chrome.runtime.getURL('options.html'));
  }
}