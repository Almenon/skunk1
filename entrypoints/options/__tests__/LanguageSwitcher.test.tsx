import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigService } from '../../../lib/storage/config-storage';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

// Mock the ConfigService
vi.mock('../../../lib/storage/config-storage', () => ({
    ConfigService: {
        getActiveLanguage: vi.fn(),
        setActiveLanguage: vi.fn(),
        getAvailableLanguages: vi.fn(),
    },
}));

const mockLanguages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
];

describe('LanguageSwitcher', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Setup default mocks
        vi.mocked(ConfigService.getAvailableLanguages).mockReturnValue(mockLanguages);
        vi.mocked(ConfigService.getActiveLanguage).mockResolvedValue('en');
        vi.mocked(ConfigService.setActiveLanguage).mockResolvedValue();
    });

    it('should render loading state initially', () => {
        // Make getActiveLanguage hang to test loading state
        vi.mocked(ConfigService.getActiveLanguage).mockImplementation(
            () => new Promise(() => { }) // Never resolves
        );

        render(<LanguageSwitcher />);

        expect(screen.getByText('Loading language settings...')).toBeInTheDocument();
    });

    it('should display current language information after loading', async () => {
        render(<LanguageSwitcher />);

        await waitFor(() => {
            expect(screen.getByText('Current Dictionary Language')).toBeInTheDocument();
        });

        expect(screen.getByText('English')).toBeInTheDocument();
        expect(screen.getByText('(English)')).toBeInTheDocument();
        expect(screen.getByText('[en]')).toBeInTheDocument();
    });

    it('should populate language select with available languages', async () => {
        render(<LanguageSwitcher />);

        await waitFor(() => {
            expect(screen.getByRole('combobox')).toBeInTheDocument();
        });

        const select = screen.getByRole('combobox');
        const options = screen.getAllByRole('option');

        expect(options).toHaveLength(4);
        expect(screen.getByRole('option', { name: 'English (English)' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Spanish (Español)' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Chinese (中文)' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'French (Français)' })).toBeInTheDocument();
    });

    it('should handle language change successfully', async () => {
        const mockOnLanguageChange = vi.fn();
        render(<LanguageSwitcher onLanguageChange={mockOnLanguageChange} />);

        await waitFor(() => {
            expect(screen.getByRole('combobox')).toBeInTheDocument();
        });

        const select = screen.getByRole('combobox');

        // Change to Spanish
        fireEvent.change(select, { target: { value: 'es' } });

        await waitFor(() => {
            expect(ConfigService.setActiveLanguage).toHaveBeenCalledWith('es');
        });

        expect(mockOnLanguageChange).toHaveBeenCalledWith('es');
    });

    it('should display error when language loading fails', async () => {
        vi.mocked(ConfigService.getActiveLanguage).mockRejectedValue(
            new Error('Storage unavailable')
        );

        render(<LanguageSwitcher />);

        await waitFor(() => {
            expect(screen.getByText('Failed to load language settings')).toBeInTheDocument();
        });

        expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    it('should display error when language change fails', async () => {
        vi.mocked(ConfigService.setActiveLanguage).mockRejectedValue(
            new Error('Failed to save')
        );

        render(<LanguageSwitcher />);

        await waitFor(() => {
            expect(screen.getByRole('combobox')).toBeInTheDocument();
        });

        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'es' } });

        await waitFor(() => {
            expect(screen.getByText('Failed to change language. Please try again.')).toBeInTheDocument();
        });
    });

    it('should validate language selection', async () => {
        render(<LanguageSwitcher />);

        await waitFor(() => {
            expect(screen.getByRole('combobox')).toBeInTheDocument();
        });

        const select = screen.getByRole('combobox');

        // Try to select an invalid language (this shouldn't happen in normal usage)
        fireEvent.change(select, { target: { value: 'invalid' } });

        await waitFor(() => {
            expect(screen.getByText('Failed to change language. Please try again.')).toBeInTheDocument();
        });

        // Should not call setActiveLanguage for invalid language
        expect(ConfigService.setActiveLanguage).not.toHaveBeenCalled();
    });

    it('should display informational text about language switching', async () => {
        render(<LanguageSwitcher />);

        await waitFor(() => {
            expect(screen.getByText(/Each language maintains its own separate dictionary/)).toBeInTheDocument();
        });

        expect(screen.getByText(/Switching languages will change which dictionary is active/)).toBeInTheDocument();
    });

    it('should update display when current language changes', async () => {
        vi.mocked(ConfigService.getActiveLanguage).mockResolvedValue('zh');

        render(<LanguageSwitcher />);

        await waitFor(() => {
            expect(screen.getByText('Chinese')).toBeInTheDocument();
        });

        expect(screen.getByText('(中文)')).toBeInTheDocument();
        expect(screen.getByText('[zh]')).toBeInTheDocument();
    });
});