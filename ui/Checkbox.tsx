import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    // Không cần thêm props tùy chỉnh cho bây giờ
}

const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, ...rest }) => {
    return (
        <label className="inline-flex items-center">
            <input
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={onChange}
                {...rest}
            />
            <span
                className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors
                    ${checked ? 'bg-primary-600 border-primary-600' : 'bg-white border-gray-300'}
                `}
            >
                {checked && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                    </svg>
                )}
            </span>
        </label>
    );
};

export default Checkbox;
