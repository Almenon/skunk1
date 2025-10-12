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
            <h2>How Word Replacer Works</h2>
            <p>
                Word Replacer automatically replaces words or phrases on web pages as you browse.
                Try it out below - add a word replacement and see how it changes the sample text!
            </p>

            <div className="demo-text" ref={demoTextRef}>
                This is a sample text where you can see how the word replacer works. Try adding a word replacement below and watch this text change!
            </div>

            <p>
                <strong>Try these examples:</strong>
            </p>
            <ul>
                <li>Replace "sample" with "demo"</li>
                <li>Replace "word" with "text"</li>
                <li>Replace "works" with "functions"</li>
            </ul>

            <AddWordForm
                onAddWord={handleAddWord}
                existingWords={existingWords}
            />

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