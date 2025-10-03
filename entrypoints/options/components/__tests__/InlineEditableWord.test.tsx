import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import InlineEditableWord from '../InlineEditableWord';

describe('InlineEditableWord', () => {
  const mockOnSave = vi.fn();

  beforeEach(() => {
    mockOnSave.mockClear();
  });

  it('renders the value as clickable text', () => {
    render(<InlineEditableWord value="test" onSave={mockOnSave} />);

    const wordElement = screen.getByText('test');
    expect(wordElement).toBeInTheDocument();
    expect(wordElement).toHaveClass('inline-editable-word');
  });

  it('enters edit mode when clicked', () => {
    render(<InlineEditableWord value="test" onSave={mockOnSave} />);

    const wordElement = screen.getByText('test');
    fireEvent.click(wordElement);

    const input = screen.getByDisplayValue('test');
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe('INPUT');
  });

  it('saves changes when Enter is pressed', () => {
    render(<InlineEditableWord value="test" onSave={mockOnSave} />);

    const wordElement = screen.getByText('test');
    fireEvent.click(wordElement);

    const input = screen.getByDisplayValue('test');
    fireEvent.change(input, { target: { value: 'updated' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockOnSave).toHaveBeenCalledWith('updated');
  });

  it('cancels changes when Escape is pressed', () => {
    render(<InlineEditableWord value="test" onSave={mockOnSave} />);

    const wordElement = screen.getByText('test');
    fireEvent.click(wordElement);

    const input = screen.getByDisplayValue('test');
    fireEvent.change(input, { target: { value: 'updated' } });
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(mockOnSave).not.toHaveBeenCalled();
    expect(screen.getByText('test')).toBeInTheDocument();
  });

  it('saves changes when input loses focus', () => {
    render(<InlineEditableWord value="test" onSave={mockOnSave} />);

    const wordElement = screen.getByText('test');
    fireEvent.click(wordElement);

    const input = screen.getByDisplayValue('test');
    fireEvent.change(input, { target: { value: 'updated' } });
    fireEvent.blur(input);

    expect(mockOnSave).toHaveBeenCalledWith('updated');
  });

  it('does not save if value is unchanged', () => {
    render(<InlineEditableWord value="test" onSave={mockOnSave} />);

    const wordElement = screen.getByText('test');
    fireEvent.click(wordElement);

    const input = screen.getByDisplayValue('test');
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('does not save if value is empty after trimming', () => {
    render(<InlineEditableWord value="test" onSave={mockOnSave} />);

    const wordElement = screen.getByText('test');
    fireEvent.click(wordElement);

    const input = screen.getByDisplayValue('test');
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<InlineEditableWord value="test" onSave={mockOnSave} className="custom-class" />);

    const wordElement = screen.getByText('test');
    expect(wordElement).toHaveClass('inline-editable-word');
    expect(wordElement).toHaveClass('custom-class');
  });

  it('respects maxLength attribute', () => {
    render(<InlineEditableWord value="test" onSave={mockOnSave} maxLength={10} />);

    const wordElement = screen.getByText('test');
    fireEvent.click(wordElement);

    const input = screen.getByDisplayValue('test');
    expect(input).toHaveAttribute('maxLength', '10');
  });
});