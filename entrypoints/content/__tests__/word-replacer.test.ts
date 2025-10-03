import { describe, it, expect, beforeEach } from 'vitest';
import {
  replaceTargetsInText,
  createReplacementElement,
  replaceTextInNode,
  scanAndReplaceWords,
  ReplacementTargets,
  MatchResult,
  ReplacementObject
} from '../word-replacer';

describe('word-replacer', () => {
  const replacementTargets: ReplacementTargets = {
    'robot': '机器人',
    'worker': '工人',
    'workers': '工人',
    'write': '写',
    'bucket': '桶'
  };

  // Helper function to create ReplacementObject for tests
  function createTestReplacementObject(originalText: string, replacementKey: string, replacementValue: string, index: number = 0, input: string = originalText): ReplacementObject {
    const mockMatch = [originalText] as RegExpExecArray;
    mockMatch.index = index;
    mockMatch.input = input;
    return new ReplacementObject(mockMatch, replacementValue, replacementKey);
  }

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
      expect(result!.replacedSplitText).toEqual([
        'hello ',
        createTestReplacementObject('robot', 'robot', '机器人', 6, 'hello robot world'),
        ' world'
      ]);
    });

    it('should find multiple word matches', () => {
      const node = document.createTextNode('the robot and worker are here');
      const result = replaceTargetsInText(node, replacementTargets);

      expect(result).not.toBeNull();
      const splitText = result!.replacedSplitText;
      expect(splitText).toHaveLength(5);
      expect(splitText[0]).toBe('the ');
      expect(splitText[1]).toBeInstanceOf(ReplacementObject);
      expect((splitText[1] as ReplacementObject).originalText).toBe('robot');
      expect((splitText[1] as ReplacementObject).replacementValue).toBe('机器人');
      expect(splitText[2]).toBe(' and ');
      expect(splitText[3]).toBeInstanceOf(ReplacementObject);
      expect((splitText[3] as ReplacementObject).originalText).toBe('worker');
      expect((splitText[3] as ReplacementObject).replacementValue).toBe('工人');
      expect(splitText[4]).toBe(' are here');
    });

    it('should handle text starting with a match', () => {
      const node = document.createTextNode('robot is working');
      const result = replaceTargetsInText(node, replacementTargets);

      expect(result).not.toBeNull();
      expect(result!.replacedSplitText).toEqual([
        createTestReplacementObject('robot', 'robot', '机器人', 0, 'robot is working'),
        ' is working'
      ]);
    });

    it('should handle text ending with a match', () => {
      const node = document.createTextNode('hello robot');
      const result = replaceTargetsInText(node, replacementTargets);

      expect(result).not.toBeNull();
      expect(result!.replacedSplitText).toEqual([
        'hello ',
        createTestReplacementObject('robot', 'robot', '机器人', 6, 'hello robot')
      ]);
    });

    it('should be case insensitive for matches', () => {
      const node = document.createTextNode('Hello ROBOT and Worker are here');
      const result = replaceTargetsInText(node, replacementTargets);

      expect(result).not.toBeNull();
      expect(result!.replacedSplitText).toEqual([
        'Hello ',
        createTestReplacementObject('ROBOT', 'robot', '机器人', 6, 'Hello ROBOT and Worker are here'),
        ' and ',
        createTestReplacementObject('Worker', 'worker', '工人', 16, 'Hello ROBOT and Worker are here'),
        ' are here'
      ]);
    });
  });

  describe('createReplacementElement', () => {
    it('should create anchor element with correct text and href', () => {
      // @ts-expect-error other properties not needed for test
      const replacementObj: ReplacementObject = {
        replacementValue: '机器人'
      };
      const element = createReplacementElement(replacementObj);

      expect(element.tagName).toBe('A');
      expect(element.textContent).toBe('机器人');
      expect(element.href).toContain('https://www.dong-chinese.com/dictionary/search/');
      // Chinese characters get URL encoded in href
      expect(element.href).toContain('%E6%9C%BA%E5%99%A8%E4%BA%BA');
    });

    it('should handle different words', () => {
      // @ts-expect-error other properties not needed for test
      const replacementObj: ReplacementObject = {
        replacementValue: '工人'
      };
      const element = createReplacementElement(replacementObj);

      expect(element.textContent).toBe('工人');
      expect(element.href).toContain('https://www.dong-chinese.com/dictionary/search/');
      // Chinese characters get URL encoded in href
      expect(element.href).toContain('%E5%B7%A5%E4%BA%BA');
    });

    it('should handle case insensitive matches', () => {
      // @ts-expect-error other properties not needed for test
      const replacementObj: ReplacementObject = {
        replacementValue: '机器人'
      };
      const element = createReplacementElement(replacementObj);

      expect(element.textContent).toBe('机器人');
      expect(element.href).toContain('https://www.dong-chinese.com/dictionary/search/');
      // Chinese characters get URL encoded in href
      expect(element.href).toContain('%E6%9C%BA%E5%99%A8%E4%BA%BA');
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
        replacedSplitText: [
          'hello ',
          createTestReplacementObject('robot', 'robot', '机器人'),
          ' world '
        ]
      };

      replaceTextInNode(match);

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
        replacedSplitText: [
          '',
          createTestReplacementObject('robot', 'robot', '机器人'),
          ' and ',
          createTestReplacementObject('worker', 'worker', '工人'),
          ' '
        ]
      };

      replaceTextInNode(match);

      const anchors = container.querySelectorAll('a');
      expect(anchors.length).toBe(2);
      expect(anchors[0].textContent).toBe('机器人');
      expect(anchors[1].textContent).toBe('工人');
    });

    it('should make sure replacement is in correct order (test1)', () => {
      document.body.innerHTML = '<p>Clanker, rust bucket, tinskin —<a href="https://www.npr.org/2025/08/06/nx-s1-5493360/clanker-robot-slur-star-wars" target="_blank"> <u>slang words used to put down robots</u></a> are on the rise.</p>'
      const match: MatchResult = {
        node: document.body.firstChild!,
        replacedSplitText: [
          'Clanker, rust ',
          createTestReplacementObject('bucket', 'bucket', '桶'),
          ', tinskin — slang words used to put down robots are on the rise.'
        ]
      };

      replaceTextInNode(match);
      expect(document.body.textContent).toBe('Clanker, rust 桶, tinskin — slang words used to put down robots are on the rise.')
    });

    it('should make sure replacement is in correct order (test2)', () => {
      document.body.innerHTML = '<div><a>a</a><p>b</p><div>c</div>bucket</div>'
      const match: MatchResult = {
        node: document.body.firstChild!,
        replacedSplitText: [
          'abc',
          createTestReplacementObject('bucket', 'bucket', '桶')
        ]
      };

      replaceTextInNode(match);
      expect(document.body?.textContent).toBe('abc桶')
    });

    it('should handle case insensitive replacements', () => {
      const container = document.createElement('div');
      const textNode = document.createTextNode('Hello ROBOT and Worker');
      container.appendChild(textNode);

      const match: MatchResult = {
        node: textNode,
        replacedSplitText: [
          'Hello ',
          createTestReplacementObject('ROBOT', 'robot', '机器人'),
          ' and ',
          createTestReplacementObject('Worker', 'worker', '工人')
        ]
      };

      replaceTextInNode(match);

      const anchors = container.querySelectorAll('a');
      expect(anchors.length).toBe(2);
      expect(anchors[0].textContent).toBe('机器人');
      expect(anchors[1].textContent).toBe('工人');
      expect(container.textContent).toBe('Hello 机器人 and 工人');
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

    it('should handle case insensitive replacements end-to-end', () => {
      document.body.innerHTML = '<p>The ROBOT and Worker are here</p>';

      const result = scanAndReplaceWords(document.body, replacementTargets);

      expect(result.matchCount).toBe(1); // 1 text node with 2 replacements

      const anchors = document.querySelectorAll('a');
      expect(anchors.length).toBe(2);
      expect(anchors[0].textContent).toBe('机器人');
      expect(anchors[1].textContent).toBe('工人');
      expect(document.body.textContent).toBe('The 机器人 and 工人 are here');
    });
  });
});