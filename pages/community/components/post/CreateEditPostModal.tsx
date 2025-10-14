import React, { useState, useEffect } from 'react';
import { Post, RawPost, PostContent } from '../../../../types';
import { POST_TOPICS } from '../../../../constants';
import { X, Image as ImageIcon, Trash2 } from 'lucide-react';
import RichTextEditor from '../../../../components/RichTextEditor';

interface CreateEditPostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (postData: Omit<RawPost, 'id' | 'created_at' | 'user_id' | 'likes' | 'views'>) => void;
    post: Post | null;
}

const CreateEditPostModal: React.FC<CreateEditPostModalProps> = ({ isOpen, onClose, onSave, post }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState(''); // HTML content
    const [images, setImages] = useState<string[]>([]);
    const [topic, setTopic] = useState<(typeof POST_TOPICS)[number]>(POST_TOPICS[0]);
    const [isPinned, setIsPinned] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editorKey, setEditorKey] = useState(Date.now());

    useEffect(() => {
        if (isOpen) {
            setEditorKey(Date.now());
            if (post) {
                setTitle(post.title);
                setContent(post.content?.html || '');
                setImages(post.content?.images || []);
                setTopic(post.topic);
                setIsPinned(post.is_pinned);
            } else {
                // Reset form for new post
                setTitle('');
                setContent('');
                setImages([]);
                setTopic(POST_TOPICS[0]);
                setIsPinned(false);
            }
            setSaving(false);
        }
    }, [post, isOpen]);

    const handleSave = async () => {
        if (!title.trim() || !topic.trim()) {
            alert('Lỗi ràng buộc: Vui lòng nhập Tiêu đề và chọn Chủ đề.');
            return;
        }

        setSaving(true);
        try {
            const postContent: PostContent = {
                html: content,
                text: content.replace(/<[^>]*>?/gm, ''), // Simple text extraction
                images: images,
            };
            
            const payload = {
                title,
                topic,
                content: postContent,
                is_pinned: isPinned,
                status: 'published',
                is_approved: true,
                auto_flagged: false,
            };
            await onSave(payload as any);
            onClose();
        } catch (e) {
            console.error('Save post failed', e);
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const maxFiles = 4;
        const toAdd: string[] = [];

        for (let i = 0; i < files.length; i++) {
            if (images.length + toAdd.length >= maxFiles) break;
            toAdd.push(URL.createObjectURL(files[i]));
        }

        setImages(prev => [...prev, ...toAdd].slice(0, maxFiles));
        e.target.value = ''; // Reset input
    };

    const getImageLayoutClass = () => {
        switch (images.length) {
            case 1: return 'grid-cols-1';
            case 2: return 'grid-cols-2';
            case 3: return 'grid-cols-2';
            case 4: return 'grid-cols-2';
            default: return 'grid-cols-1';
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-2xl bg-white text-gray-800 rounded-xl shadow-2xl border border-gray-100 animate-in fade-in-0 zoom-in-95 duration-300">
                <div className="flex flex-row items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold">{post ? 'Chỉnh sửa bài viết' : 'Tạo bài viết'}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors rounded-full p-1 bg-gray-100 hover:bg-gray-200">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-600">Tiêu đề*</label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Hãy nhập tiêu đề câu hỏi của bạn."
                            className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <RichTextEditor
                        key={editorKey}
                        initialContent={content}
                        onChange={setContent}
                        // placeholder để tùy chỉnh thông báo.
                        placeholder="Hãy nhập nội dung bài viết..." 
                    />
                
                    <div className="p-3 border border-dashed border-gray-300 rounded-lg bg-gray-50 space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="block text-sm font-semibold text-gray-700">Hình ảnh</label>
                            <label
                                htmlFor="image-upload"
                                className={`flex items-center gap-1 cursor-pointer px-3 py-1 rounded-full text-sm font-medium transition-colors shadow-sm ${images.length >= 4 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'}`}
                            >
                                <ImageIcon size={16} /> Tải ảnh
                                <input
                                    type="file" id="image-upload" accept="image/*" multiple
                                    onChange={handleImageUpload} className="hidden" disabled={images.length >= 4}
                                />
                            </label>
                        </div>

                        {images.length > 0 && (
                            <div className={`grid ${getImageLayoutClass()} gap-2`}>
                                {images.map((src, i) => (
                                    <div key={i} className={`relative overflow-hidden ${images.length === 3 && i === 0 ? 'col-span-2 aspect-[2/1]' : 'aspect-square'}`}>
                                        <img src={src} alt={`Ảnh ${i + 1}`} className="h-full w-full object-cover rounded-lg border" />
                                        <button
                                            type="button" title="Xóa ảnh"
                                            className="absolute top-1 right-1 bg-red-500/90 text-white rounded-full p-1 hover:bg-red-600"
                                            onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-600">Chủ đề câu hỏi*</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {POST_TOPICS.map((t) => (
                                <button
                                    key={t} type="button" onClick={() => setTopic(t)}
                                    className={`p-2 rounded-lg text-sm font-medium transition-colors border ${topic === t ? 'bg-blue-500 text-white border-blue-500' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                     <div className="flex items-center">
                        <input
                            id="is-pinned-modal" type="checkbox"
                            checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)}
                            className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <label htmlFor="is-pinned-modal" className="ml-2 block text-sm text-gray-900">Ghim bài viết này</label>
                    </div>

                </div>

                <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300">Hủy</button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 rounded-lg font-medium transition-colors bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-300"
                        disabled={saving || !title.trim() || !topic.trim()}
                    >
                        {saving ? 'Đang lưu...' : (post ? 'Cập nhật' : 'Đăng')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateEditPostModal;