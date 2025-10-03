import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EditWordForm from '../EditWordForm';

describe('EditWordForm', () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();
  const existingWords = ['hello', 'world'];

  beforeEach(() => {
    mockOnSave.mockClear();
    mockOnCancel.mockClear();
  });

  it('renders with initial values', () => {
    render(
      <EditWordForm
        original="test"
        replacement="prueba"
        existingWords={existingWords}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const originalInput = screen.getByDisplayValue('test');
    const replacementInput = screen.getByDisplayValue('prueba');

    expect(originalInput).toBeInTheDocument();
    expect(replacementInput).toBeInTheDocument();
  });

  it('shows save and cancel buttons', () => {
    render(
      <EditWordForm
        original="test"
        replacement="prueba"
        existingWords={existingWords}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('disables save button when no changes are made', () => {
    render(
      <EditWordForm
        original="test"
        replacement="prueba"
        existingWords={existingWords}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toBeDisabled();
    expect(saveButton).toHaveClass('disabled');
  });

  it('enables save button when changes are made', () => {
    render(
      <EditWordForm
        original="test"
        replacement="prueba"
        existingWords={existingWords}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const originalInput = screen.getByDisplayValue('test');
    const saveButton = screen.getByRole('button', { name: 'Save' });

    fireEvent.change(originalInput, { target: { value: 'testing' } });

    expect(saveButton).not.toBeDisabled();
    expect(saveButton).not.toHaveClass('disabled');
  });

  it('disables save button when inputs are empty', () => {
    render(
      <EditWordForm
        original="test"
        replacement="prueba"
        existingWords={existingWords}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const originalInput = screen.getByDisplayValue('test');
    const saveButton = screen.getByRole('button', { name: 'Save' });

    fireEvent.change(originalInput, { target: { value: '' } });

    expect(saveButton).toBeDisabled();
    expect(saveButton).toHaveClass('disabled');
  });

  it('calls onSave with trimmed values when form is submitted', () => {
    render(
      <EditWordForm
        original="test"
        replacement="prueba"
        existingWords={existingWords}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const originalInput = screen.getByDisplayValue('test');
    const replacementInput = screen.getByDisplayValue('prueba');
    const saveButton = screen.getByRole('button', { name: 'Save' });

    fireEvent.change(originalInput, { target: { value: '  testing  ' } });
    fireEvent.change(replacementInput, { target: { value: '  probando  ' } });
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith('test', 'testing', 'probando');
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <EditWordForm
        original="test"
        replacement="prueba"
        existingWords={existingWords}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('calls onCancel when Escape key is pressed', () => {
    render(
      <EditWordForm
        original="test"
        replacement="prueba"
        existingWords={existingWords}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const originalInput = screen.getByDisplayValue('test');
    fireEvent.keyDown(originalInput, { key: 'Escape' });

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('submits form when Enter key is pressed', () => {
    render(
      <EditWordForm
        original="test"
        replacement="prueba"
        existingWords={existingWords}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const originalInput = screen.getByDisplayValue('test');
    fireEvent.change(originalInput, { target: { value: 'testing' } });
    fireEvent.keyDown(originalInput, { key: 'Enter' });

    expect(mockOnSave).toHaveBeenCalledWith('test', 'testing', 'prueba');
  });

  it('shows duplicate warning for existing words', () => {
    render(
      <EditWordForm
        original="test"
        replacement="prueba"
        existingWords={existingWords}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const originalInput = screen.getByDisplayValue('test');
    const saveButton = screen.getByRole('button', { name: 'Save' });

    fireEvent.change(originalInput, { target: { value: 'hello' } });
    fireEvent.click(saveButton);

    expect(screen.getByText(/already exists/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Yes, Overwrite' })).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('calls onSave when overwrite is confirmed', () => {
    render(
      <EditWordForm
        original="test"
        replacement="prueba"
        existingWords={existingWords}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const originalInput = screen.getByDisplayValue('test');
    const saveButton = screen.getByRole('button', { name: 'Save' });

    fireEvent.change(originalInput, { target: { value: 'hello' } });
    fireEvent.click(saveButton);

    const overwriteButton = screen.getByRole('button', { name: 'Yes, Overwrite' });
    fireEvent.click(overwriteButton);

    expect(mockOnSave).toHaveBeenCalledWith('test', 'hello', 'prueba');
  });

  it('respects maxLength attribute on inputs', () => {
    render(
      <EditWordForm
        original="test"
        replacement="prueba"
        existingWords={existingWords}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const originalInput = screen.getByDisplayValue('test');
    const replacementInput = screen.getByDisplayValue('prueba');

    expect(originalInput).toHaveAttribute('maxLength', '100');
    expect(replacementInput).toHaveAttribute('maxLength', '100');
  });
});