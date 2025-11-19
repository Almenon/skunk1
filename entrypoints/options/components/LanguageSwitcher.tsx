import { useEffect, useState } from 'react';
import { ConfigService, Language } from '../../../lib/storage/config-storage';
import LanguageSelector from './LanguageSelector';

interface LanguageSwitcherProps {
    onLanguageChange?: (language: Language) => void;
}

export function LanguageSwitcher({ onLanguageChange }: LanguageSwitcherProps) {
    const [currentLanguage, setCurrentLanguage] = useState<Language>();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadLanguageData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Load current language
                const activeLanguage = await ConfigService.getActiveLanguage();
                setCurrentLanguage(activeLanguage);
            } catch (err) {
                console.error('Failed to load language data:', err);
                setError('Failed to load language settings');
            } finally {
                setIsLoading(false);
            }
        };

        loadLanguageData();
    }, []);

    const handleLanguageChange = async (newLanguage: Language) => {
        try {
            setError(null);

            // Update configuration
            await ConfigService.setActiveLanguage(newLanguage);
            setCurrentLanguage(newLanguage);

            // Notify parent component
            onLanguageChange?.(newLanguage);
        } catch (err) {
            console.error('Failed to change language:', err);
            setError('Failed to change language. Please try again.');
        }
    };

    if (isLoading) {
        return (
            <div className="language-switcher loading">
                <p>Loading language settings...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="language-switcher error">
                <p className="error-message">{error}</p>
                <button onClick={() => window.location.reload()}>
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="language-switcher">
            <div className="language-selection">
                <label>
                    <strong>Switch Dictionary Language:</strong>
                </label>
                <LanguageSelector
                    onLanguageSelect={handleLanguageChange}
                    selectedLanguage={currentLanguage}
                />
            </div>

            <div className="language-info">
                <p className="info-text">
                    Each language maintains its own separate dictionary.
                    Switching languages will change which dictionary is active for word replacements.
                </p>
            </div>
        </div>
    );
}