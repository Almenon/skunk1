export interface ReplacementTargets {
  [key: string]: string;
}

export class ReplacementObject {
  public originalText: string;
  public replacementKey: string;

  constructor(
    public match: RegExpExecArray,
    public replacementValue: string,
    replacementKey: string
  ) {
    this.originalText = match[0];
    this.replacementKey = replacementKey;
  }
}

// Track all replacements made on the page
interface ReplacementRecord {
  element: HTMLAnchorElement;
  originalText: string;
  parentNode: Node;
  nextSibling: Node | null;
}

// Global tracking of all replacements
const activeReplacements: ReplacementRecord[] = [];

export interface MatchResult {
  node: Node;
  // node.innerText with targets replaced
  replacedSplitText: (string | ReplacementObject)[];
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
  const replacements: ReplacementObject[] = []
  for (const target in replacementTargets) {
    const replacementBetweenWordBoundaries = new RegExp(`\\b${target}\\b`, 'gi');
    for (const match of textContent.matchAll(replacementBetweenWordBoundaries)) {
      replacements.push(new ReplacementObject(match, replacementTargets[target], target));
    }
  }
  if (replacements.length == 0) return null

  // Sort matches by position (ascending), then by length (descending) for overlaps
  replacements.sort((A, B) => {
    const matchA = A.match;
    const matchB = B.match;
    const result = matchA.index - matchB.index
    if (result == 0) {
      return matchB[0].length - matchA[0].length
    }
    return result
  })

  // Split text around matches, avoiding overlaps
  let index = 0;
  const result: (string | ReplacementObject)[] = [];
  for (const replacement of replacements) {
    const match = replacement.match
    if (match.index < index) continue; // Skip overlapping matches

    // Add text before match
    if (index !== match.index) {
      result.push(textContent.slice(index, match.index))
    }

    result.push(replacement);
    index = match.index + match[0].length;
  }

  // Add remaining text
  if (index < textContent.length) {
    result.push(textContent.slice(index));
  }

  return { node, replacedSplitText: result };
}

export function createReplacementElement(replacementObj: ReplacementObject): HTMLAnchorElement {
  const aElement = document.createElement('a');
  const wordReplacement = replacementObj.replacementValue;
  aElement.textContent = wordReplacement;
  aElement.href = "https://www.dong-chinese.com/dictionary/search/" + wordReplacement;

  // Add a data attribute to identify this as a word replacement
  aElement.setAttribute('data-word-replacement', 'true');
  aElement.setAttribute('data-original-text', replacementObj.originalText);

  return aElement;
}



export function replaceTextInNode(match: MatchResult): void {
  const { node, replacedSplitText: parts } = match;
  const parent = node.parentNode;

  if (parent) {
    const nextSibling = node.nextSibling;
    parent.removeChild(node);

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      let newNode: Node;
      if (part instanceof ReplacementObject) {
        console.log(`replacing ${part.match[0]} with ${part.replacementValue}. At:`, parent)
        const replacementElement = createReplacementElement(part);
        newNode = replacementElement;

        // Track this replacement for potential reversal
        activeReplacements.push({
          element: replacementElement,
          originalText: part.originalText,
          parentNode: parent,
          nextSibling: nextSibling
        });
      } else {
        newNode = document.createTextNode(part);
      }

      if (nextSibling) {
        parent.insertBefore(newNode, nextSibling);
      } else {
        parent.appendChild(newNode);
      }
    }
  }
}

/**
 * Reverts all word replacements made on the page
 * This is useful when switching languages to clear previous replacements
 */
export function revertAllReplacements(): { revertedCount: number } {
  const startTime = performance.now();
  let revertedCount = 0;

  // Process replacements in reverse order to maintain DOM structure
  for (let i = activeReplacements.length - 1; i >= 0; i--) {
    const record = activeReplacements[i];

    try {
      // Check if the element is still in the DOM
      if (record.element.parentNode) {
        // Create a text node with the original text
        const originalTextNode = document.createTextNode(record.originalText);

        // Replace the anchor element with the original text
        record.element.parentNode.replaceChild(originalTextNode, record.element);
        revertedCount++;
      }
    } catch (error) {
      console.warn('Failed to revert replacement:', error);
    }
  }

  // Clear the tracking array
  activeReplacements.length = 0;

  console.log(`Reverted ${revertedCount} word replacements in ${performance.now() - startTime}ms`);
  return { revertedCount };
}

/**
 * Gets the count of active replacements on the page
 */
export function getActiveReplacementCount(): number {
  return activeReplacements.length;
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

    if (walker.currentNode.parentElement?.tagName === 'SCRIPT' || walker.currentNode.parentElement?.tagName === 'STYLE') {
      // these elements are not visible, no point in replacing them
      continue;
    }

    const match = replaceTargetsInText(walker.currentNode, wordReplacements);
    if (match) {
      matches.push(match);
    }
  }

  console.log(`Found ${matches.length} matches in ${performance.now() - startTime}ms`);
  console.log('Replacing target elements: ', matches);

  const startTime2 = performance.now()
  matches.forEach(match => replaceTextInNode(match));
  console.log(`Replaced ${matches.length} matches in ${performance.now() - startTime2}ms`);

  return { scannedCount: index, matchCount: matches.length };
}