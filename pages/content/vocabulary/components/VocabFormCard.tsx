import React from 'react';
import { Vocabulary } from '../../../../types';
import { TrashIcon } from '../../../../constants';
import { WORD_TYPES } from '../../../../mock/content';
import FileInput from '../../../tests/create/components/shared/FileInput';

interface VocabFormCardProps {
    index: number;
    vocabData: Partial<Vocabulary>;
    onUpdate: (index: number, updatedField: Partial<Vocabulary>) => void;
    onRemove: (index: number) => void;
    canRemove: boolean;
}

const VocabFormCard: React.FC<VocabFormCardProps> = ({ index, vocabData, onUpdate, onRemove, canRemove }) => {
    
    const handleInputChange = (field: keyof Vocabulary, value: any) => {
        onUpdate(index, { [field]: value });
    };

    const handleMultiSelectChange = (field: 'level' | 'word_types', value: string) => {
        const currentValues = vocabData[field] || [];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];
        onUpdate(index, { [field]: newValues });
    };

    return (
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 relative">
            {canRemove && (
                <button onClick={() => onRemove(index)} className="absolute top-2 right-2 text-gray-400 hover:text-red-600">
                    <TrashIcon className="w-5 h-5" />
                </button>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium text-gray-700">Hán tự *</label>
                    <input type="text" value={vocabData.hanzi || ''} onChange={e => handleInputChange('hanzi', e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700">Pinyin *</label>
                    <input type="text" value={vocabData.pinyin || ''} onChange={e => handleInputChange('pinyin', e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-700">Nghĩa *</label>
                    <textarea value={vocabData.meaning || ''} onChange={e => handleInputChange('meaning', e.target.value)} rows={2} className="mt-1 w-full p-2 border border-gray-300 rounded-md"></textarea>
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700">Cấp độ (HSK) *</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                        {['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6'].map(level => (
                             <button key={level} onClick={() => handleMultiSelectChange('level', level)} className={`px-2 py-1 text-xs rounded ${vocabData.level?.includes(level) ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                                {level}
                            </button>
                        ))}
                    </div>
                </div>
                 <div>
                    <label className="text-sm font-medium text-gray-700">Ghi chú</label>
                    <textarea
                        value={vocabData.notes || ''}
                        onChange={e => handleInputChange('notes', e.target.value)}
                        rows={3}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Nhập ghi chú, ví dụ: ví dụ sử dụng, sắc thái, cấu trúc..."
                    ></textarea>
                    </div>
                 <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-700">Loại từ *</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                        {WORD_TYPES.map(wt => (
                             <button key={wt} onClick={() => handleMultiSelectChange('word_types', wt)} className={`px-2 py-1 text-xs rounded capitalize ${vocabData.word_types?.includes(wt) ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                                {wt}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="col-span-2">
                    <FileInput
                        id={`vocab-image-${index}`}
                        label="Hình ảnh minh họa"
                        value={vocabData.image_url || null}
                        onFileChange={(url) => handleInputChange('image_url', url || '')}
                        accept="image/*"
                    />
                </div>
            </div>
        </div>
    );
};

export default VocabFormCard;