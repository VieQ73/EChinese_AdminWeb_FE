
import React, { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import { CommunityRule } from '../../../types';
import { RulePayload } from '../api';

interface AddEditRuleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (payload: RulePayload) => void;
    rule: CommunityRule | null;
}

const AddEditRuleModal: React.FC<AddEditRuleModalProps> = ({ isOpen, onClose, onSave, rule }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [severity, setSeverity] = useState<CommunityRule['severity_default']>('low');

    useEffect(() => {
        if (isOpen) {
            if (rule) {
                setTitle(rule.title);
                setDescription(rule.description);
                setSeverity(rule.severity_default);
            } else {
                setTitle('');
                setDescription('');
                setSeverity('low');
            }
        }
    }, [rule, isOpen]);

    const handleSave = () => {
        if (!title.trim() || !description.trim()) {
            alert('Vui lòng điền đầy đủ tiêu đề và mô tả.');
            return;
        }
        onSave({
            title,
            description,
            severity_default: severity,
            is_active: rule ? rule.is_active : true, // Giữ nguyên trạng thái khi sửa, mặc định là active khi tạo mới
        });
    };

    const footer = (
        <div className="space-x-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-lg border">Hủy</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg">
                {rule ? 'Lưu thay đổi' : 'Tạo quy tắc'}
            </button>
        </div>
    );
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={rule ? 'Chỉnh sửa quy tắc' : 'Tạo quy tắc mới'} footer={footer} className="max-w-xl">
            <div className="space-y-4">
                <div>
                    <label className="font-medium">Tiêu đề *</label>
                    <input value={title} onChange={e => setTitle(e.target.value)} className="w-full mt-1 p-2 border rounded" placeholder="Ví dụ: Công kích cá nhân"/>
                </div>
                 <div>
                    <label className="font-medium">Mô tả chi tiết *</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full mt-1 p-2 border rounded" placeholder="Mô tả hành vi được coi là vi phạm quy tắc này."/>
                </div>
                <div>
                    <label className="font-medium">Mức độ mặc định *</label>
                    <select value={severity} onChange={e => setSeverity(e.target.value as any)} className="w-full mt-1 p-2 border rounded bg-white">
                        <option value="low">Thấp</option>
                        <option value="medium">Trung bình</option>
                        <option value="high">Cao</option>
                    </select>
                </div>
            </div>
        </Modal>
    );
};

export default AddEditRuleModal;
