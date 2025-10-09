import React, { useState, useEffect } from 'react';
import { Refund } from '../../../../types';
import { ProcessRefundPayload } from '../../api';
import { formatCurrency } from '../../utils';
import { Loader2 } from 'lucide-react';

interface ProcessRefundFormProps {
    refund: Refund;
    onSubmit: (payload: Omit<ProcessRefundPayload, 'adminId'>) => void;
    onCancel: () => void;
    isProcessing: boolean;
    currentUserRole?: 'user' | 'admin' | 'super admin';
}

const ProcessRefundForm: React.FC<ProcessRefundFormProps> = ({ refund, onSubmit, onCancel, isProcessing, currentUserRole }) => {
    const [action, setAction] = useState<'approve' | 'reject' | null>(null);
    const [notes, setNotes] = useState('');
    const [amountType, setAmountType] = useState<'full' | 'partial'>('full');
    const [partialAmount, setPartialAmount] = useState<number | ''>('');
    const [method, setMethod] = useState<'gateway' | 'manual_transfer'>('gateway');

    const isSuperAdmin = currentUserRole === 'super admin';

    useEffect(() => {
        if (refund) {
            setAction(null);
            setNotes('');
            setAmountType('full');
            setPartialAmount('');
            setMethod('gateway');
        }
    }, [refund]);

    const finalAmount = amountType === 'full' ? refund.refund_amount : Number(partialAmount);
    const isFormValid = action === 'reject' ? notes.trim() !== '' : (action === 'approve' ? notes.trim() !== '' && finalAmount > 0 && finalAmount <= refund.refund_amount : false);

    const handleSubmit = () => {
        if (!isFormValid) return;
        const payload: Omit<ProcessRefundPayload, 'adminId'> = {
            action: action!,
            notes,
            ...(action === 'approve' && { amount: finalAmount, method }),
        };
        onSubmit(payload);
    };

    if (!action) {
        return (
            <div className="flex justify-end space-x-3">
                <button onClick={() => setAction('reject')} className="px-4 py-2 text-sm font-semibold rounded-lg text-white bg-red-600 hover:bg-red-700">Từ chối</button>
                <button onClick={() => setAction('approve')} className="px-4 py-2 text-sm font-semibold rounded-lg text-white bg-green-600 hover:bg-green-700">Chấp thuận</button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h4 className="font-semibold text-lg">{action === 'approve' ? 'Chấp thuận hoàn tiền' : 'Từ chối hoàn tiền'}</h4>
            
            {action === 'approve' && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                    <div>
                        <label className="text-sm font-medium">Số tiền hoàn</label>
                        <div className="flex items-center space-x-4 mt-1">
                             <label><input type="radio" name="amount" checked={amountType==='full'} onChange={() => setAmountType('full')} /> Toàn phần ({formatCurrency(refund.refund_amount)})</label>
                             <label><input type="radio" name="amount" checked={amountType==='partial'} onChange={() => setAmountType('partial')} /> Một phần</label>
                        </div>
                        {amountType === 'partial' && <input type="number" value={partialAmount} onChange={e => setPartialAmount(Number(e.target.value))} max={refund.refund_amount} className="w-full mt-2 p-2 border rounded" />}
                    </div>
                     <div>
                        <label className="text-sm font-medium">Phương thức</label>
                        <div className="flex items-center space-x-4 mt-1">
                             <label><input type="radio" name="method" value="gateway" checked={method === 'gateway'} onChange={() => setMethod('gateway')} disabled={!isSuperAdmin} /> Qua cổng thanh toán {!isSuperAdmin && <span className="text-xs text-red-500">(Chỉ Super Admin)</span>}</label>
                             <label><input type="radio" name="method" value="manual_transfer" checked={method === 'manual_transfer'} onChange={() => setMethod('manual_transfer')} /> Chuyển khoản thủ công</label>
                        </div>
                    </div>
                </div>
            )}
            
            <div>
                <label className="text-sm font-medium">Ghi chú / Lý do *</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full mt-1 p-2 border rounded" placeholder={action === 'reject' ? 'Nhập lý do từ chối...' : 'Nhập ghi chú cho hành động này...'} />
            </div>

            <div className="flex justify-end space-x-3">
                <button onClick={() => setAction(null)} disabled={isProcessing} className="px-4 py-2 text-sm font-medium bg-gray-200 rounded-lg hover:bg-gray-300">Quay lại</button>
                <button onClick={handleSubmit} disabled={!isFormValid || isProcessing} className={`inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 ${action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                    {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin"/>}
                    Xác nhận
                </button>
            </div>
        </div>
    );
};

export default ProcessRefundForm;