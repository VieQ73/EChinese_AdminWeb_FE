import React from 'react';
import { Vocabulary } from '../../../../types';
import Checkbox from '../../../../ui/Checkbox';
import { MoreHorizontal } from 'lucide-react';

interface VocabCardProps {
    vocab: Vocabulary;
    isSelected: boolean;
    onSelect?: (id: string) => void;
    onViewDetails: (vocab: Vocabulary) => void;
}

const VocabCard: React.FC<VocabCardProps> = ({ vocab, isSelected, onSelect, onViewDetails }) => {
    return (
        <div 
            className={`flex items-center gap-4 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                isSelected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-white hover:border-primary-300'
            }`}
            onClick={() => onSelect ? onSelect(vocab.id) : onViewDetails(vocab)}
        >
            {onSelect && (
                <div onClick={(e) => e.stopPropagation()}>
                    <Checkbox checked={isSelected} onChange={() => onSelect(vocab.id)} />
                </div>
            )}
            <img 
                src={vocab.image_url || 'https://placehold.co/80x80/e2e8f0/a0aec0?text=...'} 
                alt={vocab.hanzi}
                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
                <p className="text-xl font-bold text-gray-900 truncate">{vocab.hanzi}</p>
                <p className="text-md text-gray-500 truncate">{vocab.pinyin}</p>
                <p className="text-sm text-gray-600 truncate mt-1">{vocab.meaning}</p>
            </div>
            <button 
                className="p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded-full"
                onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails(vocab);
                }}
            >
                <MoreHorizontal size={20} />
            </button>
        </div>
    );
};

export default VocabCard;