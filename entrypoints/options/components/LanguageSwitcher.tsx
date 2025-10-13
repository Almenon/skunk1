import React, { useEffect, useState } from 'react';
import { ConfigService, type Language } from '../../../lib/storage/config-storage';

interface LanguageSwitcherProps {
    onLanguageChange?: (language: string) => void;
}

export function LanguageSwitcher({ onLanguageChange }: LanguageSwitcherProps) {
    const [currentLanguage, setCurrentLanguage] = useState<string>('en');
    const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadLanguageData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Load available languages
                const languages = ConfigService.getAvailableLanguages();
                setAvailableLanguages(languages);

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

    const handleLanguageChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newLanguage = event.target.value;

        try {
            setError(null);

            // Validate language selection
            const isValid = availableLanguages.some(lang => lang.code === newLanguage);
            if (!isValid) {
                throw new Error(`Invalid language selection: ${newLanguage}`);
            }

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

    const getCurrentLanguageInfo = (): Language | null => {
        return availableLanguages.find(lang => lang.code === currentLanguage) || null;
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

    const currentLangInfo = getCurrentLanguageInfo();

    return (
        <div className="language-switcher">
            <div className="current-language-info">
                <h3>Current Dictionary Language</h3>
                {currentLangInfo && (
                    <div className="language-display">
                        <span className="language-name">{currentLangInfo.name}</span>
                        <span className="language-native">({currentLangInfo.nativeName})</span>
                        <span className="language-code">[{currentLangInfo.code}]</span>
                    </div>
                )}
            </div>

            <div className="language-selection">
                <label htmlFor="language-select">
                    <strong>Switch Dictionary Language:</strong>
                </label>
                <select
                    id="language-select"
                    value={currentLanguage}
                    onChange={handleLanguageChange}
                    className="language-select"
                >
                    {availableLanguages.map(language => (
                        <option key={language.code} value={language.code}>
                            {language.name} ({language.nativeName})
                        </option>
                    ))}
                </select>
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