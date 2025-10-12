import { useRef, useState } from 'react';
import { WordStorageService } from '../../../lib/storage';
import { scanAndReplaceWords } from '../../content/word-replacer';
import AddWordForm from '../../options/components/AddWordForm';

export default function TutorialPage1() {
    const [demoWords, setDemoWords] = useState<{ [key: string]: string }>({});
    const demoTextRef = useRef<HTMLDivElement>(null);

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
                demoTextRef.current.innerHTML = "This is a sample text where you can see how the word replacer works. Try adding a word replacement below and watch this text change!";

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
        <div>
            <p>
                #1: Add the English and Chinese words you want to practice.
            </p>

            <AddWordForm
                onAddWord={handleAddWord}
                existingWords={existingWords}
            />

            <p>
                #2: As you browse the web, your chosen words will appear in Chinese.
            </p>

            <div className="demo-text" ref={demoTextRef}>
                This is a sample text where you can see how the word replacer works. Try adding a word replacement below and watch this text change!
            </div>

            {Object.keys(demoWords).length > 0 && (
                <div style={{ marginTop: '20px' }}>
                    <h3>Your Replacements:</h3>
                    <ul>
                        {Object.entries(demoWords).map(([original, replacement]) => (
                            <li key={original}>
                                "{original}" → "{replacement}"
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}