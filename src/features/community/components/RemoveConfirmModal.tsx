import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';

const RemoveConfirmModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => Promise<void>;
  requireReason?: boolean;
}> = ({ isOpen, onClose, onConfirm, requireReason = false }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const doConfirm = async () => {
    if (requireReason && !reason.trim()) return;
    setLoading(true);
    try {
      await onConfirm(requireReason ? reason : undefined);
      onClose();
      setReason('');
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent
        className="max-w-md bg-white text-black rounded-2xl shadow-lg border border-gray-200"
      >
        <DialogHeader className="border-b border-gray-200 pb-3">
          <DialogTitle className="text-lg font-semibold">
            Xác nhận
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-4">
          <p className="text-sm text-gray-700">
            Bạn có chắc muốn thực hiện hành động này?
          </p>

          {requireReason && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Lý do (bắt buộc)
              </label>
              <input
                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 pt-3 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-lg border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Hủy
          </Button>
          <Button
            onClick={doConfirm}
            disabled={loading || (requireReason && !reason.trim())}
            className="rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? 'Đang xử lý...' : 'Xác nhận'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveConfirmModal;
