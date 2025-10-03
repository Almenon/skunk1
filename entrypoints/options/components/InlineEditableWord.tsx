import { useState, useEffect, useRef } from 'react';
import './InlineEditableWord.css';

interface InlineEditableWordProps {
  value: string;
  onSave: (newValue: string) => void;
  className?: string;
  placeholder?: string;
  maxLength?: number;
}

export default function InlineEditableWord({
  value,
  onSave,
  className = '',
  placeholder = '',
  maxLength = 100
}: InlineEditableWordProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    const trimmedValue = editValue.trim();
    if (trimmedValue && trimmedValue !== value) {
      onSave(trimmedValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleBlur = () => {
    // Auto-save on blur
    handleSave();
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className={`inline-editable-input ${className}`}
        placeholder={placeholder}
        maxLength={maxLength}
      />
    );
  }

  return (
    <span
      onClick={handleClick}
      className={`inline-editable-word ${className}`}
      title="Click to edit"
    >
      {value}
    </span>
  );
}