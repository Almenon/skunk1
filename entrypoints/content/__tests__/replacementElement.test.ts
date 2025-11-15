import { describe, expect, it } from 'vitest';

import { createReplacementElement } from "../replacementElement";

describe('createReplacementElement', () => {
    it('should create anchor element with correct text and href', () => {
        // @ts-expect-error other properties not needed for test
        const replacementObj: ReplacementObject = {
            replacementValue: '机器人'
        };
        const element = createReplacementElement(replacementObj, "zh");

        expect(element.tagName).toBe('A');
        expect(element.textContent).toBe('机器人');
        expect(element.href).toContain('https://www.dong-chinese.com/dictionary/search/%E6%9C%BA%E5%99%A8%E4%BA%BA');
    });

    // todo add test for different lanaguages
    // it('should handle different languages', () => {
    //     // @ts-expect-error other properties not needed for test
    //     const replacementObj: ReplacementObject = {
    //         replacementValue: 'hola'
    //     };
    //     const element = createReplacementElement(replacementObj, "es");

    //     expect(element.textContent).toBe('hola');
    //     expect(element.href).toContain('https://www.todoPutWebsiteHere.com/hola');
    // });
});
