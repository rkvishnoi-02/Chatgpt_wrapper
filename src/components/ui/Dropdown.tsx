import React from 'react';
import { twMerge } from 'tailwind-merge';

interface DropdownOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: string;
}

export const Dropdown = React.forwardRef<HTMLSelectElement, DropdownProps>(
  (
    {
      options,
      value,
      onChange,
      placeholder = 'Select an option',
      disabled = false,
      className,
      error,
      ...props
    },
    ref
  ) => {
    return (
      <div className="relative">        <select
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={twMerge(
            'block w-full rounded-md border border-sidebar-border bg-sidebar py-2 pl-3 pr-10 text-sm text-sidebar-foreground',
            'focus:border-sidebar-accent-foreground focus:outline-none focus:ring-1 focus:ring-sidebar-accent-foreground',
            'disabled:cursor-not-allowed disabled:bg-sidebar-accent disabled:opacity-50',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
          <svg
            className="h-4 w-4 text-sidebar-foreground/70"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);