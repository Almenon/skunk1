import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigService } from '../../../../lib/storage';
import ActiveLanguageIndicator from '../ActiveLanguageIndicator';

// Mock ConfigService
vi.mock('../../../../lib/storage', () => ({
    ConfigService: {
        getActiveLanguage: vi.fn(),
        getAvailableLanguages: vi.fn(),
        watchConfig: vi.fn()
    }
}));

const mockLanguages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' }
];

describe('ActiveLanguageIndicator', () => {
    const mockUnwatch = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(ConfigService.getAvailableLanguages).mockReturnValue(mockLanguages);
        vi.mocked(ConfigService.watchConfig).mockReturnValue(mockUnwatch);
    });

    it('displays loading state initially', () => {
        vi.mocked(ConfigService.getActiveLanguage).mockImplementation(() => new Promise(() => { }));

        render(<ActiveLanguageIndicator />);

        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(screen.getByText('Loading...').closest('.active-language-indicator')).toHaveClass('loading');
    });

    it('displays language information when loaded', async () => {
        vi.mocked(ConfigService.getActiveLanguage).mockResolvedValue('es');

        render(<ActiveLanguageIndicator />);

        await waitFor(() => {
            expect(screen.getByText('Spanish')).toBeInTheDocument();
            expect(screen.getByText('(es)')).toBeInTheDocument();
            expect(screen.getByText('Español')).toBeInTheDocument();
        });
    });

    it('displays language without code when showCode is false', async () => {
        vi.mocked(ConfigService.getActiveLanguage).mockResolvedValue('es');

        render(<ActiveLanguageIndicator showCode={false} />);

        await waitFor(() => {
            expect(screen.getByText('Spanish')).toBeInTheDocument();
            expect(screen.queryByText('(es)')).not.toBeInTheDocument();
            expect(screen.getByText('Español')).toBeInTheDocument();
        });
    });

    it('hides native name when showNativeName is false', async () => {
        vi.mocked(ConfigService.getActiveLanguage).mockResolvedValue('es');

        render(<ActiveLanguageIndicator showNativeName={false} />);

        await waitFor(() => {
            expect(screen.getByText('Spanish')).toBeInTheDocument();
            expect(screen.getByText('(es)')).toBeInTheDocument();
            expect(screen.queryByText('Español')).not.toBeInTheDocument();
        });
    });

    it('does not show native name when it matches the language name', async () => {
        vi.mocked(ConfigService.getActiveLanguage).mockResolvedValue('en');

        render(<ActiveLanguageIndicator />);

        await waitFor(() => {
            expect(screen.getByText('English')).toBeInTheDocument();
            expect(screen.getByText('(en)')).toBeInTheDocument();
            // Native name should not appear since it's the same as the language name
            expect(screen.queryByText('English')).toHaveTextContent('English'); // Only one instance
        });
    });

    it('applies size classes correctly', async () => {
        vi.mocked(ConfigService.getActiveLanguage).mockResolvedValue('en');

        const { rerender } = render(<ActiveLanguageIndicator size="small" />);

        await waitFor(() => {
            expect(screen.getByText('English').closest('.active-language-indicator')).toHaveClass('small');
        });

        rerender(<ActiveLanguageIndicator size="large" />);

        await waitFor(() => {
            expect(screen.getByText('English').closest('.active-language-indicator')).toHaveClass('large');
        });
    });

    it('applies custom className', async () => {
        vi.mocked(ConfigService.getActiveLanguage).mockResolvedValue('en');

        render(<ActiveLanguageIndicator className="custom-class" />);

        await waitFor(() => {
            expect(screen.getByText('English').closest('.active-language-indicator')).toHaveClass('custom-class');
        });
    });

    it('displays error state when language is not found', async () => {
        vi.mocked(ConfigService.getActiveLanguage).mockResolvedValue('invalid');

        render(<ActiveLanguageIndicator />);

        await waitFor(() => {
            expect(screen.getByText('Language not found')).toBeInTheDocument();
            expect(screen.getByText('⚠️')).toBeInTheDocument();
        });
    });

    it('displays error state when ConfigService throws error', async () => {
        vi.mocked(ConfigService.getActiveLanguage).mockRejectedValue(new Error('Storage error'));

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        render(<ActiveLanguageIndicator />);

        await waitFor(() => {
            expect(screen.getByText('Language not found')).toBeInTheDocument();
            expect(consoleSpy).toHaveBeenCalledWith('Failed to load active language:', expect.any(Error));
        });

        consoleSpy.mockRestore();
    });

    it('watches for configuration changes', async () => {
        vi.mocked(ConfigService.getActiveLanguage).mockResolvedValue('en');

        render(<ActiveLanguageIndicator />);

        await waitFor(() => {
            expect(ConfigService.watchConfig).toHaveBeenCalled();
        });
    });

    it('updates language when configuration changes', async () => {
        vi.mocked(ConfigService.getActiveLanguage).mockResolvedValue('en');

        render(<ActiveLanguageIndicator />);

        // Wait for initial load
        await waitFor(() => {
            expect(screen.getByText('English')).toBeInTheDocument();
        });

        // Simulate config change
        const watchCallback = vi.mocked(ConfigService.watchConfig).mock.calls[0][0];
        watchCallback({ selectedLanguage: 'es' }, { selectedLanguage: 'en' });

        await waitFor(() => {
            expect(screen.getByText('Spanish')).toBeInTheDocument();
            expect(screen.getByText('Español')).toBeInTheDocument();
        });
    });

    it('cleans up watcher on unmount', async () => {
        vi.mocked(ConfigService.getActiveLanguage).mockResolvedValue('en');

        const { unmount } = render(<ActiveLanguageIndicator />);

        await waitFor(() => {
            expect(ConfigService.watchConfig).toHaveBeenCalled();
        });

        unmount();

        expect(mockUnwatch).toHaveBeenCalled();
    });

    it('handles language change to invalid language in watcher', async () => {
        vi.mocked(ConfigService.getActiveLanguage).mockResolvedValue('en');

        render(<ActiveLanguageIndicator />);

        // Wait for initial load
        await waitFor(() => {
            expect(screen.getByText('English')).toBeInTheDocument();
        });

        // Simulate config change to invalid language
        const watchCallback = vi.mocked(ConfigService.watchConfig).mock.calls[0][0];
        watchCallback({ selectedLanguage: 'invalid' }, { selectedLanguage: 'en' });

        await waitFor(() => {
            expect(screen.getByText('Language not found')).toBeInTheDocument();
        });
    });

    it('displays globe icon', async () => {
        vi.mocked(ConfigService.getActiveLanguage).mockResolvedValue('en');

        render(<ActiveLanguageIndicator />);

        await waitFor(() => {
            expect(screen.getByText('🌐')).toBeInTheDocument();
        });
    });

    it('has proper accessibility attributes for loading state', () => {
        vi.mocked(ConfigService.getActiveLanguage).mockImplementation(() => new Promise(() => { }));

        render(<ActiveLanguageIndicator />);

        const loadingElement = screen.getByText('Loading...').closest('.active-language-indicator');
        expect(loadingElement).toHaveClass('loading');
    });

    it('has proper accessibility attributes for error state', async () => {
        vi.mocked(ConfigService.getActiveLanguage).mockResolvedValue('invalid');

        render(<ActiveLanguageIndicator />);

        await waitFor(() => {
            const errorElement = screen.getByText('Language not found').closest('.active-language-indicator');
            expect(errorElement).toHaveClass('error');
        });
    });
});