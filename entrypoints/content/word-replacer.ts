export interface WordReplacements {
  [key: string]: string;
}

export interface MatchResult {
  node: Node;
  parts: string[];
}

/**
 * Take a node and return the split version for processing later
 * @returns null if no match in node
 */
export function findMatch(node: Node, wordReplacements: WordReplacements): MatchResult | null {
  if (!node.textContent) {
    return null;
  }

  // todo split on all whitespace /\s+/
  const words = node.textContent.split(" ");
  const result: string[] = [];
  let wordsSoFar = "";
  
  words.forEach((word) => {
    if (word in wordReplacements) {
      if(wordsSoFar){
        result.push(wordsSoFar);
      }
      result.push(word);
      wordsSoFar = " ";
    } else {
      wordsSoFar += word + " ";
    }
  });

  if (result.length === 0) {
    return null;
  }

  if(wordsSoFar != "" && wordsSoFar != " "){
    result.push(wordsSoFar.slice(0,wordsSoFar.length-1))
  }
  
  return { node, parts: result };
}

export function createReplacementElement(wordToReplace: string, wordReplacements: WordReplacements): HTMLAnchorElement {
  const aElement = document.createElement('a');
  const wordReplacement = wordReplacements[wordToReplace];
  aElement.textContent = wordReplacement;
  aElement.href = "https://www.dong-chinese.com/dictionary/search/" + wordReplacement;
  return aElement;
}

export function replaceTextInNode(match: MatchResult, wordReplacements: WordReplacements): void {
  const { node, parts } = match;
  const parent = node.parentNode;
  
  if (parent) {
    parent.removeChild(node);
    for (let i = 0; i < parts.length; i++) {
      if (parts[i] in wordReplacements) {
        console.log(`replacing ${parts[i]} with ${wordReplacements[parts[i]]}. At:`)
        console.log(parent)
        parent.appendChild(createReplacementElement(parts[i], wordReplacements));
      } else {
        parent.appendChild(document.createTextNode(parts[i]));
      }
    }
  }
}

export function scanAndReplaceWords(
  body: Element, 
  wordReplacements: WordReplacements, 
  iterationMax: number = 30000
): { scannedCount: number; matchCount: number } {
  const matches: MatchResult[] = [];
  let index = 0;
  
  const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
  
  for (index = 0; walker.nextNode(); index++) {
    if (index > iterationMax) {
      console.info("Scanning webpage but webpage is too big to scan everything efficiently. Exiting.");
      break;
    }

    const match = findMatch(walker.currentNode, wordReplacements);
    if (match) {
      matches.push(match);
    }
  }

  console.log(`Finished scanning webpage. Scanned ${index} elements`);
  console.log('replacing target elements');
  console.log(matches);
  
  matches.forEach(match => replaceTextInNode(match, wordReplacements));
  
  return { scannedCount: index, matchCount: matches.length };
}