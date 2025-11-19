import { Language } from "@/lib/storage";
import { ReplacementObject } from "./word-replacer";

// todo put this in user controlled configuration
const LanguageToURL: Record<string,string> = {
    'zh': 'https://www.dong-chinese.com/dictionary/search/',
    'es': 'https://dictionary.reverso.net/spanish-english/'
}

export function createReplacementElement(replacementObj: ReplacementObject, language: Language): HTMLAnchorElement {
  const aElement = document.createElement('a');
  const wordReplacement = replacementObj.replacementValue;
  aElement.textContent = wordReplacement;
  if(language.code in LanguageToURL){
    aElement.href = LanguageToURL[language.code] + wordReplacement;
  }
  else {
    aElement.href = `https://translate.google.com/?sl=${language.code}&tl=en&text=${wordReplacement}&op=translate`
  }

  // Add a data attribute to identify this as a word replacement
  aElement.setAttribute('data-word-replacement', 'true');
  aElement.setAttribute('data-original-text', replacementObj.originalText);

  return aElement;
}