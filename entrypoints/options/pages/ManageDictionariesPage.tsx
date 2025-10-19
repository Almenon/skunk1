
import { useState } from 'react';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

export function ManageDictionariesPage() {
    const [currentLanguage, setCurrentLanguage] = useState<string>('en');

    const handleLanguageChange = (newLanguage: string) => {
        setCurrentLanguage(newLanguage);
        console.log(`Dictionary language switched from ${currentLanguage} to: ${newLanguage}`);
    };

    return (
        <div className="page-content">
            <header className="page-header">
                <h1>Manage Dictionaries</h1>
                <p>Import, export, and manage multiple dictionaries</p>
            </header>
            <main className="page-main">
                <LanguageSwitcher onLanguageChange={handleLanguageChange} />
            </main>
        </div>
    );
}