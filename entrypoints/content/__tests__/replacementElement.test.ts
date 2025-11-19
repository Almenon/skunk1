import { describe, expect, it } from 'vitest';

import { createReplacementElement } from "../replacementElement";

describe('createReplacementElement', () => {
    it('should handle Mandarin', () => {
        // @ts-expect-error other properties not needed for test
        const replacementObj: ReplacementObject = {
            replacementValue: '机器人'
        };
        const element = createReplacementElement(replacementObj, {
            code: 'zh',
            name: 'Chinese',
            nativeName: 'Zhongwen'
        });

        expect(element.tagName).toBe('A');
        expect(element.textContent).toBe('机器人');
        expect(element.href).toContain('https://www.dong-chinese.com/dictionary/search/%E6%9C%BA%E5%99%A8%E4%BA%BA');
    });

    it('should handle Spanish', () => {
        // @ts-expect-error other properties not needed for test
        const replacementObj: ReplacementObject = {
            replacementValue: 'hola'
        };
        const element = createReplacementElement(replacementObj, {
            code: 'es',
            name: 'Spanish',
            nativeName: 'Español'
        });

        expect(element.textContent).toBe('hola');
        expect(element.href).toContain('https://dictionary.reverso.net/spanish-english/hola');
    });

    it('should handle everything else', () => {
        // @ts-expect-error other properties not needed for test
        const replacementObj: ReplacementObject = {
            replacementValue: 'merci'
        };
        const element = createReplacementElement(replacementObj, {
            code: 'fr',
            name: 'French',
            nativeName: '?'
        });

        expect(element.textContent).toBe('merci');
        expect(element.href).toContain('https://translate.google.com/?sl=fr&tl=en&text=merci&op=translate');
    });
});
