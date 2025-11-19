import { storage } from '#imports';
import ISO6391, { LanguageCode } from 'iso-639-1';

export interface Language {
    code: string;           // ISO language code (e.g., 'en', 'zh', 'es')
    name: string;           // Display name (e.g., 'English', 'Chinese', 'Spanish')
    nativeName: string;     // Native language name
}

export interface AppConfig {
    selectedLanguage?: Language;
}

const DEFAULT_CONFIG: AppConfig = {};

export const configStorage = storage.defineItem<AppConfig>('local:config', {
    defaultValue: DEFAULT_CONFIG,
});

export class ConfigService {

    static async getConfig(): Promise<AppConfig> {
        try {
            return await configStorage.getValue();
        } catch (error) {
            console.error('Failed to get config from storage:', error);
            return DEFAULT_CONFIG;
        }
    }

    static async setConfig(config: AppConfig): Promise<void> {
        try {
            await configStorage.setValue(config);
        } catch (error) {
            console.error('Failed to set config in storage:', error);
            throw error;
        }
    }

    static async getActiveLanguage() {
        const config = await this.getConfig();
        return config.selectedLanguage;
    }

    static async setActiveLanguage(language: Language): Promise<void> {
        const config = await this.getConfig();
        await this.setConfig({
            ...config,
            selectedLanguage: language
        });
    }

    static getAvailableLanguages(): Language[] {
        const iso6391 = ISO6391.getAllCodes().map(code => ({
            code,
            name: ISO6391.getName(code),
            nativeName: ISO6391.getNativeName(code)
        }));

        // kinda surprised Hawaiian isn't in this iso6391 list
        // I don't want a long list of languages here, so any language
        // less popular than Hawaiian should not be included
        // (users can use custom1-10 instead)
        iso6391.push({
            code: 'Hawaiian' as LanguageCode,
            name: 'Hawaiian',
            nativeName: 'ōlelo Hawaiʻi'
        })

        // Number is very arbitrary. Can be increased if there's anyone crazy enough
        // to try learning more than 15 exotic languages
        for (let index = 0; index < 15; index++) {
            const custom = 'Custom' + (index + 1).toString();
            iso6391.push({
                code: custom as LanguageCode,
                name: custom,
                nativeName: custom,
            })
        }

        return iso6391
    }

    static getDictionaryStorageKey(language: Language): string {
        return `local:${language.code}-dictionary`;
    }

    static watchConfig(callback: (newValue: AppConfig, oldValue: AppConfig) => void) {
        return configStorage.watch(callback);
    }
}