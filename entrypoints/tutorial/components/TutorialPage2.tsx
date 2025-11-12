import { useEffect, useRef, useState } from 'react';
import { ConfigService, WordStorageService } from '../../../lib/storage';
import { scanAndReplaceWords } from '../../content/word-replacer';
import AddWordForm from '../../options/components/AddWordForm';
import './TutorialPage2.css';

export default function TutorialPage2() {
    const [demoWords, setDemoWords] = useState<{ [key: string]: string }>({});
    const [selectedLanguageName, setSelectedLanguageName] = useState<string>('Chinese');
    const demoTextRef = useRef<HTMLDivElement>(null);

    // Load the selected language name
    useEffect(() => {
        const loadLanguageName = async () => {
            try {
                const languageCode = await ConfigService.getActiveLanguage();
                const availableLanguages = ConfigService.getAvailableLanguages();
                const language = availableLanguages.find((lang) => lang.code === languageCode);
                setSelectedLanguageName(language?.name || 'Chinese');
            } catch (error) {
                console.error('Failed to load language name:', error);
                setSelectedLanguageName('Chinese'); // Fallback
            }
        };

        loadLanguageName();
    }, []);

    const handleAddWord = async (original: string, replacement: string) => {
        try {
            // Add word pair to storage
            await WordStorageService.addWordPair(original, replacement);

            // Update local state
            const newWords = { ...demoWords, [original]: replacement };
            setDemoWords(newWords);

            // Apply word replacement to the demo text element
            if (demoTextRef.current) {
                // Reset the demo text to original
                demoTextRef.current.innerHTML = "The cat is sleeping on the table. I need to buy some food from the store. The weather is very nice today. My friend lives in a big house. We can go to the park tomorrow.";

                // Get all word pairs from storage and apply them
                const allWordPairs = await WordStorageService.getWordPairs();
                scanAndReplaceWords(demoTextRef.current, allWordPairs);
            }
        } catch (error) {
            console.error('Failed to add word pair:', error);
        }
    };

    const existingWords = Object.keys(demoWords);

    return (
        <div className="tutorial-page">
            <div className="tutorial-step">
                <h2 className="step-header">
                    <span className="step-number">1</span>
                    <span className="step-text">Add the English and {selectedLanguageName} words you want to practice.</span>
                </h2>
            </div>

            <AddWordForm
                onAddWord={handleAddWord}
                existingWords={existingWords}
            />

            <div className="tutorial-step">
                <h2 className="step-header">
                    <span className="step-number">2</span>
                    <span className="step-text">As you browse the web, your chosen words will appear in {selectedLanguageName}.</span>
                </h2>
            </div>

            <div className="demo-text" ref={demoTextRef}>
                The cat is sleeping on the table. I need to go to the store to buy food for my cat. Today the weather is very good, so it will be a nice walk to the grocery store nearby.
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