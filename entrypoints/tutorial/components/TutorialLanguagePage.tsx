import { useEffect, useState } from 'react';
import { ConfigService } from '../../../lib/storage';
import LanguageSelector from '../../options/components/LanguageSelector';
import './TutorialLanguagePage.css';

interface TutorialLanguagePageProps {
    onLanguageSelected: (selected: boolean) => void;
}

export default function TutorialLanguagePage({ onLanguageSelected }: TutorialLanguagePageProps) {
    const [selectedLanguage, setSelectedLanguage] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    // Start with no language selected for tutorial
    useEffect(() => {
        setIsLoading(false);
        onLanguageSelected(false);
    }, [onLanguageSelected]);

    const handleLanguageSelect = async (languageCode: string) => {
        try {
            await ConfigService.setActiveLanguage(languageCode);
            setSelectedLanguage(languageCode);
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
                    placeholder="Search and select a language..."
                />
            </div>

            {selectedLanguage && (
                <div className="selected-language-info">
                    <p className="confirmation-text">
                        Great! You've selected <strong>
                            {ConfigService.getAvailableLanguages().find(lang => lang.code === selectedLanguage)?.name}
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