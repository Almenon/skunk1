import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigService } from '../../../lib/storage/config-storage';
import { ManageDictionariesPage } from '../pages/ManageDictionariesPage';

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
];

describe('ManageDictionariesPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Setup default mocks
        vi.mocked(ConfigService.getAvailableLanguages).mockReturnValue(mockLanguages);
        vi.mocked(ConfigService.getActiveLanguage).mockResolvedValue('en');
        vi.mocked(ConfigService.setActiveLanguage).mockResolvedValue();
    });

    it('should render page header and description', () => {
        render(<ManageDictionariesPage />);

        expect(screen.getByText('Manage Dictionaries')).toBeInTheDocument();
        expect(screen.getByText('Import, export, and manage multiple dictionaries')).toBeInTheDocument();
    });

    it('should render LanguageSwitcher component', async () => {
        render(<ManageDictionariesPage />);

        await waitFor(() => {
            expect(screen.getByText('Current Dictionary Language')).toBeInTheDocument();
        });

        expect(screen.getByText('Switch Dictionary Language:')).toBeInTheDocument();
    });

    it('should handle language change callback', async () => {
        // Spy on console.log to verify the callback is called
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

        render(<ManageDictionariesPage />);

        await waitFor(() => {
            expect(screen.getByRole('combobox')).toBeInTheDocument();
        });

        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'zh' } });

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Dictionary language switched to: zh');
        });

        consoleSpy.mockRestore();
    });

    it('should render properly when LanguageSwitcher is in loading state', () => {
        // Make getActiveLanguage hang to test loading state
        vi.mocked(ConfigService.getActiveLanguage).mockImplementation(
            () => new Promise(() => { }) // Never resolves
        );

        render(<ManageDictionariesPage />);

        expect(screen.getByText('Manage Dictionaries')).toBeInTheDocument();
        expect(screen.getByText('Loading language settings...')).toBeInTheDocument();
    });

    it('should render properly when LanguageSwitcher has an error', async () => {
        vi.mocked(ConfigService.getActiveLanguage).mockRejectedValue(
            new Error('Storage unavailable')
        );

        render(<ManageDictionariesPage />);

        await waitFor(() => {
            expect(screen.getByText('Failed to load language settings')).toBeInTheDocument();
        });

        expect(screen.getByText('Manage Dictionaries')).toBeInTheDocument();
    });
});