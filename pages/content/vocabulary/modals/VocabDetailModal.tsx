import React from 'react';
import { Vocabulary } from '../../../../types';
import Modal from '../../../../components/Modal';
import { PencilIcon } from '../../../../constants';

interface VocabDetailModalProps {
    vocab: Vocabulary;
    onClose: () => void;
    onEdit: (vocab: Vocabulary) => void;
}

const InfoRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="space-y-1">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
        <div>{children}</div>
    </div>
);

const VocabDetailModal: React.FC<VocabDetailModalProps> = ({ vocab, onClose, onEdit }) => {

    const handleEditClick = () => {
        onClose();
        onEdit(vocab);
    };

    const footer = (
        <button
            onClick={handleEditClick}
            className="flex items-center px-5 py-2.5 bg-primary-600 text-white rounded-xl shadow-sm hover:bg-primary-700 transition-all duration-200 font-medium text-sm"
        >
            <PencilIcon className="w-4 h-4 mr-2" />
            Chỉnh sửa
        </button>
    );

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title="Chi tiết từ vựng"
            footer={footer}
            //  Pass className to the Modal component.
            className="max-w-3xl" // mở rộng modal ra
        >
            <div className="flex flex-col md:flex-row gap-8">
                {/* Cột ảnh */}
                <div className="md:w-1/3 flex-shrink-0">
                    <div className="relative group">
                        <img
                            src={vocab.image_url || 'https://placehold.co/300x300/e2e8f0/a0aec0?text=...'}
                            alt={vocab.hanzi}
                            className="w-full aspect-square object-cover rounded-2xl shadow-md transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 rounded-2xl ring-1 ring-gray-200 pointer-events-none"></div>
                    </div>
                </div>

                {/* Cột nội dung */}
                <div className="md:w-2/3 space-y-5">
                    {/* Hanzi + pinyin */}
                    <div>
                        <p className="text-4xl font-bold text-gray-900 tracking-tight">{vocab.hanzi}</p>
                        <p className="text-lg text-primary-600 font-medium mt-1">{vocab.pinyin}</p>
                    </div>

                    {/* Nghĩa */}
                    <InfoRow label="Nghĩa">
                        <p className="text-base text-gray-800 leading-relaxed">{vocab.meaning}</p>
                    </InfoRow>

                    {/* Cấp độ */}
                    <InfoRow label="Cấp độ">
                        <div className="flex flex-wrap gap-2">
                            {vocab.level.map((l) => (
                                <span
                                    key={l}
                                    className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 shadow-sm"
                                >
                                    {l}
                                </span>
                            ))}
                        </div>
                    </InfoRow>

                    {/* Loại từ */}
                    <InfoRow label="Loại từ">
                        <div className="flex flex-wrap gap-2">
                            {vocab.word_types.map((wt) => (
                                <span
                                    key={wt}
                                    className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 capitalize shadow-sm"
                                >
                                    {wt}
                                </span>
                            ))}
                        </div>
                    </InfoRow>

                    {/* Ghi chú */}
                    {vocab.notes && (
                        <InfoRow label="Ghi chú">
                            <p className="text-sm text-gray-600 bg-gray-50 border border-gray-100 p-3 rounded-lg shadow-inner whitespace-pre-wrap">
                                {vocab.notes}
                            </p>
                        </InfoRow>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default VocabDetailModal;