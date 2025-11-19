
import { useState } from 'react';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { Language } from '@/lib/storage';

export function ManageDictionariesPage() {
    const [currentLanguage, setCurrentLanguage] = useState<Language>();

    const handleLanguageChange = (newLanguage: Language) => {
        setCurrentLanguage(newLanguage);
        console.log(`Dictionary language switched from ${currentLanguage?.code} to: ${newLanguage.code}`);
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