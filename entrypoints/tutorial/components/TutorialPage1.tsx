import { useEffect, useState } from 'react';

import { ConfigService, Language } from '../../../lib/storage';
import LanguageSelector from '../../options/components/LanguageSelector';
import './TutorialPage1.css';

interface TutorialPage1Props {
    onLanguageSelected: (selected: boolean) => void;
}

export default function TutorialPage1({ onLanguageSelected }: TutorialPage1Props) {
    const [selectedLanguage, setSelectedLanguage] = useState<Language>();
    const [isLoading, setIsLoading] = useState(true);

    // Start with no language selected for tutorial
    useEffect(() => {
        setIsLoading(false);
        onLanguageSelected(false);
    }, [onLanguageSelected]);

    const handleLanguageSelect = async (language: Language) => {
        try {
            await ConfigService.setActiveLanguage(language);
            setSelectedLanguage(language);
            onLanguageSelected(true);
        } catch (error) {
            console.error('Failed to set active language:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="tutorial-page">
                <div className="loading-message">Loading...</div>
            </div>
        );
    }

    return (
        <div className="tutorial-page">
            <div className="tutorial-step">
                <h2 className="step-header">
                    <span className="step-number">1</span>
                    <span className="step-text">Choose your dictionary language</span>
                </h2>
                <p className="step-description">
                    Select the language you want to learn. Your dictionary will store word pairs
                    for this language, and you can switch between different languages later.
                </p>
            </div>

            <div className="language-selection-container">
                <LanguageSelector
                    onLanguageSelect={handleLanguageSelect}
                    selectedLanguage={selectedLanguage}
                />
            </div>

            {selectedLanguage && (
                <div className="selected-language-info">
                    <p className="confirmation-text">
                        Great! You've selected <strong>
                            {selectedLanguage.name}
                        </strong> as your dictionary language.
                    </p>
                    <p className="next-step-hint">
                        Click "Next" to continue setting up your word replacements.
                    </p>
                </div>
            )}
        </div>
    );
}