import { describe, it, expect, beforeEach } from 'vitest';
import {JSDOM} from 'jsdom'
import {
  replaceTargetsInText,
  createReplacementElement,
  replaceTextInNode,
  scanAndReplaceWords,
  ReplacementTargets,
  MatchResult
} from '../word-replacer';

describe('word-replacer', () => {
  const replacementTargets: ReplacementTargets = {
    'robot': '机器人',
    'worker': '工人',
    'workers': '工人',
    'write': '写'
  };

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('findMatch', () => {
    it('should return null for node without text content', () => {
      const node = document.createElement('div');
      const result = replaceTargetsInText(node, replacementTargets);
      expect(result).toBeNull();
    });

    it('should return null when no words match', () => {
      const node = document.createTextNode('hello world test');
      const result = replaceTargetsInText(node, replacementTargets);
      expect(result).toBeNull();
    });

    it('should find single word match', () => {
      const node = document.createTextNode('hello robot world');
      const result = replaceTargetsInText(node, replacementTargets);
      
      expect(result).not.toBeNull();
      expect(result!.node).toBe(node);
      expect(result!.replacedSplitText).toEqual(['hello ', 'robot', ' world']);
    });

    it('should find multiple word matches', () => {
      const node = document.createTextNode('the robot and worker are here');
      const result = replaceTargetsInText(node, replacementTargets);
      
      expect(result).not.toBeNull();
      expect(result!.replacedSplitText).toEqual(['the ', 'robot', ' and ', 'worker', ' are here']);
    });

    it('should handle text starting with a match', () => {
      const node = document.createTextNode('robot is working');
      const result = replaceTargetsInText(node, replacementTargets);
      
      expect(result).not.toBeNull();
      expect(result!.replacedSplitText).toEqual(['robot', ' is working']);
    });

    it('should handle text ending with a match', () => {
      const node = document.createTextNode('hello robot');
      const result = replaceTargetsInText(node, replacementTargets);
      
      expect(result).not.toBeNull();
      expect(result!.replacedSplitText).toEqual(['hello ', 'robot']);
    });
  });

  describe('createReplacementElement', () => {
    it('should create anchor element with correct text and href', () => {
      const element = createReplacementElement('robot', replacementTargets);
      
      expect(element.tagName).toBe('A');
      expect(element.textContent).toBe('机器人');
      expect(element.href).toContain('https://www.dong-chinese.com/dictionary/search/');
      // Chinese characters get URL encoded in href
      expect(element.href).toContain('%E6%9C%BA%E5%99%A8%E4%BA%BA');
    });

    it('should handle different words', () => {
      const element = createReplacementElement('worker', replacementTargets);
      
      expect(element.textContent).toBe('工人');
      expect(element.href).toContain('https://www.dong-chinese.com/dictionary/search/');
      // Chinese characters get URL encoded in href
      expect(element.href).toContain('%E5%B7%A5%E4%BA%BA');
    });
  });

  describe('replaceTextInNode', () => {
    it('should replace text node with mixed content', () => {
      const container = document.createElement('div');
      const textNode = document.createTextNode('hello robot world');
      container.appendChild(textNode);
      document.body.appendChild(container);

      const match: MatchResult = {
        node: textNode,
        replacedSplitText: ['hello ', 'robot', ' world ']
      };

      replaceTextInNode(match, replacementTargets);

      expect(container.children.length).toBe(1);
      expect(container.children[0].tagName).toBe('A');
      expect(container.children[0].textContent).toBe('机器人');
      expect(container.childNodes.length).toBe(3); // text + anchor + text
    });

    it('should handle multiple replacements', () => {
      const container = document.createElement('div');
      const textNode = document.createTextNode('robot and worker');
      container.appendChild(textNode);

      const match: MatchResult = {
        node: textNode,
        replacedSplitText: ['', 'robot', ' and ', 'worker', ' ']
      };

      replaceTextInNode(match, replacementTargets);

      const anchors = container.querySelectorAll('a');
      expect(anchors.length).toBe(2);
      expect(anchors[0].textContent).toBe('机器人');
      expect(anchors[1].textContent).toBe('工人');
    });

    it('should make sure replacement is in correct order', () => {
      const frag = JSDOM.fragment(`<p>Clanker, rust bucket, tinskin —<a href="https://www.npr.org/2025/08/06/nx-s1-5493360/clanker-robot-slur-star-wars" target="_blank"> <u>slang words used to put down robots</u></a> are on the rise.</p>`)
      const p = frag.firstChild
      const match: MatchResult = {
        node: p?.firstChild!,
        replacedSplitText: ['Clanker, rust ', 'bucket', ', tinskin —']
      };

      replaceTextInNode(match, replacementTargets);
      expect(p?.textContent).toBe('Clanker, rust bucket, tinskin — slang words used to put down robots are on the rise.')
    });
  });

  describe('scanAndReplaceWords', () => {
    it('should scan and replace words in simple text', () => {
      document.body.innerHTML = '<p>The robot is working</p>';
      
      const result = scanAndReplaceWords(document.body, replacementTargets);
      
      expect(result.scannedCount).toBeGreaterThan(0);
      expect(result.matchCount).toBe(1);
      
      const anchor = document.querySelector('a');
      expect(anchor).not.toBeNull();
      expect(anchor!.textContent).toBe('机器人');
    });

    it('should handle multiple text nodes', () => {
      document.body.innerHTML = `
        <div>
          <p>The robot is here</p>
          <span>A worker is needed</span>
        </div>
      `;
      
      const result = scanAndReplaceWords(document.body, replacementTargets);
      
      expect(result.matchCount).toBe(2);
      
      const anchors = document.querySelectorAll('a');
      expect(anchors.length).toBe(2);
      expect(anchors[0].textContent).toBe('机器人');
      expect(anchors[1].textContent).toBe('工人');
    });

    it('should respect iteration limit', () => {
      // Create a large DOM structure
      const container = document.createElement('div');
      for (let i = 0; i < 100; i++) {
        const p = document.createElement('p');
        p.textContent = `Text node ${i}`;
        container.appendChild(p);
      }
      document.body.appendChild(container);
      
      const result = scanAndReplaceWords(document.body, replacementTargets, 50);
      
      expect(result.scannedCount).toBeLessThanOrEqual(51);
    });

    it('should handle empty body', () => {
      document.body.innerHTML = '';
      
      const result = scanAndReplaceWords(document.body, replacementTargets);
      
      expect(result.scannedCount).toBe(0);
      expect(result.matchCount).toBe(0);
    });

    it('should handle nested elements', () => {
      document.body.innerHTML = `
        <div>
          <p>The <strong>robot</strong> and <em>worker</em> are here</p>
        </div>
      `;
      
      const result = scanAndReplaceWords(document.body, replacementTargets);
      
      expect(result.matchCount).toBe(2);
      
      const anchors = document.querySelectorAll('a');
      expect(anchors.length).toBe(2);
    });

    it('should not modify non-matching text', () => {
      document.body.innerHTML = '<p>Hello world, this is a test</p>';
      
      const result = scanAndReplaceWords(document.body, replacementTargets);
      
      expect(result.matchCount).toBe(0);
      expect(document.querySelectorAll('a').length).toBe(0);
      expect(document.body.textContent).toContain('Hello world, this is a test');
    });
  });
});