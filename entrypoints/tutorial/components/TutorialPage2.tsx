import { useEffect, useRef, useState } from 'react';

import { ConfigService, Language, WordStorageService } from '../../../lib/storage';
import WordReplacer from '../../content/word-replacer';
import AddWordForm from '../../options/components/AddWordForm';
import './TutorialPage2.css';

export default function TutorialPage2() {
    const [demoWords, setDemoWords] = useState<{ [key: string]: string }>({});
    const [selectedLanguage, setSelectedLanguage] = useState<Language>();
    const demoTextRef = useRef<HTMLDivElement>(null);

    // Load the selected language name
    useEffect(() => {
        const loadLanguageName = async () => {
            const language = await ConfigService.getActiveLanguage();
            setSelectedLanguage(language)
        };

        loadLanguageName();
    }, []);

    const handleAddWord = async (original: string, replacement: string) => {
        try {
            if(!selectedLanguage) throw new Error("no language set")
            const w = new WordStorageService(selectedLanguage)
            await w.addWordPair(original, replacement);

            const newWords = { ...demoWords, [original]: replacement };
            setDemoWords(newWords);

            // Apply word replacement to the demo text element
            if (demoTextRef.current) {
                // Reset the demo text to original
                demoTextRef.current.innerHTML = demoText;

                // Get all word pairs from storage and apply them
                const allWordPairs = await w.getWordPairs();
                const wordReplacer = new WordReplacer(selectedLanguage)
                wordReplacer.scanAndReplaceWords(demoTextRef.current, allWordPairs);
            }
        } catch (error) {
            console.error('Failed to add word pair:', error);
        }
    };

    const existingWords = Object.keys(demoWords);

    const demoText = 'The cat is sleeping on the table. I need to go to the store to buy food for my cat. Today the weather is very good, so it will be a nice walk to the grocery store nearby.'

    return (
        <div className="tutorial-page">
            <div className="tutorial-step">
                <h2 className="step-header">
                    <span className="step-number">1</span>
                    <span className="step-text">Add the English and {selectedLanguage?.name} words you want to practice.</span>
                </h2>
            </div>

            <AddWordForm
                onAddWord={handleAddWord}
                existingWords={existingWords}
            />

            <div className="tutorial-step">
                <h2 className="step-header">
                    <span className="step-number">2</span>
                    <span className="step-text">As you browse the web, your chosen words will appear in {selectedLanguage?.name}.</span>
                </h2>
            </div>

            <div className="demo-text" ref={demoTextRef}>
                {demoText}
            </div>

            {Object.keys(demoWords).length > 0 && (
                <div className="replacements-section">
                    <h3>Your Replacements:</h3>
                    <ul className="replacements-list">
                        {Object.entries(demoWords).map(([original, replacement]) => (
                            <li key={original}>
                                "{original}"<span className="replacement-arrow">→</span>"{replacement}"
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}