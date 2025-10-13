import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigService } from '../../../../lib/storage';
import LanguageSelector from '../LanguageSelector';

// Mock ConfigService
vi.mock('../../../../lib/storage', () => ({
    ConfigService: {
        getAvailableLanguages: vi.fn()
    }
}));

const mockLanguages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' }
];

describe('LanguageSelector', () => {
    const mockOnLanguageSelect = vi.fn();

    beforeEach(() => {
        mockOnLanguageSelect.mockClear();
        vi.mocked(ConfigService.getAvailableLanguages).mockReturnValue(mockLanguages);

        // Mock scrollIntoView for test environment
        Element.prototype.scrollIntoView = vi.fn();
    });

    it('renders input with placeholder text', () => {
        render(<LanguageSelector onLanguageSelect={mockOnLanguageSelect} />);

        expect(screen.getByPlaceholderText('Search for a language...')).toBeInTheDocument();
    });

    it('renders input with custom placeholder', () => {
        render(
            <LanguageSelector
                onLanguageSelect={mockOnLanguageSelect}
                placeholder="Choose your language"
            />
        );

        expect(screen.getByPlaceholderText('Choose your language')).toBeInTheDocument();
    });

    it('displays selected language in input when provided', () => {
        render(
            <LanguageSelector
                onLanguageSelect={mockOnLanguageSelect}
                selectedLanguage="es"
            />
        );

        const input = screen.getByDisplayValue('Spanish (Español)');
        expect(input).toBeInTheDocument();
    });

    it('shows dropdown when input is focused', async () => {
        render(<LanguageSelector onLanguageSelect={mockOnLanguageSelect} />);

        const input = screen.getByRole('textbox');
        fireEvent.focus(input);

        await waitFor(() => {
            expect(screen.getByText('Spanish')).toBeInTheDocument();
            expect(screen.getByText('French')).toBeInTheDocument();
            expect(screen.getByText('Español')).toBeInTheDocument();
        });
    });

    it('filters languages based on search term', async () => {
        const user = userEvent.setup();
        render(<LanguageSelector onLanguageSelect={mockOnLanguageSelect} />);

        const input = screen.getByRole('textbox');
        await user.click(input);
        await user.type(input, 'span');

        await waitFor(() => {
            expect(screen.getByText('Spanish')).toBeInTheDocument();
            expect(screen.queryByText('English')).not.toBeInTheDocument();
            expect(screen.queryByText('French')).not.toBeInTheDocument();
        });
    });

    it('filters languages by native name', async () => {
        const user = userEvent.setup();
        render(<LanguageSelector onLanguageSelect={mockOnLanguageSelect} />);

        const input = screen.getByRole('textbox');
        await user.click(input);
        await user.type(input, 'Español');

        await waitFor(() => {
            expect(screen.getByText('Spanish')).toBeInTheDocument();
            expect(screen.queryByText('English')).not.toBeInTheDocument();
        });
    });

    it('filters languages by language code', async () => {
        const user = userEvent.setup();
        render(<LanguageSelector onLanguageSelect={mockOnLanguageSelect} />);

        const input = screen.getByRole('textbox');
        await user.click(input);
        await user.type(input, 'zh');

        await waitFor(() => {
            expect(screen.getByText('Chinese')).toBeInTheDocument();
            expect(screen.queryByText('English')).not.toBeInTheDocument();
        });
    });

    it('shows no results message when no languages match search', async () => {
        const user = userEvent.setup();
        render(<LanguageSelector onLanguageSelect={mockOnLanguageSelect} />);

        const input = screen.getByRole('textbox');
        await user.click(input);
        await user.type(input, 'xyz');

        await waitFor(() => {
            expect(screen.getByText('No languages found matching "xyz"')).toBeInTheDocument();
        });
    });

    it('calls onLanguageSelect when language option is clicked', async () => {
        render(<LanguageSelector onLanguageSelect={mockOnLanguageSelect} />);

        const input = screen.getByRole('textbox');
        fireEvent.focus(input);

        await waitFor(() => {
            const spanishOption = screen.getByText('Spanish');
            fireEvent.click(spanishOption);
        });

        expect(mockOnLanguageSelect).toHaveBeenCalledWith('es');
    });

    it('supports keyboard navigation with arrow keys', async () => {
        render(<LanguageSelector onLanguageSelect={mockOnLanguageSelect} />);

        const input = screen.getByRole('textbox');
        fireEvent.focus(input);

        // Wait for dropdown to appear
        await waitFor(() => {
            expect(screen.getByText('Spanish')).toBeInTheDocument();
        });

        // Navigate down
        fireEvent.keyDown(input, { key: 'ArrowDown' });

        // First option should be highlighted - use a more specific selector
        const firstOption = document.querySelector('.language-option.highlighted');
        expect(firstOption).toBeInTheDocument();
    });

    it('selects highlighted option with Enter key', async () => {
        render(<LanguageSelector onLanguageSelect={mockOnLanguageSelect} />);

        const input = screen.getByRole('textbox');
        fireEvent.focus(input);

        await waitFor(() => {
            expect(screen.getByText('Spanish')).toBeInTheDocument();
        });

        // Navigate down to highlight first option
        fireEvent.keyDown(input, { key: 'ArrowDown' });

        // Press Enter to select
        fireEvent.keyDown(input, { key: 'Enter' });

        expect(mockOnLanguageSelect).toHaveBeenCalledWith('en');
    });

    it('closes dropdown with Escape key', async () => {
        render(<LanguageSelector onLanguageSelect={mockOnLanguageSelect} />);

        const input = screen.getByRole('textbox');
        fireEvent.focus(input);

        await waitFor(() => {
            expect(screen.getByText('Spanish')).toBeInTheDocument();
        });

        fireEvent.keyDown(input, { key: 'Escape' });

        await waitFor(() => {
            expect(screen.queryByText('Spanish')).not.toBeInTheDocument();
        });
    });

    it('opens dropdown with Enter key when closed', () => {
        render(<LanguageSelector onLanguageSelect={mockOnLanguageSelect} />);

        const input = screen.getByRole('textbox');
        fireEvent.keyDown(input, { key: 'Enter' });

        expect(screen.getByText('Spanish')).toBeInTheDocument();
    });

    it('opens dropdown with ArrowDown key when closed', () => {
        render(<LanguageSelector onLanguageSelect={mockOnLanguageSelect} />);

        const input = screen.getByRole('textbox');
        fireEvent.keyDown(input, { key: 'ArrowDown' });

        expect(screen.getByText('Spanish')).toBeInTheDocument();
    });

    it('highlights selected language option', async () => {
        render(
            <LanguageSelector
                onLanguageSelect={mockOnLanguageSelect}
                selectedLanguage="es"
            />
        );

        const input = screen.getByRole('textbox');
        fireEvent.focus(input);

        await waitFor(() => {
            const spanishOption = screen.getByText('Spanish').closest('.language-option');
            expect(spanishOption).toHaveClass('selected');
        });
    });

    it('can be disabled', () => {
        render(
            <LanguageSelector
                onLanguageSelect={mockOnLanguageSelect}
                disabled={true}
            />
        );

        const input = screen.getByRole('textbox');
        expect(input).toBeDisabled();
    });

    it('clears search term when input loses focus', async () => {
        const user = userEvent.setup();
        render(<LanguageSelector onLanguageSelect={mockOnLanguageSelect} />);

        const input = screen.getByRole('textbox');
        await user.click(input);
        await user.type(input, 'test');

        // Blur the input
        fireEvent.blur(input);

        // Wait for blur timeout
        await waitFor(() => {
            expect(input).toHaveValue('');
        }, { timeout: 200 });
    });

    it('displays language information correctly in options', async () => {
        render(<LanguageSelector onLanguageSelect={mockOnLanguageSelect} />);

        const input = screen.getByRole('textbox');
        fireEvent.focus(input);

        await waitFor(() => {
            // Check that language name, code, and native name are displayed
            expect(screen.getByText('Spanish')).toBeInTheDocument();
            expect(screen.getByText('(es)')).toBeInTheDocument();
            expect(screen.getByText('Español')).toBeInTheDocument();
        });
    });

    it('handles case-insensitive search', async () => {
        const user = userEvent.setup();
        render(<LanguageSelector onLanguageSelect={mockOnLanguageSelect} />);

        const input = screen.getByRole('textbox');
        await user.click(input);
        await user.type(input, 'SPANISH');

        await waitFor(() => {
            expect(screen.getByText('Spanish')).toBeInTheDocument();
            expect(screen.queryByText('French')).not.toBeInTheDocument();
        });
    });
});