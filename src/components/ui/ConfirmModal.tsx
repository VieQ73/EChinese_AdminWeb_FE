import React from 'react';
import { Button } from './button';

const ConfirmModal: React.FC<{ isOpen: boolean; title?: string; message?: string; confirmLabel?: string; cancelLabel?: string; onConfirm: ()=>void; onCancel: ()=>void }> = ({ isOpen, title, message, confirmLabel='OK', cancelLabel='Cancel', onConfirm, onCancel }) => {
  if(!isOpen) return null;
  return (
    // Tăng độ trong suốt của overlay
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300">
      <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl transition-transform duration-300 scale-100">
        <h3 className="text-xl font-bold text-gray-800 mb-3">{title || 'Xác nhận hành động'}</h3>
        <p className="text-sm text-gray-600 mb-6">{message || 'Bạn có chắc chắn muốn thực hiện hành động này?'}</p>
        <div className="flex justify-end gap-3">
          {/* Sử dụng variant secondary cho nút Hủy để làm nổi bật nút Chính */}
          <Button variant="secondary" onClick={onCancel}>{cancelLabel}</Button>
          {/* Sử dụng variant default/destructive tùy theo ngữ cảnh, ở đây dùng default (Blue) */}
          <Button onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
