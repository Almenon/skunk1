import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigService } from '../../../lib/storage';
import TutorialLanguagePage from '../components/TutorialLanguagePage';

// Mock the ConfigService
vi.mock('../../../lib/storage', () => ({
    ConfigService: {
        getActiveLanguage: vi.fn(),
        setActiveLanguage: vi.fn(),
        getAvailableLanguages: vi.fn(() => [
            { code: 'en', name: 'English', nativeName: 'English' },
            { code: 'es', name: 'Spanish', nativeName: 'Español' },
            { code: 'zh', name: 'Chinese', nativeName: '中文' },
            { code: 'fr', name: 'French', nativeName: 'Français' }
        ])
    }
}));

describe('Tutorial Language Flow Integration Tests', () => {
    const user = userEvent.setup();
    const mockOnLanguageSelected = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        mockOnLanguageSelected.mockClear();
        // Default mock implementation
        vi.mocked(ConfigService.getActiveLanguage).mockResolvedValue('en');
        vi.mocked(ConfigService.setActiveLanguage).mockResolvedValue();
    });

    it('should render language selection page with no default selection', async () => {
        render(<TutorialLanguagePage onLanguageSelected={mockOnLanguageSelected} />);

        // Wait for loading to complete
        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        // Should show language selection step
        expect(screen.getByText('Choose your dictionary language')).toBeInTheDocument();
        expect(screen.getByText(/Select the language you want to learn/)).toBeInTheDocument();

        // Should show language selector with updated placeholder
        expect(screen.getByPlaceholderText('Search and select a language...')).toBeInTheDocument();

        // Should call onLanguageSelected with false initially
        expect(mockOnLanguageSelected).toHaveBeenCalledWith(false);

        // Should not show confirmation initially
        expect(screen.queryByText(/Great! You've selected/)).not.toBeInTheDocument();
    });

    it('should start with no language selected in tutorial mode', async () => {
        render(<TutorialLanguagePage onLanguageSelected={mockOnLanguageSelected} />);

        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        // Should not load any language by default in tutorial
        expect(ConfigService.getActiveLanguage).not.toHaveBeenCalled();

        // Should call onLanguageSelected with false
        expect(mockOnLanguageSelected).toHaveBeenCalledWith(false);

        // Should not show any confirmation initially
        expect(screen.queryByText(/Great! You've selected/)).not.toBeInTheDocument();
    });

    it('should handle language selection and notify parent', async () => {
        render(<TutorialLanguagePage onLanguageSelected={mockOnLanguageSelected} />);

        // Wait for component to load
        await waitFor(() => {
            expect(screen.getByPlaceholderText('Search and select a language...')).toBeInTheDocument();
        });

        const languageInput = screen.getByPlaceholderText('Search and select a language...');

        // Click on input to open dropdown
        await user.click(languageInput);

        // Type to search for Spanish
        await user.type(languageInput, 'Spanish');

        // Wait for dropdown to appear and click on Spanish option
        await waitFor(() => {
            const spanishOption = screen.getByText('Spanish');
            expect(spanishOption).toBeInTheDocument();
        });

        const spanishOption = screen.getByText('Spanish');
        await user.click(spanishOption);

        // Should call setActiveLanguage with 'es'
        await waitFor(() => {
            expect(ConfigService.setActiveLanguage).toHaveBeenCalledWith('es');
        });

        // Should call onLanguageSelected with true
        await waitFor(() => {
            expect(mockOnLanguageSelected).toHaveBeenCalledWith(true);
        });

        // Should show confirmation message
        await waitFor(() => {
            expect(screen.getByText('Spanish')).toBeInTheDocument();
            expect(screen.getByText(/Great! You've selected/)).toBeInTheDocument();
            expect(screen.getByText(/Click "Next" to continue/)).toBeInTheDocument();
        });
    });

    it('should handle language selection errors gracefully', async () => {
        // Mock setActiveLanguage to throw an error
        vi.mocked(ConfigService.setActiveLanguage).mockRejectedValue(new Error('Storage error'));

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        render(<TutorialLanguagePage onLanguageSelected={mockOnLanguageSelected} />);

        await waitFor(() => {
            expect(screen.getByPlaceholderText('Search and select a language...')).toBeInTheDocument();
        });

        const languageInput = screen.getByPlaceholderText('Search and select a language...');

        // Try to select a language
        await user.click(languageInput);
        await user.type(languageInput, 'English');

        await waitFor(() => {
            const englishOptions = screen.getAllByText('English');
            expect(englishOptions.length).toBeGreaterThan(0);
        });

        const englishOptions = screen.getAllByText('English');
        await user.click(englishOptions[0]);

        // Should log error but not crash
        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Failed to set active language:', expect.any(Error));
        });

        consoleSpy.mockRestore();
    });

    it('should handle loading state correctly', async () => {
        render(<TutorialLanguagePage onLanguageSelected={mockOnLanguageSelected} />);

        // Should show loading message initially (very briefly)
        // Since we removed the async loading, this test just verifies the component renders
        await waitFor(() => {
            expect(screen.getByText('Choose your dictionary language')).toBeInTheDocument();
        });

        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('should call onLanguageSelected callback appropriately', async () => {
        render(<TutorialLanguagePage onLanguageSelected={mockOnLanguageSelected} />);

        // Should call with false initially
        await waitFor(() => {
            expect(mockOnLanguageSelected).toHaveBeenCalledWith(false);
        });

        // Select a language
        const languageInput = screen.getByPlaceholderText('Search and select a language...');
        await user.click(languageInput);
        await user.type(languageInput, 'French');

        await waitFor(() => {
            const frenchOption = screen.getByText('French');
            expect(frenchOption).toBeInTheDocument();
        });

        await user.click(screen.getByText('French'));

        // Should call with true after selection
        await waitFor(() => {
            expect(mockOnLanguageSelected).toHaveBeenCalledWith(true);
        });
    });
});