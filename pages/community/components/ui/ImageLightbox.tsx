import React from 'react';
import { X } from 'lucide-react';

interface ImageLightboxProps {
  imageUrl: string | null;
  onClose: () => void;
}

/**
 * Modal hiển thị ảnh phóng to (lightbox).
 * Che phủ toàn bộ màn hình và cho phép đóng lại.
 */
const ImageLightbox: React.FC<ImageLightboxProps> = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  // Xử lý đóng khi nhấn phím Escape
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 animate-in fade-in-0 duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-[101] p-2 rounded-full bg-black/50"
        onClick={onClose}
        aria-label="Đóng ảnh"
      >
        <X size={32} />
      </button>
      {/* Container của ảnh, ngăn việc click vào ảnh đóng lightbox */}
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <img
          src={imageUrl}
          alt="Xem ảnh phóng to"
          className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
        />
      </div>
    </div>
  );
};

export default ImageLightbox;