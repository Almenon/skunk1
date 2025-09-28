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
 * the replacement is returned as a seperate list.
 * For example, ["Hello I am bob"] -> ["你好", "I am bob"]
 * @returns null if no match in node.
 */
export function replaceTargetsInText(node: Node, replacementTargets: {[key:string]: string}): MatchResult | null {
  if (!node.textContent?.trim()) {
    return null;
  }

  const matches: RegExpExecArray[] = []
  for(const target in replacementTargets){
      let replacementBetweenWordBoundaries = new RegExp(`\\b${target}\\b`, 'g')
      for(const match of node.textContent.matchAll(replacementBetweenWordBoundaries)){
          matches.push(match)
      }
  }
  if(matches.length == 0) return null
  console.log(`Matches for ${node.textContent}: ${matches}`)

  // sort so replacement targets are in ascending order of start position
  // [0..1] [2..3] [5..9] and so on
  // if two targets start at same index, longest one comes first
  matches.sort((matchA, matchB) => {
      const result = matchA.index - matchB.index
      if(result == 0) {
          return matchB[0].length - matchA[0].length
      }
      return result
  })

  // split up text
  let index = 0
  const result: string[] = [];
  for (const match of matches) {
      if(match.index < index){
          // replacementTarget is overlapping or inside previous replacementTarget
          // in which case we skip, (we can't replace an overlap)
          continue
      }
      // put non-match text in result
      if(index != match.index){
          result.push(node.textContent.slice(index, match.index))
      }
      // put text in result
      result.push(match[0])
      index = match.index + match[0].length
  }

  // there may be leftover text at the end, make sure that doesn't get missed
  if(index != node.textContent.length){
      result.push(node.textContent.slice(index, node.textContent.length))
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
    console.log(node.textContent)
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

  console.log(`Finished scanning webpage. Scanned ${index} elements`);
  console.log('replacing target elements');
  console.log(matches);
  
  matches.forEach(match => replaceTextInNode(match, wordReplacements));
  
  return { scannedCount: index, matchCount: matches.length };
}