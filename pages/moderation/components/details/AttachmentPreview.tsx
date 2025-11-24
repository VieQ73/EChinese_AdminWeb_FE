import React from 'react';
import { Images } from 'lucide-react';

interface AttachmentPreviewProps {
  attachments: string[];
  onImageClick: (index: number) => void;
}

const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
  attachments,
  onImageClick,
}) => {
  if (attachments.length === 0) return null;

  const displayImages = attachments.slice(0, 4);
  const remainingCount = attachments.length - 4;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center mb-3">
        <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
          <Images className="w-4 h-4 text-primary-600" />
          Ảnh đính kèm ({attachments.length})
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {displayImages.map((url: string, index: number) => (
          <button
            key={index}
            onClick={() => onImageClick(index)}
            className="group relative block rounded-lg overflow-hidden border-2 border-gray-200 hover:border-primary-500 transition-all hover:shadow-md aspect-square"
          >
            <img
              src={url}
              alt={`Ảnh đính kèm ${index + 1}`}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="10"%3EKhông tải được%3C/text%3E%3C/svg%3E';
              }}
            />
            {index === 3 && remainingCount > 0 && (
              <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center backdrop-blur-sm">
                <span className="text-white font-bold text-2xl">+{remainingCount}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default AttachmentPreview;
