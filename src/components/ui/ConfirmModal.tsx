import React from 'react';
import { Button } from './button';

const ConfirmModal: React.FC<{ isOpen: boolean; title?: string; message?: string; confirmLabel?: string; cancelLabel?: string; onConfirm: ()=>void; onCancel: ()=>void }> = ({ isOpen, title, message, confirmLabel='OK', cancelLabel='Cancel', onConfirm, onCancel }) => {
  if(!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{message}</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>{cancelLabel}</Button>
          <Button onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
