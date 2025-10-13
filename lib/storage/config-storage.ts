import { storage } from '#imports';
import ISO6391 from 'iso-639-1';

/**
 * Language interface for language metadata
 */
export interface Language {
    code: string;           // ISO language code (e.g., 'en', 'zh', 'es')
    name: string;           // Display name (e.g., 'English', 'Chinese', 'Spanish')
    nativeName: string;     // Native language name
}

/**
 * Application configuration interface
 */
export interface AppConfig {
    selectedLanguage: string;  // Language code (e.g., 'en', 'es', 'zh')
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: AppConfig = {
    selectedLanguage: 'en'
};

/**
 * Define storage item for application configuration
 */
export const configStorage = storage.defineItem<AppConfig>('local:config', {
    defaultValue: DEFAULT_CONFIG,
});

/**
 * Configuration service for managing application settings
 */
export class ConfigService {

    /**
     * Get the current application configuration
     */
    static async getConfig(): Promise<AppConfig> {
        try {
            return await configStorage.getValue();
        } catch (error) {
            console.error('Failed to get config from storage:', error);
            return DEFAULT_CONFIG;
        }
    }

    /**
     * Set the application configuration
     */
    static async setConfig(config: AppConfig): Promise<void> {
        try {
            await configStorage.setValue(config);
        } catch (error) {
            console.error('Failed to set config in storage:', error);
            throw error;
        }
    }

    /**
     * Get the currently active language
     */
    static async getActiveLanguage(): Promise<string> {
        const config = await this.getConfig();
        return config.selectedLanguage;
    }

    /**
     * Set the active language
     */
    static async setActiveLanguage(languageCode: string): Promise<void> {
        const config = await this.getConfig();
        await this.setConfig({
            ...config,
            selectedLanguage: languageCode
        });
    }

    /**
     * Get all available languages from ISO-639-1
     */
    static getAvailableLanguages(): Language[] {
        return ISO6391.getAllCodes().map(code => ({
            code,
            name: ISO6391.getName(code),
            nativeName: ISO6391.getNativeName(code)
        }));
    }

    /**
     * Generate storage key for language-specific dictionary
     */
    static getDictionaryStorageKey(languageCode: string): string {
        return `local:${languageCode.trim()}-dictionary`;
    }



    /**
     * Watch for changes to configuration
     */
    static watchConfig(callback: (newValue: AppConfig, oldValue: AppConfig) => void) {
        return configStorage.watch(callback);
    }
}