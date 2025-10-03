import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AddWordForm from '../AddWordForm';

describe('AddWordForm', () => {
  const mockOnAddWord = vi.fn();
  const existingWords = ['hello', 'world'];

  beforeEach(() => {
    mockOnAddWord.mockClear();
  });

  it('renders form inputs and add button', () => {
    render(<AddWordForm onAddWord={mockOnAddWord} existingWords={existingWords} />);
    
    expect(screen.getByLabelText('Original Word / Phrase')).toBeInTheDocument();
    expect(screen.getByLabelText('Replacement Word')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it('disables add button when inputs are empty', () => {
    render(<AddWordForm onAddWord={mockOnAddWord} existingWords={existingWords} />);
    
    const addButton = screen.getByRole('button', { name: 'Add' });
    expect(addButton).toBeDisabled();
    expect(addButton).toHaveClass('disabled');
  });

  it('enables add button when both inputs have values', () => {
    render(<AddWordForm onAddWord={mockOnAddWord} existingWords={existingWords} />);
    
    const originalInput = screen.getByLabelText('Original Word / Phrase');
    const replacementInput = screen.getByLabelText('Replacement Word');
    const addButton = screen.getByRole('button', { name: 'Add' });

    fireEvent.change(originalInput, { target: { value: 'test' } });
    fireEvent.change(replacementInput, { target: { value: 'prueba' } });

    expect(addButton).not.toBeDisabled();
    expect(addButton).not.toHaveClass('disabled');
  });

  it('calls onAddWord with trimmed values when form is submitted', () => {
    render(<AddWordForm onAddWord={mockOnAddWord} existingWords={existingWords} />);
    
    const originalInput = screen.getByLabelText('Original Word / Phrase');
    const replacementInput = screen.getByLabelText('Replacement Word');
    const addButton = screen.getByRole('button', { name: 'Add' });

    fireEvent.change(originalInput, { target: { value: '  test  ' } });
    fireEvent.change(replacementInput, { target: { value: '  prueba  ' } });
    fireEvent.click(addButton);

    expect(mockOnAddWord).toHaveBeenCalledWith('test', 'prueba');
  });

  it('clears inputs after successful submission', () => {
    render(<AddWordForm onAddWord={mockOnAddWord} existingWords={existingWords} />);
    
    const originalInput = screen.getByLabelText('Original Word / Phrase') as HTMLInputElement;
    const replacementInput = screen.getByLabelText('Replacement Word') as HTMLInputElement;
    const addButton = screen.getByRole('button', { name: 'Add' });

    fireEvent.change(originalInput, { target: { value: 'test' } });
    fireEvent.change(replacementInput, { target: { value: 'prueba' } });
    fireEvent.click(addButton);

    expect(originalInput.value).toBe('');
    expect(replacementInput.value).toBe('');
  });

  it('shows duplicate warning for existing words', () => {
    render(<AddWordForm onAddWord={mockOnAddWord} existingWords={existingWords} />);
    
    const originalInput = screen.getByLabelText('Original Word / Phrase');
    const replacementInput = screen.getByLabelText('Replacement Word');
    const addButton = screen.getByRole('button', { name: 'Add' });

    fireEvent.change(originalInput, { target: { value: 'hello' } });
    fireEvent.change(replacementInput, { target: { value: 'hola' } });
    fireEvent.click(addButton);

    expect(screen.getByText(/already exists/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Yes, Overwrite' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(mockOnAddWord).not.toHaveBeenCalled();
  });

  it('calls onAddWord when overwrite is confirmed', () => {
    render(<AddWordForm onAddWord={mockOnAddWord} existingWords={existingWords} />);
    
    const originalInput = screen.getByLabelText('Original Word / Phrase');
    const replacementInput = screen.getByLabelText('Replacement Word');
    const addButton = screen.getByRole('button', { name: 'Add' });

    fireEvent.change(originalInput, { target: { value: 'hello' } });
    fireEvent.change(replacementInput, { target: { value: 'hola' } });
    fireEvent.click(addButton);

    const overwriteButton = screen.getByRole('button', { name: 'Yes, Overwrite' });
    fireEvent.click(overwriteButton);

    expect(mockOnAddWord).toHaveBeenCalledWith('hello', 'hola');
  });

  it('hides duplicate warning when cancel is clicked', () => {
    render(<AddWordForm onAddWord={mockOnAddWord} existingWords={existingWords} />);
    
    const originalInput = screen.getByLabelText('Original Word / Phrase');
    const replacementInput = screen.getByLabelText('Replacement Word');
    const addButton = screen.getByRole('button', { name: 'Add' });

    fireEvent.change(originalInput, { target: { value: 'hello' } });
    fireEvent.change(replacementInput, { target: { value: 'hola' } });
    fireEvent.click(addButton);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);

    expect(screen.queryByText(/already exists/)).not.toBeInTheDocument();
    expect(mockOnAddWord).not.toHaveBeenCalled();
  });

  it('respects maxLength attribute on inputs', () => {
    render(<AddWordForm onAddWord={mockOnAddWord} existingWords={existingWords} />);
    
    const originalInput = screen.getByLabelText('Original Word / Phrase');
    const replacementInput = screen.getByLabelText('Replacement Word');

    expect(originalInput).toHaveAttribute('maxLength', '100');
    expect(replacementInput).toHaveAttribute('maxLength', '100');
  });
});