import { scanAndReplaceWords, WordReplacements } from './word-replacer';

export default defineContentScript({
  matches: ["*://*/*"],
  main() {
    console.log('Hello popsicles!');
    const wordReplacements: WordReplacements = {
      'robot': '机器人',
      'worker': '工人',
      'workers': '工人',
      'write': '写'
    };
    const iterationMax = 30000; // arbitrary, I just want to at least cover first page

    const body = document.querySelector("body");
    if (body != null) {
      scanAndReplaceWords(body, wordReplacements, iterationMax);
    } else {
      console.warn("document does not have a body. Exiting");
    }
  },
});
