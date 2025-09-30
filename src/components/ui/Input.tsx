import React from 'react';

// Định nghĩa props cho Input component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, id, error, className, ...props }) => {
  const inputClass = `w-full p-3 border ${
    error ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'
  } rounded-lg shadow-sm transition duration-150 focus:border-teal-500 focus:ring-1 ${className || ''}`;

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        id={id}
        className={inputClass}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
};

export default Input;
