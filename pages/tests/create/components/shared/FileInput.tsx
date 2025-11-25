import React, { useRef, useState, useEffect } from 'react';
import { Upload, X, File as FileIcon, Loader2 } from 'lucide-react';
import { uploadToCloudinary } from '../../../../../services/cloudinary';

interface FileInputProps {
    id: string;
    label: string;
    value?: string | null; // Value is now always a string URL
    onFileChange: (url: string | null) => void;
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
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        const determineFileType = () => {
            if (accept.startsWith('image/')) return 'image';
            if (accept.startsWith('audio/')) return 'audio';
            return 'other';
        };

        if (typeof value === 'string' && value) {
            setPreviewUrl(value);
            setFileName(value.split('/').pop() || 'File');
            
            // Infer file type from URL extension or accept prop for blobs
            if (/\.(jpg|jpeg|png|gif|webp)$/i.test(value)) setFileType('image');
            else if (/\.(mp3|wav|ogg|m4a)$/i.test(value)) setFileType('audio');
            else if (value.startsWith('blob:')) setFileType(determineFileType());
            else setFileType('other');

        } else {
            setPreviewUrl(null);
            setFileType(null);
            setFileName(null);
        }
    }, [value, accept]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const url = await uploadToCloudinary(file);
            onFileChange(url);
        } catch (error) {
            console.error("Upload failed:", error);
            // Optionally, show an error to the user
            onFileChange(null); // Clear the value on failure
        } finally {
            setIsUploading(false);
            // Clear the input value so the same file can be selected again
            if (inputRef.current) {
                inputRef.current.value = '';
            }
        }
    };

    const handleRemoveFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        onFileChange(null);
    };
    
    const triggerFileInput = () => {
        if (isUploading) return;
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
                disabled={isUploading}
            />
            
            {previewUrl && !isUploading ? (
                <div className={`${containerClasses} border-solid border-slate-300 p-0 overflow-hidden`}>
                     {fileType === 'image' && <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />}
                     {fileType === 'audio' && (
                        <div className="p-2 flex flex-col items-center justify-center text-center w-full">
                            <audio src={previewUrl} controls className="w-full">
                                Your browser does not support the audio element.
                            </audio>
                            <span className="mt-2 text-xs break-all" title={fileName || 'Audio file'}>{fileName || 'Audio file'}</span>
                        </div>
                     )}
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
                    className={`${containerClasses} ${isUploading ? 'cursor-not-allowed bg-slate-200' : 'bg-slate-50 border-slate-300 hover:border-blue-400 hover:bg-blue-50'}`}
                    disabled={isUploading}
                >
                    <div className={`flex items-center text-slate-500 text-center ${variant === 'compact' ? 'flex-col' : 'flex-row'}`}>
                        {isUploading ? (
                            <>
                                <Loader2 size={variant === 'compact' ? 20 : 24} className={`animate-spin ${variant === 'compact' ? 'mb-1' : 'mr-2'}`} />
                                <span>Đang tải lên...</span>
                            </>
                        ) : (
                            <>
                                <Upload size={variant === 'compact' ? 20 : 24} className={variant === 'compact' ? 'mb-1' : 'mr-2'} />
                                <span>{label}</span>
                            </>
                        )}
                    </div>
                </button>
            )}
        </div>
    );
};

export default FileInput;
