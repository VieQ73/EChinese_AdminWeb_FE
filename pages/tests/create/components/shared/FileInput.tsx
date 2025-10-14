import React, { useRef, useState, useEffect } from 'react';
import { Upload, X, File as FileIcon, Music, Image as ImageIcon } from 'lucide-react';

interface FileInputProps {
    id: string;
    label: string;
    value?: File | string | null; // Can be a File object for new uploads, or a string URL for existing files
    onFileChange: (file: File | null) => void;
    accept?: string;
    variant?: 'default' | 'compact';
}

const FileInput: React.FC<FileInputProps> = ({
    id,
    label,
    value,
    onFileChange,
    accept = "*/*",
    variant = 'default'
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [fileType, setFileType] = useState<'image' | 'audio' | 'other' | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    useEffect(() => {
        let objectUrl: string | null = null;
        if (value instanceof File) {
            objectUrl = URL.createObjectURL(value);
            setPreviewUrl(objectUrl);
            setFileName(value.name);
            if (value.type.startsWith('image/')) setFileType('image');
            else if (value.type.startsWith('audio/')) setFileType('audio');
            else setFileType('other');
        } else if (typeof value === 'string' && value) {
            setPreviewUrl(value);
            setFileName(value.split('/').pop() || 'File');
             // Simple check for file type from URL extension
            if (/\.(jpg|jpeg|png|gif|webp)$/i.test(value)) setFileType('image');
            else if (/\.(mp3|wav|ogg)$/i.test(value)) setFileType('audio');
            else setFileType('other');
        } else {
            setPreviewUrl(null);
            setFileType(null);
            setFileName(null);
        }
        
        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [value]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        onFileChange(file);
    };

    const handleRemoveFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        onFileChange(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };
    
    const triggerFileInput = () => {
        inputRef.current?.click();
    };
    
    // Common classes
    const containerBaseClass = "relative group flex items-center justify-center border-2 border-dashed rounded-lg transition-colors";
    const compactClasses = "w-28 h-28 text-xs flex-col";
    const defaultClasses = "w-full min-h-[80px] p-4 text-sm flex-row";
    
    const containerClasses = `${containerBaseClass} ${variant === 'compact' ? compactClasses : defaultClasses}`;

    return (
        <div className="w-full">
            {variant === 'default' && label && (
                <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
                    {label}
                </label>
            )}

            <input
                id={id}
                type="file"
                ref={inputRef}
                onChange={handleFileChange}
                accept={accept}
                className="hidden"
            />
            
            {previewUrl ? (
                <div className={`${containerClasses} border-solid border-slate-300 p-0 overflow-hidden`}>
                     {fileType === 'image' && <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />}
                     {fileType === 'audio' && <div className="p-2 flex flex-col items-center justify-center text-center"><Music size={variant === 'compact' ? 24 : 32} className="text-slate-500 mb-2"/><span className="break-all" title={fileName || 'Audio file'}>{fileName || 'Audio file'}</span></div>}
                     {fileType === 'other' && <div className="p-2 flex flex-col items-center justify-center text-center"><FileIcon size={variant === 'compact' ? 24 : 32} className="text-slate-500 mb-2"/><span className="break-all" title={fileName || 'File'}>{fileName || 'File'}</span></div>}
                     <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Xóa file"
                    >
                        <X size={14} />
                    </button>
                </div>
            ) : (
                 <button
                    type="button"
                    onClick={triggerFileInput}
                    className={`${containerClasses} bg-slate-50 border-slate-300 hover:border-blue-400 hover:bg-blue-50`}
                >
                    <div className={`flex items-center text-slate-500 text-center ${variant === 'compact' ? 'flex-col' : 'flex-row'}`}>
                        <Upload size={variant === 'compact' ? 20 : 24} className={variant === 'compact' ? 'mb-1' : 'mr-2'} />
                        <span>{label}</span>
                    </div>
                </button>
            )}
        </div>
    );
};

export default FileInput;
