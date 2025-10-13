import { useEffect, useState } from 'react';
import { ConfigService, type Language } from '../../../lib/storage';
import './ActiveLanguageIndicator.css';

interface ActiveLanguageIndicatorProps {
    className?: string;
    showCode?: boolean;
    showNativeName?: boolean;
    size?: 'small' | 'medium' | 'large';
}

export default function ActiveLanguageIndicator({
    className = '',
    showCode = true,
    showNativeName = true,
    size = 'medium'
}: ActiveLanguageIndicatorProps) {
    const [currentLanguage, setCurrentLanguage] = useState<Language | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadCurrentLanguage = async () => {
            try {
                const activeLanguageCode = await ConfigService.getActiveLanguage();
                const availableLanguages = ConfigService.getAvailableLanguages();
                const language = availableLanguages.find(lang => lang.code === activeLanguageCode);

                setCurrentLanguage(language || null);
            } catch (error) {
                console.error('Failed to load active language:', error);
                setCurrentLanguage(null);
            } finally {
                setIsLoading(false);
            }
        };

        loadCurrentLanguage();

        // Watch for configuration changes
        const unwatch = ConfigService.watchConfig((newConfig) => {
            const availableLanguages = ConfigService.getAvailableLanguages();
            const language = availableLanguages.find(lang => lang.code === newConfig.selectedLanguage);
            setCurrentLanguage(language || null);
        });

        return unwatch;
    }, []);

    if (isLoading) {
        return (
            <div className={`active-language-indicator loading ${size} ${className}`}>
                <div className="loading-spinner"></div>
                <span className="loading-text">Loading...</span>
            </div>
        );
    }

    if (!currentLanguage) {
        return (
            <div className={`active-language-indicator error ${size} ${className}`}>
                <div className="error-icon">⚠️</div>
                <span className="error-text">Language not found</span>
            </div>
        );
    }

    return (
        <div className={`active-language-indicator ${size} ${className}`}>
            <div className="language-flag">
                🌐
            </div>
            <div className="language-info">
                <div className="language-primary">
                    <span className="language-name">{currentLanguage.name}</span>
                    {showCode && (
                        <span className="language-code">({currentLanguage.code})</span>
                    )}
                </div>
                {showNativeName && currentLanguage.nativeName !== currentLanguage.name && (
                    <div className="language-native">{currentLanguage.nativeName}</div>
                )}
            </div>
        </div>
    );
}