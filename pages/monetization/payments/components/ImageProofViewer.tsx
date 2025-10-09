import React from 'react';

interface ImageProofViewerProps {
    url: string | null | undefined;
}

const ImageProofViewer: React.FC<ImageProofViewerProps> = ({ url }) => {
    if (!url) {
        return <p className="text-sm text-gray-500 italic">Không có bằng chứng thanh toán.</p>;
    }

    return (
        <div>
            <a href={url} target="_blank" rel="noopener noreferrer" className="block border rounded-lg overflow-hidden group">
                <img 
                    src={url} 
                    alt="Bằng chứng thanh toán" 
                    className="w-full h-auto max-h-60 object-contain transition-transform duration-300 group-hover:scale-105"
                />
            </a>
            <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-primary-600 hover:underline mt-1 inline-block"
            >
                Xem ảnh gốc
            </a>
        </div>
    );
};

export default ImageProofViewer;
