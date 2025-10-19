import { useEffect, useRef, useState } from 'react';
import { ConfigService, type Language } from '../../../lib/storage';
import './LanguageSelector.css';

interface LanguageSelectorProps {
    onLanguageSelect: (languageCode: string) => void;
    selectedLanguage?: string;
    placeholder?: string;
    disabled?: boolean;
}

export default function LanguageSelector({
    onLanguageSelect,
    selectedLanguage,
    placeholder = "Search for a language...",
    disabled = false
}: LanguageSelectorProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [filteredLanguages, setFilteredLanguages] = useState<Language[]>([]);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const availableLanguages = ConfigService.getAvailableLanguages();

    // Filter languages based on search term
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredLanguages(availableLanguages);
        } else {
            const filtered = availableLanguages.filter(language =>
                language.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                language.nativeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                language.code.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredLanguages(filtered);
        }
        setHighlightedIndex(-1);
    }, [searchTerm]);

    // Get display value for selected language
    const getDisplayValue = () => {
        if (selectedLanguage && selectedLanguage.trim()) {
            const language = availableLanguages.find(lang => lang.code === selectedLanguage);
            return language ? `${language.name} (${language.nativeName})` : selectedLanguage;
        }
        return '';
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setIsOpen(true);
    };

    const handleInputFocus = () => {
        setIsOpen(true);
        setSearchTerm('');
    };

    const handleInputBlur = () => {
        // Delay closing to allow for option selection
        setTimeout(() => {
            setIsOpen(false);
            setSearchTerm('');
        }, 150);
    };

    const handleLanguageSelect = (languageCode: string) => {
        onLanguageSelect(languageCode);
        setIsOpen(false);
        setSearchTerm('');
        inputRef.current?.blur();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === 'Enter' || e.key === 'ArrowDown') {
                setIsOpen(true);
                e.preventDefault();
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev < filteredLanguages.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev > 0 ? prev - 1 : filteredLanguages.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < filteredLanguages.length) {
                    handleLanguageSelect(filteredLanguages[highlightedIndex].code);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setSearchTerm('');
                inputRef.current?.blur();
                break;
        }
    };

    // Scroll highlighted option into view
    useEffect(() => {
        if (highlightedIndex >= 0 && dropdownRef.current) {
            const highlightedElement = dropdownRef.current.children[highlightedIndex] as HTMLElement;
            if (highlightedElement) {
                highlightedElement.scrollIntoView({
                    block: 'nearest',
                    behavior: 'smooth'
                });
            }
        }
    }, [highlightedIndex]);

    return (
        <div className="language-selector">
            <div className="language-selector-input-container">
                <input
                    ref={inputRef}
                    type="text"
                    role="combobox"
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                    aria-autocomplete="list"
                    value={isOpen ? searchTerm : getDisplayValue()}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`language-selector-input ${isOpen ? 'open' : ''}`}
                    autoComplete="off"
                />
                <div className={`language-selector-arrow ${isOpen ? 'open' : ''}`}>
                    ▼
                </div>
            </div>

            {isOpen && (
                <div
                    ref={dropdownRef}
                    className="language-selector-dropdown"
                    role="listbox"
                    aria-label="Language options"
                >
                    {filteredLanguages.length > 0 ? (
                        filteredLanguages.map((language, index) => (
                            <div
                                key={language.code}
                                role="option"
                                aria-selected={language.code === selectedLanguage}
                                className={`language-option ${index === highlightedIndex ? 'highlighted' : ''} ${language.code === selectedLanguage ? 'selected' : ''
                                    }`}
                                onClick={() => handleLanguageSelect(language.code)}
                            >
                                <div className="language-option-main">
                                    <span className="language-name">{language.name}</span>
                                </div>
                                <div className="language-native-name">{language.nativeName}</div>
                            </div>
                        ))
                    ) : (
                        <div className="no-results">
                            No languages found matching "{searchTerm}"
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}