import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, id, ...props }) => {
  const textAreaId = id || props.name;
  return (
    <div>
      {label && (
        <label htmlFor={textAreaId} className="block text-sm font-medium text-slate-700 mb-1">
          {label}
        </label>
      )}
      <textarea
        id={textAreaId}
        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition"
        rows={3}
        {...props}
      />
    </div>
  );
};
