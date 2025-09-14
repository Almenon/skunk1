import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WordPairList from '../WordPairList';

describe('WordPairList', () => {
  const mockOnEditWord = vi.fn();
  const mockOnDeleteWord = vi.fn();

  const sampleWordPairs = {
    'hello': 'hola',
    'world': 'mundo',
    'apple': 'manzana'
  };

  beforeEach(() => {
    mockOnEditWord.mockClear();
    mockOnDeleteWord.mockClear();
  });

  it('shows empty state when no word pairs exist', () => {
    render(
      <WordPairList 
        wordPairs={{}} 
        onEditWord={mockOnEditWord} 
        onDeleteWord={mockOnDeleteWord} 
      />
    );
    
    expect(screen.getByText('No word replacements configured yet.')).toBeInTheDocument();
    expect(screen.getByText('Add your first word pair below to get started!')).toBeInTheDocument();
  });

  it('displays word pairs in alphabetical order', () => {
    render(
      <WordPairList 
        wordPairs={sampleWordPairs} 
        onEditWord={mockOnEditWord} 
        onDeleteWord={mockOnDeleteWord} 
      />
    );
    
    const wordItems = screen.getAllByText(/apple|hello|world/);
    expect(wordItems[0]).toHaveTextContent('apple');
    expect(wordItems[1]).toHaveTextContent('hello');
    expect(wordItems[2]).toHaveTextContent('world');
  });

  it('displays header row with column labels', () => {
    render(
      <WordPairList 
        wordPairs={sampleWordPairs} 
        onEditWord={mockOnEditWord} 
        onDeleteWord={mockOnDeleteWord} 
      />
    );
    
    expect(screen.getByText('Original Word')).toBeInTheDocument();
    expect(screen.getByText('Replacement Word')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('shows edit and delete buttons for each word pair', () => {
    render(
      <WordPairList 
        wordPairs={sampleWordPairs} 
        onEditWord={mockOnEditWord} 
        onDeleteWord={mockOnDeleteWord} 
      />
    );
    
    const editButtons = screen.getAllByText('Edit');
    const deleteButtons = screen.getAllByText('Delete');
    
    expect(editButtons).toHaveLength(3);
    expect(deleteButtons).toHaveLength(3);
  });

  it('enters edit mode when edit button is clicked', () => {
    render(
      <WordPairList 
        wordPairs={sampleWordPairs} 
        onEditWord={mockOnEditWord} 
        onDeleteWord={mockOnDeleteWord} 
      />
    );
    
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]); // Click edit for first item (apple)
    
    // Should show edit form inputs
    const inputs = screen.getAllByDisplayValue('apple');
    expect(inputs.length).toBeGreaterThan(0);
  });

  it('shows delete confirmation when delete button is clicked', () => {
    render(
      <WordPairList 
        wordPairs={sampleWordPairs} 
        onEditWord={mockOnEditWord} 
        onDeleteWord={mockOnDeleteWord} 
      />
    );
    
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]); // Click delete for first item
    
    expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this word pair?')).toBeInTheDocument();
  });

  it('calls onDeleteWord when deletion is confirmed', () => {
    render(
      <WordPairList 
        wordPairs={sampleWordPairs} 
        onEditWord={mockOnEditWord} 
        onDeleteWord={mockOnDeleteWord} 
      />
    );
    
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]); // Click delete for apple
    
    const confirmButton = screen.getByText('Yes, Delete');
    fireEvent.click(confirmButton);
    
    expect(mockOnDeleteWord).toHaveBeenCalledWith('apple');
  });

  it('cancels deletion when cancel is clicked', () => {
    render(
      <WordPairList 
        wordPairs={sampleWordPairs} 
        onEditWord={mockOnEditWord} 
        onDeleteWord={mockOnDeleteWord} 
      />
    );
    
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);
    
    expect(screen.queryByText('Confirm Deletion')).not.toBeInTheDocument();
    expect(mockOnDeleteWord).not.toHaveBeenCalled();
  });

  it('displays word pairs with correct styling classes', () => {
    render(
      <WordPairList 
        wordPairs={sampleWordPairs} 
        onEditWord={mockOnEditWord} 
        onDeleteWord={mockOnDeleteWord} 
      />
    );
    
    const originalWords = screen.getAllByText('apple')[0];
    const replacementWords = screen.getAllByText('manzana')[0];
    
    expect(originalWords).toHaveClass('word-original');
    expect(replacementWords).toHaveClass('word-replacement');
  });
});