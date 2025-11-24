import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageGalleryModalProps {
  images: string[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({
  images,
  isOpen,
  onClose,
  initialIndex = 0,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (!isOpen || images.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black bg-opacity-95 flex items-center justify-center animate-fadeIn">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10 p-2 rounded-full hover:bg-white hover:bg-opacity-10"
        aria-label="Đóng"
      >
        <X className="w-8 h-8" />
      </button>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 text-white hover:text-gray-300 transition-all bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-3 z-10"
            aria-label="Ảnh trước"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 text-white hover:text-gray-300 transition-all bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-3 z-10"
            aria-label="Ảnh tiếp theo"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      {/* Main Content */}
      <div className="relative w-full h-full flex items-center justify-center p-8">
        <div className="max-w-4xl max-h-full flex flex-col items-center gap-4">
          {/* Main Image */}
          <div className="relative max-w-full max-h-[65vh] flex items-center justify-center">
            <img
              src={images[currentIndex]}
              alt={`Ảnh ${currentIndex + 1}`}
              className="max-w-full max-h-[65vh] object-contain rounded-lg shadow-2xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23374151" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="16"%3EKhông tải được ảnh%3C/text%3E%3C/svg%3E';
              }}
            />
          </div>

          {/* Image Counter */}
          <div className="bg-black bg-opacity-60 px-4 py-2 rounded-full">
            <span className="text-white text-sm font-medium">
              {currentIndex + 1} / {images.length}
            </span>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto max-w-full px-4 pb-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
              {images.map((url: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden transition-all ${
                    index === currentIndex
                      ? 'border-primary-500 scale-110 shadow-lg'
                      : 'border-gray-600 hover:border-gray-400 opacity-70 hover:opacity-100'
                  }`}
                  aria-label={`Xem ảnh ${index + 1}`}
                >
                  <img
                    src={url}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23374151" width="80" height="80"/%3E%3C/svg%3E';
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGalleryModal;
