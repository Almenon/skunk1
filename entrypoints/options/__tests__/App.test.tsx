import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WordStorageService } from '../../../lib/storage/word-storage';
import App from '../App';

// Mock the storage service
vi.mock('../../../lib/storage/word-storage', () => ({
  WordStorageService: {
    getWordPairs: vi.fn(),
    addWordPair: vi.fn(),
    updateWordPair: vi.fn(),
    deleteWordPair: vi.fn(),
    watchWordPairs: vi.fn(() => () => { }), // Return unwatch function
  },
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    // Mock getWordPairs to return a promise that doesn't resolve immediately
    vi.mocked(WordStorageService.getWordPairs).mockImplementation(
      () => new Promise(() => { }) // Never resolves
    );

    render(<App />);

    expect(screen.getByText('Loading word pairs...')).toBeInTheDocument();
  });

  it('should render main interface after loading', async () => {
    // Mock successful loading
    vi.mocked(WordStorageService.getWordPairs).mockResolvedValue({
      'hello': 'hi',
      'world': 'earth'
    });

    render(<App />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('Dictionary')).toBeInTheDocument();
    });

    // Check that sidebar is rendered
    expect(screen.getByText('Configuration')).toBeInTheDocument();
    expect(screen.getByText('Manage Dictionaries')).toBeInTheDocument();

    // Check that dictionary page content is rendered
    expect(screen.getByText('Current Word Pairs')).toBeInTheDocument();
    expect(screen.getByText('Add New Word Pair')).toBeInTheDocument();
  });

  it('should display error when storage fails to load', async () => {
    // Mock storage failure
    vi.mocked(WordStorageService.getWordPairs).mockRejectedValue(
      new Error('Storage unavailable')
    );

    render(<App />);

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/Failed to load word pairs from storage/)).toBeInTheDocument();
    });
  });

  it('should set up storage watcher on mount', async () => {
    vi.mocked(WordStorageService.getWordPairs).mockResolvedValue({});
    const mockUnwatch = vi.fn();
    vi.mocked(WordStorageService.watchWordPairs).mockReturnValue(mockUnwatch);

    render(<App />);

    await waitFor(() => {
      expect(WordStorageService.watchWordPairs).toHaveBeenCalled();
    });
  });
});