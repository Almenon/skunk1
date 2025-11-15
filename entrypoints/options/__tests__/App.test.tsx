import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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
    render(<App />);
    expect(screen.getByText('Loading word pairs...')).toBeInTheDocument();
  });

  it('should render main interface after loading', async () => {

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
});