import React, { useState, useEffect } from 'react';
import Modal from '../../../../components/Modal';
import { BadgeLevel } from '../../../../types';
import { BadgePayload } from '../api';
import FileInput from '../../../tests/create/components/shared/FileInput';

interface EditBadgeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (payload: BadgePayload) => void;
    badge: BadgeLevel | null; // null for creating new badge
}

const EditBadgeModal: React.FC<EditBadgeModalProps> = ({ isOpen, onClose, onSave, badge }) => {
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('');
    const [minPoints, setMinPoints] = useState<number | ''>('');
    const [ruleDescription, setRuleDescription] = useState('');
    const [isActive, setIsActive] = useState(true);

    const isEditMode = !!badge;
    const canEditMinPoints = isEditMode ? ![0, 4, 5].includes(badge.level) : true;

    useEffect(() => {
        if (isOpen) {
            if (badge) { // Edit mode
                setName(badge.name);
                setIcon(badge.icon);
                setMinPoints(badge.min_points);
                setRuleDescription(badge.rule_description);
                setIsActive(badge.is_active);
            } else { // Create mode
                setName('');
                setIcon('https://cdn-icons-png.flaticon.com/512/1000/1000941.png');
                setMinPoints('');
                setRuleDescription('');
                setIsActive(true);
            }
        }
    }, [badge, isOpen]);

    const handleSave = () => {
        if (!name.trim() || minPoints === '' || !ruleDescription.trim()) {
            alert('Vui lòng điền đầy đủ các trường bắt buộc.');
            return;
        }
        
        const payload: BadgePayload = {
            name,
            icon,
            min_points: Number(minPoints),
            rule_description: ruleDescription,
            is_active: isActive,
        };
        onSave(payload);
    };

    const footer = (
        <div className="space-x-2">
            <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border">Hủy</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm text-white bg-primary-600 rounded-lg">
                {isEditMode ? 'Lưu thay đổi' : 'Tạo huy hiệu'}
            </button>
        </div>
    );
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? `Chỉnh sửa: ${badge.name}` : 'Tạo huy hiệu mới'} footer={footer} className="max-w-xl">
            <div className="space-y-4">
                <div>
                    <label className="font-medium">Tên Huy hiệu *</label>
                    <input value={name} onChange={e => setName(e.target.value)} className="w-full mt-1 p-2 border rounded" />
                </div>
                <div>
                    <FileInput
                        id="badge-icon-upload"
                        label="Icon *"
                        value={icon || null}
                        onFileChange={(url) => setIcon(url || '')}
                        accept="image/*"
                    />
                </div>
                <div>
                    <label className="font-medium">Điểm cộng đồng yêu cầu *</label>
                    <input 
                        type="number" 
                        value={minPoints} 
                        onChange={e => setMinPoints(Number(e.target.value))} 
                        className="w-full mt-1 p-2 border rounded disabled:bg-gray-200" 
                        disabled={!canEditMinPoints}
                        title={!canEditMinPoints ? "Không thể sửa điểm của huy hiệu hệ thống." : ""}
                    />
                     {!canEditMinPoints && <p className="text-xs text-gray-500 mt-1">Không thể sửa điểm của huy hiệu hệ thống.</p>}
                </div>
                <div>
                    <label className="font-medium">Mô tả quy tắc *</label>
                    <textarea value={ruleDescription} onChange={e => setRuleDescription(e.target.value)} rows={3} className="w-full mt-1 p-2 border rounded" />
                </div>
                <div className="flex items-center">
                    <input
                        id="badge-is-active"
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="badge-is-active" className="ml-2 block text-sm text-gray-900">Kích hoạt huy hiệu này</label>
                </div>
            </div>
        </Modal>
    );
};

export default EditBadgeModal;