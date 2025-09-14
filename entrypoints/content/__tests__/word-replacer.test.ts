import { describe, it, expect, beforeEach } from 'vitest';
import {
  findMatch,
  createReplacementElement,
  replaceTextInNode,
  scanAndReplaceWords,
  WordReplacements,
  MatchResult
} from '../word-replacer';

describe('word-replacer', () => {
  const wordReplacements: WordReplacements = {
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
      const result = findMatch(node, wordReplacements);
      expect(result).toBeNull();
    });

    it('should return null when no words match', () => {
      const node = document.createTextNode('hello world test');
      const result = findMatch(node, wordReplacements);
      expect(result).toBeNull();
    });

    it('should find single word match', () => {
      const node = document.createTextNode('hello robot world');
      const result = findMatch(node, wordReplacements);
      
      expect(result).not.toBeNull();
      expect(result!.node).toBe(node);
      expect(result!.parts).toEqual(['hello ', 'robot', 'world']);
    });

    it('should find multiple word matches', () => {
      const node = document.createTextNode('the robot and worker are here');
      const result = findMatch(node, wordReplacements);
      
      expect(result).not.toBeNull();
      expect(result!.parts).toEqual(['the ', 'robot', 'and ', 'worker', 'are here']);
    });

    it('should handle text starting with a match', () => {
      const node = document.createTextNode('robot is working');
      const result = findMatch(node, wordReplacements);
      
      expect(result).not.toBeNull();
      expect(result!.parts).toEqual(['robot', 'is working']);
    });

    it('should handle text ending with a match', () => {
      const node = document.createTextNode('hello robot');
      const result = findMatch(node, wordReplacements);
      
      expect(result).not.toBeNull();
      expect(result!.parts).toEqual(['hello ', 'robot']);
    });
  });

  describe('createReplacementElement', () => {
    it('should create anchor element with correct text and href', () => {
      const element = createReplacementElement('robot', wordReplacements);
      
      expect(element.tagName).toBe('A');
      expect(element.textContent).toBe('机器人');
      expect(element.href).toContain('https://www.dong-chinese.com/dictionary/search/');
      // Chinese characters get URL encoded in href
      expect(element.href).toContain('%E6%9C%BA%E5%99%A8%E4%BA%BA');
    });

    it('should handle different words', () => {
      const element = createReplacementElement('worker', wordReplacements);
      
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
        parts: ['hello ', 'robot', ' world ']
      };

      replaceTextInNode(match, wordReplacements);

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
        parts: ['', 'robot', ' and ', 'worker', ' ']
      };

      replaceTextInNode(match, wordReplacements);

      const anchors = container.querySelectorAll('a');
      expect(anchors.length).toBe(2);
      expect(anchors[0].textContent).toBe('机器人');
      expect(anchors[1].textContent).toBe('工人');
    });

    it('should handle node without parent gracefully', () => {
      const textNode = document.createTextNode('hello robot');
      const match: MatchResult = {
        node: textNode,
        parts: ['hello ', 'robot']
      };

      // Should not throw error
      expect(() => replaceTextInNode(match, wordReplacements)).not.toThrow();
    });
  });

  describe('scanAndReplaceWords', () => {
    it('should scan and replace words in simple text', () => {
      document.body.innerHTML = '<p>The robot is working</p>';
      
      const result = scanAndReplaceWords(document.body, wordReplacements);
      
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
      
      const result = scanAndReplaceWords(document.body, wordReplacements);
      
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
      
      const result = scanAndReplaceWords(document.body, wordReplacements, 50);
      
      expect(result.scannedCount).toBeLessThanOrEqual(51);
    });

    it('should handle empty body', () => {
      document.body.innerHTML = '';
      
      const result = scanAndReplaceWords(document.body, wordReplacements);
      
      expect(result.scannedCount).toBe(0);
      expect(result.matchCount).toBe(0);
    });

    it('should handle nested elements', () => {
      document.body.innerHTML = `
        <div>
          <p>The <strong>robot</strong> and <em>worker</em> are here</p>
        </div>
      `;
      
      const result = scanAndReplaceWords(document.body, wordReplacements);
      
      expect(result.matchCount).toBe(2);
      
      const anchors = document.querySelectorAll('a');
      expect(anchors.length).toBe(2);
    });

    it('should not modify non-matching text', () => {
      document.body.innerHTML = '<p>Hello world, this is a test</p>';
      
      const result = scanAndReplaceWords(document.body, wordReplacements);
      
      expect(result.matchCount).toBe(0);
      expect(document.querySelectorAll('a').length).toBe(0);
      expect(document.body.textContent).toContain('Hello world, this is a test');
    });
  });
});