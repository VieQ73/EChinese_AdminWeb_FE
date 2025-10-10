import React, { useState } from 'react';
import { X, ZoomIn, Image as ImageIcon } from 'lucide-react';

interface ImagePreviewProps {
  imageUrl: string;
  altText?: string;
  onRemove?: () => void;
  className?: string;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  imageUrl,
  altText = 'Hình ảnh',
  onRemove,
  className = ''
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleImageClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Preview Thumbnail */}
      <div className={`relative group ${className}`}>
        <div 
          className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:border-blue-300 transition-colors"
          onClick={handleImageClick}
        >
          {/* Mock image placeholder - In real app, use actual image */}
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
            <ImageIcon className="w-8 h-8 mb-1" />
            <span className="text-xs text-center px-2">
              {altText}
            </span>
          </div>
          
          {/* Zoom overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
            <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Remove button */}
        {onRemove && (
          <button
            onClick={onRemove}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Full size modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={handleCloseModal}
        >
          <div className="relative max-w-4xl max-h-full">
            {/* Close button */}
            <button
              onClick={handleCloseModal}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            {/* Full size image placeholder */}
            <div className="bg-white rounded-lg p-8 max-w-2xl max-h-[80vh] overflow-auto">
              <div className="flex flex-col items-center justify-center space-y-4">
                <ImageIcon className="w-16 h-16 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900">{altText}</h3>
                <p className="text-gray-600 text-center">
                  Đây là vị trí hiển thị hình ảnh thực tế
                </p>
                <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded">
                  URL: {imageUrl}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};