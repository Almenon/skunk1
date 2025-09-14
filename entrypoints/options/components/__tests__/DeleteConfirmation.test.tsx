import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DeleteConfirmation from '../DeleteConfirmation';

describe('DeleteConfirmation', () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    mockOnConfirm.mockClear();
    mockOnCancel.mockClear();
  });

  it('renders confirmation dialog with word pair details', () => {
    render(
      <DeleteConfirmation
        original="hello"
        replacement="hola"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this word pair?')).toBeInTheDocument();
    expect(screen.getByText('hello')).toBeInTheDocument();
    expect(screen.getByText('hola')).toBeInTheDocument();
    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
  });

  it('shows confirm and cancel buttons', () => {
    render(
      <DeleteConfirmation
        original="hello"
        replacement="hola"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.getByRole('button', { name: 'Yes, Delete' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('calls onConfirm when Yes, Delete button is clicked', () => {
    render(
      <DeleteConfirmation
        original="hello"
        replacement="hola"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    const confirmButton = screen.getByRole('button', { name: 'Yes, Delete' });
    fireEvent.click(confirmButton);
    
    expect(mockOnConfirm).toHaveBeenCalled();
  });

  it('calls onCancel when Cancel button is clicked', () => {
    render(
      <DeleteConfirmation
        original="hello"
        replacement="hola"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('calls onCancel when Escape key is pressed', () => {
    render(
      <DeleteConfirmation
        original="hello"
        replacement="hola"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('calls onConfirm when Enter key is pressed', () => {
    render(
      <DeleteConfirmation
        original="hello"
        replacement="hola"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    fireEvent.keyDown(document, { key: 'Enter' });
    
    expect(mockOnConfirm).toHaveBeenCalled();
  });

  it('displays word pair with correct styling classes', () => {
    render(
      <DeleteConfirmation
        original="hello"
        replacement="hola"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    const originalWord = screen.getByText('hello');
    const replacementWord = screen.getByText('hola');
    
    expect(originalWord).toHaveClass('preview-original');
    expect(replacementWord).toHaveClass('preview-replacement');
  });

  it('renders as modal overlay', () => {
    render(
      <DeleteConfirmation
        original="hello"
        replacement="hola"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
    
    const overlay = document.querySelector('.delete-confirmation-overlay');
    const modal = document.querySelector('.delete-confirmation-modal');
    
    expect(overlay).toBeInTheDocument();
    expect(modal).toBeInTheDocument();
  });
});