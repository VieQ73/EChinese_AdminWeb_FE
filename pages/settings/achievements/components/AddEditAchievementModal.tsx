import React, { useState, useEffect } from 'react';
import Modal from '../../../../components/Modal';
import { Achievement } from '../../../../types';
import { AchievementPayload } from '../api';
import { Loader2 } from 'lucide-react';
import FileInput from '../../../tests/create/components/shared/FileInput';

interface AddEditAchievementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: AchievementPayload) => Promise<void>;
    achievement: Achievement | null;
}

const AddEditAchievementModal: React.FC<AddEditAchievementModalProps> = ({ isOpen, onClose, onSave, achievement }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState('');
    const [points, setPoints] = useState<number | ''>('');
    const [criteria, setCriteria] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [jsonError, setJsonError] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setSaving(false);
            setJsonError('');
            if (achievement) {
                setName(achievement.name);
                setDescription(achievement.description);
                setIcon(achievement.icon || '');
                setPoints(achievement.points);
                setCriteria(JSON.stringify(achievement.criteria, null, 2));
                setIsActive(achievement.is_active);
            } else {
                setName('');
                setDescription('');
                setIcon('');
                setPoints('');
                setCriteria('{\n  "type": "",\n  "value": 0\n}');
                setIsActive(true);
            }
        }
    }, [achievement, isOpen]);

    const handleCriteriaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setCriteria(value);
        try {
            JSON.parse(value);
            setJsonError('');
        } catch (error) {
            setJsonError('JSON không hợp lệ.');
        }
    };
    
    const formatJson = () => {
        try {
            const parsed = JSON.parse(criteria);
            setCriteria(JSON.stringify(parsed, null, 2));
            setJsonError('');
        } catch (error) {
            setJsonError('Không thể định dạng: JSON không hợp lệ.');
        }
    }

    const handleSave = async () => {
        if (jsonError) {
            alert('Vui lòng sửa lỗi JSON trong tiêu chí.');
            return;
        }
        setSaving(true);
        try {
            const payload: AchievementPayload = {
                name,
                description,
                icon,
                points: Number(points),
                criteria: JSON.parse(criteria),
                is_active: isActive,
            };
            await onSave(payload);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={achievement ? "Chỉnh sửa Thành tích" : "Tạo Thành tích mới"}
            className="max-w-2xl"
            footer={
                <div className="space-x-2">
                    <button onClick={onClose} disabled={saving} className="px-4 py-2 text-sm font-medium rounded-lg border">Hủy</button>
                    <button onClick={handleSave} disabled={saving || !!jsonError} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg disabled:opacity-50">
                         {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                         Lưu
                    </button>
                </div>
            }
        >
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <div>
                    <label className="font-medium">Tên thành tích *</label>
                    <input value={name} onChange={e => setName(e.target.value)} className="w-full mt-1 p-2 border rounded"/>
                </div>
                 <div>
                    <label className="font-medium">Mô tả *</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full mt-1 p-2 border rounded"/>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <FileInput
                            id="achievement-icon-upload"
                            label="Icon"
                            value={icon || null}
                            onFileChange={(url) => setIcon(url || '')}
                            accept="image/*"
                        />
                    </div>
                     <div>
                        <label className="font-medium">Điểm thưởng *</label>
                        <input type="number" value={points} onChange={e => setPoints(Number(e.target.value))} className="w-full mt-1 p-2 border rounded"/>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="font-medium">Tiêu chí (JSON) *</label>
                        <button onClick={formatJson} className="text-xs text-primary-600 hover:underline">Định dạng JSON</button>
                    </div>
                    <textarea value={criteria} onChange={handleCriteriaChange} rows={6} className={`w-full mt-1 p-2 border rounded font-mono text-sm ${jsonError ? 'border-red-500' : ''}`}/>
                    {jsonError && <p className="text-xs text-red-500 mt-1">{jsonError}</p>}
                </div>
                <div className="flex items-center">
                    <input type="checkbox" id="is_active_ach" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="h-4 w-4 rounded"/>
                    <label htmlFor="is_active_ach" className="ml-2">Kích hoạt</label>
                </div>
            </div>
        </Modal>
    );
};

export default AddEditAchievementModal;
