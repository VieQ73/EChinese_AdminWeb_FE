import React, { ReactNode } from 'react';
import Modal from '../../../components/Modal';
import { Loader2 } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: ReactNode;
  confirmText?: string;
  confirmButtonClass?: string;
  isConfirming?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmText = 'Xác nhận',
  confirmButtonClass = 'bg-red-600 hover:bg-red-700',
  isConfirming = false,
}) => {
  const footer = (
    <div className="space-x-2">
      <button 
        onClick={onClose} 
        disabled={isConfirming}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
      >
        Hủy
      </button>
      <button 
        onClick={onConfirm}
        disabled={isConfirming}
        className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-lg ${confirmButtonClass} disabled:opacity-50`}
      >
        {isConfirming && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {confirmText}
      </button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} footer={footer}>
      {children}
    </Modal>
  );
};

export default ConfirmationModal;
