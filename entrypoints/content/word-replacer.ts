export interface ReplacementTargets {
  [key: string]: string;
}

export interface MatchResult {
  node: Node;
  // node.innerText with targets replaced. Also split by target
  replacedSplitText: string[];
}

/**
 * Replaces the targets in the node text. The node will be unchanged, 
 * the replacement is returned as a separate list.
 * @returns null if no match in node.
 */
export function replaceTargetsInText(node: Node, replacementTargets: ReplacementTargets): MatchResult | null {
  const textContent = node.textContent
  if (!textContent?.trim()) {
    return null;
  }

  // Find all matches for all targets
  const matches: RegExpExecArray[] = [];
  for(const target in replacementTargets){
    const replacementBetweenWordBoundaries = new RegExp(`\\b${target}\\b`, 'g');
    matches.push(...textContent.matchAll(replacementBetweenWordBoundaries));
  }
  if(matches.length == 0) return null

  // Sort matches by position (ascending), then by length (descending) for overlaps
  matches.sort((matchA, matchB) => {
      const result = matchA.index - matchB.index
      if(result == 0) {
          return matchB[0].length - matchA[0].length
      }
      return result
  })

  // Split text around matches, avoiding overlaps
  let index = 0;
  const result: string[] = [];
  for (const match of matches) {
    if(match.index < index) continue; // Skip overlapping matches

    // Add text before match
    if(index !== match.index){
      result.push(textContent.slice(index, match.index))
    }

    // Add the matched text
    result.push(match[0]);
    index = match.index + match[0].length;
  }

  // Add remaining text
  if (index < textContent.length) {
    result.push(textContent.slice(index));
  }
  
  return { node, replacedSplitText: result };
}

export function createReplacementElement(wordToReplace: string, wordReplacements: ReplacementTargets): HTMLAnchorElement {
  const aElement = document.createElement('a');
  const wordReplacement = wordReplacements[wordToReplace];
  aElement.textContent = wordReplacement;
  aElement.href = "https://www.dong-chinese.com/dictionary/search/" + wordReplacement;
  return aElement;
}

export function replaceTextInNode(match: MatchResult, wordReplacements: ReplacementTargets): void {
  const { node, replacedSplitText: parts } = match;
  const parent = node.parentNode;
  
  if (parent) {
    const nextSibling = node.nextSibling;
    parent.removeChild(node);
    
    for (let i = 0; i < parts.length; i++) {
      let newNode: Node;
      if (parts[i] in wordReplacements) {
        console.log(`replacing ${parts[i]} with ${wordReplacements[parts[i]]}. At:`, parent)
        newNode = createReplacementElement(parts[i], wordReplacements);
      } else {
        newNode = document.createTextNode(parts[i]);
      }
      
      if (nextSibling) {
        parent.insertBefore(newNode, nextSibling);
      } else {
        parent.appendChild(newNode);
      }
    }
  }
}

export function scanAndReplaceWords(
  body: Element, 
  wordReplacements: ReplacementTargets, 
  iterationMax: number = 30000
): { scannedCount: number; matchCount: number } {
  const matches: MatchResult[] = [];
  let index = 0;
  
  const startTime = performance.now()
  const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
  
  for (index = 0; walker.nextNode(); index++) {
    if (index > iterationMax) {
      console.info("Scanning webpage but webpage is too big to scan everything efficiently. Exiting.");
      break;
    }

    const match = replaceTargetsInText(walker.currentNode, wordReplacements);
    if (match) {
      matches.push(match);
    }
  }

  console.log(`Found ${matches.length} matches in ${performance.now()-startTime}ms`);
  console.log('Replacing target elements: ', matches);
  
  const startTime2 = performance.now()
  matches.forEach(match => replaceTextInNode(match, wordReplacements));
  console.log(`Replaced ${matches.length} matches in ${performance.now()-startTime2}ms`);
  
  return { scannedCount: index, matchCount: matches.length };
}