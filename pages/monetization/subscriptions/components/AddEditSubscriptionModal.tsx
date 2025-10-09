import React, { useState, useEffect } from 'react';
import Modal from '../../../../components/Modal';
import { Subscription } from '../../../../types';
import RichTextEditor from '../../../../components/RichTextEditor';

export interface SubscriptionPayload {
    name: string;
    description: any;
    price: number;
    duration_months?: number | null;
    daily_quota_ai_lesson: number;
    daily_quota_translate: number;
    is_active: boolean;
}

interface AddEditSubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: SubscriptionPayload) => Promise<void>;
    subscription: Subscription | null;
    saving: boolean;
    error?: string | null;
}

const AddEditSubscriptionModal: React.FC<AddEditSubscriptionModalProps> = ({ isOpen, onClose, onSave, subscription, saving, error }) => {
    const [name, setName] = useState('');
    const [descriptionHtml, setDescriptionHtml] = useState('');
    const [price, setPrice] = useState<number | ''>('');
    const [durationMonths, setDurationMonths] = useState<number | ''>('');
    const [quotaLesson, setQuotaLesson] = useState<number | ''>('');
    const [quotaTranslate, setQuotaTranslate] = useState<number | ''>('');
    const [isActive, setIsActive] = useState(true);
    const [editorKey, setEditorKey] = useState(Date.now());

    useEffect(() => {
        if (isOpen) {
            setEditorKey(Date.now()); // Reset textarea
            if (subscription) {
                setName(subscription.name);
                // Xử lý description có thể là string hoặc object
                const desc = subscription.description;
                if (typeof desc === 'string') {
                    setDescriptionHtml(desc);
                } else if (desc && typeof desc === 'object') {
                    setDescriptionHtml((desc as any).html || JSON.stringify(desc));
                } else {
                    setDescriptionHtml('');
                }
                setPrice(subscription.price);
                setDurationMonths(subscription.duration_months === null ? 0 : subscription.duration_months); // 0 for lifetime
                setQuotaLesson(subscription.daily_quota_ai_lesson);
                setQuotaTranslate(subscription.daily_quota_translate);
                setIsActive(subscription.is_active);
            } else {
                // Reset form
                setName('');
                setDescriptionHtml('');
                setPrice('');
                setDurationMonths(1);
                setQuotaLesson('');
                setQuotaTranslate('');
                setIsActive(true);
            }
        }
    }, [subscription, isOpen]);

    const handleSave = () => {
        if (!name.trim() || price === '' || durationMonths === '' || quotaLesson === '' || quotaTranslate === '') {
            alert('Vui lòng điền đầy đủ các trường bắt buộc.');
            return;
        }

        onSave({
            name,
            description: { html: descriptionHtml }, // Khôi phục format object
            price: Number(price),
            duration_months: Number(durationMonths) === 0 ? null : Number(durationMonths),
            daily_quota_ai_lesson: Number(quotaLesson),
            daily_quota_translate: Number(quotaTranslate),
            is_active: isActive,
        });
    };

    const footer = (
        <div className="space-x-2">
            <button onClick={onClose} disabled={saving} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50">Hủy</button>
            <button onClick={handleSave} disabled={saving} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50">
                {saving && <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                {subscription ? 'Cập nhật' : 'Tạo gói'}
            </button>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={subscription ? "Chỉnh sửa gói" : "Tạo gói đăng ký mới"} footer={footer} className="max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto p-1">
                {/* Cột trái: Form inputs */}
                <div className="space-y-4">
                     {error && <div className="p-3 bg-red-100 text-red-700 border border-red-200 rounded-lg">{error}</div>}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tên gói *</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full p-2 border rounded-md"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Giá (VND) *</label>
                            <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} className="mt-1 w-full p-2 border rounded-md"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Thời hạn (tháng) *</label>
                            <input type="number" value={durationMonths} onChange={e => setDurationMonths(Number(e.target.value))} className="mt-1 w-full p-2 border rounded-md"/>
                             <p className="text-xs text-gray-500 mt-1">Nhập 0 cho gói Vĩnh viễn.</p>
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Quota bài học AI *</label>
                            <input type="number" value={quotaLesson} onChange={e => setQuotaLesson(Number(e.target.value))} className="mt-1 w-full p-2 border rounded-md"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Quota dịch AI *</label>
                            <input type="number" value={quotaTranslate} onChange={e => setQuotaTranslate(Number(e.target.value))} className="mt-1 w-full p-2 border rounded-md"/>
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Mô tả (quyền lợi)</label>
                        <RichTextEditor 
                            key={editorKey}
                            initialContent={descriptionHtml}
                            onChange={setDescriptionHtml}
                        />
                    </div>
                    <div className="flex items-center">
                        <input id="is_active" type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="h-4 w-4 text-primary-600 rounded"/>
                        <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-900">Kích hoạt gói này</label>
                    </div>
                </div>

                {/* Cột phải: Preview */}
                <div className="space-y-4">
                     <div>
                        <h4 className="font-semibold text-gray-800">Xem trước hiển thị</h4>
                        <div className="mt-2 p-4 border border-gray-200 rounded-lg bg-gray-50 min-h-[200px]">
                            <h3 className="text-lg font-bold">{name || "Tên gói"}</h3>
                            <p className="text-xl font-semibold text-primary-600 my-2">{formatCurrency(Number(price) || 0)} / {Number(durationMonths) > 0 ? `${durationMonths} tháng` : 'Vĩnh viễn'}</p>
                            <div className="prose prose-sm max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: descriptionHtml || "<p>Mô tả sẽ hiển thị ở đây...</p>" }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

// Hàm định dạng tiền tệ tạm thời, sẽ chuyển vào utils
const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
};

export default AddEditSubscriptionModal;
