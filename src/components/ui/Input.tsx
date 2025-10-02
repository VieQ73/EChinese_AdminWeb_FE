import React from 'react';

// Định nghĩa props cho Input component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, id, error, className, ...props }) => {
  // Thay đổi màu focus từ teal sang blue
  const inputClass = `w-full p-3 border ${
    error ? 'border-red-400 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
  } rounded-xl shadow-inner transition duration-150 focus:border-blue-500 focus:ring-2 bg-gray-50 hover:bg-white ${className || ''}`;

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-1">
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
