import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

interface Option {
  label: string;
  value: string;
  shortName?: string;
}

interface TypeaheadProps {
  options: Option[];
  selectedValue: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  displayFormat?: (option: Option) => string;
  triggerClassName?: string;
  inputClassName?: string;
}

const Typeahead: FC<TypeaheadProps> = ({
  options,
  selectedValue,
  onSelect,
  placeholder = 'Select...',
  displayFormat = (option) => option.label,
  triggerClassName = '',
  inputClassName = 'focus:outline-none'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedInputValue = useDebouncedValue(inputValue, 300);

  const selectedOption = options.find(opt => opt.value === selectedValue);

  const filteredOptions = useMemo(() =>
    options.filter(option =>
      option.label.toLowerCase().includes(debouncedInputValue.toLowerCase()) ||
      (option.shortName && option.shortName.toLowerCase().includes(debouncedInputValue.toLowerCase()))
    ), [options, debouncedInputValue]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleSelect = useCallback((value: string) => {
    onSelect(value);
    setIsOpen(false);
    setInputValue('');
  }, [onSelect]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && filteredOptions.length > 0) {
      handleSelect(filteredOptions[0].value);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }, [filteredOptions, handleSelect]);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      inputRef.current?.focus();
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, handleClickOutside]);

  return (
    <>
      {isOpen ? (
        <div>
          <div className="fixed inset-0 bg-base-100/80 backdrop-blur-xs z-40" />
          <div ref={containerRef} className="relative z-[100]">
            <div className="relative w-full">
              <input
                ref={inputRef}
                type="text"
                className={`${inputClassName} border border-base-300 rounded-t-selector bg-base-300 shadow-lg w-full min-w-0 p-2`}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={selectedOption ? displayFormat(selectedOption) : placeholder}
                aria-label="Search options"
                autoFocus
              />
              <ul className="absolute top-full left-0 right-0 bg-base-300 border border-base-300 border-t-0 rounded-b-selector shadow-lg max-h-60 overflow-y-auto">
                {filteredOptions.map((option) => (
                  <li key={option.value}>
                    <button
                      className="w-full text-left p-2 hover:bg-base-200 overflow-hidden whitespace-nowrap text-ellipsis cursor-pointer"
                      onClick={() => handleSelect(option.value)}
                      title={displayFormat(option)}
                    >
                      {displayFormat(option)}
                    </button>
                  </li>
                ))}
                {filteredOptions.length === 0 && (
                  <li className="p-2 text-gray-500">No options found</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <h1
          className={`${triggerClassName} group p-2 w-full border border-transparent cursor-text`}
          onClick={() => setIsOpen(true)}
          aria-label="Select"
        >
          <span className="opacity-0 group-hover:opacity-100 group-hover:animate-ping">|</span>
          <span className="group-hover:opacity-70">{selectedOption ? displayFormat(selectedOption) : placeholder}</span>
        </h1>
      )}
    </>
  );
};

export default Typeahead;
