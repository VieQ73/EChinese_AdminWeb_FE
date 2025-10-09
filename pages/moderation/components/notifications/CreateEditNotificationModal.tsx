import React, { useState, useEffect } from 'react';
import Modal from '../../../../components/Modal';
import RichTextEditor from '../../../../components/RichTextEditor';
import { Notification } from '../../../../types';

interface CreateEditNotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (notificationData: Omit<Notification, 'id' | 'created_at'>) => void;
    notification?: Notification | null;
}

const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
    system: 'Hệ thống',
    community: 'Cộng đồng',
    reminder: 'Nhắc nhở',
    feedback: 'Góp ý',
};
const NOTIFICATION_TYPES = Object.keys(NOTIFICATION_TYPE_LABELS);


const CreateEditNotificationModal: React.FC<CreateEditNotificationModalProps> = ({ isOpen, onClose, onSave, notification }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [audience, setAudience] = useState<'all' | 'user' | 'admin'>('all');
    const [type, setType] = useState<(typeof NOTIFICATION_TYPES)[number]>('community');
    const [editorKey, setEditorKey] = useState(Date.now());

    useEffect(() => {
        if (isOpen) {
            setEditorKey(Date.now()); // Reset RichTextEditor
            if (notification) {
                setTitle(notification.title);
                setContent((notification.content as any)?.html || '');
                setAudience(notification.audience);
                setType(notification.type as any);
            } else {
                setTitle('');
                setContent('');
                setAudience('all');
                setType('community');
            }
        }
    }, [isOpen, notification]);

    const handleSave = () => {
        if (!title.trim() || !content.trim()) {
            alert('Tiêu đề và Nội dung không được để trống.');
            return;
        }

        const data: Omit<Notification, 'id' | 'created_at'> = {
            title,
            content: { html: content },
            audience,
            type: type as Notification['type'],
            is_push_sent: false, // Luôn tạo ở trạng thái Nháp
            from_system: false, // Luôn là do admin tạo
            priority: 1,
            read_at: null,
        };
        onSave(data);
    };

    const footer = (
        <div className="space-x-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border">Hủy</button>
            <button onClick={handleSave} className="bg-primary-600 text-white px-4 py-2 rounded-lg">Lưu vào Nháp</button>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={notification ? "Sửa thông báo" : "Tạo thông báo mới"} footer={footer} className="max-w-3xl">
            <div className="space-y-4">
                <div>
                    <label className="font-medium text-gray-700">Tiêu đề *</label>
                    <input value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="font-medium text-gray-700">Đối tượng</label>
                        <select value={audience} onChange={e => setAudience(e.target.value as any)} className="w-full p-2 border rounded mt-1">
                            <option value="all">Tất cả mọi người</option>
                            <option value="user">Chỉ người dùng thường</option>
                            <option value="admin">Chỉ Quản trị viên</option>
                        </select>
                    </div>
                     <div>
                        <label className="font-medium text-gray-700">Loại thông báo</label>
                        <select value={type} onChange={e => setType(e.target.value as any)} className="w-full p-2 border rounded mt-1">
                           {NOTIFICATION_TYPES.map(t => <option key={t} value={t} className="capitalize">{NOTIFICATION_TYPE_LABELS[t]}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="font-medium text-gray-700">Nội dung *</label>
                    <RichTextEditor
                        key={editorKey}
                        initialContent={content}
                        onChange={setContent}
                        placeholder="Nhập nội dung thông báo..."
                    />
                </div>
            </div>
        </Modal>
    );
};

export default CreateEditNotificationModal;