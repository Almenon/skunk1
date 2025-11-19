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
        vi.mocked(ConfigService.getActiveLanguage).mockResolvedValue(mockLanguages[0]);
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

    it('should populate language select with available languages', async () => {
        render(<LanguageSwitcher />);

        await waitFor(() => {
            expect(screen.getByRole('combobox')).toBeInTheDocument();
        });

        // Click to open the dropdown
        const combobox = screen.getByRole('combobox');
        fireEvent.focus(combobox);

        await waitFor(() => {
            const options = screen.getAllByRole('option');
            expect(options).toHaveLength(4);
        });

        // Check that all languages appear in the dropdown options
        const dropdown = screen.getByRole('listbox');
        expect(dropdown).toBeInTheDocument();

        const options = screen.getAllByRole('option');
        expect(options).toHaveLength(4);

        // Check specific language options by their role and content
        expect(screen.getByRole('option', { name: /English/ })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /Spanish.*Español/ })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /Chinese.*中文/ })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /French.*Français/ })).toBeInTheDocument();
    });

    it('should handle language change successfully', async () => {
        const mockOnLanguageChange = vi.fn();
        render(<LanguageSwitcher onLanguageChange={mockOnLanguageChange} />);

        await waitFor(() => {
            expect(screen.getByRole('combobox')).toBeInTheDocument();
        });

        const combobox = screen.getByRole('combobox');

        // Focus to open dropdown
        fireEvent.focus(combobox);

        await waitFor(() => {
            expect(screen.getByText('Spanish')).toBeInTheDocument();
        });

        // Click on Spanish option
        const spanishOption = screen.getByText('Spanish');
        fireEvent.click(spanishOption);

        await waitFor(() => {
            expect(ConfigService.setActiveLanguage).toHaveBeenCalledWith(mockLanguages[1]);
        });

        expect(mockOnLanguageChange).toHaveBeenCalledWith(mockLanguages[1]);
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

        const combobox = screen.getByRole('combobox');
        fireEvent.focus(combobox);

        await waitFor(() => {
            expect(screen.getByText('Spanish')).toBeInTheDocument();
        });

        const spanishOption = screen.getByText('Spanish');
        fireEvent.click(spanishOption);

        await waitFor(() => {
            expect(screen.getByText('Failed to change language. Please try again.')).toBeInTheDocument();
        });
    });

    it('should validate language selection', async () => {
        render(<LanguageSwitcher />);

        await waitFor(() => {
            expect(screen.getByRole('combobox')).toBeInTheDocument();
        });

        const combobox = screen.getByRole('combobox');

        // We'll test this by mocking a scenario where the language validation fails
        // Focus and try to trigger an invalid selection through the component's internal logic
        fireEvent.focus(combobox);

        // Type an invalid language code that doesn't exist
        fireEvent.change(combobox, { target: { value: 'invalid-search' } });

        // Since there's no matching language, no selection should occur
        // The test passes if no error is thrown and setActiveLanguage is not called
        expect(ConfigService.setActiveLanguage).not.toHaveBeenCalled();
    });

    it('should display informational text about language switching', async () => {
        render(<LanguageSwitcher />);

        await waitFor(() => {
            expect(screen.getByText(/Each language maintains its own separate dictionary/)).toBeInTheDocument();
        });

        expect(screen.getByText(/Switching languages will change which dictionary is active/)).toBeInTheDocument();
    });
});