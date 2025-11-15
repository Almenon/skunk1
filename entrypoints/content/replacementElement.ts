import { ReplacementObject } from "./word-replacer";

// todo put this in user controlled configuration
const LanguageToURL: Record<string,string> = {
    'zh': "https://www.dong-chinese.com/dictionary/search/"
}

export function createReplacementElement(replacementObj: ReplacementObject, languageCode: string): HTMLAnchorElement {
  const aElement = document.createElement('a');
  const wordReplacement = replacementObj.replacementValue;
  aElement.textContent = wordReplacement;
  if(languageCode in LanguageToURL){
    aElement.href = LanguageToURL[languageCode] + wordReplacement;
  }

  // Add a data attribute to identify this as a word replacement
  aElement.setAttribute('data-word-replacement', 'true');
  aElement.setAttribute('data-original-text', replacementObj.originalText);

  return aElement;
}